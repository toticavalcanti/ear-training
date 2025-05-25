// ===================================
// src/services/gamificationService.ts
// Lógica completa para calcular scores, XP, níveis e achievements
// ===================================
import UserScore from '../models/UserScore';
import UserProgress from '../models/UserProgress';
import Achievement from '../models/Achievement';
import UserAchievement from '../models/UserAchievement';

export class GamificationService {
  
  // ===================================
  // CÁLCULOS DE SCORE E XP
  // ===================================
  
  /**
   * Calcular score baseado em accuracy, tempo e dificuldade
   * @param isCorrect - Se a resposta está correta
   * @param timeSpent - Tempo gasto em milissegundos
   * @param difficulty - Nível de dificuldade
   * @param maxTime - Tempo máximo em milissegundos (padrão: 30s)
   * @returns Score de 0 a 100
   */
  static calculateScore(
    isCorrect: boolean, 
    timeSpent: number, 
    difficulty: string,
    maxTime: number = 30000
  ): number {
    if (!isCorrect) return 0;
    
    // Score base por dificuldade
    const baseScore = {
      'beginner': 60,
      'intermediate': 70,
      'advanced': 80
    }[difficulty] || 60;
    
    // Bonus de tempo (mais rápido = mais pontos)
    const timeBonus = Math.max(0, (maxTime - timeSpent) / maxTime * 40);
    
    return Math.min(100, Math.round(baseScore + timeBonus));
  }
  
  /**
   * Calcular XP baseado no score, dificuldade e tipo de exercício
   * @param score - Score obtido (0-100)
   * @param difficulty - Nível de dificuldade
   * @param exerciseType - Tipo do exercício
   * @param isPerfect - Se foi score perfeito
   * @returns Quantidade de XP ganho
   */
  static calculateExperience(
    score: number, 
    difficulty: string, 
    exerciseType: string,
    isPerfect: boolean = false
  ): number {
    const baseXP = {
      'beginner': 10,
      'intermediate': 20,
      'advanced': 30
    }[difficulty] || 10;
    
    const typeMultiplier = {
      'interval': 1.0,
      'rhythmic': 1.1,
      'melodic': 1.2,
      'progression': 1.3
    }[exerciseType] || 1.0;
    
    let xp = Math.round(baseXP * (score / 100) * typeMultiplier);
    
    // Bonus por score perfeito
    if (isPerfect) xp = Math.round(xp * 1.5);
    
    return Math.max(0, xp);
  }
  
  /**
   * Calcular nível baseado na experiência total
   * @param experience - XP total do usuário
   * @returns Nível atual
   */
  static calculateLevel(experience: number): number {
    // Fórmula: nível = floor(sqrt(XP / 100)) + 1
    return Math.floor(Math.sqrt(experience / 100)) + 1;
  }
  
  /**
   * Calcular XP necessário para o próximo nível
   * @param currentLevel - Nível atual
   * @returns XP necessário para subir de nível
   */
  static calculateXPForNextLevel(currentLevel: number): number {
    return Math.pow(currentLevel, 2) * 100;
  }
  
  // ===================================
  // FUNÇÃO PRINCIPAL DE SUBMISSÃO
  // ===================================
  
