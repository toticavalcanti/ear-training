// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { RegisterRequest } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { email, password, name } = body;
    console.log('🔍 Register attempt for email:', email);

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, senha e nome são obrigatórios' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    console.log('✅ MongoDB connected');

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      // Verificar se é usuário Google
      if (existingUser.googleId && !existingUser.password) {
        return NextResponse.json(
          { 
            error: 'Esta conta já existe com Google. Use "Entrar com Google"',
            isGoogleUser: true 
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Usuário já existe com este email' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('✅ Password hashed');

    const newUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      subscription: 'free',
      subscriptionType: 'free',
      subscriptionStatus: 'inactive',
      level: 1,
      xp: 0,
      lastActive: new Date(),
    });

    console.log('✅ User created:', newUser.email);

    const token = jwt.sign(
      {
        id: newUser._id.toString(),
        email: newUser.email,
        name: newUser.name,
        subscription: newUser.subscription,
        level: newUser.level,
        xp: newUser.xp,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    console.log('✅ JWT token generated');

    return NextResponse.json({
      message: 'Usuário criado com sucesso!',
      token,
      user: {
        id: newUser._id.toString(),
        email: newUser.email,
        name: newUser.name,
        subscription: newUser.subscription,
        subscriptionType: newUser.subscriptionType,
        subscriptionStatus: newUser.subscriptionStatus,
        avatar: newUser.avatar,
        level: newUser.level,
        xp: newUser.xp,
        isGoogleUser: false,
        lastActive: newUser.lastActive?.toISOString(),
        createdAt: newUser.createdAt?.toISOString(),
        updatedAt: newUser.updatedAt?.toISOString(),
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Register error:', error);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}