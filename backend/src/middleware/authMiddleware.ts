// src/middleware/authMiddleware.ts - VERSÃO FINAL COM TODOS OS EXPORTS
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Interface para adicionar userId ao Request
export interface AuthRequest extends Request {
  userId?: string;
}

// Interface para o payload do JWT
interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

// MIDDLEWARE DE AUTENTICAÇÃO
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Token não fornecido' });
      return;
    }

    const token = authHeader.substring(7);

    if (!process.env.JWT_SECRET) {
      res.status(500).json({ message: 'Erro de configuração do servidor' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expirado' });
      return;
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Token inválido' });
      return;
    }
    
    res.status(401).json({ message: 'Falha na autenticação' });
  }
};

// EXPORT ALIASES PARA COMPATIBILIDADE
export const protect = authMiddleware;  // Para userRoutes.ts
export default authMiddleware;