/**
 * Stripe Checkout Session API - Vercel Serverless Function
 *
 * SEGURANÇA:
 * - Usa STRIPE_SECRET_KEY do ambiente (nunca exposto no frontend)
 * - Valida inputs antes de processar
 * - price_id é validado contra lista permitida (não confia no cliente)
 * - Usa client_reference_id para vincular ao userId do Supabase
 * - Verifica assinatura ativa antes de criar sessão
 */

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    console.log('🔵 Checkout API chamada:', req.method, {
        hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
        hasPriceId: !!(process.env.STRIPE_PREMIUM_PRICE_ID || process.env.VITE_STRIPE_PREMIUM_PRICE_ID),
    });

    // CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

    if (!STRIPE_SECRET_KEY) {
        console.error('❌ STRIPE_SECRET_KEY não configurado');
        return res.status(500).json({ error: 'Stripe não configurado' });
    }

    // IDs de preços permitidos (whitelist de segurança)
    // Aceita tanto STRIPE_PREMIUM_PRICE_ID quanto VITE_STRIPE_PREMIUM_PRICE_ID
    const premiumPriceId = process.env.STRIPE_PREMIUM_PRICE_ID || process.env.VITE_STRIPE_PREMIUM_PRICE_ID;
    const ALLOWED_PRICE_IDS = [
        premiumPriceId,
    ].filter(Boolean);

    try {
        const { email, customerName, userId, successUrl, cancelUrl } = req.body || {};

        // Validação de inputs
        if (!email || !userId) {
            console.error('❌ Dados obrigatórios ausentes:', { email: !!email, userId: !!userId });
            return res.status(400).json({ error: 'Email e userId são obrigatórios' });
        }

        // Usar o preço do ambiente (não confiar no cliente)
        const priceId = premiumPriceId;

        if (!priceId || !ALLOWED_PRICE_IDS.includes(priceId)) {
            console.error('❌ Price ID inválido ou não configurado:', { priceId });
            return res.status(400).json({ error: 'Plano inválido. Verifique a configuração do STRIPE_PREMIUM_PRICE_ID.' });
        }

        // Verificar se o usuário já tem assinatura ativa no Supabase
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey) {
            try {
                const supabase = createClient(supabaseUrl, supabaseKey);

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('subscription_tier, subscription_expires_at')
                    .eq('id', userId)
                    .maybeSingle();

                if (profile?.subscription_tier === 'premium') {
                    const isExpired = profile.subscription_expires_at
                        ? new Date(profile.subscription_expires_at) < new Date()
                        : false;

                    if (!isExpired) {
                        console.log('ℹ️ Usuário já possui assinatura premium ativa:', userId);
                        return res.status(200).json({
                            alreadyActive: true,
                            message: 'Você já possui uma assinatura Premium ativa.',
                        });
                    }
                }
            } catch (dbError) {
                // Log mas não bloqueia - se falhar verificação, deixa prosseguir
                console.warn('⚠️ Erro ao verificar assinatura existente (prosseguindo):', dbError.message);
            }
        }

        // Importar Stripe
        const { default: Stripe } = await import('stripe');
        const stripe = new Stripe(STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
        });

        // Construir URLs de retorno
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                       (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                       'http://localhost:3000');

        const finalSuccessUrl = successUrl || `${baseUrl}/#/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
        const finalCancelUrl = cancelUrl || `${baseUrl}/#/checkout`;

        console.log('📡 Criando sessão Stripe Checkout...', {
            email,
            userId,
            priceId,
            successUrl: finalSuccessUrl,
            cancelUrl: finalCancelUrl,
        });

        // Criar sessão de checkout
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: finalSuccessUrl,
            cancel_url: finalCancelUrl,
            customer_email: email,
            client_reference_id: userId, // Vincula ao Supabase user ID
            metadata: {
                userId,
                customerName: customerName || '',
                source: 'zaya_tarot',
            },
            // Permitir códigos promocionais
            allow_promotion_codes: true,
            // Coletar endereço de cobrança
            billing_address_collection: 'auto',
            // Configurações de assinatura
            subscription_data: {
                metadata: {
                    userId,
                    source: 'zaya_tarot',
                },
            },
        });

        console.log('✅ Sessão criada:', session.id, 'URL:', session.url);

        return res.json({
            url: session.url,
            sessionId: session.id,
        });

    } catch (error) {
        console.error('❌ Erro ao criar sessão:', error.message, error.stack);
        return res.status(500).json({
            error: 'Erro ao processar pagamento',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
}
