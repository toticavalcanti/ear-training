// src/models/UserAchievement.ts - CORREÇÃO DO WARNING
import mongoose, { Schema, Document } from 'mongoose';

export interface IUserAchievement extends Document {
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  isNew: boolean;
}

const UserAchievementSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  achievementId: { type: String, required: true },
  unlockedAt: { type: Date, default: Date.now },
  isNew: { type: Boolean, default: true }
}, { 
  timestamps: true,
  suppressReservedKeysWarning: true // 🔧 ADICIONA ESTA LINHA
});

// Garantir que cada achievement só seja desbloqueado uma vez por usuário
UserAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

export default mongoose.model<IUserAchievement>('UserAchievement', UserAchievementSchema);