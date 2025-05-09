// src/controllers/stripeController.ts
import { Request, Response } from "express";
import Stripe from "stripe";
import dotenv from 'dotenv';
import User from "../models/User";
import Subscription from "../models/Subscription";
import {
  createCheckoutSession,
  cancelSubscription,
  reactivateSubscription,
  changeSubscriptionPlan,
  handleStripeWebhook,
} from "../services/stripeService";

dotenv.config();

// Criar sessão de checkout
export const createCheckout = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = (req as any).user;
    const { isAnnual } = req.body;

    // Verificar se o usuário já é premium
    if (user.subscription === "premium") {
      res
        .status(400)
        .json({ message: "Você já possui uma assinatura premium" });
      return;
    }

    // Criar URL de checkout
    const checkoutUrl = await createCheckoutSession(
      user._id,
      user.email,
      isAnnual === true
    );

    // Retornar URL para o frontend
    res.json({ checkoutUrl });
  } catch (err: any) {
    console.error("Erro ao criar checkout:", err);
    res.status(500).json({ message: "Erro ao processar pagamento" });
  }
};

// Webhook para eventos do Stripe
export const stripeWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const signature = req.headers["stripe-signature"] as string;

    // Verificar a assinatura do webhook
    const event = await handleStripeWebhook(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );

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
  } catch (err: any) {
    console.error("Erro no webhook:", err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

// Lidar com conclusão do checkout
const handleCheckoutCompleted = async (event: Stripe.Event): Promise<void> => {
  const session = event.data.object as Stripe.Checkout.Session;

  try {
    if (session.client_reference_id && session.subscription) {
      const userId = session.client_reference_id;
      const subscriptionId = session.subscription as string;

      console.log("Processando checkout completado para usuário:", userId);
      console.log("ID da assinatura:", subscriptionId);

      // Obter dados da assinatura do Stripe
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
        apiVersion: process.env.STRIPE_API_VERSION as Stripe.LatestApiVersion || "2025-04-30.basil",
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
      if (subscriptionData && typeof (subscriptionData as any).current_period_end === 'number') {
        const timestamp = (subscriptionData as any).current_period_end;
        const dataCalculada = new Date(timestamp * 1000);
        
        if (!isNaN(dataCalculada.getTime())) {
          currentPeriodEnd = dataCalculada;
          console.log("Data de término calculada:", currentPeriodEnd);
        } else {
          console.log("Data de término inválida, usando padrão:", currentPeriodEnd);
        }
      } else {
        console.log("Campo current_period_end não encontrado, usando data padrão:", currentPeriodEnd);
      }

      // Atualizar usuário para premium
      await User.findByIdAndUpdate(userId, { subscription: "premium" });

      // Determinar o plano com base no ID da sessão
      // Como pode ser difícil acessar o price_id, vamos assumir plano mensal por padrão
      const isAnnual = false; // Por padrão, mensal

      // Criar ou atualizar assinatura
      const subscriptionRecord = await Subscription.findOneAndUpdate(
        { user: userId },
        {
          status: "active",
          plan: isAnnual ? "annual" : "monthly",
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscriptionId,
          currentPeriodEnd: currentPeriodEnd,
          cancelAtPeriodEnd: false
        },
        { upsert: true, new: true }
      );

      console.log("Assinatura atualizada com sucesso:", subscriptionRecord);
    } else {
      console.error("Dados incompletos na sessão:", session);
    }
  } catch (error) {
    console.error("Erro ao processar checkout completado:", error);
  }
};

// Lidar com atualização de assinatura
const handleSubscriptionUpdated = async (
  event: Stripe.Event
): Promise<void> => {
  // Corrigido: usando asserção de tipo para acessar propriedades
  const subscription = event.data.object as any;

  // Buscar a assinatura pelo ID
  const subRecord = await Subscription.findOne({
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
    } catch (error) {
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
      await User.findByIdAndUpdate(subRecord.user, { subscription: "free" });
    } else if (subscription.status === "active") {
      await User.findByIdAndUpdate(subRecord.user, { subscription: "premium" });
    }
  }
};

// Lidar com exclusão de assinatura
const handleSubscriptionDeleted = async (
  event: Stripe.Event
): Promise<void> => {
  // Corrigido: usando asserção de tipo para acessar propriedades
  const subscription = event.data.object as any;

  // Buscar a assinatura pelo ID
  const subRecord = await Subscription.findOne({
    stripeSubscriptionId: subscription.id,
  });

  if (subRecord) {
    // Atualizar status da assinatura
    subRecord.status = "cancelled";
    await subRecord.save();

    // Atualizar usuário para plano gratuito
    await User.findByIdAndUpdate(subRecord.user, { subscription: "free" });
  }
};

// Lidar com falha de pagamento
const handlePaymentFailed = async (event: Stripe.Event): Promise<void> => {
  // Corrigido: usando asserção de tipo para acessar propriedades
  const invoice = event.data.object as any;

  if (invoice.subscription) {
    // Buscar a assinatura pelo ID
    const subRecord = await Subscription.findOne({
      stripeSubscriptionId: invoice.subscription as string,
    });

    if (subRecord) {
      // Atualizar status da assinatura
      subRecord.status = "past_due";
      await subRecord.save();
    }
  }
};

// Cancelar assinatura
export const cancelUserSubscription = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = (req as any).user;

    // Buscar assinatura do usuário
    const subscription = await Subscription.findOne({ user: user._id });

    if (!subscription) {
      res.status(404).json({ message: "Assinatura não encontrada" });
      return;
    }

    // Cancelar assinatura no Stripe
    await cancelSubscription(subscription.stripeSubscriptionId);

    // Atualizar status no banco de dados
    subscription.cancelAtPeriodEnd = true;
    await subscription.save();

    res.json({
      message:
        "Assinatura cancelada com sucesso. Você terá acesso premium até o final do período pago.",
      subscription,
    });
  } catch (err: any) {
    console.error("Erro ao cancelar assinatura:", err);
    res.status(500).json({ message: "Erro ao cancelar assinatura" });
  }
};

