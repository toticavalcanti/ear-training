"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/stripeRoutes.ts
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const stripeController_1 = require("../controllers/stripeController");
const stripeService_1 = require("../services/stripeService");
const router = express_1.default.Router();
// Função para lidar com erros assíncronos
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
// Rota de teste para checkout
router.get('/test-checkout', (req, res) => {
    try {
        // ID de usuário real obtido da base de dados
        const userId = "681aa3cd00512617d88df5ae"; // ID do usuário "teste@exemplo.com"
        const userEmail = "teste@exemplo.com";
        const isAnnual = req.query.annual === 'true';
        // Criar URL de checkout
        (0, stripeService_1.createCheckoutSession)(userId, userEmail, isAnnual)
            .then(checkoutUrl => {
            res.redirect(checkoutUrl);
        })
            .catch(error => {
            console.error('Erro no teste de checkout:', error);
            res.status(500).send('Erro no teste de checkout');
        });
    }
    catch (error) {
        console.error('Erro no teste de checkout:', error);
        res.status(500).send('Erro no teste de checkout');
    }
});
// Webhook para eventos do Stripe
router.post('/webhook', asyncHandler(function (req, res) {
    return (0, stripeController_1.stripeWebhook)(req, res);
}));
// Rotas protegidas
router.post('/create-checkout', authMiddleware_1.protect, asyncHandler(function (req, res) {
    return (0, stripeController_1.createCheckout)(req, res);
}));
router.get('/subscription', authMiddleware_1.protect, asyncHandler(function (req, res) {
    return (0, stripeController_1.getSubscriptionInfo)(req, res);
}));
router.post('/cancel', authMiddleware_1.protect, asyncHandler(function (req, res) {
    return (0, stripeController_1.cancelUserSubscription)(req, res);
}));
router.post('/reactivate', authMiddleware_1.protect, asyncHandler(function (req, res) {
    return (0, stripeController_1.reactivateUserSubscription)(req, res);
}));
router.post('/change-plan', authMiddleware_1.protect, asyncHandler(function (req, res) {
    return (0, stripeController_1.changePlan)(req, res);
}));
exports.default = router;
