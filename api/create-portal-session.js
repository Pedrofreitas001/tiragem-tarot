/**
 * Stripe Customer Portal Session API - Vercel Serverless Function
 *
 * Permite que clientes:
 * - Atualizem métodos de pagamento
 * - Vejam faturas e histórico
 * - Cancelem assinaturas
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

    try {
        const { customerId, returnUrl } = req.body;

        if (!customerId) {
            return res.status(400).json({ error: 'customerId é obrigatório' });
        }

        // Importar Stripe
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(STRIPE_SECRET_KEY, {
            apiVersion: '2024-12-18.acacia',
        });

        // Construir URL de retorno
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                       process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                       'http://localhost:3000';

        const finalReturnUrl = returnUrl || `${baseUrl}/#/settings`;

        console.log('📡 Criando sessão do portal...', { customerId });

        // Criar sessão do portal
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: finalReturnUrl,
        });

        console.log('✅ Portal session criada');

        return res.json({
            url: session.url,
        });

    } catch (error) {
        console.error('❌ Erro ao criar portal session:', error.message);
        return res.status(500).json({
            error: 'Erro ao acessar portal',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
}
