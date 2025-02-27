import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

export async function createPaymentIntent(amount: number, metadata: any) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw error;
  }
}

export async function handleWebhook(signature: string | string[], rawBody: Buffer) {
  try {
    if (Array.isArray(signature)) {
      signature = signature[0];
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable');
    }

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (error) {
    console.error('Error handling webhook:', error);
    throw error;
  }
}