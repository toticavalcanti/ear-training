// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { LoginRequest } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;
    console.log('🔍 Login attempt for email:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    console.log('✅ MongoDB connected');

    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('🔍 User found:', !!user);
    console.log('🔍 User has password:', !!(user && user.password));
    console.log('🔍 User is Google user:', !!(user && user.googleId));
    
    if (!user) {
      console.log('❌ User not found');
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // Verificar se é usuário Google (não tem senha)
    if (user.googleId && !user.password) {
      console.log('❌ Google user trying to login with password');
      return NextResponse.json(
        { 
          error: 'Esta conta foi criada com Google. Use "Entrar com Google"',
          isGoogleUser: true 
        },
        { status: 400 }
      );
    }

    if (!user.password) {
      console.log('❌ User has no password set');
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    console.log('🔍 Password hash length:', user.password.length);
    console.log('🔍 Password hash starts with:', user.password.substring(0, 10));
    console.log('🔍 Is bcrypt hash:', user.password.startsWith('$2'));

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('🔍 Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Password comparison failed');
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // Atualizar último acesso
    user.lastActive = new Date();
    await user.save();

    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        subscription: user.subscription,
        level: user.level || 1,
        xp: user.xp || 0,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful for:', email);

    return NextResponse.json({
      message: 'Login realizado com sucesso!',
      token,
      user: {
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
        lastActive: user.lastActive?.toISOString(),
        createdAt: user.createdAt?.toISOString(),
        updatedAt: user.updatedAt?.toISOString(),
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}