// src/app/api/progress/leaderboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Progress from '@/models/Progress';

interface PopulatedUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface ProgressLeanDoc {
  _id: string;
  totalXp: number;
  currentLevel: number;
  totalPoints: number;
  totalExercises: number;
  overallAccuracy: number;
  currentGlobalStreak: number;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: Date;
  }>;
  userId: PopulatedUser;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'xp'; // xp, points, accuracy
    const limit = parseInt(searchParams.get('limit') || '10');

    let sortField = {};
    
    switch (type) {
      case 'points':
        sortField = { totalPoints: -1 };
        break;
      case 'accuracy':
        sortField = { overallAccuracy: -1 };
        break;
      case 'level':
        sortField = { currentLevel: -1, totalXp: -1 };
        break;
      default: // xp
        sortField = { totalXp: -1 };
    }

    // Buscar top usuários com progresso
    const topProgress = await Progress.find({
      totalExercises: { $gt: 0 } // Apenas usuários que fizeram pelo menos 1 exercício
    })
    .sort(sortField)
    .limit(limit)
    .populate('userId', 'name email avatar')
    .lean<ProgressLeanDoc[]>();

    // Formatar resposta
    const leaderboard = topProgress.map((progress, index) => ({
      rank: index + 1,
      user: {
        name: progress.userId?.name || 'Usuário Anônimo',
        avatar: progress.userId?.avatar || null,
      },
      stats: {
        totalXp: progress.totalXp || 0,
        currentLevel: progress.currentLevel || 1,
        totalPoints: progress.totalPoints || 0,
        totalExercises: progress.totalExercises || 0,
        overallAccuracy: Math.round((progress.overallAccuracy || 0) * 10) / 10, // 1 casa decimal
        currentGlobalStreak: progress.currentGlobalStreak || 0,
        badges: progress.badges?.length || 0,
      },
    }));

    return NextResponse.json({
      type,
      leaderboard,
      total: leaderboard.length,
    });

  } catch (error) {
    console.error('💥 Erro ao buscar leaderboard:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}