// src/lib/progressService.ts
import { getLevelProgress } from './levelUtils';

export interface SessionResult {
  exerciseType: 'melodic-intervals' | 'harmonic-intervals' | 'chord-progressions' | 'rhythmic-patterns';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // em segundos
  averageResponseTime: number; // em segundos
}

export interface UserProgress {
  totalXp: number;
  currentLevel: number;
  xpForNextLevel: number;
  totalPoints: number;
  totalExercises: number;
  totalCorrectAnswers: number;
  overallAccuracy: number;
  currentGlobalStreak: number;
  bestGlobalStreak: number;
  lastActiveDate: string;
  exerciseStats: Array<{
    exerciseType: string;
    totalSessions: number;
    totalQuestions: number;
    totalCorrect: number;
    bestAccuracy: number;
    averageAccuracy: number;
    totalTimeSpent: number;
    totalPointsEarned: number;
    totalXpEarned: number;
    currentStreak: number;
    bestStreak: number;
    lastPlayed: string;
  }>;
  recentSessions: Array<{
    exerciseType: string;
    difficulty: string;
    totalQuestions: number;
    correctAnswers: number;
    timeSpent: number;
    averageResponseTime: number;
    pointsEarned: number;
    xpEarned: number;
    completedAt: string;
  }>;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProgressResponse {
  sessionResults: {
    pointsEarned: number;
    xpEarned: number;
    accuracy: number;
    levelUp: boolean;
    newLevel: number;
    newBadges: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      unlockedAt: string;
    }>;
  };
  updatedProgress: {
    totalXp: number;
    currentLevel: number;
    totalPoints: number;
    currentGlobalStreak: number;
    overallAccuracy: number;
  };
}

export interface LeaderboardEntry {
  rank: number;
  user: {
    name: string;
    avatar: string | null;
  };
  stats: {
    totalXp: number;
    currentLevel: number;
    totalPoints: number;
    totalExercises: number;
    overallAccuracy: number;
    currentGlobalStreak: number;
    badges: number;
  };
}

class ProgressService {
  
  private getApiUrl(): string {
    // Igual ao AuthContext: hardcoded para localhost:5000/api
    return 'http://localhost:5000/api';
  }

  private getToken(): string | null {
    // Igual ao AuthContext: pegar do localStorage.jwtToken
    return localStorage.getItem('jwtToken');
  }

  /**
   * Busca o progresso completo do usuário logado
   */
  async getUserProgress(): Promise<UserProgress> {
    try {
      console.log('📊 Buscando progresso do usuário...');
      
      const token = this.getToken();
      if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
      }
      
      const response = await fetch(`${this.getApiUrl()}/progress/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro getUserProgress:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Progresso recebido:', data);
      return data;

    } catch (error) {
      console.error('💥 Erro ao buscar progresso:', error);
      throw error;
    }
  }

  /**
   * Atualiza o progresso após completar uma sessão de exercício
   */
  async updateProgress(sessionData: SessionResult): Promise<UpdateProgressResponse> {
    try {
      console.log('📈 Atualizando progresso...', sessionData);
      
      const token = this.getToken();
      if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
      }
      
      const response = await fetch(`${this.getApiUrl()}/progress/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      console.log('📈 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro updateProgress:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Progresso atualizado:', data);
      return data;

    } catch (error) {
      console.error('💥 Erro ao atualizar progresso:', error);
      throw error;
    }
  }

  /**
   * Busca o leaderboard/ranking
   */
  async getLeaderboard(
    type: 'xp' | 'points' | 'accuracy' | 'level' = 'xp',
    limit: number = 10
  ): Promise<{ type: string; leaderboard: LeaderboardEntry[]; total: number }> {
    try {
      console.log(`🏆 Buscando leaderboard (${type}, ${limit})...`);
      
      const token = this.getToken();
      if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
      }
      
      const response = await fetch(`${this.getApiUrl()}/progress/leaderboard?type=${type}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('🏆 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro getLeaderboard:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Leaderboard recebido:', data);
      return data;

    } catch (error) {
      console.error('💥 Erro ao buscar leaderboard:', error);
      throw error;
    }
  }

  /**
   * Utilitário para calcular porcentagem de progresso para o próximo nível
   */
  calculateLevelProgress(currentXp: number, currentLevel: number): number {
    try {
      return getLevelProgress(currentXp, currentLevel);
    } catch {
      // Fallback se getLevelProgress não existir
      return 0;
    }
  }

  /**
   * Utilitário para formatar tempo em formato legível
   */
  formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.round(seconds % 60);
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  }

  /**
   * Utilitário para obter a cor do nível
   */
  getLevelColor(level: number): string {
    if (level <= 2) return 'text-gray-600';
    if (level <= 5) return 'text-green-600';
    if (level <= 10) return 'text-blue-600';
    if (level <= 20) return 'text-purple-600';
    if (level <= 50) return 'text-orange-600';
    return 'text-red-600';
  }

  /**
   * Utilitário para obter o ícone do nível
   */
  getLevelIcon(level: number): string {
    if (level <= 2) return '🌱';
    if (level <= 5) return '🌿';
    if (level <= 10) return '🌳';
    if (level <= 20) return '⭐';
    if (level <= 50) return '🏆';
    return '👑';
  }
}

// Instância singleton
export const progressService = new ProgressService();

// Export default também para compatibilidade
export default progressService;