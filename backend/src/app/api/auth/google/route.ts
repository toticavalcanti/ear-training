// src/app/api/auth/google/route.ts
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectToDatabase from '@/lib/mongodb'
import User from '@/models/User'

// POST: Login direto com dados do Google OAuth
export async function POST(request: NextRequest) {
  try {
    const { email, name, googleId, avatar } = await request.json()
    
    console.log('🔍 Google OAuth login attempt:', { email, name, googleId })

    if (!email || !name || !googleId) {
      return NextResponse.json(
        { error: 'Dados do Google incompletos' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    let user = await User.findOne({ email: email.toLowerCase() })

    if (user) {
      // Usuário existe - atualizar dados do Google se necessário
      console.log('✅ Usuário existente encontrado')
      if (!user.googleId) {
        user.googleId = googleId
        console.log('🔗 Vinculando conta existente ao Google')
      }
      if (avatar && avatar !== user.avatar) {
        user.avatar = avatar
      }
      user.lastActive = new Date()
      await user.save()
    } else {
      // Criar novo usuário Google
      console.log('👤 Criando novo usuário Google')
      user = new User({
        name,
        email: email.toLowerCase(),
        googleId,
        avatar,
        subscription: 'free',
        lastActive: new Date()
        // Nota: passwordHash não é definido para usuários Google
      })
      await user.save()
    }

    // Gerar JWT token (usando a mesma lógica do login tradicional)
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        subscription: user.subscription,
        avatar: user.avatar,
        googleId: user.googleId,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    console.log('✅ Google OAuth login successful:', user.email)

    return NextResponse.json({
      message: 'Login com Google realizado com sucesso!',
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        subscription: user.subscription,
        avatar: user.avatar,
        isGoogleUser: true,
        googleId: user.googleId,
      }
    })

  } catch (error) {
    console.error('❌ Google OAuth error:', error)
    
    return NextResponse.json(
      { error: 'Erro no login com Google' },
      { status: 500 }
    )
  }
}

// GET: Iniciar fluxo Google OAuth (redirecionar para Google)
export async function GET() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/google/callback`
  
  if (!googleClientId) {
    return NextResponse.json(
      { error: 'Google Client ID não configurado' },
      { status: 500 }
    )
  }

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${googleClientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=profile email&` +
    `access_type=offline&` +
    `prompt=select_account`

  return NextResponse.redirect(googleAuthUrl)
}