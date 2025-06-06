// src/models/User.ts
import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string; // Unificado: será usado tanto para passwordHash quanto password
  subscription: 'free' | 'premium';
  subscriptionType?: 'free' | 'premium' | 'annual'; // Compatibilidade com Express
  subscriptionStatus?: 'active' | 'inactive' | 'canceled'; // Compatibilidade com Express
  level: number;
  xp: number;
  lastActive: Date;
  
  // Campos Google OAuth:
  googleId?: string;
  avatar?: string;
  
  // Timestamps (adicionados pelo Mongoose)
  createdAt: Date;
  updatedAt: Date;
  
  comparePassword: (password: string) => Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
  },
  password: {
    type: String,
    // Senha obrigatória apenas para usuários que não são do Google
    required: function(this: IUser) {
      return !this.googleId; // Se não tem googleId, senha é obrigatória
    },
  },
  subscription: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free',
  },
  // Campos de compatibilidade com Express
  subscriptionType: {
    type: String,
    enum: ['free', 'premium', 'annual'] as const,
    default: 'free',
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'canceled'] as const,
    default: 'inactive',
  },
  level: {
    type: Number,
    default: 1,
  },
  xp: {
    type: Number,
    default: 0,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  avatar: {
    type: String,
  },
}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
});

// Índices necessários
UserSchema.index({ lastActive: 1 });
UserSchema.index({ subscription: 1 });

// Método para comparar senha
UserSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  if (!this.password) {
    return false; // Usuários do Google não têm senha
  }
  return await bcrypt.compare(password, this.password);
};

// Validação customizada: deve ter senha OU googleId
UserSchema.pre('validate', function(next) {
  if (!this.password && !this.googleId) {
    this.invalidate('password', 'Usuário deve ter senha ou Google ID');
  }
  next();
});

// Middleware para sincronizar campos de compatibilidade
UserSchema.pre('save', function(next) {
  // Sincronizar subscription com subscriptionType
  if (this.subscription && !this.subscriptionType) {
    this.subscriptionType = this.subscription as 'free' | 'premium';
  }
  
  // Atualizar lastActive automaticamente
  this.lastActive = new Date();
  next();
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);