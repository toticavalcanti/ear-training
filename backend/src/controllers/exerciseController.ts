// src/controllers/exerciseController.ts
import { Request, Response } from 'express';
import Exercise from '../models/Exercise';
import ExerciseHistory from '../models/ExerciseHistory';
import { 
  generateIntervalExercise, 
  generateProgressionExercise, 
  generateMelodicExercise, 
  generateRhythmicExercise,
  generateLLMExercise  // Nova função que usa LLM
} from '../services/exerciseService';

// Obter um exercício específico
export const getExercise = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, difficulty, useLLM } = req.query;
    const user = (req as any).user;

    // Validate exercise type
    if (!type || !['interval', 'progression', 'melodic', 'rhythmic'].includes(type as string)) {
      res.status(400).json({ message: 'Invalid exercise type' });
      return;
    }

    // Check if user has access to premium exercises
    const isPremiumUser = user.subscription === 'premium';
    
    // Determine if we should use LLM-based exercise generation
    const shouldUseLLM = 
      (useLLM === 'true' || useLLM === '1') && // Explicitly requested
      isPremiumUser;                           // Premium users only
    
    let exercise;
    
    if (shouldUseLLM) {
      // Generate exercise using LLM
      const newExercise = await generateLLMExercise(
        type as any, 
        difficulty as string || 'beginner', 
        {}, // Options can be expanded later
        isPremiumUser
      );
      
      exercise = await Exercise.create(newExercise);
    } else {
      // Try to find an existing exercise of the requested type
      exercise = await Exercise.findOne({
        type,
        ...(difficulty ? { difficulty } : {}),
        ...(isPremiumUser ? {} : { requiresPremium: false })
      }).sort({ createdAt: -1 });
    
      // If no existing exercise found, generate a new one with the algorithmic approach
      if (!exercise) {
        let newExercise;
        
        switch (type as string) {
          case 'interval':
            newExercise = generateIntervalExercise(difficulty as string || 'beginner', isPremiumUser);
            break;
          case 'progression':
            newExercise = generateProgressionExercise(difficulty as string || 'beginner', isPremiumUser);
            break;
          case 'melodic':
            newExercise = generateMelodicExercise(difficulty as string || 'beginner', isPremiumUser);
            break;
          case 'rhythmic':
            newExercise = generateRhythmicExercise(difficulty as string || 'beginner', isPremiumUser);
            break;
          default:
            res.status(400).json({ message: 'Unsupported exercise type' });
            return;
        }
        
        exercise = await Exercise.create(newExercise);
      }
    }

    // Remove the answer from the response sent to the client
    const exerciseResponse = {
      _id: exercise._id,
      type: exercise.type,
      difficulty: exercise.difficulty,
      content: exercise.content,
      requiresPremium: exercise.requiresPremium
    };

    res.json(exerciseResponse);
  } catch (error) {
    console.error('Error getting exercise:', error);
    res.status(500).json({ message: 'Error getting exercise' });
  }
};

