/**
 * MOCK API - Stripe Checkout Session
 * 
 * Em produção, este endpoint deve:
 * 1. Validar o usuário autenticado
 * 2. Criar uma sessão de checkout no Stripe
 * 3. Retornar a checkout_url
 * 
 * Documentação Stripe: https://stripe.com/docs/api/checkout/sessions/create
 */

export interface CreateCheckoutSessionRequest {
  planId: 'starter' | 'professional';
  billingPeriod: 'monthly' | 'yearly';
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionResponse {
  checkout_url: string;
  session_id: string;
}

/**
 * MOCK - Simula a criação de uma sessão de checkout do Stripe
 * 
 * Em produção, substitua por:
 * 
 * ```typescript
 * import Stripe from 'stripe';
 * const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
 * 
 * export default async function handler(req, res) {
 *   if (req.method !== 'POST') {
 *     return res.status(405).json({ error: 'Method not allowed' });
 *   }
 * 
 *   const { planId, billingPeriod, successUrl, cancelUrl } = req.body;
 * 
 *   // Map planId to Stripe Price ID
 *   const priceId = getPriceIdForPlan(planId, billingPeriod);
 * 
 *   const session = await stripe.checkout.sessions.create({
 *     mode: 'subscription',
 *     payment_method_types: ['card'],
 *     line_items: [
 *       {
 *         price: priceId,
 *         quantity: 1,
 *       },
 *     ],
 *     success_url: successUrl,
 *     cancel_url: cancelUrl,
 *     customer_email: req.user.email, // From your auth system
 *     metadata: {
 *       userId: req.user.id,
 *       planId,
 *       billingPeriod,
 *     },
 *   });
 * 
 *   res.status(200).json({
 *     checkout_url: session.url,
 *     session_id: session.id,
 *   });
 * }
 * ```
 */

export async function createCheckoutSession(
  request: CreateCheckoutSessionRequest
): Promise<CreateCheckoutSessionResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock response
  return {
    checkout_url: `https://checkout.stripe.com/c/pay/mock-session-${Date.now()}`,
    session_id: `cs_test_mock_${Date.now()}`
  };
}

/**
 * Stripe Price IDs (configure no seu dashboard do Stripe)
 * 
 * Exemplo de mapeamento:
 */
export const STRIPE_PRICE_IDS = {
  starter_monthly: 'price_starter_monthly_xxx',
  starter_yearly: 'price_starter_yearly_xxx',
  professional_monthly: 'price_professional_monthly_xxx',
  professional_yearly: 'price_professional_yearly_xxx',
} as const;

/**
 * Helper function para obter o Price ID correto
 */
export function getPriceIdForPlan(
  planId: 'starter' | 'professional',
  billingPeriod: 'monthly' | 'yearly'
): string {
  const key = `${planId}_${billingPeriod}` as keyof typeof STRIPE_PRICE_IDS;
  return STRIPE_PRICE_IDS[key];
}
