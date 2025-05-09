// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface UserPayload {
  id: string;
}

// Middleware para proteger rotas
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token;

    // Verificar se o token está no header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Pegar token do header
      token = req.headers.authorization.split(' ')[1];
    }

    // Verificar se o token existe
    if (!token) {
      res.status(401).json({ message: 'Não autorizado, token não encontrado' });
      return;
    }

    // Verificar token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default_secret'
    ) as UserPayload;

    // Adicionar usuário à requisição
    const user = await User.findById(decoded.id).select('-passwordHash');
    
    if (!user) {
      res.status(401).json({ message: 'Não autorizado, usuário não encontrado' });
      return;
    }

    // Adicionar usuário ao request
    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    res.status(401).json({ message: 'Não autorizado, token inválido' });
  }
};

// Adicionar um alias para manter compatibilidade com código existente
export const authMiddleware = protect;