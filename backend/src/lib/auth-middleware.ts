// src/lib/auth-middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { JwtPayload, AuthResult } from '@/types/auth'

export async function requireAuth(request: NextRequest): Promise<AuthResult | NextResponse> {
  try {
    // Verificar token JWT
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      )
    }

    // Verificar e decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload
    const userId = decoded.id || decoded.userId

    if (!userId) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Retorna os dados do usuário autenticado
    return {
      userId,
      email: decoded.email
    }

  } catch (error) {
    console.error('Erro no middleware de auth:', error)
    
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { error: 'Token expirado' },
        { status: 401 }
      )
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}