// Reativar assinatura
export const reactivateUserSubscription = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = (req as any).user;

    // Buscar assinatura do usuário
    const subscription = await Subscription.findOne({ user: user._id });

    if (!subscription) {
      res.status(404).json({ message: "Assinatura não encontrada" });
      return;
    }

    if (!subscription.cancelAtPeriodEnd) {
      res.status(400).json({ message: "Sua assinatura já está ativa" });
      return;
    }

    // Reativar assinatura no Stripe
    await reactivateSubscription(subscription.stripeSubscriptionId);

    // Atualizar status no banco de dados
    subscription.cancelAtPeriodEnd = false;
    await subscription.save();

    res.json({
      message: "Assinatura reativada com sucesso.",
      subscription,
    });
  } catch (err: any) {
    console.error("Erro ao reativar assinatura:", err);
    res.status(500).json({ message: "Erro ao reativar assinatura" });
  }
};

// Trocar plano
export const changePlan = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = (req as any).user;
    const { isAnnual } = req.body;

    // Buscar assinatura do usuário
    const subscription = await Subscription.findOne({ user: user._id });

    if (!subscription) {
      res.status(404).json({ message: "Assinatura não encontrada" });
      return;
    }

    // Verificar se já está no plano desejado
    const currentPlan = subscription.plan;
    if (
      (currentPlan === "annual" && isAnnual) ||
      (currentPlan === "monthly" && !isAnnual)
    ) {
      res.status(400).json({ message: "Você já está inscrito neste plano" });
      return;
    }

    // Trocar plano no Stripe
    await changeSubscriptionPlan(subscription.stripeSubscriptionId, isAnnual);

    // Atualizar plano no banco de dados
    subscription.plan = isAnnual ? "annual" : "monthly";
    await subscription.save();

    res.json({
      message: `Plano alterado com sucesso para ${
        isAnnual ? "anual" : "mensal"
      }.`,
      subscription,
    });
  } catch (err: any) {
    console.error("Erro ao trocar plano:", err);
    res.status(500).json({ message: "Erro ao trocar plano" });
  }
};

// Obter informações da assinatura
export const getSubscriptionInfo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = (req as any).user;

    // Buscar informações da assinatura
    const subscription = await Subscription.findOne({ user: user._id });

    res.json({
      subscription: user.subscription,
      isActive: user.subscription === "premium",
      details: subscription || null,
      canUpgrade: user.subscription !== "premium",
    });
  } catch (err: any) {
    console.error("Erro ao obter informações da assinatura:", err);
    res
      .status(500)
      .json({ message: "Erro ao obter informações da assinatura" });
  }
};