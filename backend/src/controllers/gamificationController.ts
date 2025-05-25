// ===================================
// src/controllers/gamificationController.ts
// Controller para todas as funcionalidades de gamificação
// ===================================
import { Request, Response } from 'express';
import { GamificationService } from '../services/gamificationService';
import Exercise from '../models/Exercise';

// ===================================
// SUBMISSÃO DE EXERCÍCIOS
// ===================================

/**
 * Submeter exercício com sistema de gamificação completo
 */
export const submitExercise = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { 
      exerciseId, 
      userAnswer, 
      timeSpent, 
      attempts = 1 
    } = req.body;

    // Validar dados obrigatórios
    if (!exerciseId || userAnswer === undefined || !timeSpent) {
      res.status(400).json({ 
        message: 'Dados obrigatórios: exerciseId, userAnswer, timeSpent' 
      });
      return;
    }

    // Buscar o exercício para obter dados completos
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      res.status(404).json({ message: 'Exercício não encontrado' });
      return;
    }

    // Verificar acesso premium se necessário
    if (exercise.requiresPremium && user.subscription !== 'premium') {
      res.status(403).json({ 
        message: 'Assinatura premium necessária para este exercício' 
      });
      return;
    }

    console.log(`🎮 Submetendo exercício ${exerciseId} para usuário ${user._id}`);

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

    // Resposta completa com todos os dados de gamificação
    res.json({
      // Resultado básico
      isCorrect: result.score > 0,
      correctAnswer: exercise.answer,
      
      // Dados de gamificação
      score: result.score,
      accuracy: result.accuracy,
      experienceGained: result.experienceGained,
      isPerfect: result.isPerfect,
      
      // Progressão
      levelUp: result.levelUp,
      currentLevel: result.currentLevel,
      totalExperience: result.totalExperience,
      
      // Achievements
      newAchievements: result.newAchievements,
      
      // Mensagens para o frontend
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
};

// ===================================
// PROGRESSO DO USUÁRIO
// ===================================

/**
 * Obter progresso detalhado do usuário atual
 */
export const getUserProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    
    console.log(`📊 Buscando progresso para usuário ${user._id}`);
    
    const progress = await GamificationService.getUserProgress(user._id.toString());
    
    if (!progress) {
      res.status(404).json({ message: 'Progresso não encontrado' });
      return;
    }

    // Calcular XP necessário para próximo nível
    const xpForNextLevel = GamificationService.calculateXPForNextLevel(progress.level);
    const xpProgress = progress.experience - Math.pow(progress.level - 1, 2) * 100;
    const xpNeeded = xpForNextLevel - Math.pow(progress.level - 1, 2) * 100;

    res.json({
      // Informações básicas
      level: progress.level,
      experience: progress.experience,
      totalExercises: progress.totalExercises,
      perfectScores: progress.perfectScores,
      averageScore: Math.round(progress.averageScore * 10) / 10,
      streakDays: progress.streakDays,
      
      // Progresso do nível atual
      levelProgress: {
        current: xpProgress,
        needed: xpNeeded,
        percentage: Math.round((xpProgress / xpNeeded) * 100)
      },
      
      // Estatísticas por tipo de exercício
      byType: {
        intervals: progress.intervals,
        rhythmic: progress.rhythmic,
        melodic: progress.melodic,
        progression: progress.progression
      },
      
      // Estatísticas por dificuldade
      byDifficulty: {
        beginner: progress.beginner,
        intermediate: progress.intermediate,
        advanced: progress.advanced
      },
      
      // Informações de tempo
      lastActivityDate: progress.lastActivityDate,
      
      // Dados do usuário
      user: {
        name: user.name,
        subscription: user.subscription
      }
    });

  } catch (error) {
    console.error('Erro ao buscar progresso:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// ===================================
// ACHIEVEMENTS
// ===================================

/**
 * Obter todos os achievements do usuário (desbloqueados e bloqueados)
 */
export const getUserAchievements = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    
    console.log(`🏆 Buscando achievements para usuário ${user._id}`);
    
    const achievements = await GamificationService.getUserAchievements(user._id.toString());

    // Processar achievements desbloqueados
    const unlockedFormatted = achievements.unlocked.map(ua => {
      const achievementData = ua.achievementData;
      
      return {
        id: achievementData?.id || ua.achievementId,
        name: achievementData?.name || 'Achievement',
        description: achievementData?.description || '',
        icon: achievementData?.icon || '🏆',
        category: achievementData?.category || 'progress',
        rarity: achievementData?.rarity || 'common',
        points: achievementData?.points || 0,
        unlockedAt: ua.unlockedAt,
        isNew: ua.isNew
      };
    });

    // Processar achievements bloqueados
    const lockedFormatted = achievements.locked.map(achievement => ({
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      category: achievement.category,
      rarity: achievement.rarity,
      points: achievement.points,
      condition: achievement.condition,
      threshold: achievement.threshold,
      progress: 0 // TODO: calcular progresso atual baseado no userProgress
    }));

    // Calcular total de pontos desbloqueados
    const totalPoints = unlockedFormatted.reduce((sum, ua) => sum + ua.points, 0);

    res.json({
      achievements: {
        unlocked: unlockedFormatted,
        locked: lockedFormatted
      },
      
      summary: {
        total: achievements.total,
        unlocked: achievements.unlockedCount,
        locked: achievements.total - achievements.unlockedCount,
        completionPercentage: achievements.total > 0 ? 
          Math.round((achievements.unlockedCount / achievements.total) * 100) : 0,
        totalPoints: totalPoints
      }
    });

  } catch (error) {
    console.error('Erro ao buscar achievements:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Marcar achievements como visualizados (remover flag "isNew")
 */
export const markAchievementsAsViewed = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { achievementIds } = req.body;

    if (!Array.isArray(achievementIds)) {
      res.status(400).json({ message: 'achievementIds deve ser um array' });
      return;
    }

    // Importar modelo aqui para evitar dependência circular
    const UserAchievement = (await import('../models/UserAchievement')).default;

    // Atualizar flag isNew para false
    await UserAchievement.updateMany(
      { 
        userId: user._id.toString(),
        achievementId: { $in: achievementIds },
        isNew: true
      },
      { 
        isNew: false 
      }
    );

    res.json({ 
      message: 'Achievements marcados como visualizados',
      updatedCount: achievementIds.length
    });

  } catch (error) {
    console.error('Erro ao marcar achievements:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// ===================================
// LEADERBOARD E RANKINGS
// ===================================

/**
 * Obter leaderboard de usuários
 */
export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      limit = 10, 
      period = 'all' 
    } = req.query;

    // Validar parâmetros
    const limitNum = Math.min(Math.max(parseInt(limit as string) || 10, 1), 100);
    const validPeriods = ['week', 'month', 'all'];
    const periodStr = validPeriods.includes(period as string) ? 
      period as 'week' | 'month' | 'all' : 'all';

    console.log(`🏅 Gerando leaderboard: ${limitNum} usuários, período: ${periodStr}`);

    const leaderboard = await GamificationService.getLeaderboard(limitNum, periodStr);

    // Importar modelo User para buscar nomes
    const User = (await import('../models/User')).default;
    
    // Enriquecer dados do leaderboard com informações do usuário
    const enrichedLeaderboard = await Promise.all(
      leaderboard.map(async (entry, index) => {
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
            streakDays: entry.streakDays,
            
            // Calcular estatísticas derivadas
            perfectPercentage: entry.totalExercises > 0 ? 
              Math.round((entry.perfectScores / entry.totalExercises) * 100) : 0
          };
        } catch (error) {
          console.error(`Erro ao buscar usuário ${entry.userId}:`, error);
          return {
            rank: index + 1,
            userId: entry.userId,
            name: 'Usuário Anônimo',
            level: entry.level,
            experience: entry.experience,
            averageScore: Math.round(entry.averageScore * 10) / 10,
            totalExercises: entry.totalExercises,
            perfectScores: entry.perfectScores,
            streakDays: entry.streakDays,
            perfectPercentage: 0
          };
        }
      })
    );

    res.json({
      leaderboard: enrichedLeaderboard,
      meta: {
        period: periodStr,
        limit: limitNum,
        total: enrichedLeaderboard.length,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erro ao gerar leaderboard:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Obter posição do usuário atual no ranking
 */
export const getUserRank = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { period = 'all' } = req.query;

    const validPeriods = ['week', 'month', 'all'];
    const periodStr = validPeriods.includes(period as string) ? 
      period as 'week' | 'month' | 'all' : 'all';

    // Buscar leaderboard completo para encontrar posição
    const fullLeaderboard = await GamificationService.getLeaderboard(1000, periodStr);
    
    const userPosition = fullLeaderboard.findIndex(
      entry => entry.userId === user._id.toString()
    );

    if (userPosition === -1) {
      res.json({
        rank: null,
        message: 'Usuário não encontrado no ranking',
        totalUsers: fullLeaderboard.length
      });
      return;
    }

    const userEntry = fullLeaderboard[userPosition];

    res.json({
      rank: userPosition + 1,
      totalUsers: fullLeaderboard.length,
      percentile: Math.round(((fullLeaderboard.length - userPosition) / fullLeaderboard.length) * 100),
      userData: {
        level: userEntry.level,
        experience: userEntry.experience,
        averageScore: Math.round(userEntry.averageScore * 10) / 10,
        totalExercises: userEntry.totalExercises,
        perfectScores: userEntry.perfectScores,
        streakDays: userEntry.streakDays
      },
      period: periodStr
    });

  } catch (error) {
    console.error('Erro ao buscar ranking do usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// ===================================
// ESTATÍSTICAS GERAIS
// ===================================

/**
 * Obter estatísticas gerais da plataforma
 */
export const getPlatformStats = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(`📊 Gerando estatísticas da plataforma`);

    const stats = await GamificationService.getPlatformStats();

    // Importar modelo User para informações adicionais
    const User = (await import('../models/User')).default;

    // Buscar estatísticas adicionais
    const [
      premiumUsers,
      activeUsersLastWeek,
      topPerformerDetails
    ] = await Promise.all([
      User.countDocuments({ subscription: 'premium' }),
      User.countDocuments({ 
        lastActive: { 
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
        } 
      }),
      stats.topPerformer ? 
        User.findById(stats.topPerformer.userId).select('name') : 
        null
    ]);

    res.json({
      users: {
        total: stats.totalUsers,
        premium: premiumUsers,
        free: stats.totalUsers - premiumUsers,
        activeLastWeek: activeUsersLastWeek
      },
      
      exercises: {
        totalCompleted: stats.totalExercises,
        averageScore: Math.round(stats.averageScore * 10) / 10
      },
      
      topPerformer: stats.topPerformer ? {
        name: topPerformerDetails?.name || 'Usuário Anônimo',
        level: stats.topPerformer.level,
        experience: stats.topPerformer.experience
      } : null,
      
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao gerar estatísticas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};