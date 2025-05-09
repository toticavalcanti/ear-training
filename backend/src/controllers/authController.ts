// src/controllers/authController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import User from '../models/User';

// Registrar novo usuário
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Log para depuração
    console.log('Tentativa de registro:', { email, name });

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email já está em uso' });
      return;
    }

    // Hash da senha
    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(password, salt);

    // Criar novo usuário
    const user = await User.create({
      name,
      email,
      passwordHash,
      subscription: 'free',
    });

    // Gerar token JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
};

// Login de usuário
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    // Log para depuração
    console.log('Tentativa de login:', { email });

    // Buscar usuário
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Credenciais inválidas' });
      return;
    }

    // Verificar senha
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Credenciais inválidas' });
      return;
    }

    // Atualizar última atividade
    user.lastActive = new Date();
    await user.save();

    // Gerar token JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
};

// Obter perfil do usuário atual
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // O middleware auth já adiciona req.user
    const user = await User.findById((req as any).user.id).select('-passwordHash');

    if (!user) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({ message: 'Erro ao obter perfil' });
  }
};