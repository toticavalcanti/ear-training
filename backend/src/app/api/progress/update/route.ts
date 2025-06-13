// src/app/api/progress/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Progress, { IExerciseStats, IBadge, IProgress, IExerciseSession } from '@/models/Progress';
import { getUserFromToken } from '@/lib/auth-utils';
import { getLevelFromXp, getXpForNextLevel } from '@/lib/levelUtils';
import { Document } from 'mongoose';

interface SessionData {
  exerciseType: 'melodic-intervals' | 'harmonic-intervals' | 'chord-progressions' | 'rhythmic-patterns';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  averageResponseTime: number;
}

type ProgressDocument = Document & IProgress;

interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
}

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
    description: 'Acerte 100% em uma sessão com 5+ questões',
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
  
  const difficultyMultipliers: Record<string, number> = {
    beginner: 1,
    intermediate: 1.5,
    advanced: 2,
  };
  const difficultyMultiplier = difficultyMultipliers[difficulty] || 1;
  
  const basePoints = Math.round(20 * difficultyMultiplier);
  
  let correctnessBonus = 0;
  if (accuracy === 1) {
    correctnessBonus = Math.round(30 * difficultyMultiplier);
  } else if (accuracy > 0) {
    correctnessBonus = Math.round(5 * difficultyMultiplier);
  }
  
  let thoughtfulnessBonus = 0;
  const idealTime = 8;
  
  if (averageResponseTime < 3) {
    thoughtfulnessBonus = 0;
  } else if (averageResponseTime >= 3 && averageResponseTime <= 15) {
    const timeRatio = Math.min(1, averageResponseTime / idealTime);
    thoughtfulnessBonus = Math.round(15 * difficultyMultiplier * timeRatio);
  } else {
    thoughtfulnessBonus = Math.round(5 * difficultyMultiplier);
  }
  
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
  
  const participationBonus = Math.round(10 * difficultyMultiplier);
  
  let recoveryBonus = 0;
  if (accuracy < 1 && consecutiveErrors >= 2) {
    recoveryBonus = Math.round(15 * difficultyMultiplier);
  } else if (accuracy === 1 && consecutiveErrors >= 1) {
    recoveryBonus = Math.round(25 * difficultyMultiplier * Math.min(consecutiveErrors, 3));
  }
  
  const totalPoints = basePoints + correctnessBonus + thoughtfulnessBonus + 
                     improvementBonus + participationBonus + recoveryBonus;
  
  let encouragement = '';
  if (accuracy === 1) {
    const excellentReasons = [];
    if (thoughtfulnessBonus > 10) excellentReasons.push('análise cuidadosa');
    if (recoveryBonus > 0) excellentReasons.push('recuperação');
    if (improvementBonus > 0) excellentReasons.push('melhoria consistente');
    
    encouragement = excellentReasons.length > 0
      ? `Excelente! Destaque em: ${excellentReasons.join(', ')}`
      : 'Muito bem! Continue assim!';
  } else {
    encouragement = averageResponseTime >= 5
      ? 'Boa análise! A prática leva à perfeição 🎯'
      : 'Tente ouvir novamente e analise com calma 🎵';
  }
  
  const engagementFactor = (thoughtfulnessBonus > 0 ? 1.2 : 0.8);
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

