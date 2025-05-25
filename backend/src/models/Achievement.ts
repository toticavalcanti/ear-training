// ===================================
// src/models/Achievement.ts - VERSÃO CORRIGIDA
// ===================================
import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'progress' | 'mastery' | 'speed' | 'streak' | 'special';
  condition: string; // Ex: "complete_10_intervals", "perfect_score_5_times"
  threshold: number; // Valor necessário para desbloquear
  points: number; // XP ganho
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isActive: boolean;
  
  // Timestamps automáticos do Mongoose
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['progress', 'mastery', 'speed', 'streak', 'special'] 
  },
  condition: { type: String, required: true },
  threshold: { type: Number, required: true },
  points: { type: Number, required: true },
  rarity: { 
    type: String, 
    required: true, 
    enum: ['common', 'rare', 'epic', 'legendary'] 
  },
  isActive: { type: Boolean, default: true }
}, { 
  timestamps: true // Isso adiciona createdAt e updatedAt automaticamente
});

export default mongoose.model<IAchievement>('Achievement', AchievementSchema);