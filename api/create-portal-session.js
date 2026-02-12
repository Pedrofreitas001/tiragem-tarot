/**
 * Stripe Customer Portal Session API - Vercel Serverless Function
 *
 * Permite que clientes:
 * - Atualizem métodos de pagamento
 * - Vejam faturas e histórico
 * - Cancelem assinaturas
 *
 * NOTA: Usa fetch direto para a Stripe API ao invés do SDK
 * para evitar problemas de conexão no runtime Vercel Serverless.
 */

const STRIPE_API = 'https://api.stripe.com/v1';

async function stripeRequest(endpoint, params, secretKey) {
    const response = await fetch(`${STRIPE_API}${endpoint}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${secretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(params).toString(),
    });

    const data = await response.json();

    if (!response.ok) {
        const errorMessage = data.error?.message || `Stripe API error: ${response.status}`;
        const err = new Error(errorMessage);
        err.type = data.error?.type;
        err.code = data.error?.code;
        throw err;
    }

    return data;
}

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
        const { customerId, returnUrl } = req.body || {};

        if (!customerId) {
            return res.status(400).json({ error: 'customerId é obrigatório' });
        }

        // Construir URL de retorno
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                       (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                       'http://localhost:3000');

        const finalReturnUrl = returnUrl || `${baseUrl}/#/settings`;

        console.log('📡 Criando sessão do portal via fetch...', { customerId });

        // Criar sessão do portal via Stripe API direta
        const session = await stripeRequest('/billing_portal/sessions', {
            'customer': customerId,
            'return_url': finalReturnUrl,
        }, STRIPE_SECRET_KEY);

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