function calculateConsecutiveErrors(recentSessions: Array<{correctAnswers: number, totalQuestions: number}>): number {
  let consecutive = 0;
  for (let i = recentSessions.length - 1; i >= 0; i--) {
    if (recentSessions[i].correctAnswers < recentSessions[i].totalQuestions) {
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
  
  if (!existingBadgeIds.includes('first-exercise') && progress.totalExercises === 1) {
    newBadges.push('first-exercise');
  }
  
  if (!existingBadgeIds.includes('perfect-session') && 
      sessionData.correctAnswers === sessionData.totalQuestions && 
      sessionData.totalQuestions >= 5) {
    newBadges.push('perfect-session');
  }
  
  if (!existingBadgeIds.includes('streak-5') && progress.currentGlobalStreak >= 5) {
    newBadges.push('streak-5');
  }
  
  if (!existingBadgeIds.includes('streak-10') && progress.currentGlobalStreak >= 10) {
    newBadges.push('streak-10');
  }
  
  if (!existingBadgeIds.includes('level-5') && progress.currentLevel >= 5) {
    newBadges.push('level-5');
  }
  
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

    const body: SessionData = await request.json();
    const {
      exerciseType,
      difficulty,
      totalQuestions,
      correctAnswers,
      timeSpent,
      averageResponseTime,
    } = body;

    if (!exerciseType || !difficulty || totalQuestions === undefined || correctAnswers === undefined) {
      return NextResponse.json(
        { message: 'Dados incompletos da sessão' },
        { status: 400 }
      );
    }

    let progress = await Progress.findOne({ userId }) as ProgressDocument | null;
    
    if (!progress) {
      progress = new Progress({ 
        userId, totalXp: 0, currentLevel: 1, totalPoints: 0, totalExercises: 0,
        totalCorrectAnswers: 0, overallAccuracy: 0, currentGlobalStreak: 0,
        bestGlobalStreak: 0, lastActiveDate: new Date(), exerciseStats: [],
        recentSessions: [], badges: [], createdAt: new Date(), updatedAt: new Date()
      }) as ProgressDocument;
    }

    const consecutiveErrors = calculateConsecutiveErrors(
      progress.recentSessions.slice(-5).map(s => ({
        correctAnswers: s.correctAnswers,
        totalQuestions: s.totalQuestions
      }))
    );

    const scoringResult = calculateEngagementPoints(
      correctAnswers, totalQuestions, difficulty, averageResponseTime,
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

    const oldLevel = progress.currentLevel;
    progress.totalXp += xp;
    progress.totalPoints += points;
    progress.totalExercises += 1;
    progress.totalCorrectAnswers += correctAnswers;
    
    progress.currentLevel = getLevelFromXp(progress.totalXp);
    const levelUp = progress.currentLevel > oldLevel;

    if (accuracy >= 0.8) {
      progress.currentGlobalStreak += 1;
      progress.bestGlobalStreak = Math.max(progress.bestGlobalStreak, progress.currentGlobalStreak);
    } else {
      progress.currentGlobalStreak = 0;
    }

    progress.lastActiveDate = new Date();
    progress.updatedAt = new Date();

    let exerciseStat: IExerciseStats | undefined = progress.exerciseStats.find((stat) => stat.exerciseType === exerciseType);
    if (!exerciseStat) {
      const newExerciseStat: IExerciseStats = {
        exerciseType: exerciseType,
        totalSessions: 0, totalQuestions: 0, totalCorrect: 0,
        bestAccuracy: 0, averageAccuracy: 0, totalTimeSpent: 0,
        totalPointsEarned: 0, totalXpEarned: 0, currentStreak: 0,
        bestStreak: 0, lastPlayed: new Date(),
      };
      progress.exerciseStats.push(newExerciseStat);
      exerciseStat = newExerciseStat;
    }
    
    exerciseStat.totalSessions += 1;
    exerciseStat.totalQuestions += totalQuestions;
    exerciseStat.totalCorrect += correctAnswers;
    exerciseStat.bestAccuracy = Math.max(exerciseStat.bestAccuracy, accuracy * 100);
    exerciseStat.averageAccuracy = (exerciseStat.totalCorrect / exerciseStat.totalQuestions) * 100;
    exerciseStat.totalTimeSpent += timeSpent;
    exerciseStat.totalPointsEarned += points;
    exerciseStat.totalXpEarned += xp;
    exerciseStat.lastPlayed = new Date();
    
    if (accuracy >= 0.8) {
      exerciseStat.currentStreak += 1;
      exerciseStat.bestStreak = Math.max(exerciseStat.bestStreak, exerciseStat.currentStreak);
    } else {
      exerciseStat.currentStreak = 0;
    }

    const sessionEntry: IExerciseSession = {
      exerciseType, difficulty, totalQuestions, correctAnswers,
      timeSpent, averageResponseTime, pointsEarned: points,
      xpEarned: xp, completedAt: new Date(),
    };
    progress.recentSessions.unshift(sessionEntry);
    if (progress.recentSessions.length > 50) {
      progress.recentSessions = progress.recentSessions.slice(0, 50);
    }

    const newBadgeIds = checkForNewBadges(progress, body);
    const newBadges = newBadgeIds.map(badgeId => ({
      ...AVAILABLE_BADGES[badgeId],
      unlockedAt: new Date(),
    }));
    
    if (newBadges.length > 0) {
        progress.badges.push(...newBadges);
    }

    const totalQuestionsAll = progress.exerciseStats.reduce((sum, stat) => sum + stat.totalQuestions, 0);
    const totalCorrectAll = progress.exerciseStats.reduce((sum, stat) => sum + stat.totalCorrect, 0);
    progress.overallAccuracy = totalQuestionsAll > 0 ? (totalCorrectAll / totalQuestionsAll) * 100 : 0;
    progress.overallAccuracy = Math.min(progress.overallAccuracy, 100);

    await progress.save();

    console.log(`✅ Progresso atualizado para usuário ${userId}`);
    
    return NextResponse.json({
      sessionResults: {
        pointsEarned: points,
        xpEarned: xp,
        accuracy: Math.round(accuracy * 100),
        levelUp,
        newLevel: progress.currentLevel,
        newBadges,
        pointsBreakdown: scoringResult.breakdown,
      },
      updatedProgress: {
        totalXp: progress.totalXp,
        currentLevel: progress.currentLevel,
        xpForNextLevel: getXpForNextLevel(progress.currentLevel),
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