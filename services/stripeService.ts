/**
 * Stripe Integration Service for Zaya Tarot
 *
 * This service handles all Stripe-related operations including:
 * - Checkout session creation
 * - Subscription management
 * - Customer portal access
 *
 * SETUP INSTRUCTIONS:
 * 1. Add your Stripe publishable key to the STRIPE_PUBLISHABLE_KEY constant below
 * 2. Create a backend endpoint to handle checkout session creation (or use Stripe Payment Links)
 * 3. Configure webhooks in your Stripe dashboard to handle subscription events
 */

// ============================================
// STRIPE CONFIGURATION - ADD YOUR KEYS HERE
// ============================================

export const STRIPE_CONFIG = {
    // Chave publicável do Stripe (carregada do ambiente em produção)
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SvSCpQfequPVfiy4XTSkIDHUtTiC8ZyRD53eviQdDqvzXtThFcgSx5BsQsY0c6dWoV00UvyH5KnQi5QhxEuj95D0010SHywCt',

    // Product ID (para referência)
    productId: 'prod_TuEXZVRLRlGKSn',

    // Price ID do plano premium (carregado do ambiente - OBRIGATÓRIO para checkout)
    priceId: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID || '',

    // Success and cancel URLs for Stripe Checkout
    successUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/checkout`,
};

// ============================================
// STRIPE CHECKOUT FUNCTIONS
// ============================================

/**
 * Initialize Stripe.js
 * This function loads the Stripe.js library dynamically
 */
export const loadStripe = async () => {
    if (!STRIPE_CONFIG.publishableKey) {
        console.error('Stripe publishable key is not configured');
        return null;
    }

    // Dynamically load Stripe.js
    if (typeof window !== 'undefined' && !(window as any).Stripe) {
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.async = true;
        document.head.appendChild(script);

        await new Promise((resolve) => {
            script.onload = resolve;
        });
    }

    return (window as any).Stripe?.(STRIPE_CONFIG.publishableKey);
};

/**
 * Create a Stripe Checkout Session and redirect to payment page
 *
 * Option 1: Using Stripe Payment Links (No backend required)
 * - Create a Payment Link in your Stripe Dashboard
 * - Simply redirect to that URL
 *
 * Option 2: Using Checkout Sessions (Requires backend)
 * - Create an API endpoint that creates checkout sessions
 * - Redirect to the session URL
 */
export const redirectToCheckout = async (options: {
    email?: string;
    customerName?: string;
    userId?: string;
}) => {
    // If using Stripe Payment Links (simpler, no backend needed):
    // Uncomment and add your payment link URL
    // const paymentLinkUrl = 'https://buy.stripe.com/YOUR_PAYMENT_LINK_ID';
    // window.location.href = paymentLinkUrl + (options.email ? `?prefilled_email=${encodeURIComponent(options.email)}` : '');
    // return;

    // If using Checkout Sessions (more customizable, requires backend):
    try {
        // Create checkout session on your backend
        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: options.email,
                customerName: options.customerName,
                userId: options.userId,
                successUrl: STRIPE_CONFIG.successUrl,
                cancelUrl: STRIPE_CONFIG.cancelUrl,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Checkout session error:', data);
            throw new Error(data.error || 'Failed to create checkout session');
        }

        // Se o usuário já tem assinatura ativa
        if (data.alreadyActive) {
            window.location.href = '/settings';
            return;
        }

        // Redirect to Stripe Checkout
        if (data.url) {
            window.location.href = data.url;
        } else {
            throw new Error('No checkout URL returned from server');
        }
    } catch (error) {
        console.error('Error redirecting to checkout:', error);
        throw error;
    }
};

/**
 * Open Customer Portal for subscription management
 * Allows customers to update payment methods, view invoices, and cancel subscriptions
 */
export const openCustomerPortal = async (customerId: string) => {
    try {
        const response = await fetch('/api/create-portal-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customerId,
                returnUrl: window.location.origin + '/settings',
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to create portal session');
        }

        const { url } = await response.json();
        window.location.href = url;
    } catch (error) {
        console.error('Error opening customer portal:', error);
        throw error;
    }
};

// ============================================
// WEBHOOK EVENT TYPES
// ============================================

export type StripeWebhookEvent =
    | 'checkout.session.completed'
    | 'customer.subscription.created'
    | 'customer.subscription.updated'
    | 'customer.subscription.deleted'
    | 'invoice.paid'
    | 'invoice.payment_failed';

// ============================================
// BACKEND SETUP GUIDE
// ============================================

/**
 * BACKEND SETUP INSTRUCTIONS
 *
 * If you're using Express.js, add these endpoints:
 *
 * 1. Create Checkout Session:
 *
 * app.post('/api/create-checkout-session', async (req, res) => {
 *   const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
 *   const { priceId, email, customerName, userId, successUrl, cancelUrl } = req.body;
 *
 *   const session = await stripe.checkout.sessions.create({
 *     mode: 'subscription',
 *     payment_method_types: ['card'],
 *     line_items: [{ price: priceId, quantity: 1 }],
 *     success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}',
 *     cancel_url: cancelUrl,
 *     customer_email: email,
 *     client_reference_id: userId,
 *     metadata: { userId, customerName },
 *     allow_promotion_codes: true,
 *     billing_address_collection: 'auto',
 *   });
 *
 *   res.json({ url: session.url });
 * });
 *
 * 2. Create Customer Portal Session:
 *
 * app.post('/api/create-portal-session', async (req, res) => {
 *   const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
 *   const { customerId, returnUrl } = req.body;
 *
 *   const session = await stripe.billingPortal.sessions.create({
 *     customer: customerId,
 *     return_url: returnUrl,
 *   });
 *
 *   res.json({ url: session.url });
 * });
 *
 * 3. Webhook Handler:
 *
 * app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
 *   const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
 *   const sig = req.headers['stripe-signature'];
 *
 *   let event;
 *   try {
 *     event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
 *   } catch (err) {
 *     return res.status(400).send(`Webhook Error: ${err.message}`);
 *   }
 *
 *   switch (event.type) {
 *     case 'checkout.session.completed':
 *       // Activate subscription in your database
 *       const session = event.data.object;
 *       await updateUserSubscription(session.client_reference_id, 'active', session.customer);
 *       break;
 *     case 'customer.subscription.deleted':
 *       // Cancel subscription in your database
 *       const subscription = event.data.object;
 *       await updateUserSubscription(null, 'cancelled', subscription.customer);
 *       break;
 *   }
 *
 *   res.json({ received: true });
 * });
 */
