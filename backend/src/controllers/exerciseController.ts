// ===================================
// src/controllers/exerciseController.ts - VERSÃO SIMPLES QUE FUNCIONA
// ===================================
import { Request, Response } from 'express';
import Exercise from '../models/Exercise';

// Interface para request autenticado
interface AuthRequest extends Request {
  userId?: string;
}

// ===================================
// GET EXERCISE - VERSÃO SIMPLES
// ===================================
export const getExercise = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, difficulty } = req.query;
    const userId = (req as any).userId;

    console.log('🎯 getExercise called:', { type, difficulty, userId });

    // Validate exercise type
    if (!type || !['interval', 'progression', 'melodic', 'rhythmic'].includes(type as string)) {
      res.status(400).json({ message: 'Invalid exercise type' });
      return;
    }

    // Buscar dados do usuário no banco
    const User = (await import('../models/User')).default;
    const user = await User.findById(userId);
    
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    const isPremiumUser = user.subscription === 'premium';
    
    console.log('👤 User:', { isPremium: isPremiumUser, subscription: user.subscription });

    // ESTRATÉGIA SIMPLES: Buscar exercise no banco
    const filters: any = { type };
    
    if (difficulty) {
      filters.difficulty = difficulty;
    }
    
    // Se não é premium, só exercises gratuitos
    if (!isPremiumUser) {
      filters.requiresPremium = { $ne: true };
    }

    console.log('🔍 Filtros:', filters);

    // Buscar exercise aleatório que atenda aos critérios
    const exercises = await Exercise.find(filters);
    
    console.log(`📚 ${exercises.length} exercises encontrados`);

    if (exercises.length === 0) {
      res.status(404).json({ 
        message: 'No exercise found for the specified criteria',
        criteria: filters,
        suggestion: 'Try running the seed script to populate exercises'
      });
      return;
    }

    // Pegar exercise aleatório
    const randomExercise = exercises[Math.floor(Math.random() * exercises.length)];

    // Retornar SEM a resposta (para o usuário tentar adivinhar)
    const exerciseResponse = {
      _id: randomExercise._id,
      type: randomExercise.type,
      difficulty: randomExercise.difficulty,
      content: randomExercise.content,
      requiresPremium: randomExercise.requiresPremium
    };

    console.log('✅ Retornando exercise:', exerciseResponse._id);
    res.json(exerciseResponse);

  } catch (error) {
    console.error('❌ Error in getExercise:', error);
    res.status(500).json({ 
      message: 'Error getting exercise',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
};

// ===================================
// CHECK ANSWER - VERSÃO SIMPLES  
// ===================================
export const checkAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { exerciseId, userAnswer } = req.body;
    const userId = (req as any).userId;

    console.log('🔍 checkAnswer:', { exerciseId, userAnswer, userId });

    if (!exerciseId || userAnswer === undefined) {
      res.status(400).json({ message: 'Exercise ID and user answer are required' });
      return;
    }

    const exercise = await Exercise.findById(exerciseId);
    
    if (!exercise) {
      res.status(404).json({ message: 'Exercise not found' });
      return;
    }

    // Buscar usuário para verificar premium
    const User = (await import('../models/User')).default;
    const user = await User.findById(userId);
    
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    // Check premium access
    if (exercise.requiresPremium && user.subscription !== 'premium') {
      res.status(403).json({ message: 'Premium subscription required for this exercise' });
      return;
    }

    // Comparação simples de respostas
    let isCorrect = false;
    
    if (exercise.type === 'interval') {
      const userAnswerStr = String(userAnswer).toLowerCase().trim();
      const correctAnswerStr = String(exercise.answer).toLowerCase().trim();
      isCorrect = userAnswerStr === correctAnswerStr;
    } else {
      // Para outros tipos, comparação string simples por enquanto
      isCorrect = String(userAnswer).toLowerCase().trim() === String(exercise.answer).toLowerCase().trim();
    }

    console.log('📊 Answer check:', { 
      userAnswer, 
      correctAnswer: exercise.answer, 
      isCorrect 
    });

    // TODO: Salvar no histórico quando o model estiver pronto
    
    res.json({
      isCorrect,
      correctAnswer: exercise.answer,
      feedback: isCorrect ? '✅ Correct!' : '❌ Try again!',
      exerciseType: exercise.type,
      difficulty: exercise.difficulty
    });

  } catch (error) {
    console.error('❌ Error in checkAnswer:', error);
    res.status(500).json({ 
      message: 'Error checking answer',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
};

// ===================================
// EXERCISE HISTORY - PLACEHOLDER
// ===================================
export const getExerciseHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    
    // TODO: Implementar quando ExerciseHistory model estiver pronto
    res.json({
      message: 'Exercise history feature coming soon',
      userId,
      history: [],
      pagination: {
        total: 0,
        page: 1,
        pages: 0
      }
    });
  } catch (error) {
    console.error('❌ Error in getExerciseHistory:', error);
    res.status(500).json({ message: 'Error getting exercise history' });
  }
};

// ===================================
// USER STATS - PLACEHOLDER  
// ===================================
export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    
    // Buscar dados do usuário
    const User = (await import('../models/User')).default;
    const user = await User.findById(userId);
    
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }
    
    // Stats do sistema (quantos exercises disponíveis)
    const totalExercises = await Exercise.countDocuments();
    const exercisesByType = await Exercise.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const exercisesByDifficulty = await Exercise.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        subscription: user.subscription,
        isPremium: user.subscription === 'premium'
      },
      systemStats: {
        totalExercisesAvailable: totalExercises,
        exercisesByType: exercisesByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        exercisesByDifficulty: exercisesByDifficulty.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      },
      userStats: {
        // TODO: Implementar quando tiver histórico
        totalCompleted: 0,
        correctAnswers: 0,
        accuracy: 0,
        streak: 0
      }
    });

  } catch (error) {
    console.error('❌ Error in getUserStats:', error);
    res.status(500).json({ message: 'Error getting user stats' });
  }
};