  /**
   * Submeter exercício e atualizar todo o progresso do usuário
   * @param userId - ID do usuário
   * @param exerciseId - ID do exercício
   * @param exerciseType - Tipo do exercício
   * @param difficulty - Dificuldade
   * @param userAnswer - Resposta do usuário
   * @param correctAnswer - Resposta correta
   * @param timeSpent - Tempo gasto em milissegundos
   * @param attempts - Número de tentativas
   * @returns Resultado da submissão
   */
  static async submitExercise(
    userId: string,
    exerciseId: string,
    exerciseType: string,
    difficulty: string,
    userAnswer: any,
    correctAnswer: any,
    timeSpent: number,
    attempts: number = 1
  ) {
    console.log(`🎮 GAMIFICATION: Submetendo exercício para ${userId}`);
    console.log(`📝 Tipo: ${exerciseType}, Dificuldade: ${difficulty}, Tempo: ${timeSpent}ms`);
    
    // Verificar se a resposta está correta
    const isCorrect = this.checkAnswer(userAnswer, correctAnswer, exerciseType);
    const accuracy = isCorrect ? 100 : 0;
    const score = this.calculateScore(isCorrect, timeSpent, difficulty);
    const isPerfect = score === 100;
    const experienceGained = this.calculateExperience(score, difficulty, exerciseType, isPerfect);
    
    console.log(`📊 Resultado: ${isCorrect ? 'CORRETO' : 'INCORRETO'}, Score: ${score}/100, XP: ${experienceGained}`);
    
    // Salvar score no banco
    const userScore = new UserScore({
      userId,
      exerciseId,
      exerciseType,
      difficulty,
      score,
      accuracy,
      timeSpent,
      attempts,
      perfectScore: isPerfect,
      experienceGained
    });
    
    await userScore.save();
    console.log(`💾 Score salvo no banco de dados`);
    
    // Atualizar progresso do usuário
    const updatedProgress = await this.updateUserProgress(
      userId, 
      exerciseType, 
      difficulty, 
      score, 
      timeSpent, 
      isPerfect, 
      experienceGained
    );
    
    // Verificar achievements desbloqueados
    const newAchievements = await this.checkAchievements(userId);
    
    console.log(`🏆 ${newAchievements.length} novos achievements desbloqueados`);
    
    return {
      score,
      accuracy,
      experienceGained,
      isPerfect,
      newAchievements,
      levelUp: updatedProgress.levelUp,
      currentLevel: updatedProgress.currentLevel,
      totalExperience: updatedProgress.totalExperience
    };
  }
  
  // ===================================
  // VERIFICAÇÃO DE RESPOSTAS
  // ===================================
  
  /**
   * Verificar se a resposta do usuário está correta
   * @param userAnswer - Resposta do usuário
   * @param correctAnswer - Resposta correta
   * @param exerciseType - Tipo do exercício
   * @returns true se correto, false se incorreto
   */
  private static checkAnswer(userAnswer: any, correctAnswer: any, exerciseType: string): boolean {
    try {
      switch (exerciseType) {
        case 'interval':
          // Para intervalos, comparar strings (ex: "P5", "M3")
          return String(userAnswer).toLowerCase().trim() === String(correctAnswer).toLowerCase().trim();
          
        case 'rhythmic':
          // Para ritmos, comparar strings ou arrays
          if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
            return JSON.stringify(userAnswer.sort()) === JSON.stringify(correctAnswer.sort());
          }
          return String(userAnswer).toLowerCase().trim() === String(correctAnswer).toLowerCase().trim();
          
        case 'melodic':
          // Para melodias, comparar arrays de notas
          if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
            return JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
          }
          return String(userAnswer) === String(correctAnswer);
          
        case 'progression':
          // Para progressões, comparar arrays de acordes
          if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
            return JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
          }
          return String(userAnswer) === String(correctAnswer);
          
