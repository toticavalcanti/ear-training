// ===================================
// src/routes/gamificationRoutes.ts
// ===================================
import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(protect);

// ===================================
// ROTA BÁSICA DE TESTE
// ===================================
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Sistema de gamificação funcionando!',
    timestamp: new Date().toISOString()
  });
});

// ===================================
// SUBMETER EXERCÍCIO COM GAMIFICAÇÃO
// ===================================
router.post('/submit', asyncHandler(async (req, res) => {
  try {
    const user = (req as any).user;
    const { exerciseId, userAnswer, timeSpent, attempts = 1 } = req.body;

    // Validações básicas
    if (!exerciseId || userAnswer === undefined || !timeSpent) {
      res.status(400).json({ 
        message: 'Dados obrigatórios: exerciseId, userAnswer, timeSpent' 
      });
      return;
    }

    // Import dinâmico para evitar problemas de dependência circular
    const { GamificationService } = await import('../services/gamificationService');
    const Exercise = (await import('../models/Exercise')).default;

    // Buscar exercício
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      res.status(404).json({ message: 'Exercício não encontrado' });
      return;
    }

    // Processar através do sistema de gamificação
    const result = await GamificationService.submitExercise(
      user._id.toString(),
      exerciseId,
      exercise.type,
      exercise.difficulty,
      userAnswer,
      exercise.answer,
      timeSpent,
      attempts
    );

    // Resposta
    res.json({
      isCorrect: result.score > 0,
      correctAnswer: exercise.answer,
      score: result.score,
      accuracy: result.accuracy,
      experienceGained: result.experienceGained,
      isPerfect: result.isPerfect,
      levelUp: result.levelUp,
      currentLevel: result.currentLevel,
      totalExperience: result.totalExperience,
      newAchievements: result.newAchievements,
      message: result.isPerfect ? 
        `🎉 Perfeito! +${result.experienceGained} XP` : 
        result.score > 0 ? 
          `✅ Correto! +${result.experienceGained} XP` : 
          '❌ Tente novamente!'
    });

  } catch (error) {
    console.error('Erro ao submeter exercício:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}));

// ===================================
// PROGRESSO DO USUÁRIO
// ===================================
router.get('/progress', asyncHandler(async (req, res) => {
  try {
    const user = (req as any).user;
    
    const { GamificationService } = await import('../services/gamificationService');
    const progress = await GamificationService.getUserProgress(user._id.toString());
    
    if (!progress) {
      res.status(404).json({ message: 'Progresso não encontrado' });
      return;
    }

    // Calcular progresso do nível
    const xpForNextLevel = GamificationService.calculateXPForNextLevel(progress.level);
    const xpProgress = progress.experience - Math.pow(progress.level - 1, 2) * 100;
    const xpNeeded = xpForNextLevel - Math.pow(progress.level - 1, 2) * 100;

    res.json({
      level: progress.level,
      experience: progress.experience,
      totalExercises: progress.totalExercises,
      perfectScores: progress.perfectScores,
      averageScore: Math.round(progress.averageScore * 10) / 10,
      streakDays: progress.streakDays,
      levelProgress: {
        current: xpProgress,
        needed: xpNeeded,
        percentage: Math.round((xpProgress / xpNeeded) * 100)
      },
      byType: {
        intervals: progress.intervals,
        rhythmic: progress.rhythmic,
        melodic: progress.melodic,
        progression: progress.progression
      },
      user: {
        name: user.name,
        subscription: user.subscription
      }
    });

  } catch (error) {
    console.error('Erro ao buscar progresso:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}));

// ===================================
// ACHIEVEMENTS DO USUÁRIO
// ===================================
router.get('/achievements', asyncHandler(async (req, res) => {
  try {
    const user = (req as any).user;
    
    const { GamificationService } = await import('../services/gamificationService');
    const achievements = await GamificationService.getUserAchievements(user._id.toString());

    res.json({
      achievements: {
        unlocked: achievements.unlocked.map((ua: any) => ({
          id: ua.achievementData?.id || ua.achievementId,
          name: ua.achievementData?.name || 'Achievement',
          description: ua.achievementData?.description || '',
          icon: ua.achievementData?.icon || '🏆',
          category: ua.achievementData?.category || 'progress',
          rarity: ua.achievementData?.rarity || 'common',
          points: ua.achievementData?.points || 0,
          unlockedAt: ua.unlockedAt,
          isNew: ua.isNew
        })),
        locked: achievements.locked.map((achievement: any) => ({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          category: achievement.category,
          rarity: achievement.rarity,
          points: achievement.points,
          condition: achievement.condition,
          threshold: achievement.threshold
        }))
      },
      summary: {
        total: achievements.total,
        unlocked: achievements.unlockedCount,
        locked: achievements.total - achievements.unlockedCount,
        completionPercentage: achievements.total > 0 ? 
          Math.round((achievements.unlockedCount / achievements.total) * 100) : 0
      }
    });

  } catch (error) {
    console.error('Erro ao buscar achievements:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}));

// ===================================
// LEADERBOARD
// ===================================
router.get('/leaderboard', asyncHandler(async (req, res) => {
  try {
    const { limit = 10, period = 'all' } = req.query;
    
    const limitNum = Math.min(Math.max(parseInt(limit as string) || 10, 1), 100);
    const validPeriods = ['week', 'month', 'all'];
    const periodStr = validPeriods.includes(period as string) ? 
      period as 'week' | 'month' | 'all' : 'all';

    const { GamificationService } = await import('../services/gamificationService');
    const leaderboard = await GamificationService.getLeaderboard(limitNum, periodStr);

    const User = (await import('../models/User')).default;
    
    // Enriquecer com dados do usuário
    const enrichedLeaderboard = await Promise.all(
      leaderboard.map(async (entry: any, index: number) => {
        try {
          const user = await User.findById(entry.userId).select('name');
          return {
            rank: index + 1,
            userId: entry.userId,
            name: user?.name || 'Usuário Anônimo',
            level: entry.level,
            experience: entry.experience,
            averageScore: Math.round(entry.averageScore * 10) / 10,
            totalExercises: entry.totalExercises,
            perfectScores: entry.perfectScores,
            streakDays: entry.streakDays
          };
        } catch (error) {
          return {
            rank: index + 1,
            userId: entry.userId,
            name: 'Usuário Anônimo',
            level: entry.level,
            experience: entry.experience,
            averageScore: Math.round(entry.averageScore * 10) / 10
          };
        }
      })
    );

    res.json({
      leaderboard: enrichedLeaderboard,
      meta: {
        period: periodStr,
        limit: limitNum,
        total: enrichedLeaderboard.length
      }
    });

  } catch (error) {
    console.error('Erro ao gerar leaderboard:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}));

export default router;