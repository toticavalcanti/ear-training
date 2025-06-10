// src/app/api/progress/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Progress, { IExerciseStats, IBadge, IProgress } from '@/models/Progress';
import { getUserFromToken } from '@/lib/auth-utils';
import { Document } from 'mongoose';

interface SessionData {
  exerciseType: string;
  difficulty: string;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  averageResponseTime: number;
}

// Tipo do documento Progress do Mongoose
type ProgressDocument = Document & IProgress;

interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// Sistema de badges predefinido
const AVAILABLE_BADGES: Record<string, BadgeDefinition> = {
  'first-exercise': {
    id: 'first-exercise',
    name: 'Primeiro Passo',
    description: 'Complete seu primeiro exercício',
    icon: '🎯',
  },
  'perfect-session': {
    id: 'perfect-session',
    name: 'Perfeição',
    description: 'Acerte 100% em uma sessão',
    icon: '💯',
  },
  'streak-5': {
    id: 'streak-5',
    name: 'Em Chamas',
    description: 'Mantenha 5 acertos consecutivos',
    icon: '🔥',
  },
  'streak-10': {
    id: 'streak-10',
    name: 'Imparável',
    description: 'Mantenha 10 acertos consecutivos',
    icon: '⚡',
  },
  'level-5': {
    id: 'level-5',
    name: 'Veterano',
    description: 'Alcance o nível 5',
    icon: '⭐',
  },
  'intervals-master': {
    id: 'intervals-master',
    name: 'Mestre dos Intervalos',
    description: 'Complete 50 exercícios de intervalos',
    icon: '🎼',
  },
};

function calculateLevel(totalXp: number): { currentLevel: number; xpForNextLevel: number } {
  // Progressão: Level 1 = 0, Level 2 = 100, Level 3 = 300, Level 4 = 600, etc.
  // Fórmula: XP necessário = (level - 1) * 100 + (level - 1) * (level - 2) * 50
  
  let currentLevel = 1;
  let xpForCurrentLevel = 0;
  
  while (true) {
    const xpForNextLevel = currentLevel === 1 ? 100 : 
      xpForCurrentLevel + (currentLevel * 100) + ((currentLevel - 1) * 50);
    
    if (totalXp < xpForNextLevel) {
      return {
        currentLevel,
        xpForNextLevel: xpForNextLevel - totalXp
      };
    }
    
    xpForCurrentLevel = xpForNextLevel;
    currentLevel++;
    
    // Limite máximo para evitar loop infinito
    if (currentLevel > 100) {
      return { currentLevel: 100, xpForNextLevel: 0 };
    }
  }
}

