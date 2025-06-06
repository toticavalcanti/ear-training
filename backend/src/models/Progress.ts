// src/models/Progress.ts
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IExerciseSession {
  exerciseType: 'melodic-intervals' | 'harmonic-intervals' | 'chord-progressions' | 'rhythmic-patterns';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // em segundos
  averageResponseTime: number; // em segundos
  pointsEarned: number;
  xpEarned: number;
  completedAt: Date;
}

export interface IExerciseStats {
  exerciseType: 'melodic-intervals' | 'harmonic-intervals' | 'chord-progressions' | 'rhythmic-patterns';
  totalSessions: number;
  totalQuestions: number;
  totalCorrect: number;
  bestAccuracy: number; // percentual
  averageAccuracy: number; // percentual
  totalTimeSpent: number; // em segundos
  totalPointsEarned: number;
  totalXpEarned: number;
  currentStreak: number;
  bestStreak: number;
  lastPlayed: Date;
}

export interface IBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

export interface IProgress extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  
  // Progresso Geral
  totalXp: number;
  currentLevel: number;
  totalPoints: number;
  totalExercises: number;
  totalCorrectAnswers: number;
  overallAccuracy: number;
  
  // Streak Global
  currentGlobalStreak: number;
  bestGlobalStreak: number;
  lastActiveDate: Date;
  
  // Estatísticas por Exercício
  exerciseStats: IExerciseStats[];
  
  // Histórico de Sessões (últimas 50)
  recentSessions: IExerciseSession[];
  
  // Conquistas/Badges
  badges: IBadge[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSessionSchema = new Schema<IExerciseSession>({
  exerciseType: {
    type: String,
    enum: ['melodic-intervals', 'harmonic-intervals', 'chord-progressions', 'rhythmic-patterns'],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 1,
  },
  correctAnswers: {
    type: Number,
    required: true,
    min: 0,
  },
  timeSpent: {
    type: Number,
    required: true,
    min: 0,
  },
  averageResponseTime: {
    type: Number,
    required: true,
    min: 0,
  },
  pointsEarned: {
    type: Number,
    required: true,
    min: 0,
  },
  xpEarned: {
    type: Number,
    required: true,
    min: 0,
  },
  completedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const ExerciseStatsSchema = new Schema<IExerciseStats>({
  exerciseType: {
    type: String,
    enum: ['melodic-intervals', 'harmonic-intervals', 'chord-progressions', 'rhythmic-patterns'],
    required: true,
  },
  totalSessions: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalQuestions: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalCorrect: {
    type: Number,
    default: 0,
    min: 0,
  },
  bestAccuracy: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  averageAccuracy: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  totalTimeSpent: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalPointsEarned: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalXpEarned: {
    type: Number,
    default: 0,
    min: 0,
  },
  currentStreak: {
    type: Number,
    default: 0,
    min: 0,
  },
  bestStreak: {
    type: Number,
    default: 0,
    min: 0,
  },
  lastPlayed: {
    type: Date,
    default: Date.now,
  },
});

const BadgeSchema = new Schema<IBadge>({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  unlockedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const ProgressSchema = new Schema<IProgress>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // ✅ Índice único automático (não duplicar)
  },
  
  // Progresso Geral
  totalXp: {
    type: Number,
    default: 0,
    min: 0,
    index: true, // ✅ Para ordenação do leaderboard
  },
  currentLevel: {
    type: Number,
    default: 1,
    min: 1,
    index: true, // ✅ Para ordenação do leaderboard
  },
  totalPoints: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalExercises: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalCorrectAnswers: {
    type: Number,
    default: 0,
    min: 0,
  },
  overallAccuracy: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  
  // Streak Global
  currentGlobalStreak: {
    type: Number,
    default: 0,
    min: 0,
  },
  bestGlobalStreak: {
    type: Number,
    default: 0,
    min: 0,
  },
  lastActiveDate: {
    type: Date,
    default: Date.now,
  },
  
  // Estatísticas por Exercício
  exerciseStats: [ExerciseStatsSchema],
  
  // Histórico de Sessões (últimas 50)
  recentSessions: {
    type: [ExerciseSessionSchema],
    validate: {
      validator: function(sessions: IExerciseSession[]) {
        return sessions.length <= 50;
      },
      message: 'Máximo de 50 sessões no histórico',
    },
  },
  
  // Conquistas/Badges
  badges: [BadgeSchema],
  
}, {
  timestamps: true,
});

// ❌ REMOVIDO: Índices duplicados
// ProgressSchema.index({ userId: 1 }); // JÁ tem unique: true
// ProgressSchema.index({ totalXp: -1 }); // JÁ tem index: true
// ProgressSchema.index({ currentLevel: -1 }); // JÁ tem index: true

// ✅ Índices específicos que NÃO são duplicados
ProgressSchema.index({ 'recentSessions.completedAt': -1 }); // Para histórico ordenado

// Middleware para atualizar nível automaticamente
ProgressSchema.pre('save', function(next) {
  // Cálculo simples de nível baseado em XP
  // Fórmula: nível = 1 + floor(sqrt(totalXp / 100))
  const newLevel = Math.max(1, Math.floor(Math.sqrt(this.totalXp / 100)) + 1);
  
  if (newLevel !== this.currentLevel) {
    this.currentLevel = newLevel;
  }
  next();
});

export default mongoose.models.Progress || mongoose.model<IProgress>('Progress', ProgressSchema);