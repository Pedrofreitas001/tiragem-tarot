/**
 * Stripe Webhook Handler - Vercel Serverless Function
 *
 * SEGURANÇA CRÍTICA:
 * - Valida assinatura do webhook com STRIPE_WEBHOOK_SECRET
 * - NUNCA confie em redirects de sucesso para ativar premium
 * - Usa idempotência para evitar processamento duplicado
 */

// Cache de eventos processados (idempotência em memória)
const processedEvents = new Set();

export const config = {
    api: {
        bodyParser: false,
    },
};

async function getRawBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
    });
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
        console.error('❌ Stripe não configurado');
        return res.status(500).json({ error: 'Webhook não configurado' });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        console.error('❌ Supabase não configurado');
        return res.status(500).json({ error: 'Database não configurado' });
    }

    try {
        const rawBody = await getRawBody(req);
        const signature = req.headers['stripe-signature'];

        if (!signature) {
            return res.status(400).json({ error: 'Signature ausente' });
        }

        // Importar dependências dinamicamente
        const { default: Stripe } = await import('stripe');
        const { createClient } = await import('@supabase/supabase-js');

        const stripe = new Stripe(STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
        });

        // Validar assinatura do webhook
        let event;
        try {
            event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.error('❌ Signature inválida:', err.message);
            return res.status(400).json({ error: 'Signature inválida' });
        }

        // Idempotência
        if (processedEvents.has(event.id)) {
            return res.json({ received: true, status: 'already_processed' });
        }
        processedEvents.add(event.id);

        // Limpar cache antigo
        if (processedEvents.size > 1000) {
            const iterator = processedEvents.values();
            for (let i = 0; i < 500; i++) {
                processedEvents.delete(iterator.next().value);
            }
        }

        console.log('📨 Webhook:', event.type, event.id);

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const userId = session.client_reference_id;
                const subscriptionId = session.subscription;

                if (!userId) break;

                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();

                await supabase
                    .from('profiles')
                    .update({
                        subscription_tier: 'premium',
                        subscription_expires_at: expiresAt,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', userId);

                await supabase
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

                console.log('✅ Premium ativado:', userId);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;

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

                console.log('🚫 Assinatura cancelada:', subscription.id);
                break;
            }

            case 'invoice.paid': {
                const invoice = event.data.object;
                const subscriptionId = invoice.subscription;

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
                    }
                }
                break;
            }

            default:
                console.log('⏭️ Evento ignorado:', event.type);
        }

        return res.json({ received: true });

    } catch (error) {
        console.error('❌ Erro:', error.message);
        return res.status(500).json({ error: 'Erro interno' });
    }
}