        default:
          console.warn(`⚠️ Tipo de exercício desconhecido: ${exerciseType}`);
          return false;
      }
    } catch (error) {
      console.error(`❌ Erro ao verificar resposta:`, error);
      return false;
    }
  }
  
  // ===================================
  // ATUALIZAÇÃO DE PROGRESSO
  // ===================================
  
  /**
   * Atualizar o progresso completo do usuário
   * @param userId - ID do usuário
   * @param exerciseType - Tipo do exercício
   * @param difficulty - Dificuldade
   * @param score - Score obtido
   * @param timeSpent - Tempo gasto
   * @param isPerfect - Se foi score perfeito
   * @param experienceGained - XP ganho
   * @returns Informações sobre o progresso atualizado
   */
  private static async updateUserProgress(
    userId: string,
    exerciseType: string,
    difficulty: string,
    score: number,
    timeSpent: number,
    isPerfect: boolean,
    experienceGained: number
  ) {
    let userProgress = await UserProgress.findOne({ userId });
    
    // Criar progresso inicial se não existir
    if (!userProgress) {
      userProgress = new UserProgress({ userId });
      console.log(`👤 Criando progresso inicial para usuário ${userId}`);
    }
    
    const oldLevel = userProgress.level;
    const oldExperience = userProgress.experience;
    
    // Atualizar estatísticas gerais
    userProgress.totalExercises += 1;
    if (isPerfect) userProgress.perfectScores += 1;
    
    // Recalcular média geral
    const totalExercises = userProgress.totalExercises;
    userProgress.averageScore = (userProgress.averageScore * (totalExercises - 1) + score) / totalExercises;
    
    // Atualizar progresso por tipo de exercício
    const typeKey = exerciseType as keyof typeof userProgress;
    if (userProgress[typeKey] && typeof userProgress[typeKey] === 'object') {
      const typeStats = userProgress[typeKey] as any;
      typeStats.completed += 1;
      typeStats.averageScore = (typeStats.averageScore * (typeStats.completed - 1) + score) / typeStats.completed;
      
      // Atualizar melhor tempo (apenas se for melhor)
      if (typeStats.bestTime === 0 || timeSpent < typeStats.bestTime) {
        typeStats.bestTime = timeSpent;
      }
    }
    
    // Atualizar progresso por dificuldade
    const difficultyKey = difficulty as keyof typeof userProgress;
    if (userProgress[difficultyKey] && typeof userProgress[difficultyKey] === 'object') {
      const difficultyStats = userProgress[difficultyKey] as any;
      difficultyStats.completed += 1;
      difficultyStats.averageScore = (difficultyStats.averageScore * (difficultyStats.completed - 1) + score) / difficultyStats.completed;
    }
    
    // Atualizar XP e nível
    userProgress.experience += experienceGained;
    userProgress.level = this.calculateLevel(userProgress.experience);
    
    // Verificar se subiu de nível
    const levelUp = userProgress.level > oldLevel;
    if (levelUp) {
      console.log(`🎉 LEVEL UP! ${oldLevel} → ${userProgress.level} (${oldExperience} → ${userProgress.experience} XP)`);
    }
    
    // Atualizar streak de dias consecutivos
    await this.updateStreak(userProgress);
    
    // Salvar progresso atualizado
    await userProgress.save();
    console.log(`📈 Progresso atualizado: Nível ${userProgress.level}, XP ${userProgress.experience}, Média ${userProgress.averageScore.toFixed(1)}%`);
    
    return {
      levelUp,
      currentLevel: userProgress.level,
      totalExperience: userProgress.experience,
      averageScore: userProgress.averageScore
    };
  }
  
  /**
   * Atualizar streak de dias consecutivos
   * @param userProgress - Objeto de progresso do usuário
   */
  private static async updateStreak(userProgress: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetar horas para comparação apenas de data
    
    const lastActivity = new Date(userProgress.lastActivityDate);
    lastActivity.setHours(0, 0, 0, 0);
    
    const daysDifference = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDifference === 0) {
      // Mesmo dia, manter streak
      console.log(`🔥 Streak mantido: ${userProgress.streakDays} dias`);
    } else if (daysDifference === 1) {
      // Dia consecutivo, incrementar streak
      userProgress.streakDays += 1;
      console.log(`🔥 Streak incrementado: ${userProgress.streakDays} dias`);
    } else {
      // Quebrou o streak
      const oldStreak = userProgress.streakDays;
      userProgress.streakDays = 1;
      console.log(`💔 Streak quebrado: ${oldStreak} → 1 dia`);
    }
    
    userProgress.lastActivityDate = new Date();
  }
  
  // ===================================
  // SISTEMA DE ACHIEVEMENTS
  // ===================================
  
  /**
   * Verificar e desbloquear achievements para o usuário
   * @param userId - ID do usuário
   * @returns Array de novos achievements desbloqueados
   */
  private static async checkAchievements(userId: string): Promise<any[]> {
    try {
      const userProgress = await UserProgress.findOne({ userId });
      if (!userProgress) {
        console.log(`⚠️ Progresso não encontrado para usuário ${userId}`);
        return [];
      }
      
      // Buscar todos os achievements ativos
      const achievements = await Achievement.find({ isActive: true });
      
      // Buscar achievements já desbloqueados pelo usuário
      const userAchievements = await UserAchievement.find({ userId }).select('achievementId');
      const unlockedIds = userAchievements.map(ua => ua.achievementId);
      
      const newAchievements: any[] = [];
      
      // Verificar cada achievement
      for (const achievement of achievements) {
        // Pular se já desbloqueado
        if (unlockedIds.includes(achievement.id)) continue;
        
        // Verificar se a condição foi atendida
        if (this.checkAchievementCondition(achievement, userProgress)) {
          try {
            // Desbloquear achievement
            await new UserAchievement({
              userId,
              achievementId: achievement.id
            }).save();
            
            newAchievements.push(achievement);
            console.log(`🏆 Achievement desbloqueado: ${achievement.name} (${achievement.points} XP)`);
          } catch (error) {
            console.error(`❌ Erro ao salvar achievement ${achievement.id}:`, error);
          }
        }
      }
      
      return newAchievements;
    } catch (error) {
      console.error(`❌ Erro ao verificar achievements:`, error);
      return [];
    }
  }
  
  /**
   * Verificar se uma condição específica de achievement foi atendida
   * @param achievement - O achievement a ser verificado
   * @param userProgress - Progresso do usuário
   * @returns true se a condição foi atendida
   */
  private static checkAchievementCondition(achievement: any, userProgress: any): boolean {
    const condition = achievement.condition;
    const threshold = achievement.threshold;
    
    try {
      switch (condition) {
        case 'total_exercises':
          return userProgress.totalExercises >= threshold;
          
        case 'perfect_scores':
          return userProgress.perfectScores >= threshold;
          
        case 'reach_level':
          return userProgress.level >= threshold;
          
        case 'intervals_completed':
          return userProgress.intervals.completed >= threshold;
          
        case 'rhythmic_completed':
          return userProgress.rhythmic.completed >= threshold;
          
        case 'melodic_completed':
          return userProgress.melodic.completed >= threshold;
          
        case 'progression_completed':
          return userProgress.progression.completed >= threshold;
          
        case 'streak_days':
          return userProgress.streakDays >= threshold;
          
        case 'average_score':
          return userProgress.averageScore >= threshold;
          
        case 'experience_points':
          return userProgress.experience >= threshold;
          
        // Condições especiais que requerem verificação de UserScore
        case 'fast_completion':
          return this.checkFastCompletion(userProgress.userId, threshold);
          
        case 'early_completion':
        case 'late_completion':
          return this.checkTimeBasedCompletion(userProgress.userId, condition);
          
        default:
          console.warn(`⚠️ Condição de achievement desconhecida: ${condition}`);
          return false;
      }
    } catch (error) {
      console.error(`❌ Erro ao verificar condição ${condition}:`, error);
      return false;
    }
  }
  
  /**
   * Verificar se o usuário completou algum exercício rapidamente
   * @param userId - ID do usuário
   * @param thresholdMs - Tempo limite em milissegundos
   * @returns true se completou exercício no tempo limite
   */
  private static async checkFastCompletion(userId: string, thresholdMs: number): Promise<boolean> {
    try {
      const fastCompletion = await UserScore.findOne({
        userId,
        timeSpent: { $lt: thresholdMs },
        perfectScore: true // Apenas scores perfeitos contam para velocidade
      });
      return !!fastCompletion;
    } catch (error) {
      console.error(`❌ Erro ao verificar fast completion:`, error);
      return false;
    }
  }
  
  /**
   * Verificar achievements baseados em horário
   * @param userId - ID do usuário
   * @param condition - 'early_completion' ou 'late_completion'
   * @returns true se a condição foi atendida
   */
  private static async checkTimeBasedCompletion(userId: string, condition: string): Promise<boolean> {
    try {
      const query: any = { userId };
      
      if (condition === 'early_completion') {
        // Antes das 6h da manhã
        query.completedAt = {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(6, 0, 0, 0))
        };
      } else if (condition === 'late_completion') {
        // Depois das 23h
        query.completedAt = {
          $gte: new Date(new Date().setHours(23, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        };
      }
      
      const timeBasedCompletion = await UserScore.findOne(query);
      return !!timeBasedCompletion;
    } catch (error) {
      console.error(`❌ Erro ao verificar time-based completion:`, error);
      return false;
    }
  }
  
  // ===================================
  // MÉTODOS PÚBLICOS DE CONSULTA
  // ===================================
  
  /**
   * Obter ranking/leaderboard de usuários
   * @param limit - Número máximo de usuários
   * @param period - Período do ranking
   * @returns Lista de usuários ranqueados
   */
  static async getLeaderboard(limit: number = 10, period: 'week' | 'month' | 'all' = 'all') {
    try {
      const query: any = {};
      
      if (period !== 'all') {
        const now = new Date();
        const startDate = new Date();
        
        if (period === 'week') {
          startDate.setDate(now.getDate() - 7);
        } else if (period === 'month') {
          startDate.setMonth(now.getMonth() - 1);
        }
        
        query.updatedAt = { $gte: startDate };
      }
      
      const leaderboard = await UserProgress.find(query)
        .sort({ experience: -1, level: -1, averageScore: -1 })
        .limit(limit)
        .select('userId level experience averageScore totalExercises perfectScores streakDays');
      
      console.log(`🏅 Leaderboard gerado: ${leaderboard.length} usuários (período: ${period})`);
      return leaderboard;
    } catch (error) {
      console.error(`❌ Erro ao gerar leaderboard:`, error);
      return [];
    }
  }
  
  /**
   * Obter progresso detalhado do usuário
   * @param userId - ID do usuário
   * @returns Progresso do usuário ou null
   */
  static async getUserProgress(userId: string) {
    try {
      let progress = await UserProgress.findOne({ userId });
      
      if (!progress) {
        // Criar progresso inicial se não existir
        progress = new UserProgress({ userId });
        await progress.save();
        console.log(`👤 Progresso inicial criado para usuário ${userId}`);
      }
      
      return progress;
    } catch (error) {
      console.error(`❌ Erro ao buscar progresso do usuário ${userId}:`, error);
      return null;
    }
  }
  
  /**
   * Obter achievements do usuário
   * @param userId - ID do usuário
   * @returns Achievements desbloqueados e bloqueados
   */
  static async getUserAchievements(userId: string) {
    try {
      // Buscar achievements desbloqueados pelo usuário
      const userAchievements = await UserAchievement.find({ userId })
        .populate('achievementId')
        .sort({ unlockedAt: -1 });
      
      // Buscar todos os achievements disponíveis
      const allAchievements = await Achievement.find({ isActive: true });
      
      // Filtrar achievements ainda bloqueados
      const unlockedIds = userAchievements.map(ua => ua.achievementId);
      const locked = allAchievements.filter(achievement => 
        !unlockedIds.includes(achievement.id)
      );
      
      console.log(`🏆 Achievements do usuário ${userId}: ${userAchievements.length}/${allAchievements.length}`);
      
      return {
        unlocked: userAchievements,
        locked: locked,
        total: allAchievements.length,
        unlockedCount: userAchievements.length
      };
    } catch (error) {
      console.error(`❌ Erro ao buscar achievements do usuário ${userId}:`, error);
      return {
        unlocked: [],
        locked: [],
        total: 0,
        unlockedCount: 0
      };
    }
  }
  
  /**
   * Obter estatísticas gerais da plataforma
   * @returns Estatísticas gerais
   */
  static async getPlatformStats() {
    try {
      const [
        totalUsers,
        totalExercises,
        averageScoreResult,
        topPerformer
      ] = await Promise.all([
        UserProgress.countDocuments(),
        UserScore.countDocuments(),
        UserScore.aggregate([
          { $group: { _id: null, avgScore: { $avg: '$score' } } }
        ]),
        UserProgress.findOne().sort({ experience: -1 }).select('userId level experience')
      ]);
      
      const platformStats = {
        totalUsers,
        totalExercises,
        averageScore: averageScoreResult[0]?.avgScore || 0,
        topPerformer: topPerformer || null
      };
      
      console.log(`📊 Estatísticas da plataforma:`, platformStats);
      return platformStats;
    } catch (error) {
      console.error(`❌ Erro ao buscar estatísticas da plataforma:`, error);
      return {
        totalUsers: 0,
        totalExercises: 0,
        averageScore: 0,
        topPerformer: null
      };
    }
  }
}