// src/lib/auth-utils.ts
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id?: string;
  userId?: string;
  email?: string;
  iat?: number;
  exp?: number;
}

/**
 * Extrai e valida o userId do token JWT no header Authorization
 * Mesma lógica usada em /api/users/me que funciona perfeitamente
 */
export async function getUserFromToken(request: NextRequest): Promise<string | null> {
  try {
    console.log('🔍 Verificando token JWT...');
    
    // Verificar token JWT (igual /api/users/me)
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Token não fornecido ou formato inválido');
      return null;
    }

    const token = authHeader.substring(7);
    console.log('🔍 Token extraído, verificando...');

    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET não configurado');
      return null;
    }

    // Verificar e decodificar token (igual /api/users/me)
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    const userId = decoded.id || decoded.userId;

    if (!userId) {
      console.log('❌ Token inválido - userId não encontrado');
      return null;
    }

    console.log('✅ Token válido, userId:', userId);
    return userId;

  } catch (error) {
    console.error('❌ Erro ao verificar token:', error);
    
    if (error instanceof jwt.TokenExpiredError) {
      console.log('❌ Token expirado');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.log('❌ Token inválido (JWT error)');
    }
    
    return null;
  }
}

/**
 * Middleware para verificar autenticação obrigatória
 * Retorna o userId ou lança erro 401
 */
export async function requireAuth(request: NextRequest): Promise<string> {
  const userId = await getUserFromToken(request);
  
  if (!userId) {
    throw new Error('UNAUTHORIZED');
  }
  
  return userId;
}