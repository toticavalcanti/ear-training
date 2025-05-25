"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/authRoutes.ts
const express_1 = __importDefault(require("express"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Rota de teste simples para verificar se o roteador está funcionando
router.get('/test', (req, res) => {
    console.log('Rota de teste auth acessada');
    res.json({ message: 'Rota de autenticação funcionando!' });
});
// Rotas públicas
router.post('/register', (0, express_async_handler_1.default)(authController_1.register));
router.post('/login', (0, express_async_handler_1.default)(authController_1.login));
// Rota protegida
router.get('/me', authMiddleware_1.protect, (0, express_async_handler_1.default)(authController_1.getMe));
exports.default = router;
