// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import PasswordReset from '@/models/PasswordReset';
import bcryptjs from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { message: 'Token e nova senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: 'Nova senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    console.log('🔍 Verificando token de recuperação...');

    // Buscar token válido
    const passwordReset = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!passwordReset) {
      console.log('❌ Token inválido ou expirado');
      return NextResponse.json(
        { message: 'Token inválido ou expirado' },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = await User.findOne({ email: passwordReset.email });
    
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return NextResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 400 }
      );
    }

    // Hash da nova senha
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    // ✅ LOGS DE DEBUG ADICIONADOS:
    console.log('🔍 Nova senha (plain):', newPassword);
    console.log('🔍 Hash gerado:', hashedPassword);
    console.log('🔍 Password ANTES de salvar:', user.password);

    // Atualizar senha do usuário
    user.password = hashedPassword;
    await user.save();

    // ✅ MAIS LOGS DE DEBUG:
    console.log('🔍 Password DEPOIS de salvar:', user.password);
    console.log('🔍 User._id:', user._id);

    // Marcar token como usado
    passwordReset.used = true;
    await passwordReset.save();

    console.log('✅ Senha redefinida com sucesso para:', user.email);

    return NextResponse.json({ 
      message: 'Senha redefinida com sucesso! Você já pode fazer login.' 
    });

  } catch (error) {
    console.error('💥 Erro ao redefinir senha:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}