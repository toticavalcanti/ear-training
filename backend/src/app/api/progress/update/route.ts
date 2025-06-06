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

function calculatePoints(
  correctAnswers: number,
  totalQuestions: number,
  difficulty: string,
  averageResponseTime: number
): number {
  const accuracy = correctAnswers / totalQuestions;
  
  // Multiplicador base por dificuldade
  const difficultyMultipliers: Record<string, number> = {
    beginner: 1,
    intermediate: 1.5,
    advanced: 2,
  };
  const difficultyMultiplier = difficultyMultipliers[difficulty] || 1;
  
  // Bonus por tempo de resposta (resposta rápida = mais pontos)
  const timeBonus = Math.max(0.5, Math.min(1.5, 10 / averageResponseTime));
  
  // Fórmula: Pontos base * Precisão * Dificuldade * Bonus de Tempo
  const basePoints = totalQuestions * 10;
  
  return Math.round(basePoints * accuracy * difficultyMultiplier * timeBonus);
}

function calculateXP(points: number, accuracy: number): number {
  // XP = Pontos * (0.5 + accuracy/2)
  // Exemplo: 100 pontos + 80% accuracy = 100 * (0.5 + 0.4) = 90 XP
  return Math.round(points * (0.5 + accuracy / 2));
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
      // Criar progresso se não existir
      progress = new Progress({ userId }) as ProgressDocument;
    }

    // Calcular pontos e XP
    const accuracy = correctAnswers / totalQuestions;
    const points = calculatePoints(correctAnswers, totalQuestions, difficulty, averageResponseTime);
    const xp = calculateXP(points, accuracy);

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
    
    // Recalcular precisão geral
    const totalQuestionsSoFar = progress.exerciseStats.reduce((sum: number, stat: IExerciseStats) => sum + stat.totalQuestions, 0) + totalQuestions;
    progress.overallAccuracy = totalQuestionsSoFar > 0 ? 
      (progress.totalCorrectAnswers / totalQuestionsSoFar) * 100 : 0;

    // Atualizar streak global
    if (accuracy >= 0.8) { // 80% ou mais para manter streak
      progress.currentGlobalStreak += 1;
      progress.bestGlobalStreak = Math.max(progress.bestGlobalStreak, progress.currentGlobalStreak);
    } else {
      progress.currentGlobalStreak = 0;
    }

    progress.lastActiveDate = new Date();

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

    // Salvar progresso atualizado
    await progress.save();

    console.log(`✅ Progresso atualizado para usuário ${userId}:`, {
      points,
      xp,
      accuracy: Math.round(accuracy * 100) + '%',
      newLevel: progress.currentLevel,
      levelUp: progress.currentLevel > oldLevel,
      newBadges: newBadgeIds,
    });

    // Resposta com dados da sessão
    return NextResponse.json({
      sessionResults: {
        pointsEarned: points,
        xpEarned: xp,
        accuracy: Math.round(accuracy * 100),
        levelUp: progress.currentLevel > oldLevel,
        newLevel: progress.currentLevel,
        newBadges,
      },
      updatedProgress: {
        totalXp: progress.totalXp,
        currentLevel: progress.currentLevel,
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