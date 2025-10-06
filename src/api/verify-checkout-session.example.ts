/**
 * PRODUCTION EXAMPLE - Verify Stripe Checkout Session
 * 
 * Este é um exemplo de implementação real do endpoint de verificação.
 * Copie este código para seu backend (Next.js API route, Express, etc.)
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

/**
 * Next.js API Route Handler
 * File: pages/api/verify-checkout-session.ts (Next.js 12/13)
 * or app/api/verify-checkout-session/route.ts (Next.js 13+ App Router)
 */

// Next.js 12/13 Pages Router
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId } = req.body;

  // Validate session ID
  if (!sessionId) {
    return res.status(400).json({ 
      status: 'failed',
      error: 'Session ID is required' 
    });
  }

  try {
    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'subscription']
    });

    // Validate session
    if (!session) {
      return res.status(404).json({ 
        status: 'failed',
        error: 'Session not found' 
      });
    }

    // Check payment status
    if (session.payment_status === 'unpaid') {
      return res.status(200).json({
        status: 'pending',
        message: 'Payment has not been completed yet'
      });
    }

    if (session.payment_status !== 'paid') {
      return res.status(200).json({
        status: 'failed',
        message: 'Payment failed or was cancelled'
      });
    }

    // Extract metadata
    const planId = session.metadata?.planId as 'starter' | 'professional';
    const billingPeriod = session.metadata?.billingPeriod as 'monthly' | 'yearly';
    const userId = session.metadata?.userId;

    if (!planId || !billingPeriod) {
      throw new Error('Missing plan metadata');
    }

    // Map plan to credits
    const creditsMap = {
      starter: 100,
      professional: 200,
    };

    const planNames = {
      starter: 'Starter',
      professional: 'Professional',
    };

    // Convert amount from cents to currency
    const amount = (session.amount_total || 0) / 100;

    // Prepare response
    const response = {
      status: 'success' as const,
      planId,
      planName: planNames[planId],
      billingPeriod,
      amount,
      currency: session.currency?.toUpperCase() || 'BRL',
      credits: creditsMap[planId],
      customerEmail: session.customer_email || session.customer_details?.email || '',
      timestamp: new Date(session.created * 1000).toISOString(),
      subscriptionId: typeof session.subscription === 'string' 
        ? session.subscription 
        : session.subscription?.id,
      customerId: typeof session.customer === 'string'
        ? session.customer
        : session.customer?.id,
    };

    // IMPORTANT: Update user's plan in database
    // This should ideally be done in a webhook, but as a fallback:
    if (userId) {
      await updateUserPlan({
        userId,
        planId,
        billingPeriod,
        subscriptionId: response.subscriptionId,
        customerId: response.customerId,
        credits: response.credits,
      });
    }

    return res.status(200).json(response);

  } catch (error: any) {
    console.error('Error verifying checkout session:', error);
    
    // Handle specific Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ 
        status: 'failed',
        error: 'Invalid session ID' 
      });
    }

    return res.status(500).json({ 
      status: 'failed',
      error: 'Failed to verify checkout session' 
    });
  }
}

/**
 * Helper function to update user's plan in database
 * Implement according to your database schema
 */
async function updateUserPlan(data: {
  userId: string;
  planId: string;
  billingPeriod: string;
  subscriptionId?: string;
  customerId?: string;
  credits: number;
}) {
  // Example with Prisma
  /*
  await prisma.user.update({
    where: { id: data.userId },
    data: {
      plan: data.planId,
      billingPeriod: data.billingPeriod,
      stripeSubscriptionId: data.subscriptionId,
      stripeCustomerId: data.customerId,
      credits: {
        increment: data.credits
      },
      planActivatedAt: new Date(),
    }
  });

  // Create transaction record
  await prisma.transaction.create({
    data: {
      userId: data.userId,
      type: 'UPGRADE',
      planId: data.planId,
      billingPeriod: data.billingPeriod,
      creditsAdded: data.credits,
      subscriptionId: data.subscriptionId,
      status: 'COMPLETED',
    }
  });
  */

  // Example with MongoDB
  /*
  await db.collection('users').updateOne(
    { _id: new ObjectId(data.userId) },
    {
      $set: {
        plan: data.planId,
        billingPeriod: data.billingPeriod,
        stripeSubscriptionId: data.subscriptionId,
        stripeCustomerId: data.customerId,
        planActivatedAt: new Date(),
      },
      $inc: {
        credits: data.credits
      }
    }
  );
  */

  console.log('User plan updated:', data);
}

/**
 * Next.js 13+ App Router Example
 * File: app/api/verify-checkout-session/route.ts
 */

/*
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { sessionId } = await request.json();
  
  // ... same logic as above ...
  
  return NextResponse.json(response);
}
*/

/**
 * Express.js Example
 */

/*
import express from 'express';

const app = express();

app.post('/api/verify-checkout-session', async (req, res) => {
  const { sessionId } = req.body;
  
  // ... same logic as above ...
  
  res.json(response);
});
*/
