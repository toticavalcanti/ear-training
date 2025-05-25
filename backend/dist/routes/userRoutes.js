"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/userRoutes.ts
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const userController_1 = require("../controllers/userController");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const router = express_1.default.Router();
// Atualizar perfil
router.put('/profile', authMiddleware_1.protect, (0, express_async_handler_1.default)(userController_1.updateProfile));
// Alterar senha
router.put('/change-password', authMiddleware_1.protect, (0, express_async_handler_1.default)(userController_1.changePassword));
// Gerenciar assinatura
router.post('/upgrade', authMiddleware_1.protect, (0, express_async_handler_1.default)(userController_1.upgradeSubscription));
// Obter estatísticas do usuário
router.get('/stats', authMiddleware_1.protect, (0, express_async_handler_1.default)(userController_1.getUserStats));
exports.default = router;
