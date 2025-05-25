"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/exerciseRoutes.ts
const express_1 = require("express");
const exerciseController_1 = require("../controllers/exerciseController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Rotas protegidas por autenticação
router.use(authMiddleware_1.authMiddleware);
// Obter um exercício
router.get('/get', exerciseController_1.getExercise);
// Verificar resposta
router.post('/check', exerciseController_1.checkAnswer); // Atualizado para checkAnswer
// Obter histórico de exercícios
router.get('/history', exerciseController_1.getExerciseHistory); // Atualizado para getExerciseHistory
// Obter estatísticas do usuário
router.get('/stats', exerciseController_1.getUserStats);
exports.default = router;
