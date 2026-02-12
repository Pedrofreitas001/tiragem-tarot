/**
 * Stripe Webhook Handler - Vercel Serverless Function
 *
 * SEGURANÇA CRÍTICA:
 * - Valida assinatura do webhook com HMAC-SHA256 (sem SDK)
 * - NUNCA confie em redirects de sucesso para ativar premium
 * - Usa idempotência para evitar processamento duplicado
 *
 * NOTA: Usa fetch direto + crypto nativo para evitar problemas
 * de conexão do Stripe SDK no runtime Vercel Serverless.
 */

import { createHmac, timingSafeEqual } from 'crypto';
import { createClient } from '@supabase/supabase-js';

const STRIPE_API = 'https://api.stripe.com/v1';

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

/**
 * Verifica a assinatura do webhook Stripe usando HMAC-SHA256.
 * Equivalente a stripe.webhooks.constructEvent() mas sem o SDK.
 */
function verifyWebhookSignature(payload, signatureHeader, secret) {
    const TOLERANCE_SECONDS = 300; // 5 minutos

    if (!signatureHeader) {
        throw new Error('No stripe-signature header');
    }

    // Parse do header: t=timestamp,v1=signature
    const parts = {};
    signatureHeader.split(',').forEach(item => {
        const [key, value] = item.split('=');
        if (key === 't') parts.t = value;
        if (key === 'v1') {
            if (!parts.v1) parts.v1 = [];
            parts.v1.push(value);
        }
    });

    if (!parts.t || !parts.v1 || parts.v1.length === 0) {
        throw new Error('Invalid signature header format');
    }

    const timestamp = parseInt(parts.t, 10);
    const now = Math.floor(Date.now() / 1000);

    if (Math.abs(now - timestamp) > TOLERANCE_SECONDS) {
        throw new Error('Webhook timestamp too old');
    }

    // Calcular assinatura esperada: HMAC-SHA256(timestamp + "." + payload)
    const payloadStr = typeof payload === 'string' ? payload : payload.toString('utf8');
    const signedPayload = `${timestamp}.${payloadStr}`;
    const expectedSignature = createHmac('sha256', secret)
        .update(signedPayload, 'utf8')
        .digest('hex');

    // Verificar se alguma das assinaturas v1 corresponde (timing-safe)
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const isValid = parts.v1.some(sig => {
        const sigBuffer = Buffer.from(sig, 'utf8');
        if (sigBuffer.length !== expectedBuffer.length) return false;
        return timingSafeEqual(expectedBuffer, sigBuffer);
    });

    if (!isValid) {
        throw new Error('Webhook signature verification failed');
    }

    // Parse do evento
    return JSON.parse(payloadStr);
}

async function stripeGet(endpoint, secretKey) {
    const response = await fetch(`${STRIPE_API}${endpoint}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${secretKey}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || `Stripe API error: ${response.status}`);
    }

    return data;
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

        // Validar assinatura do webhook (sem SDK)
        let event;
        try {
            event = verifyWebhookSignature(rawBody, signature, STRIPE_WEBHOOK_SECRET);
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

                // Buscar dados da assinatura via fetch
                const subscription = await stripeGet(`/subscriptions/${subscriptionId}`, STRIPE_SECRET_KEY);
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
                    // Buscar dados da assinatura via fetch
                    const subscription = await stripeGet(`/subscriptions/${subscriptionId}`, STRIPE_SECRET_KEY);
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