// ✅ NOVA FUNÇÃO UNIFICADA DE PONTUAÇÃO ENGAJANTE
function calculateEngagementPoints(
  correctAnswers: number,
  totalQuestions: number,
  difficulty: string,
  averageResponseTime: number,
  recentSessions: Array<{correctAnswers: number, totalQuestions: number, averageResponseTime: number}>,
  consecutiveErrors: number
): { 
  points: number; 
  xp: number; 
  breakdown: {
    basePoints: number;
    correctnessBonus: number;
    thoughtfulnessBonus: number;
    improvementBonus: number;
    participationBonus: number;
    recoveryBonus: number;
    difficultyMultiplier: number;
    encouragement: string;
  }
} {
  const accuracy = correctAnswers / totalQuestions;
  
  // Multiplicador base por dificuldade
  const difficultyMultipliers: Record<string, number> = {
    beginner: 1,
    intermediate: 1.5,
    advanced: 2,
  };
  const difficultyMultiplier = difficultyMultipliers[difficulty] || 1;
  
  // ✅ 1. PONTOS BASE - Todos sempre ganham algo
  const basePoints = Math.round(20 * difficultyMultiplier);
  
  // ✅ 2. BONUS DE CORREÇÃO - Não é tudo ou nada
  let correctnessBonus = 0;
  if (accuracy === 1) {
    correctnessBonus = Math.round(30 * difficultyMultiplier);
  } else if (accuracy > 0) {
    // Ainda ganha alguma coisa por tentar
    correctnessBonus = Math.round(5 * difficultyMultiplier);
  }
  
  // ✅ 3. BONUS DE REFLEXÃO - Encoraja análise cuidadosa
  let thoughtfulnessBonus = 0;
  const idealTime = 8; // 8 segundos = tempo ideal para análise
  
  if (averageResponseTime < 3) {
    // Muito rápido = provável chute = 0 bonus
    thoughtfulnessBonus = 0;
  } else if (averageResponseTime >= 3 && averageResponseTime <= 15) {
    // Tempo bom de análise = MÁXIMO bonus
    const timeRatio = Math.min(1, averageResponseTime / idealTime);
    thoughtfulnessBonus = Math.round(15 * difficultyMultiplier * timeRatio);
  } else {
    // Tempo excessivo, mas ainda positivo
    thoughtfulnessBonus = Math.round(5 * difficultyMultiplier);
  }
  
  // ✅ 4. BONUS DE MELHORIA - Recompensa progresso
  let improvementBonus = 0;
  if (recentSessions.length >= 3) {
    const recent = recentSessions.slice(-3);
    const recentAccuracy = recent.reduce((sum, s) => sum + (s.correctAnswers / s.totalQuestions), 0) / recent.length;
    const previous = recentSessions.slice(-6, -3);
    const previousAccuracy = previous.length > 0 ? 
      previous.reduce((sum, s) => sum + (s.correctAnswers / s.totalQuestions), 0) / previous.length : 0;
    
    if (recentAccuracy > previousAccuracy) {
      improvementBonus = Math.round(20 * difficultyMultiplier);
    }
  }
  
  // ✅ 5. BONUS DE PARTICIPAÇÃO - Encoraja prática
  const participationBonus = Math.round(10 * difficultyMultiplier);
  
  // ✅ 6. BONUS DE RECUPERAÇÃO - Recovery mechanics
  let recoveryBonus = 0;
  if (accuracy < 1 && consecutiveErrors >= 2) {
    // Após 2+ erros, próxima tentativa vale mais
    recoveryBonus = Math.round(15 * difficultyMultiplier);
  } else if (accuracy === 1 && consecutiveErrors >= 1) {
    // Acertou após erro(s) - Grande recompensa!
    recoveryBonus = Math.round(25 * difficultyMultiplier * Math.min(consecutiveErrors, 3));
  }
  
  const totalPoints = basePoints + correctnessBonus + thoughtfulnessBonus + 
                     improvementBonus + participationBonus + recoveryBonus;
  
  // ✅ 7. MENSAGEM DE ENCORAJAMENTO
  let encouragement = '';
  if (accuracy === 1) {
    const excellentReasons = [];
    if (thoughtfulnessBonus > 10) excellentReasons.push('análise cuidadosa');
    if (recoveryBonus > 0) excellentReasons.push('recuperação');
    if (improvementBonus > 0) excellentReasons.push('melhoria consistente');
    
    if (excellentReasons.length > 0) {
      encouragement = `Excelente! Destaque em: ${excellentReasons.join(', ')}`;
    } else {
      encouragement = 'Muito bem! Continue assim!';
    }
  } else {
    if (averageResponseTime >= 5) {
      encouragement = 'Boa análise! A prática leva à perfeição 🎯';
    } else {
      encouragement = 'Tente ouvir novamente e analise com calma 🎵';
    }
  }
  
  // ✅ XP baseado em engajamento, não apenas precisão
  const engagementFactor = (thoughtfulnessBonus > 0 ? 1.2 : 0.8); // Bonus por reflexão
  const xp = Math.round(totalPoints * (0.3 + accuracy * 0.4) * engagementFactor);
  
  return {
    points: totalPoints,
    xp: xp,
    breakdown: {
      basePoints,
      correctnessBonus,
      thoughtfulnessBonus,
      improvementBonus,
      participationBonus,
      recoveryBonus,
      difficultyMultiplier,
      encouragement
    }
  };
}

// ✅ FUNÇÃO AUXILIAR PARA CALCULAR ERROS CONSECUTIVOS
function calculateConsecutiveErrors(recentSessions: Array<{correctAnswers: number, totalQuestions: number}>): number {
  let consecutive = 0;
  for (let i = recentSessions.length - 1; i >= 0; i--) {
    const session = recentSessions[i];
    if (session.correctAnswers < session.totalQuestions) {
      consecutive++;
    } else {
      break;
    }
  }
  return consecutive;
}

