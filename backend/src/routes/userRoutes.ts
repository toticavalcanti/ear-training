// src/routes/userRoutes.ts
import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { 
  updateProfile, 
  changePassword,
  upgradeSubscription,
  getUserStats
} from '../controllers/userController';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// Atualizar perfil
router.put('/profile', protect, asyncHandler(updateProfile));

// Alterar senha
router.put('/change-password', protect, asyncHandler(changePassword));

// Gerenciar assinatura
router.post('/upgrade', protect, asyncHandler(upgradeSubscription));

// Obter estatísticas do usuário
router.get('/stats', protect, asyncHandler(getUserStats));

export default router;