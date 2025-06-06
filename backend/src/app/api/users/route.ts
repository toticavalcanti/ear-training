// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/users - Verificando autenticação');
    
    // Verificar se está autenticado
    const userAuth = await requireAuth(request);
    
    // Se retornou NextResponse, é um erro de autenticação
    if (userAuth instanceof NextResponse) {
      console.log('❌ Falha na autenticação');
      return userAuth;
    }

    console.log('✅ Usuário autenticado:', userAuth.email);

    await connectToDatabase();
    console.log('✅ MongoDB connected');
    
    // Buscar todos os usuários (sem senhas)
    const users = await User.find({}).select('-password');
    console.log(`✅ Encontrados ${users.length} usuários`);
    
    return NextResponse.json({
      users: users.map(user => ({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        subscription: user.subscription,
        subscriptionType: user.subscriptionType,
        subscriptionStatus: user.subscriptionStatus,
        avatar: user.avatar,
        level: user.level || 1,
        xp: user.xp || 0,
        isGoogleUser: !!user.googleId,
        lastActive: user.lastActive?.toISOString(),
        createdAt: user.createdAt?.toISOString(),
        updatedAt: user.updatedAt?.toISOString(),
      })),
      total: users.length
    });

  } catch (error) {
    console.error('❌ Erro ao buscar usuários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}