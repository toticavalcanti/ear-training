// src/app/api/progress/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Progress, { IExerciseSession } from '@/models/Progress';
import User from '@/models/User';
import { getXpForNextLevel } from '@/lib/levelUtils';
import { getUserFromToken } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const userId = await getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    // Verificar se usuário existe
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Buscar progresso do usuário
    let progress = await Progress.findOne({ userId });
    
    // Se não existe progresso, criar um novo
    if (!progress) {
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
      });
      
      await progress.save();
      console.log('✅ Progresso inicial criado para usuário:', user.email);
    }

    // Calcular estatísticas adicionais
    const responseData = {
      // Progresso Geral
      totalXp: progress.totalXp,
      currentLevel: progress.currentLevel,
      xpForNextLevel: getXpForNextLevel(progress.currentLevel),
      totalPoints: progress.totalPoints,
      totalExercises: progress.totalExercises,
      totalCorrectAnswers: progress.totalCorrectAnswers,
      overallAccuracy: progress.overallAccuracy,
      
      // Streaks
      currentGlobalStreak: progress.currentGlobalStreak,
      bestGlobalStreak: progress.bestGlobalStreak,
      lastActiveDate: progress.lastActiveDate,
      
      // Estatísticas por Exercício
      exerciseStats: progress.exerciseStats,
      
      // Histórico Recente (últimas 10 sessões)
      recentSessions: progress.recentSessions
        .sort((a: IExerciseSession, b: IExerciseSession) => 
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        )
        .slice(0, 10),
      
      // Badges
      badges: progress.badges,
      
      // Timestamps
      createdAt: progress.createdAt,
      updatedAt: progress.updatedAt,
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('💥 Erro ao buscar progresso do usuário:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}