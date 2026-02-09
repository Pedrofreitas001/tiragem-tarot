/**
 * Stripe Webhook Handler - Vercel Serverless Function
 *
 * SEGURANÇA CRÍTICA:
 * - Valida assinatura do webhook com STRIPE_WEBHOOK_SECRET
 * - NUNCA confie em redirects de sucesso para ativar premium
 * - Usa idempotência para evitar processamento duplicado
 * - Logs seguros (sem dados sensíveis)
 *
 * EVENTOS PROCESSADOS:
 * - checkout.session.completed: Ativa assinatura premium
 * - customer.subscription.updated: Atualiza status da assinatura
 * - customer.subscription.deleted: Cancela/expira assinatura
 * - invoice.paid: Renova assinatura
 * - invoice.payment_failed: Marca falha de pagamento
 */

import { createClient } from '@supabase/supabase-js';

// Cache de eventos processados (idempotência em memória)
// Em produção, use Redis ou banco de dados
const processedEvents = new Set();

export const config = {
    api: {
        bodyParser: false, // Necessário para validar signature
    },
};

async function getRawBody(req) {
    const chunks = [];
    for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Validar configuração
    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
        console.error('❌ Stripe não configurado');
        return res.status(500).json({ error: 'Webhook não configurado' });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        console.error('❌ Supabase não configurado');
        return res.status(500).json({ error: 'Database não configurado' });
    }

    try {
        // Obter body raw para validação de assinatura
        const rawBody = await getRawBody(req);
        const signature = req.headers['stripe-signature'];

        if (!signature) {
            console.error('❌ Signature ausente');
            return res.status(400).json({ error: 'Signature ausente' });
        }

        // Importar Stripe
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(STRIPE_SECRET_KEY, {
            apiVersion: '2024-12-18.acacia',
        });

        // VALIDAÇÃO CRÍTICA: Verificar assinatura do webhook
        let event;
        try {
            event = stripe.webhooks.constructEvent(
                rawBody,
                signature,
                STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.error('❌ Falha na validação de assinatura:', err.message);
            return res.status(400).json({ error: `Webhook signature inválida: ${err.message}` });
        }

        // Idempotência: Evitar processamento duplicado
        if (processedEvents.has(event.id)) {
            console.log('⏭️ Evento já processado:', event.id);
            return res.json({ received: true, status: 'already_processed' });
        }

        // Marcar como processado (antes de processar para evitar race condition)
        processedEvents.add(event.id);

        // Limpar cache antigo (manter apenas últimos 1000 eventos)
        if (processedEvents.size > 1000) {
            const iterator = processedEvents.values();
            for (let i = 0; i < 500; i++) {
                processedEvents.delete(iterator.next().value);
            }
        }

        console.log('📨 Webhook recebido:', event.type, event.id);

        // Inicializar Supabase (com service role para bypassing RLS)
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        // Processar evento
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const userId = session.client_reference_id;
                const customerId = session.customer;
                const subscriptionId = session.subscription;

                if (!userId) {
                    console.error('❌ userId não encontrado no client_reference_id');
                    break;
                }

                console.log('✅ Checkout completo:', { userId, customerId, subscriptionId });

                // Buscar detalhes da subscription
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();

                // Atualizar profile do usuário para premium
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        subscription_tier: 'premium',
                        subscription_expires_at: expiresAt,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', userId);

                if (profileError) {
                    console.error('❌ Erro ao atualizar profile:', profileError);
                } else {
                    console.log('✅ Profile atualizado para premium');
                }

                // Criar registro na tabela subscriptions
                const { error: subError } = await supabase
                    .from('subscriptions')
                    .insert({
                        user_id: userId,
                        status: 'active',
                        provider: 'stripe',
                        provider_subscription_id: subscriptionId,
                        plan: 'premium',
                        price_cents: session.amount_total || 1990,
                        currency: session.currency || 'brl',
                        started_at: new Date().toISOString(),
                        expires_at: expiresAt,
                    });

                if (subError) {
                    console.error('❌ Erro ao criar subscription:', subError);
                }

                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                const customerId = subscription.customer;
                const status = subscription.status;
                const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();

                console.log('📝 Subscription atualizada:', { customerId, status });

                // Buscar userId pela subscription no banco
                const { data: subData } = await supabase
                    .from('subscriptions')
                    .select('user_id')
                    .eq('provider_subscription_id', subscription.id)
                    .single();

                if (subData?.user_id) {
                    const tier = status === 'active' ? 'premium' : 'free';

                    await supabase
                        .from('profiles')
                        .update({
                            subscription_tier: tier,
                            subscription_expires_at: status === 'active' ? expiresAt : null,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', subData.user_id);

                    await supabase
                        .from('subscriptions')
                        .update({
                            status: status === 'active' ? 'active' : 'cancelled',
                            expires_at: expiresAt,
                        })
                        .eq('provider_subscription_id', subscription.id);
                }

                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;

                console.log('🚫 Subscription cancelada:', subscription.id);

                // Buscar e atualizar
                const { data: subData } = await supabase
                    .from('subscriptions')
                    .select('user_id')
                    .eq('provider_subscription_id', subscription.id)
                    .single();

                if (subData?.user_id) {
                    await supabase
                        .from('profiles')
                        .update({
                            subscription_tier: 'free',
                            subscription_expires_at: null,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', subData.user_id);

                    await supabase
                        .from('subscriptions')
                        .update({
                            status: 'cancelled',
                            cancelled_at: new Date().toISOString(),
                        })
                        .eq('provider_subscription_id', subscription.id);
                }

                break;
            }

            case 'invoice.paid': {
                const invoice = event.data.object;
                const subscriptionId = invoice.subscription;

                console.log('💰 Invoice paga:', invoice.id);

                if (subscriptionId) {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();

                    const { data: subData } = await supabase
                        .from('subscriptions')
                        .select('user_id')
                        .eq('provider_subscription_id', subscriptionId)
                        .single();

                    if (subData?.user_id) {
                        await supabase
                            .from('profiles')
                            .update({
                                subscription_tier: 'premium',
                                subscription_expires_at: expiresAt,
                                updated_at: new Date().toISOString(),
                            })
                            .eq('id', subData.user_id);

                        await supabase
                            .from('subscriptions')
                            .update({
                                status: 'active',
                                expires_at: expiresAt,
                            })
                            .eq('provider_subscription_id', subscriptionId);
                    }
                }

                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                console.log('❌ Pagamento falhou:', invoice.id);

                // Não cancelar imediatamente - Stripe tentará novamente
                // Apenas logar para monitoramento

                break;
            }

            default:
                console.log('⏭️ Evento não processado:', event.type);
        }

        return res.json({ received: true });

    } catch (error) {
        console.error('❌ Erro no webhook:', error.message);
        return res.status(500).json({ error: 'Erro interno' });
    }
}