// Verificar a resposta do usuário a um exercício
export const checkAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { exerciseId, userAnswer } = req.body;
    const user = (req as any).user;

    if (!exerciseId || !userAnswer) {
      res.status(400).json({ message: 'Exercise ID and user answer are required' });
      return;
    }

    const exercise = await Exercise.findById(exerciseId);
    
    if (!exercise) {
      res.status(404).json({ message: 'Exercise not found' });
      return;
    }

    // Verificar se o usuário tem acesso a exercícios premium
    if (exercise.requiresPremium && user.subscription !== 'premium') {
      res.status(403).json({ message: 'Premium subscription required for this exercise' });
      return;
    }

    // Comparar a resposta do usuário com a resposta correta
    let isCorrect = false;
    
    // Para exercícios de intervalo, a resposta é uma string única
    if (exercise.type === 'interval') {
      // Garantir que estamos lidando com strings
      const userAnswerStr = typeof userAnswer === 'string' ? userAnswer.toLowerCase() : String(userAnswer).toLowerCase();
      const correctAnswerStr = typeof exercise.answer === 'string' ? exercise.answer.toLowerCase() : String(exercise.answer).toLowerCase();
      
      isCorrect = userAnswerStr === correctAnswerStr;
    } 
    // Para exercícios de progressão, melodia e ritmo, as respostas podem ser arrays
    else {
      // Normalizar a resposta do usuário para comparação
      const normalizedUserAnswer = Array.isArray(userAnswer) 
        ? userAnswer.map(a => String(a).toLowerCase()).join(',')
        : String(userAnswer).toLowerCase();
      
      // Normalizar a resposta correta para comparação
      const normalizedCorrectAnswer = Array.isArray(exercise.answer) 
        ? exercise.answer.map(a => String(a).toLowerCase()).join(',')
        : String(exercise.answer).toLowerCase();
      
      isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
    }

    // Registrar o histórico do exercício
    await ExerciseHistory.create({
      userId: user._id,
      exerciseId: exercise._id,
      exerciseType: exercise.type,
      difficulty: exercise.difficulty,
      userAnswer,
      isCorrect,
      date: new Date()
    });

    res.json({
      isCorrect,
      correctAnswer: exercise.answer
    });
  } catch (error) {
    console.error('Error checking answer:', error);
    res.status(500).json({ message: 'Error checking answer' });
  }
};

// Obter o histórico de exercícios do usuário
export const getExerciseHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { limit = 10, page = 1, type } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const query = {
      userId: user._id,
      ...(type ? { exerciseType: type } : {})
    };

    const history = await ExerciseHistory.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await ExerciseHistory.countDocuments(query);

    res.json({
      history,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error getting exercise history:', error);
    res.status(500).json({ message: 'Error getting exercise history' });
  }
};

// Obter estatísticas do usuário
export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;

    // Obter estatísticas gerais
    const totalExercises = await ExerciseHistory.countDocuments({ userId: user._id });
    const correctExercises = await ExerciseHistory.countDocuments({ 
      userId: user._id,
      isCorrect: true
    });

    // Obter estatísticas por tipo de exercício
    const intervalStats = await getStatsByType(user._id, 'interval');
    const progressionStats = await getStatsByType(user._id, 'progression');
    const melodicStats = await getStatsByType(user._id, 'melodic');
    const rhythmicStats = await getStatsByType(user._id, 'rhythmic');

    // Obter tendência de desempenho ao longo do tempo (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await ExerciseHistory.aggregate([
      { 
        $match: { 
          userId: user._id,
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: "%Y-%m-%d", date: "$date" }
          },
          total: { $sum: 1 },
          correct: {
            $sum: { $cond: [ "$isCorrect", 1, 0 ] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      overall: {
        total: totalExercises,
        correct: correctExercises,
        accuracy: totalExercises > 0 ? (correctExercises / totalExercises) * 100 : 0
      },
      byType: {
        interval: intervalStats,
        progression: progressionStats,
        melodic: melodicStats,
        rhythmic: rhythmicStats
      },
      dailyProgress: dailyStats.map(day => ({
        date: day._id,
        total: day.total,
        correct: day.correct,
        accuracy: (day.correct / day.total) * 100
      }))
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ message: 'Error getting user stats' });
  }
};

// Função auxiliar para obter estatísticas por tipo de exercício
async function getStatsByType(userId: string, type: string) {
  const total = await ExerciseHistory.countDocuments({ 
    userId,
    exerciseType: type
  });

  const correct = await ExerciseHistory.countDocuments({ 
    userId,
    exerciseType: type,
    isCorrect: true
  });

  // Obter estatísticas por dificuldade
  const byDifficulty = await ExerciseHistory.aggregate([
    { 
      $match: { 
        userId,
        exerciseType: type
      }
    },
    {
      $group: {
        _id: "$difficulty",
        total: { $sum: 1 },
        correct: {
          $sum: { $cond: [ "$isCorrect", 1, 0 ] }
        }
      }
    }
  ]);

  return {
    total,
    correct,
    accuracy: total > 0 ? (correct / total) * 100 : 0,
    byDifficulty: byDifficulty.map(diff => ({
      difficulty: diff._id,
      total: diff.total,
      correct: diff.correct,
      accuracy: (diff.correct / diff.total) * 100
    }))
  };
}