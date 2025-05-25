// ===================================
// src/models/UserScore.ts
// ===================================
import mongoose, { Schema, Document } from 'mongoose';

export interface IUserScore extends Document {
  userId: string;
  exerciseId: string;
  exerciseType: 'interval' | 'rhythmic' | 'melodic' | 'progression';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  score: number; // 0-100
  accuracy: number; // % de acerto
  timeSpent: number; // milissegundos
  attempts: number;
  completedAt: Date;
  perfectScore: boolean; // 100% accuracy
  experienceGained: number; // XP ganho neste exercício
}

const UserScoreSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  exerciseId: { type: String, required: true },
  exerciseType: { 
    type: String, 
    required: true, 
    enum: ['interval', 'rhythmic', 'melodic', 'progression'] 
  },
  difficulty: { 
    type: String, 
    required: true, 
    enum: ['beginner', 'intermediate', 'advanced'] 
  },
  score: { type: Number, required: true, min: 0, max: 100 },
  accuracy: { type: Number, required: true, min: 0, max: 100 },
  timeSpent: { type: Number, required: true },
  attempts: { type: Number, required: true, min: 1 },
  completedAt: { type: Date, default: Date.now },
  perfectScore: { type: Boolean, default: false },
  experienceGained: { type: Number, default: 0 }
}, { timestamps: true });

// Índices compostos para performance
UserScoreSchema.index({ userId: 1, exerciseType: 1 });
UserScoreSchema.index({ userId: 1, completedAt: -1 });
UserScoreSchema.index({ userId: 1, perfectScore: 1 });

export default mongoose.model<IUserScore>('UserScore', UserScoreSchema);