// src/routes/exerciseRoutes.ts
import { Router } from 'express';
import {
  getExercise,
  checkAnswer, // Substituir submitAnswer por checkAnswer
  getExerciseHistory, // Substituir getHistory por getExerciseHistory
  getUserStats, // Adicionar esta função se necessário
} from '../controllers/exerciseController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Rotas protegidas por autenticação
router.use(authMiddleware);

// Obter um exercício
router.get('/get', getExercise);

// Verificar resposta
router.post('/check', checkAnswer); // Atualizado para checkAnswer

// Obter histórico de exercícios
router.get('/history', getExerciseHistory); // Atualizado para getExerciseHistory

// Obter estatísticas do usuário
router.get('/stats', getUserStats);

export default router;