function checkForNewBadges(progress: ProgressDocument, sessionData: SessionData): string[] {
  const newBadges: string[] = [];
  const existingBadgeIds = progress.badges.map((b: IBadge) => b.id);
  
  // Primeiro exercício
  if (!existingBadgeIds.includes('first-exercise') && progress.totalExercises === 0) {
    newBadges.push('first-exercise');
  }
  
  // Sessão perfeita
  if (!existingBadgeIds.includes('perfect-session') && 
      sessionData.correctAnswers === sessionData.totalQuestions && 
      sessionData.totalQuestions >= 5) {
    newBadges.push('perfect-session');
  }
  
  // Streaks
  if (!existingBadgeIds.includes('streak-5') && progress.currentGlobalStreak >= 5) {
    newBadges.push('streak-5');
  }
  
  if (!existingBadgeIds.includes('streak-10') && progress.currentGlobalStreak >= 10) {
    newBadges.push('streak-10');
  }
  
  // Nível 5
  if (!existingBadgeIds.includes('level-5') && progress.currentLevel >= 5) {
    newBadges.push('level-5');
  }
  
  // Mestre dos intervalos
  const intervalStats = progress.exerciseStats.find((stat: IExerciseStats) => 
    stat.exerciseType === 'melodic-intervals' || stat.exerciseType === 'harmonic-intervals'
  );
  if (!existingBadgeIds.includes('intervals-master') && 
      intervalStats && intervalStats.totalSessions >= 50) {
    newBadges.push('intervals-master');
  }
  
  return newBadges;
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const userId = await getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      exerciseType,
      difficulty,
      totalQuestions,
      correctAnswers,
      timeSpent,
      averageResponseTime,
    } = body;

    // Validação dos dados
    if (!exerciseType || !difficulty || !totalQuestions || correctAnswers === undefined) {
      return NextResponse.json(
        { message: 'Dados incompletos da sessão' },
        { status: 400 }
      );
    }

    // Buscar progresso existente
    let progress = await Progress.findOne({ userId }) as ProgressDocument | null;
    
    if (!progress) {
      // ✅ CRIAR PROGRESSO COM TODOS OS CAMPOS INICIALIZADOS
      progress = new Progress({ 
        userId,
        totalXp: 0,
        currentLevel: 1,
        totalPoints: 0,
        totalExercises: 0,
        totalCorrectAnswers: 0,
        overallAccuracy: 0,
        currentGlobalStreak: 0,
        bestGlobalStreak: 0,
        lastActiveDate: new Date(),
        exerciseStats: [],
        recentSessions: [],
        badges: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }) as ProgressDocument;
    }

    // ✅ USAR NOVA FUNÇÃO DE PONTUAÇÃO ENGAJANTE
    const consecutiveErrors = calculateConsecutiveErrors(
      progress.recentSessions.slice(-5).map(s => ({
        correctAnswers: s.correctAnswers,
        totalQuestions: s.totalQuestions
      }))
    );

    const scoringResult = calculateEngagementPoints(
      correctAnswers,
      totalQuestions,
      difficulty,
      averageResponseTime,
      progress.recentSessions.slice(-10).map(s => ({
        correctAnswers: s.correctAnswers,
        totalQuestions: s.totalQuestions,
        averageResponseTime: s.averageResponseTime
      })),
      consecutiveErrors
    );

    const points = scoringResult.points;
    const xp = scoringResult.xp;
    const accuracy = correctAnswers / totalQuestions;

    // Criar dados da sessão
    const sessionData: SessionData = {
      exerciseType,
      difficulty,
      totalQuestions,
      correctAnswers,
      timeSpent,
      averageResponseTime,
    };

    // Atualizar estatísticas gerais
    const oldLevel = progress.currentLevel;
    progress.totalXp += xp;
    progress.totalPoints += points;
    progress.totalExercises += 1;
    progress.totalCorrectAnswers += correctAnswers;
    
    // ✅ CALCULAR NOVO NÍVEL BASEADO NO XP
    const levelInfo = calculateLevel(progress.totalXp);
    progress.currentLevel = levelInfo.currentLevel;
    // Não salvamos xpForNextLevel no banco - calculamos dinamicamente

    // Atualizar streak global
    if (accuracy >= 0.8) { // 80% ou mais para manter streak
      progress.currentGlobalStreak += 1;
      progress.bestGlobalStreak = Math.max(progress.bestGlobalStreak, progress.currentGlobalStreak);
    } else {
      progress.currentGlobalStreak = 0;
    }

    progress.lastActiveDate = new Date();
    progress.updatedAt = new Date();

    // Atualizar estatísticas do exercício específico
    let exerciseStat = progress.exerciseStats.find((stat: IExerciseStats) => stat.exerciseType === exerciseType);
    
    if (!exerciseStat) {
      const newExerciseStat: IExerciseStats = {
        exerciseType: exerciseType as 'melodic-intervals' | 'harmonic-intervals' | 'chord-progressions' | 'rhythmic-patterns',
        totalSessions: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        bestAccuracy: 0,
        averageAccuracy: 0,
        totalTimeSpent: 0,
        totalPointsEarned: 0,
        totalXpEarned: 0,
        currentStreak: 0,
        bestStreak: 0,
        lastPlayed: new Date(),
      };
      progress.exerciseStats.push(newExerciseStat);
      exerciseStat = newExerciseStat;
    }

    // Atualizar estatísticas específicas
    exerciseStat.totalSessions += 1;
    exerciseStat.totalQuestions += totalQuestions;
    exerciseStat.totalCorrect += correctAnswers;
    exerciseStat.bestAccuracy = Math.max(exerciseStat.bestAccuracy, accuracy * 100);
    exerciseStat.averageAccuracy = (exerciseStat.totalCorrect / exerciseStat.totalQuestions) * 100;
    exerciseStat.totalTimeSpent += timeSpent;
    exerciseStat.totalPointsEarned += points;
    exerciseStat.totalXpEarned += xp;
    exerciseStat.lastPlayed = new Date();

    // Atualizar streak do exercício
    if (accuracy >= 0.8) {
      exerciseStat.currentStreak += 1;
      exerciseStat.bestStreak = Math.max(exerciseStat.bestStreak, exerciseStat.currentStreak);
    } else {
      exerciseStat.currentStreak = 0;
    }

    // Adicionar sessão ao histórico (manter apenas as últimas 50)
    progress.recentSessions.unshift({
      exerciseType: exerciseType as 'melodic-intervals' | 'harmonic-intervals' | 'chord-progressions' | 'rhythmic-patterns',
      difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced',
      totalQuestions,
      correctAnswers,
      timeSpent,
      averageResponseTime,
      pointsEarned: points,
      xpEarned: xp,
      completedAt: new Date(),
    });
    if (progress.recentSessions.length > 50) {
      progress.recentSessions = progress.recentSessions.slice(0, 50);
    }

    // Verificar novas conquistas
    const newBadgeIds = checkForNewBadges(progress, sessionData);
    const newBadges = newBadgeIds.map(badgeId => ({
      ...AVAILABLE_BADGES[badgeId],
      unlockedAt: new Date(),
    }));
    
    progress.badges.push(...newBadges);

    // ✅ CALCULAR PRECISÃO GERAL APÓS ATUALIZAR TODAS AS ESTATÍSTICAS
    // Usar APENAS dados dos exerciseStats para evitar inconsistências
    const totalQuestionsAllExercises = progress.exerciseStats.reduce((sum: number, stat: IExerciseStats) => sum + stat.totalQuestions, 0);
    const totalCorrectAllExercises = progress.exerciseStats.reduce((sum: number, stat: IExerciseStats) => sum + stat.totalCorrect, 0);
    
    progress.overallAccuracy = totalQuestionsAllExercises > 0 ? 
      (totalCorrectAllExercises / totalQuestionsAllExercises) * 100 : 0;

    // Garantir que não exceda 100%
    progress.overallAccuracy = Math.min(progress.overallAccuracy, 100);

    // Salvar progresso atualizado
    await progress.save();

    console.log(`✅ Sistema unificado - Progresso atualizado para usuário ${userId}:`, {
      points,
      xp,
      accuracy: Math.round(accuracy * 100) + '%',
      oldLevel,
      newLevel: progress.currentLevel,
      levelUp: progress.currentLevel > oldLevel,
      newBadges: newBadgeIds,
      breakdown: scoringResult.breakdown,
      systemType: 'Unified Engagement System'
    });

    // ✅ RESPOSTA COM BREAKDOWN DETALHADO
    // Calcular xpForNextLevel dinamicamente para a resposta
    const finalLevelInfo = calculateLevel(progress.totalXp);
    
    return NextResponse.json({
      sessionResults: {
        pointsEarned: points,
        xpEarned: xp,
        accuracy: Math.round(accuracy * 100),
        levelUp: progress.currentLevel > oldLevel,
        newLevel: progress.currentLevel,
        newBadges,
        // ✅ NOVO: Breakdown detalhado para o frontend
        pointsBreakdown: scoringResult.breakdown,
      },
      updatedProgress: {
        totalXp: progress.totalXp,
        currentLevel: progress.currentLevel,
        xpForNextLevel: finalLevelInfo.xpForNextLevel, // ✅ Calculado dinamicamente
        totalPoints: progress.totalPoints,
        currentGlobalStreak: progress.currentGlobalStreak,
        overallAccuracy: Math.round(progress.overallAccuracy),
      },
    });

  } catch (error) {
    console.error('💥 Erro ao atualizar progresso:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}