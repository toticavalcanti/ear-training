// src/app/api/auth/google/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectToDatabase from '@/lib/mongodb'
import User from '@/models/User'

interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

interface GoogleUserData {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

// GET: Callback do Google OAuth
export async function GET(request: NextRequest) {
  console.log('🚀 Google callback iniciado - URL:', request.url)
  
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    console.log('🔄 Google OAuth callback:', { code: !!code, error })

    if (error) {
      console.error('❌ Google OAuth error:', error)
      const frontendUrl = process.env.CORS_ORIGIN || process.env.NEXTAUTH_URL || 'http://localhost:3000'
      return NextResponse.redirect(`${frontendUrl}/auth/login?error=${encodeURIComponent('Erro no login com Google')}`)
    }

    if (!code) {
      console.error('❌ No authorization code received')
      const frontendUrl = process.env.CORS_ORIGIN || process.env.NEXTAUTH_URL || 'http://localhost:3000'
      return NextResponse.redirect(`${frontendUrl}/auth/login?error=${encodeURIComponent('Código de autorização não recebido')}`)
    }

    // Trocar código por token de acesso
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/google/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      console.error('❌ Failed to exchange code for token')
      const frontendUrl = process.env.CORS_ORIGIN || process.env.NEXTAUTH_URL || 'http://localhost:3000'
      return NextResponse.redirect(`${frontendUrl}/auth/login?error=${encodeURIComponent('Erro ao trocar código por token')}`)
    }

    const tokenData: GoogleTokenResponse = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Obter dados do usuário do Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!userResponse.ok) {
      console.error('❌ Failed to get user info from Google')
      const frontendUrl = process.env.CORS_ORIGIN || process.env.NEXTAUTH_URL || 'http://localhost:3000'
      return NextResponse.redirect(`${frontendUrl}/auth/login?error=${encodeURIComponent('Erro ao obter dados do usuário')}`)
    }

    const googleUser: GoogleUserData = await userResponse.json()
    console.log('✅ Google user data received:', { email: googleUser.email, name: googleUser.name })

    await connectToDatabase()

    const email = googleUser.email?.toLowerCase()
    if (!email) {
      const frontendUrl = process.env.CORS_ORIGIN || process.env.NEXTAUTH_URL || 'http://localhost:3000'
      return NextResponse.redirect(`${frontendUrl}/auth/login?error=${encodeURIComponent('Email não encontrado no perfil Google')}`)
    }

    // Verificar se usuário já existe
    let user = await User.findOne({ email })

    if (user) {
      // Usuário existe - atualizar dados do Google se necessário
      if (!user.googleId) {
        user.googleId = googleUser.id
        user.avatar = googleUser.picture
        console.log('🔗 Vinculando conta existente ao Google')
      }
      user.lastActive = new Date()
      await user.save()
    } else {
      // Criar novo usuário Google
      console.log('👤 Criando novo usuário Google')
      user = new User({
        name: googleUser.name,
        email,
        googleId: googleUser.id,
        avatar: googleUser.picture,
        subscription: 'free',
        subscriptionType: 'free',
        subscriptionStatus: 'inactive',
        level: 1,
        xp: 0,
        lastActive: new Date()
      })
      await user.save()
    }

    // Gerar JWT token
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        subscription: user.subscription,
        level: user.level || 1,
        xp: user.xp || 0,
        avatar: user.avatar,
        googleId: user.googleId,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    console.log('✅ Google OAuth callback successful:', user.email)
    console.log('🔑 JWT Secret exists:', !!process.env.JWT_SECRET)
    console.log('🎫 Token generated length:', token.length)

    // Redirecionar para frontend com token
    const frontendUrl = process.env.CORS_ORIGIN || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    // Redirecionar para uma página de sucesso que capturará o token
    return NextResponse.redirect(`${frontendUrl}/auth/success?token=${token}`)

  } catch (error) {
    console.error('❌ Google OAuth callback error:', error)
    const frontendUrl = process.env.CORS_ORIGIN || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    return NextResponse.redirect(`${frontendUrl}/auth/login?error=${encodeURIComponent('Erro interno no callback')}`)
  }
}