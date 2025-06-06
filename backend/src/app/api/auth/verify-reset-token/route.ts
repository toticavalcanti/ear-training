// app/api/auth/verify-reset-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import PasswordReset from '@/models/PasswordReset';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { message: 'Token é obrigatório' },
        { status: 400 }
      );
    }

    const passwordReset = await PasswordReset.findOne({
      token: token as string,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!passwordReset) {
      return NextResponse.json(
        { 
          message: 'Token inválido ou expirado',
          valid: false 
        },
        { status: 400 }
      );
    }

    // Buscar dados do usuário para mostrar na tela
    const user = await User.findOne({ email: passwordReset.email }).select('name email');

    return NextResponse.json({ 
      valid: true,
      email: user?.email,
      name: user?.name 
    });

  } catch (error) {
    console.error('💥 Erro ao verificar token:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}