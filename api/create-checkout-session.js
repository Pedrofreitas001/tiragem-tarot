/**
 * Stripe Checkout Session API - Vercel Serverless Function
 *
 * SEGURANÇA:
 * - Usa STRIPE_SECRET_KEY do ambiente (nunca exposto no frontend)
 * - Valida inputs antes de processar
 * - price_id é validado contra lista permitida (não confia no cliente)
 * - Usa client_reference_id para vincular ao userId do Supabase
 */

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
        const { email, customerName, userId, successUrl, cancelUrl } = req.body;

        // Validação de inputs
        if (!email || !userId) {
            return res.status(400).json({ error: 'Email e userId são obrigatórios' });
        }

        // Usar o preço do ambiente (não confiar no cliente)
        const priceId = premiumPriceId;

        if (!priceId || !ALLOWED_PRICE_IDS.includes(priceId)) {
            console.error('❌ Price ID inválido ou não permitido');
            return res.status(400).json({ error: 'Plano inválido' });
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

        console.log('✅ Sessão criada:', session.id);

        return res.json({
            url: session.url,
            sessionId: session.id,
        });

    } catch (error) {
        console.error('❌ Erro ao criar sessão:', error.message);
        return res.status(500).json({
            error: 'Erro ao processar pagamento',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
}
