// ===================================
// src/routes/gamificationRoutes.ts - VERSÃO MELHORADA
// ===================================
import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getUserProgress,
  getUserAchievements,
  getLeaderboard,
  getUserRank
} from '../controllers/gamificationController';
import { GamificationService } from '../services/gamificationService';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(protect);

// ===================================
// ROTA BÁSICA DE TESTE
// ===================================
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Sistema de gamificação funcionando!',
    timestamp: new Date().toISOString(),
    routes: [
      'GET /test - Teste básico',
      'POST /submit-frontend - Submeter exercício frontend',
      'GET /progress - Progresso do usuário',
      'GET /achievements - Achievements do usuário',
      'GET /leaderboard - Ranking geral',
      'GET /rank - Posição do usuário'
    ]
  });
});

// ===================================
// USAR SEU CONTROLLER EXISTENTE
// ===================================
router.get('/progress', getUserProgress);
router.get('/achievements', getUserAchievements);
router.get('/leaderboard', getLeaderboard);
router.get('/rank', getUserRank);

// ===================================
// 🆕 SUBMIT FRONTEND - INTEGRAÇÃO COMPLETA
// ===================================
router.post('/submit-frontend', async (req, res) => {
  try {
    const user = (req as any).user;
    const { 
      exerciseType, 
      difficulty, 
      userAnswer, 
      correctAnswer, 
      timeSpent, 
      exerciseData 
    } = req.body;

    console.log(`🎮 [FRONTEND] Recebendo exercício de ${user.name} (${user._id})`);
    console.log(`📝 Tipo: ${exerciseType}, Dificuldade: ${difficulty}`);
    console.log(`🔍 Resposta: "${userAnswer}" vs "${correctAnswer}"`);
    console.log(`⏱️ Tempo: ${timeSpent}ms`);

    // Validações básicas
    if (!exerciseType || !difficulty || userAnswer === undefined || !correctAnswer || !timeSpent) {
      console.warn('❌ Dados obrigatórios faltando');
      res.status(400).json({ 
        success: false,
        message: 'Dados obrigatórios: exerciseType, difficulty, userAnswer, correctAnswer, timeSpent' 
      });
      return;
    }

    // Validar tipos
    const validTypes = ['interval', 'rhythmic', 'melodic', 'progression'];
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    
    if (!validTypes.includes(exerciseType)) {
      res.status(400).json({
        success: false,
        message: `Tipo de exercício inválido. Válidos: ${validTypes.join(', ')}`
      });
      return;
    }

    if (!validDifficulties.includes(difficulty)) {
      res.status(400).json({
        success: false,
        message: `Dificuldade inválida. Válidas: ${validDifficulties.join(', ')}`
      });
      return;
    }

    // Verificar se user tem acesso premium (se necessário)
    const isPremiumExercise = difficulty !== 'beginner';
    if (isPremiumExercise && user.subscription !== 'premium') {
      console.warn(`⚠️ Usuário ${user.name} tentou exercício premium sem assinatura`);
      res.status(403).json({
        success: false,
        message: 'Assinatura premium necessária para exercícios intermediários e avançados'
      });
      return;
    }

    // Gerar ID único para este exercício frontend
    const exerciseId = `frontend_${exerciseType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // 🚀 PROCESSAR COM SISTEMA DE GAMIFICAÇÃO COMPLETO
      const result = await GamificationService.submitExercise(
        user._id.toString(),
        exerciseId,
        exerciseType,
        difficulty,
        userAnswer,
        correctAnswer,
        timeSpent,
        1 // tentativas = 1 para exercícios frontend
      );

      console.log(`✅ Exercício processado com sucesso:`);
      console.log(`📊 Score: ${result.score}/100, XP: ${result.experienceGained}`);
      console.log(`🎯 Level: ${result.currentLevel}, Level Up: ${result.levelUp}`);
      console.log(`🏆 Achievements: ${result.newAchievements.length}`);

      // Resposta completa para o frontend
      res.json({
        success: true,
        isCorrect: result.score > 0,
        correctAnswer,
        userAnswer,
        
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
        
        // Mensagem personalizada
        message: generateMessage(result, exerciseType, difficulty),
        
        // Metadados do exercício
        exerciseId,
        exerciseType,
        difficulty,
        timeSpent,
        
        // Data para o frontend
        processedAt: new Date().toISOString()
      });

    } catch (gamificationError) {
      console.error('❌ Erro no sistema de gamificação:', gamificationError);
      
      // Fallback: resposta básica sem gamificação
      const isCorrect = String(userAnswer).toLowerCase().trim() === String(correctAnswer).toLowerCase().trim();
      
      res.json({
        success: false, // Indica que houve problema na gamificação
        isCorrect,
        correctAnswer,
        userAnswer,
        score: isCorrect ? 70 : 0, // Score básico
        experienceGained: isCorrect ? 10 : 2, // XP básico
        message: isCorrect ? 
          '✅ Resposta correta! (Erro ao salvar progresso)' : 
          '❌ Resposta incorreta',
        error: 'Erro ao processar gamificação - dados não salvos',
        fallbackMode: true
      });
    }

  } catch (error) {
    console.error('💥 Erro geral no submit-frontend:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? 
        (error as Error).message : 
        'Erro interno'
    });
  }
});

// ===================================
// FUNÇÃO AUXILIAR PARA MENSAGENS
// ===================================
function generateMessage(
  result: any, 
  exerciseType: string, 
  difficulty: string
): string {
  const typeNames: Record<string, string> = {
    interval: 'intervalos',
    rhythmic: 'ritmos',
    melodic: 'melodias',
    progression: 'progressões'
  };

  const difficultyNames: Record<string, string> = {
    beginner: 'iniciante',
    intermediate: 'intermediário',
    advanced: 'avançado'
  };

  const typeName = typeNames[exerciseType] || exerciseType;
  const difficultyName = difficultyNames[difficulty] || difficulty;

  if (result.isPerfect) {
    return `🎉 Perfeito! Você domina ${typeName} no nível ${difficultyName}! +${result.experienceGained} XP`;
  } else if (result.score >= 80) {
    return `✅ Excelente! Muito bem em ${typeName}! +${result.experienceGained} XP`;
  } else if (result.score >= 60) {
    return `👍 Bom trabalho com ${typeName}! +${result.experienceGained} XP`;
  } else if (result.score > 0) {
    return `💪 Continue praticando ${typeName}! +${result.experienceGained} XP`;
  } else {
    return `❌ Não foi dessa vez! Continue estudando ${typeName}. +${result.experienceGained} XP`;
  }
}

// ===================================
// 🆕 ROTA PARA ESTATÍSTICAS RÁPIDAS
// ===================================
router.get('/quick-stats', async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Buscar progresso básico rapidamente
    const progress = await GamificationService.getUserProgress(user._id.toString());
    
    if (!progress) {
      res.json({
        level: 1,
        experience: 0,
        totalExercises: 0,
        averageScore: 0
      });
      return;
    }

    res.json({
      level: progress.level,
      experience: progress.experience,
      totalExercises: progress.totalExercises,
      averageScore: Math.round(progress.averageScore * 10) / 10,
      streakDays: progress.streakDays,
      intervalStats: progress.intervals
    });

  } catch (error) {
    console.error('❌ Erro ao buscar quick-stats:', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas' });
  }
});

export default router;