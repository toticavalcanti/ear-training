"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscriptionInfo = exports.changePlan = exports.reactivateUserSubscription = exports.cancelUserSubscription = exports.stripeWebhook = exports.createCheckout = void 0;
const stripe_1 = __importDefault(require("stripe"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("../models/User"));
const Subscription_1 = __importDefault(require("../models/Subscription"));
const stripeService_1 = require("../services/stripeService");
dotenv_1.default.config();
// Criar sessão de checkout
const createCheckout = async (req, res) => {
    try {
        const user = req.user;
        const { isAnnual } = req.body;
        // Verificar se o usuário já é premium
        if (user.subscription === "premium") {
            res
                .status(400)
                .json({ message: "Você já possui uma assinatura premium" });
            return;
        }
        // Criar URL de checkout
        const checkoutUrl = await (0, stripeService_1.createCheckoutSession)(user._id, user.email, isAnnual === true);
        // Retornar URL para o frontend
        res.json({ checkoutUrl });
    }
    catch (err) {
        console.error("Erro ao criar checkout:", err);
        res.status(500).json({ message: "Erro ao processar pagamento" });
    }
};
exports.createCheckout = createCheckout;
// Webhook para eventos do Stripe
const stripeWebhook = async (req, res) => {
    try {
        const signature = req.headers["stripe-signature"];
        // Verificar a assinatura do webhook
        const event = await (0, stripeService_1.handleStripeWebhook)(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET || "");
        // Processar o evento
        switch (event.type) {
            case "checkout.session.completed":
                await handleCheckoutCompleted(event);
                break;
            case "customer.subscription.updated":
                await handleSubscriptionUpdated(event);
                break;
            case "customer.subscription.deleted":
                await handleSubscriptionDeleted(event);
                break;
            case "invoice.payment_failed":
                await handlePaymentFailed(event);
                break;
        }
        res.json({ received: true });
    }
    catch (err) {
        console.error("Erro no webhook:", err);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};
exports.stripeWebhook = stripeWebhook;
// Lidar com conclusão do checkout
const handleCheckoutCompleted = async (event) => {
    const session = event.data.object;
    try {
        if (session.client_reference_id && session.subscription) {
            const userId = session.client_reference_id;
            const subscriptionId = session.subscription;
            console.log("Processando checkout completado para usuário:", userId);
            console.log("ID da assinatura:", subscriptionId);
            // Obter dados da assinatura do Stripe
            const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || "", {
                apiVersion: process.env.STRIPE_API_VERSION || "2025-04-30.basil",
            });
            // Buscar dados detalhados da assinatura
            const subscriptionData = await stripe.subscriptions.retrieve(subscriptionId);
            console.log("Dados da assinatura:", JSON.stringify(subscriptionData, null, 2));
            // Usar datas padrão se não for possível obter do Stripe
            const agora = new Date();
            const periodoFinal = new Date();
            periodoFinal.setMonth(periodoFinal.getMonth() + 1); // Padrão: 1 mês a partir de agora
            // Tentar obter o período final do objeto retornado pelo Stripe
            let currentPeriodEnd = periodoFinal;
            if (subscriptionData && typeof subscriptionData.current_period_end === 'number') {
                const timestamp = subscriptionData.current_period_end;
                const dataCalculada = new Date(timestamp * 1000);
                if (!isNaN(dataCalculada.getTime())) {
                    currentPeriodEnd = dataCalculada;
                    console.log("Data de término calculada:", currentPeriodEnd);
                }
                else {
                    console.log("Data de término inválida, usando padrão:", currentPeriodEnd);
                }
            }
            else {
                console.log("Campo current_period_end não encontrado, usando data padrão:", currentPeriodEnd);
            }
            // Atualizar usuário para premium
            await User_1.default.findByIdAndUpdate(userId, { subscription: "premium" });
            // Determinar o plano com base no ID da sessão
            // Como pode ser difícil acessar o price_id, vamos assumir plano mensal por padrão
            const isAnnual = false; // Por padrão, mensal
            // Criar ou atualizar assinatura
            const subscriptionRecord = await Subscription_1.default.findOneAndUpdate({ user: userId }, {
                status: "active",
                plan: isAnnual ? "annual" : "monthly",
                stripeCustomerId: session.customer,
                stripeSubscriptionId: subscriptionId,
                currentPeriodEnd: currentPeriodEnd,
                cancelAtPeriodEnd: false
            }, { upsert: true, new: true });
            console.log("Assinatura atualizada com sucesso:", subscriptionRecord);
        }
        else {
            console.error("Dados incompletos na sessão:", session);
        }
    }
    catch (error) {
        console.error("Erro ao processar checkout completado:", error);
    }
};
// Lidar com atualização de assinatura
const handleSubscriptionUpdated = async (event) => {
    // Corrigido: usando asserção de tipo para acessar propriedades
    const subscription = event.data.object;
    // Buscar a assinatura pelo ID
    const subRecord = await Subscription_1.default.findOne({
        stripeSubscriptionId: subscription.id,
    });
    if (subRecord) {
        // Atualizar status da assinatura
        subRecord.status =
            subscription.status === "active"
                ? "active"
                : subscription.status === "past_due"
                    ? "past_due"
                    : "incomplete";
        // Tentar obter e converter o período final da assinatura
        try {
            if (subscription.current_period_end) {
                const endDate = new Date(subscription.current_period_end * 1000);
                if (!isNaN(endDate.getTime())) {
                    subRecord.currentPeriodEnd = endDate;
                }
            }
        }
        catch (error) {
            console.error("Erro ao processar data de término:", error);
        }
        subRecord.cancelAtPeriodEnd = subscription.cancel_at_period_end;
        // Determinar o plano com base no preço
        if (subscription.items &&
            subscription.items.data &&
            subscription.items.data.length > 0 &&
            subscription.items.data[0].price &&
            subscription.items.data[0].price.id) {
            const priceId = subscription.items.data[0].price.id;
            subRecord.plan = priceId === process.env.STRIPE_ANNUAL_PRICE_ID ? "annual" : "monthly";
        }
        await subRecord.save();
        // Se a assinatura estiver inativa, atualizar o usuário
        if (subscription.status !== "active") {
            await User_1.default.findByIdAndUpdate(subRecord.user, { subscription: "free" });
        }
        else if (subscription.status === "active") {
            await User_1.default.findByIdAndUpdate(subRecord.user, { subscription: "premium" });
        }
    }
};
// Lidar com exclusão de assinatura
const handleSubscriptionDeleted = async (event) => {
    // Corrigido: usando asserção de tipo para acessar propriedades
    const subscription = event.data.object;
    // Buscar a assinatura pelo ID
    const subRecord = await Subscription_1.default.findOne({
        stripeSubscriptionId: subscription.id,
    });
    if (subRecord) {
        // Atualizar status da assinatura
        subRecord.status = "cancelled";
        await subRecord.save();
        // Atualizar usuário para plano gratuito
        await User_1.default.findByIdAndUpdate(subRecord.user, { subscription: "free" });
    }
};
// Lidar com falha de pagamento
const handlePaymentFailed = async (event) => {
    // Corrigido: usando asserção de tipo para acessar propriedades
    const invoice = event.data.object;
    if (invoice.subscription) {
        // Buscar a assinatura pelo ID
        const subRecord = await Subscription_1.default.findOne({
            stripeSubscriptionId: invoice.subscription,
        });
        if (subRecord) {
            // Atualizar status da assinatura
            subRecord.status = "past_due";
            await subRecord.save();
        }
    }
};
// Cancelar assinatura
const cancelUserSubscription = async (req, res) => {
    try {
        const user = req.user;
        // Buscar assinatura do usuário
        const subscription = await Subscription_1.default.findOne({ user: user._id });
        if (!subscription) {
            res.status(404).json({ message: "Assinatura não encontrada" });
            return;
        }
        // Cancelar assinatura no Stripe
        await (0, stripeService_1.cancelSubscription)(subscription.stripeSubscriptionId);
        // Atualizar status no banco de dados
        subscription.cancelAtPeriodEnd = true;
        await subscription.save();
        res.json({
            message: "Assinatura cancelada com sucesso. Você terá acesso premium até o final do período pago.",
            subscription,
        });
    }
    catch (err) {
        console.error("Erro ao cancelar assinatura:", err);
        res.status(500).json({ message: "Erro ao cancelar assinatura" });
    }
};
exports.cancelUserSubscription = cancelUserSubscription;
// Reativar assinatura
const reactivateUserSubscription = async (req, res) => {
    try {
        const user = req.user;
        // Buscar assinatura do usuário
        const subscription = await Subscription_1.default.findOne({ user: user._id });
        if (!subscription) {
            res.status(404).json({ message: "Assinatura não encontrada" });
            return;
        }
        if (!subscription.cancelAtPeriodEnd) {
            res.status(400).json({ message: "Sua assinatura já está ativa" });
            return;
        }
        // Reativar assinatura no Stripe
        await (0, stripeService_1.reactivateSubscription)(subscription.stripeSubscriptionId);
        // Atualizar status no banco de dados
        subscription.cancelAtPeriodEnd = false;
        await subscription.save();
        res.json({
            message: "Assinatura reativada com sucesso.",
            subscription,
        });
    }
    catch (err) {
        console.error("Erro ao reativar assinatura:", err);
        res.status(500).json({ message: "Erro ao reativar assinatura" });
    }
};
exports.reactivateUserSubscription = reactivateUserSubscription;
// Trocar plano
const changePlan = async (req, res) => {
    try {
        const user = req.user;
        const { isAnnual } = req.body;
        // Buscar assinatura do usuário
        const subscription = await Subscription_1.default.findOne({ user: user._id });
        if (!subscription) {
            res.status(404).json({ message: "Assinatura não encontrada" });
            return;
        }
        // Verificar se já está no plano desejado
        const currentPlan = subscription.plan;
        if ((currentPlan === "annual" && isAnnual) ||
            (currentPlan === "monthly" && !isAnnual)) {
            res.status(400).json({ message: "Você já está inscrito neste plano" });
            return;
        }
        // Trocar plano no Stripe
        await (0, stripeService_1.changeSubscriptionPlan)(subscription.stripeSubscriptionId, isAnnual);
        // Atualizar plano no banco de dados
        subscription.plan = isAnnual ? "annual" : "monthly";
        await subscription.save();
        res.json({
            message: `Plano alterado com sucesso para ${isAnnual ? "anual" : "mensal"}.`,
            subscription,
        });
    }
    catch (err) {
        console.error("Erro ao trocar plano:", err);
        res.status(500).json({ message: "Erro ao trocar plano" });
    }
};
exports.changePlan = changePlan;
// Obter informações da assinatura
const getSubscriptionInfo = async (req, res) => {
    try {
        const user = req.user;
        // Buscar informações da assinatura
        const subscription = await Subscription_1.default.findOne({ user: user._id });
        res.json({
            subscription: user.subscription,
            isActive: user.subscription === "premium",
            details: subscription || null,
            canUpgrade: user.subscription !== "premium",
        });
    }
    catch (err) {
        console.error("Erro ao obter informações da assinatura:", err);
        res
            .status(500)
            .json({ message: "Erro ao obter informações da assinatura" });
    }
};
exports.getSubscriptionInfo = getSubscriptionInfo;
