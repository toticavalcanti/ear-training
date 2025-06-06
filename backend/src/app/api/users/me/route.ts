// src/app/api/users/me/route.ts
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectToDatabase from '@/lib/mongodb'
import User from '@/models/User'

interface JwtPayload {
  id?: string;
  userId?: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/users/me - Iniciando verificação de token')
    
    // Verificar token JWT
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Token não fornecido ou formato inválido')
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    console.log('🔍 Token extraído, verificando...')

    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET não configurado')
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      )
    }

    // Verificar e decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload
    const userId = decoded.id || decoded.userId

    if (!userId) {
      console.log('❌ Token inválido - userId não encontrado')
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    console.log('✅ Token válido, buscando usuário:', userId)

    await connectToDatabase()
    
    // Buscar usuário no banco (excluindo o campo password)
    const user = await User.findById(userId).select('-password')
    
    if (!user) {
      console.log('❌ Usuário não encontrado no banco:', userId)
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    console.log('✅ Usuário encontrado:', user.email)

    // Retornar dados do usuário no formato esperado pelo contexto
    return NextResponse.json({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      subscription: user.subscription,
      subscriptionType: user.subscriptionType || user.subscription,
      subscriptionStatus: user.subscriptionStatus || 'inactive',
      avatar: user.avatar,
      level: user.level || 1,
      xp: user.xp || 0,
      isGoogleUser: !!user.googleId,
      lastActive: user.lastActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })

  } catch (error) {
    console.error('❌ Erro em /api/users/me:', error)
    
    if (error instanceof jwt.TokenExpiredError) {
      console.log('❌ Token expirado')
      return NextResponse.json(
        { error: 'Token expirado' },
        { status: 401 }
      )
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      console.log('❌ Token inválido (JWT error)')
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