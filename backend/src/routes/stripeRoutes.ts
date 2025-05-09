// src/routes/stripeRoutes.ts
import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { protect } from '../middleware/authMiddleware';
import { 
  createCheckout,
  stripeWebhook,
  getSubscriptionInfo,
  cancelUserSubscription,
  reactivateUserSubscription,
  changePlan
} from '../controllers/stripeController';
import { createCheckoutSession } from '../services/stripeService';

const router = express.Router();

// Função para lidar com erros assíncronos
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Rota de teste para checkout
router.get('/test-checkout', (req: Request, res: Response) => {
  try {
    // ID de usuário real obtido da base de dados
    const userId = "681aa3cd00512617d88df5ae"; // ID do usuário "teste@exemplo.com"
    const userEmail = "teste@exemplo.com";
    const isAnnual = req.query.annual === 'true';
    
    // Criar URL de checkout
    createCheckoutSession(
      userId,
      userEmail,
      isAnnual
    )
      .then(checkoutUrl => {
        res.redirect(checkoutUrl);
      })
      .catch(error => {
        console.error('Erro no teste de checkout:', error);
        res.status(500).send('Erro no teste de checkout');
      });
  } catch (error) {
    console.error('Erro no teste de checkout:', error);
    res.status(500).send('Erro no teste de checkout');
  }
});

// Webhook para eventos do Stripe
router.post('/webhook', asyncHandler(function(req: Request, res: Response) {
  return stripeWebhook(req, res);
}));

// Rotas protegidas
router.post('/create-checkout', protect, asyncHandler(function(req: Request, res: Response) {
  return createCheckout(req, res);
}));

router.get('/subscription', protect, asyncHandler(function(req: Request, res: Response) {
  return getSubscriptionInfo(req, res);
}));

router.post('/cancel', protect, asyncHandler(function(req: Request, res: Response) {
  return cancelUserSubscription(req, res);
}));

router.post('/reactivate', protect, asyncHandler(function(req: Request, res: Response) {
  return reactivateUserSubscription(req, res);
}));

router.post('/change-plan', protect, asyncHandler(function(req: Request, res: Response) {
  return changePlan(req, res);
}));

export default router;