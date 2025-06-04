// ===================================
// src/routes/gamificationRoutes.ts - USANDO SEU CONTROLLER
// ===================================
import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getUserProgress,
  getUserAchievements,
  getLeaderboard,
  getUserRank
} from '../controllers/gamificationController';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(protect);

// ===================================
// ROTA BÁSICA DE TESTE
// ===================================
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Sistema de gamificação funcionando!',
    timestamp: new Date().toISOString()
  });
});

// ===================================
// USAR SEU CONTROLLER EXISTENTE
// ===================================
router.get('/progress', getUserProgress);
router.get('/achievements', getUserAchievements);
router.get('/leaderboard', getLeaderboard);
router.get('/rank', getUserRank);

// ===================================
// 🆕 SUBMIT FRONTEND (SIMPLES)
// ===================================
router.post('/submit-frontend', async (req, res) => {
  try {
    const user = (req as any).user;
    const { userAnswer, correctAnswer, timeSpent } = req.body;
    
    const isCorrect = userAnswer === correctAnswer;
    
    res.json({
      success: true,
      isCorrect,
      message: isCorrect ? '✅ Correto!' : '❌ Incorreto',
      experienceGained: isCorrect ? 15 : 5
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Erro interno' });
  }
});

export default router;