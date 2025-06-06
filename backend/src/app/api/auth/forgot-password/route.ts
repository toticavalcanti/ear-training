// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import PasswordReset from '@/models/PasswordReset';
import emailService from '@/lib/emailService';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🔍 Solicitação de recuperação para:', email);

    // Verificar se o usuário existe
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Por segurança, sempre retornamos sucesso mesmo se o email não existir
    if (!user) {
      console.log('❌ Usuário não encontrado, mas retornando sucesso por segurança');
      return NextResponse.json({ 
        message: 'Se este email estiver cadastrado, você receberá as instruções de recuperação em breve.' 
      });
    }

    // Verificar se é usuário do Google
    if (user.googleId && !user.passwordHash) {
      return NextResponse.json(
        { 
          message: 'Esta conta foi criada com Google. Não é possível redefinir senha.',
          isGoogleUser: true 
        },
        { status: 400 }
      );
    }

    // Gerar token único
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Invalidar tokens antigos para este email
    await PasswordReset.updateMany(
      { email: email.toLowerCase(), used: false },
      { used: true }
    );

    // Criar novo token de recuperação
    const passwordReset = new PasswordReset({
      email: email.toLowerCase(),
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hora
    });

    await passwordReset.save();

    // Enviar email
    const emailSent = await emailService.sendPasswordResetEmail(
      email.toLowerCase(),
      resetToken,
      user.name
    );

    if (!emailSent) {
      console.error('❌ Falha ao enviar email de recuperação');
      return NextResponse.json(
        { message: 'Erro ao enviar email de recuperação' },
        { status: 500 }
      );
    }

    console.log('✅ Email de recuperação enviado com sucesso');
    return NextResponse.json({ 
      message: 'Instruções de recuperação enviadas para seu email!' 
    });

  } catch (error) {
    console.error('💥 Erro ao solicitar recuperação:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}