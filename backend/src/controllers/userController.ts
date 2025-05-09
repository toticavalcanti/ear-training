// src/controllers/userController.ts
import { Request, Response } from 'express';
import User from '../models/User';
import Exercise from '../models/Exercise'; // Adicionando a importação
import ExerciseHistory from '../models/ExerciseHistory';
import bcryptjs from 'bcryptjs';

// Atualizar perfil do usuário
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { name, email } = req.body;

    // Verificar se o email já está em uso (se estiver sendo alterado)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ message: 'Email já está em uso' });
        return;
      }
    }

    // Atualizar os campos
    const updateFields: { name?: string; email?: string } = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;

    // Atualizar o usuário
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro ao atualizar perfil' });
  }
};

// Alterar senha do usuário
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { currentPassword, newPassword } = req.body;

    // Verificar senha atual
    const userWithPassword = await User.findById(user._id);
    if (!userWithPassword) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }

    const isMatch = await userWithPassword.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(401).json({ message: 'Senha atual incorreta' });
      return;
    }

    // Hash da nova senha
    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(newPassword, salt);

    // Atualizar senha
    userWithPassword.passwordHash = passwordHash;
    await userWithPassword.save();

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ message: 'Erro ao alterar senha' });
  }
};

// Atualizar para assinatura premium (placeholder sem integração real com Stripe)
export const upgradeSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    
    // Para teste: simplesmente atualiza para premium
    // Em produção, você implementaria a integração com Stripe aqui
    
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { subscription: 'premium' },
      { new: true }
    ).select('-passwordHash');
    
    if (!updatedUser) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }
    
    res.json({
      message: 'Assinatura atualizada com sucesso',
      user: updatedUser
    });
  } catch (error) {
    console.error('Erro ao atualizar assinatura:', error);
    res.status(500).json({ message: 'Erro ao atualizar assinatura' });
  }
};

// Interface para as estatísticas por tipo
interface TypeStats {
  total: number;
  correct: number;
  accuracy: number;
}

// Interface para todas as estatísticas
interface Stats {
  overall: TypeStats;
  byType: Record<string, TypeStats>;
}

// Obter estatísticas do usuário
export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    
    // Estatísticas gerais
    const totalExercises = await ExerciseHistory.countDocuments({ user: user._id });
    const correctExercises = await ExerciseHistory.countDocuments({ 
      user: user._id, 
      isCorrect: true 
    });
    
    // Estatísticas por tipo de exercício
    const stats: Stats = {
      overall: {
        total: totalExercises,
        correct: correctExercises,
        accuracy: totalExercises > 0 ? Math.round((correctExercises / totalExercises) * 100) : 0
      },
      byType: {}
    };
    
    // Buscar estatísticas por tipo de exercício
    const exerciseTypes = ['interval', 'progression', 'melodic', 'rhythmic'];
    
    for (const type of exerciseTypes) {
      // Buscar IDs de exercícios deste tipo
      const exerciseList = await Exercise.find({ type }).select('_id');
      const exerciseIds = exerciseList.map((ex: any) => ex._id);
      
      if (exerciseIds.length > 0) {
        const typeTotal = await ExerciseHistory.countDocuments({ 
          user: user._id, 
          exercise: { $in: exerciseIds }
        });
        
        const typeCorrect = await ExerciseHistory.countDocuments({ 
          user: user._id, 
          exercise: { $in: exerciseIds },
          isCorrect: true
        });
        
        stats.byType[type] = {
          total: typeTotal,
          correct: typeCorrect,
          accuracy: typeTotal > 0 ? Math.round((typeCorrect / typeTotal) * 100) : 0
        };
      } else {
        stats.byType[type] = {
          total: 0,
          correct: 0,
          accuracy: 0
        };
      }
    }
    
    // Adicionar assinatura ao retorno
    const userInfo = {
      name: user.name,
      email: user.email,
      subscription: user.subscription,
      lastActive: user.lastActive
    };
    
    res.json({
      user: userInfo,
      stats
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ message: 'Erro ao obter estatísticas' });
  }
};