// ===================================
// src/models/UserProgress.ts
// ===================================
import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProgress extends Document {
  userId: string;
  level: number;
  experience: number;
  totalExercises: number;
  perfectScores: number;
  averageScore: number;
  streakDays: number;
  lastActivityDate: Date;
  
  // Progresso por tipo
  intervals: {
    completed: number;
    averageScore: number;
    bestTime: number;
  };
  rhythmic: {
    completed: number;
    averageScore: number;
    bestTime: number;
  };
  melodic: {
    completed: number;
    averageScore: number;
    bestTime: number;
  };
  progression: {
    completed: number;
    averageScore: number;
    bestTime: number;
  };
  
  // Progresso por dificuldade
  beginner: { completed: number; averageScore: number; };
  intermediate: { completed: number; averageScore: number; };
  advanced: { completed: number; averageScore: number; };
}

const UserProgressSchema: Schema = new Schema({
  userId: { type: String, required: true, unique: true, index: true },
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  totalExercises: { type: Number, default: 0 },
  perfectScores: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  streakDays: { type: Number, default: 0 },
  lastActivityDate: { type: Date, default: Date.now },
  
  intervals: {
    completed: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    bestTime: { type: Number, default: 0 }
  },
  rhythmic: {
    completed: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    bestTime: { type: Number, default: 0 }
  },
  melodic: {
    completed: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    bestTime: { type: Number, default: 0 }
  },
  progression: {
    completed: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    bestTime: { type: Number, default: 0 }
  },
  
  beginner: {
    completed: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 }
  },
  intermediate: {
    completed: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 }
  },
  advanced: {
    completed: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 }
  }
}, { timestamps: true });

export default mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);