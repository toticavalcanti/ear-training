// src/config/passport.ts - VERSÃO FINAL QUE FUNCIONA
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User, { IUser } from '../models/User';

console.log('🔧 Configurando Passport Google OAuth...');

// Verificar variáveis de ambiente
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  console.error('❌ ERRO: GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET devem estar configurados');
  process.exit(1);
}

// Configuração da estratégia Google OAuth
passport.use(new GoogleStrategy({
  clientID: googleClientId,
  clientSecret: googleClientSecret,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('🔍 Google OAuth - Dados recebidos:', {
      id: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName
    });

    const email = profile.emails?.[0]?.value;
    if (!email) {
      return done(new Error('Email não encontrado no perfil Google'), undefined);
    }

    // Verificar se usuário já existe
    let user: IUser | null = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Usuário existe - atualizar dados do Google se necessário
      if (!user.googleId) {
        user.googleId = profile.id;
        user.lastActive = new Date();
        await user.save();
        console.log('✅ Usuário existente vinculado ao Google');
      } else {
        user.lastActive = new Date();
        await user.save();
        console.log('✅ Usuário Google existente atualizado');
      }
      
      return done(null, user);
    } else {
      // Criar novo usuário Google - SEM passwordHash
      const newUser: IUser = new User({
        name: profile.displayName,
        email: email.toLowerCase(),
        googleId: profile.id,
        avatar: profile.photos?.[0]?.value,
        subscription: 'free',
        lastActive: new Date()
        // Nota: NÃO definimos passwordHash para usuários Google
      });

      await newUser.save();
      console.log('✅ Novo usuário Google criado');
      
      return done(null, newUser);
    }

  } catch (error) {
    console.error('❌ Erro na autenticação Google:', error);
    return done(error, undefined);
  }
}));

// Serialização do usuário para a sessão
passport.serializeUser((user: any, done) => {
  done(null, (user._id as any).toString());
});

// Deserialização do usuário da sessão
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id).select('-passwordHash');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

console.log('✅ Passport Google OAuth configurado com sucesso!');