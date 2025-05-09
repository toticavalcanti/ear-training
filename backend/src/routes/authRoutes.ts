// src/routes/authRoutes.ts
import express from 'express';
import asyncHandler from 'express-async-handler';
import { register, login, getMe } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Rota de teste simples para verificar se o roteador está funcionando
router.get('/test', (req, res) => {
  console.log('Rota de teste auth acessada');
  res.json({ message: 'Rota de autenticação funcionando!' });
});

// Rotas públicas
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));

// Rota protegida
router.get('/me', protect, asyncHandler(getMe));

export default router;