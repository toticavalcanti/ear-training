// src/routes/authRoutes.ts - VERSÃO FINAL QUE FUNCIONA
import express, { Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { register, login, googleLogin, getProfile } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Interface para request com user (do Passport)
interface PassportRequest extends Request {
  user?: any;
}

// Função para gerar JWT
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '30d' });
};

// ===================================
// ROTAS TRADICIONAIS
// ===================================

// 📝 REGISTRO TRADICIONAL
router.post('/register', register);

// 🔐 LOGIN TRADICIONAL
router.post('/login', login);

// 👤 PERFIL DO USUÁRIO
router.get('/me', authMiddleware, getProfile);

// ===================================
// ROTAS GOOGLE OAUTH
// ===================================

// 🔐 LOGIN GOOGLE DIRETO
router.post('/google-login', googleLogin);

// 🌐 INICIAR GOOGLE OAUTH (navegador)
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

// 🔄 CALLBACK GOOGLE OAUTH
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/auth/error' }),
  async (req: PassportRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.redirect(`/auth/error?message=${encodeURIComponent('Usuário não encontrado')}`);
        return;
      }

      const token = generateToken((req.user._id as any).toString());
      const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/success?token=${token}`);
      
    } catch (error) {
      console.error('Erro no callback Google:', error);
      res.redirect(`/auth/error?message=${encodeURIComponent('Erro interno do servidor')}`);
    }
  }
);

// 🧪 ROTA DE TESTE
router.get('/test', (req: Request, res: Response): void => {
  res.json({ 
    message: 'Auth routes funcionando!',
    routes: [
      'POST /api/auth/register',
      'POST /api/auth/login', 
      'GET /api/auth/me',
      'POST /api/auth/google-login',
      'GET /api/auth/google'
    ]
  });
});

export default router;