// src/services/stripeService.ts
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: process.env.STRIPE_API_VERSION as Stripe.LatestApiVersion || '2025-04-30.basil',
});

// Criar sessão de checkout para assinatura
export const createCheckoutSession = async (
  userId: string, 
  customerEmail: string,
  isAnnual: boolean = false
): Promise<string> => {
  try {
    // Selecionar o ID de preço com base no plano escolhido
    const priceId = isAnnual 
      ? process.env.STRIPE_ANNUAL_PRICE_ID 
      : process.env.STRIPE_PRICE_ID;

    // Definir o plano de assinatura
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customerEmail,
      client_reference_id: userId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/payment-cancelled`,
    });

    return session.url || '';
  } catch (error) {
    console.error('Erro ao criar sessão Stripe:', error);
    throw new Error('Erro ao processar pagamento');
  }
};

// Verificar assinatura ativa
export const checkSubscriptionStatus = async (subscriptionId: string): Promise<boolean> => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription.status === 'active';
  } catch (error) {
    console.error('Erro ao verificar assinatura:', error);
    return false;
  }
};

// Cancelar assinatura
export const cancelSubscription = async (subscriptionId: string): Promise<Stripe.Subscription> => {
  try {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    throw new Error('Erro ao cancelar assinatura');
  }
};

// Reativar assinatura cancelada (se ainda estiver no período pago)
export const reactivateSubscription = async (subscriptionId: string): Promise<Stripe.Subscription> => {
  try {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    });
  } catch (error) {
    console.error('Erro ao reativar assinatura:', error);
    throw new Error('Erro ao reativar assinatura');
  }
};

// Atualizar método de pagamento
export const updateSubscriptionPaymentMethod = async (
  subscriptionId: string,
  paymentMethodId: string
): Promise<Stripe.Subscription> => {
  try {
    // Atualizar o método de pagamento padrão do cliente
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    await stripe.customers.update(subscription.customer as string, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    
    // Retornar a assinatura atualizada
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    console.error('Erro ao atualizar método de pagamento:', error);
    throw new Error('Erro ao atualizar método de pagamento');
  }
};

// Trocar plano (de mensal para anual ou vice-versa)
export const changeSubscriptionPlan = async (
  subscriptionId: string,
  isAnnual: boolean
): Promise<Stripe.Subscription> => {
  try {
    // Obter o ID do novo preço
    const newPriceId = isAnnual
      ? process.env.STRIPE_ANNUAL_PRICE_ID
      : process.env.STRIPE_PRICE_ID;
    
    // Atualizar a assinatura com o novo preço
    return await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: (await stripe.subscriptions.retrieve(subscriptionId)).items.data[0].id,
        price: newPriceId,
      }],
      proration_behavior: 'create_prorations',
    });
  } catch (error) {
    console.error('Erro ao trocar plano:', error);
    throw new Error('Erro ao trocar plano de assinatura');
  }
};

// Processar eventos de webhook
export const handleStripeWebhook = async (
  body: any,
  signature: string,
  endpointSecret: string
): Promise<Stripe.Event> => {
  try {
    // Verificar assinatura do webhook
    return stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    throw new Error('Assinatura de webhook inválida');
  }
};