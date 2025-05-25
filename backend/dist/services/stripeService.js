"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebhook = exports.changeSubscriptionPlan = exports.updateSubscriptionPaymentMethod = exports.reactivateSubscription = exports.cancelSubscription = exports.checkSubscriptionStatus = exports.createCheckoutSession = void 0;
// src/services/stripeService.ts
const stripe_1 = __importDefault(require("stripe"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: process.env.STRIPE_API_VERSION || '2025-04-30.basil',
});
// Criar sessão de checkout para assinatura
const createCheckoutSession = async (userId, customerEmail, isAnnual = false) => {
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
    }
    catch (error) {
        console.error('Erro ao criar sessão Stripe:', error);
        throw new Error('Erro ao processar pagamento');
    }
};
exports.createCheckoutSession = createCheckoutSession;
// Verificar assinatura ativa
const checkSubscriptionStatus = async (subscriptionId) => {
    try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        return subscription.status === 'active';
    }
    catch (error) {
        console.error('Erro ao verificar assinatura:', error);
        return false;
    }
};
exports.checkSubscriptionStatus = checkSubscriptionStatus;
// Cancelar assinatura
const cancelSubscription = async (subscriptionId) => {
    try {
        return await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true
        });
    }
    catch (error) {
        console.error('Erro ao cancelar assinatura:', error);
        throw new Error('Erro ao cancelar assinatura');
    }
};
exports.cancelSubscription = cancelSubscription;
// Reativar assinatura cancelada (se ainda estiver no período pago)
const reactivateSubscription = async (subscriptionId) => {
    try {
        return await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: false
        });
    }
    catch (error) {
        console.error('Erro ao reativar assinatura:', error);
        throw new Error('Erro ao reativar assinatura');
    }
};
exports.reactivateSubscription = reactivateSubscription;
// Atualizar método de pagamento
const updateSubscriptionPaymentMethod = async (subscriptionId, paymentMethodId) => {
    try {
        // Atualizar o método de pagamento padrão do cliente
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await stripe.customers.update(subscription.customer, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });
        // Retornar a assinatura atualizada
        return await stripe.subscriptions.retrieve(subscriptionId);
    }
    catch (error) {
        console.error('Erro ao atualizar método de pagamento:', error);
        throw new Error('Erro ao atualizar método de pagamento');
    }
};
exports.updateSubscriptionPaymentMethod = updateSubscriptionPaymentMethod;
// Trocar plano (de mensal para anual ou vice-versa)
const changeSubscriptionPlan = async (subscriptionId, isAnnual) => {
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
    }
    catch (error) {
        console.error('Erro ao trocar plano:', error);
        throw new Error('Erro ao trocar plano de assinatura');
    }
};
exports.changeSubscriptionPlan = changeSubscriptionPlan;
// Processar eventos de webhook
const handleStripeWebhook = async (body, signature, endpointSecret) => {
    try {
        // Verificar assinatura do webhook
        return stripe.webhooks.constructEvent(body, signature, endpointSecret);
    }
    catch (error) {
        console.error('Erro ao processar webhook:', error);
        throw new Error('Assinatura de webhook inválida');
    }
};
exports.handleStripeWebhook = handleStripeWebhook;
