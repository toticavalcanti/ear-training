// ===================================
// src/routes/adminRoutes.ts
// ===================================
import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Middleware de autenticação
router.use(protect);

// Middleware de autorização admin (simplificado)
const requireAdmin = (req: any, res: any, next: any) => {
  const user = req.user;
  
  // Para desenvolvimento ou usuário de teste
  if (user.email === 'teste@exemplo.com' || process.env.NODE_ENV === 'development') {
    next();
  } else {
    res.status(403).json({ 
      message: 'Acesso negado. Privilégios de administrador necessários.' 
    });
  }
};

router.use(requireAdmin);

// ===================================
// POPULAR ACHIEVEMENTS
// ===================================
router.post('/seed-achievements', asyncHandler(async (req, res) => {
  try {
    const Achievement = (await import('../models/Achievement')).default;
    
    // Achievements básicos para começar
    const basicAchievements = [
      {
        id: 'first_steps',
        name: 'Primeiros Passos',
        description: 'Complete seu primeiro exercício',
        icon: '🎯',
        category: 'progress',
        condition: 'total_exercises',
        threshold: 1,
        points: 10,
        rarity: 'common',
        isActive: true
      },
      {
        id: 'getting_started',
        name: 'Começando Bem',
        description: 'Complete 5 exercícios',
        icon: '🚀',
        category: 'progress',
        condition: 'total_exercises',
        threshold: 5,
        points: 25,
        rarity: 'common',
        isActive: true
      },
      {
        id: 'first_perfect',
        name: 'Primeira Perfeição',
        description: 'Obtenha seu primeiro score perfeito',
        icon: '⭐',
        category: 'mastery',
        condition: 'perfect_scores',
        threshold: 1,
        points: 20,
        rarity: 'common',
        isActive: true
      },
      {
        id: 'daily_habit',
        name: 'Hábito Diário',
        description: 'Pratique por 3 dias consecutivos',
        icon: '🔥',
        category: 'streak',
        condition: 'streak_days',
        threshold: 3,
        points: 30,
        rarity: 'common',
        isActive: true
      },
      {
        id: 'level_5',
        name: 'Novato Graduado',
        description: 'Alcance o nível 5',
        icon: '🎓',
        category: 'progress',
        condition: 'reach_level',
        threshold: 5,
        points: 50,
        rarity: 'common',
        isActive: true
      }
    ];

    // Verificar se já existem
    const existingCount = await Achievement.countDocuments();
    
    if (existingCount > 0 && req.query.force !== 'true') {
      res.json({
        message: `⚠️ Já existem ${existingCount} achievements. Use ?force=true para substituir.`,
        existing: existingCount
      });
      return;
    }

    // Deletar existentes se force=true
    if (req.query.force === 'true') {
      await Achievement.deleteMany({});
    }

    // Inserir novos
    const result = await Achievement.insertMany(basicAchievements);

    res.json({
      message: '✅ Achievements populados com sucesso!',
      count: result.length,
      achievements: result.map(a => ({
        id: a.id,
        name: a.name,
        category: a.category,
        points: a.points
      }))
    });

  } catch (error) {
    console.error('Erro ao popular achievements:', error);
    res.status(500).json({ 
      message: 'Erro ao popular achievements',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}));

// ===================================
// LISTAR ACHIEVEMENTS
// ===================================
router.get('/achievements', asyncHandler(async (req, res) => {
  try {
    const Achievement = (await import('../models/Achievement')).default;
    
    const achievements = await Achievement.find({}).sort({ category: 1, points: 1 });

    res.json({
      total: achievements.length,
      achievements: achievements.map(a => ({
        id: a.id,
        name: a.name,
        description: a.description,
        icon: a.icon,
        category: a.category,
        condition: a.condition,
        threshold: a.threshold,
        points: a.points,
        rarity: a.rarity,
        isActive: a.isActive
      }))
    });

  } catch (error) {
    console.error('Erro ao listar achievements:', error);
    res.status(500).json({ message: 'Erro ao listar achievements' });
  }
}));

// ===================================
// ESTATÍSTICAS DO SISTEMA
// ===================================
router.get('/stats', asyncHandler(async (req, res) => {
  try {
    const [User, UserProgress, UserScore, Achievement] = await Promise.all([
      import('../models/User').then(m => m.default),
      import('../models/UserProgress').then(m => m.default),
      import('../models/UserScore').then(m => m.default),
      import('../models/Achievement').then(m => m.default)
    ]);

    const [totalUsers, totalProgress, totalScores, totalAchievements] = await Promise.all([
      User.countDocuments(),
      UserProgress.countDocuments(),
      UserScore.countDocuments(),
      Achievement.countDocuments()
    ]);

    res.json({
      overview: {
        totalUsers,
        usersWithProgress: totalProgress,
        totalExercisesCompleted: totalScores,
        availableAchievements: totalAchievements
      },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao gerar estatísticas:', error);
    res.status(500).json({ message: 'Erro ao gerar estatísticas' });
  }
}));

export default router;