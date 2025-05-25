// src/controllers/authController.ts - VERSÃO FINAL QUE FUNCIONA
import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

// Interface para request com userId (do middleware)
interface AuthRequest extends Request {
  userId?: string;
}

// Função para gerar JWT
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '30d' });
};

// 🔐 LOGIN TRADICIONAL - COMPATÍVEL COM SEU MODEL
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔍 DEBUG LOGIN - Dados recebidos:', {
      email: req.body.email,
      hasPassword: !!req.body.password
    });

    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ DEBUG: Email ou senha não fornecidos');
      res.status(400).json({ message: 'Email e senha são obrigatórios' });
      return;
    }

    console.log('🔍 DEBUG: Buscando usuário no banco...');
    const user: IUser | null = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ DEBUG: Usuário não encontrado no banco');
      res.status(401).json({ message: 'Credenciais inválidas' });
      return;
    }

    console.log('✅ DEBUG: Usuário encontrado:', {
      email: user.email,
      hasPasswordHash: !!user.passwordHash,
      isGoogleUser: !!user.googleId
    });

    // VERIFICAR SE É USUÁRIO GOOGLE (não tem senha)
    if (user.googleId && !user.passwordHash) {
      console.log('❌ DEBUG: Usuário é do Google, não tem senha');
      res.status(400).json({ 
        message: 'Esta conta foi criada com Google. Use "Entrar com Google"',
        isGoogleUser: true 
      });
      return;
    }

    // USAR SEU MÉTODO comparePassword EXISTENTE
    console.log('🔍 DEBUG: Verificando senha...');
    const isMatch = await user.comparePassword(password);
    console.log('🔍 DEBUG: Resultado verificação:', isMatch);

    if (!isMatch) {
      console.log('❌ DEBUG: Senha incorreta');
      res.status(401).json({ message: 'Credenciais inválidas' });
      return;
    }

    console.log('✅ DEBUG: Login bem-sucedido!');

    // Atualizar último acesso
    user.lastActive = new Date();
    await user.save();

    // Gerar token - CORRIGINDO TIPO
    const token = generateToken((user._id as any).toString());

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        avatar: user.avatar,
        lastActive: user.lastActive
      }
    });

  } catch (error) {
    console.error('💥 DEBUG: Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// 📝 REGISTRO - MANTENDO SEU CAMPO passwordHash
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Senha deve ter pelo menos 6 caracteres' });
      return;
    }

    const existingUser: IUser | null = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      if (existingUser.googleId && !existingUser.passwordHash) {
        res.status(400).json({ 
          message: 'Esta conta já existe com Google. Use "Entrar com Google"',
          isGoogleUser: true 
        });
        return;
      }
      res.status(400).json({ message: 'Usuário já existe' });
      return;
    }

    // Hash da senha
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Criar usuário com passwordHash (SEU CAMPO)
    const user: IUser = new User({
      name,
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      subscription: 'free'
    });

    await user.save();
    
    // Gerar token - CORRIGINDO TIPO
    const token = generateToken((user._id as any).toString());

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// 🆕 GOOGLE LOGIN - COMPATÍVEL COM SEU MODEL
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, googleId, avatar } = req.body;

    if (!email || !name || !googleId) {
      res.status(400).json({ message: 'Email, nome e googleId são obrigatórios' });
      return;
    }

    let user: IUser | null = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Usuário existe - atualizar dados do Google
      if (!user.googleId) {
        user.googleId = googleId;
      }
      if (avatar) {
        user.avatar = avatar;
      }
      user.lastActive = new Date();
      await user.save();
    } else {
      // Criar novo usuário Google (SEM passwordHash)
      user = new User({
        name,
        email: email.toLowerCase(),
        googleId,
        avatar,
        subscription: 'free'
      });
      await user.save();
    }

    // Gerar token - CORRIGINDO TIPO
    const token = generateToken((user._id as any).toString());

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Erro no Google login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// 👤 GET PROFILE
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user: IUser | null = await User.findById(req.userId).select('-passwordHash');
    
    if (!user) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      subscription: user.subscription,
      avatar: user.avatar,
      lastActive: user.lastActive,
      hasPassword: !!user.passwordHash,
      isGoogleUser: !!user.googleId
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};