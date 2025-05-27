//backend/src/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';
import bcryptjs from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string; // Opcional para Google users
  subscription: 'free' | 'premium';
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
  passwordHash: {
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
  lastActive: {
    type: Date,
    default: Date.now,
  },
  
  // ✅ CAMPO GOOGLE ID CORRIGIDO (sem duplicação)
  googleId: {
    type: String,
    unique: true,        // Cria índice automaticamente
    sparse: true,        // Permite null/undefined únicos
  },
  avatar: {
    type: String,
  },
}, {
  timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  suppressReservedKeysWarning: true, // Remove warning do mongoose
});

// ✅ ÍNDICES NECESSÁRIOS (sem duplicar o googleId que já é unique)
UserSchema.index({ lastActive: 1 }); // Para queries de usuários ativos
UserSchema.index({ subscription: 1 }); // Para filtrar por tipo de assinatura

// ✅ MÉTODO PARA COMPARAR SENHA
UserSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  if (!this.passwordHash) {
    return false; // Usuários do Google não têm senha
  }
  return await bcryptjs.compare(password, this.passwordHash);
};

// ✅ VALIDAÇÃO CUSTOMIZADA: deve ter senha OU googleId
UserSchema.pre('validate', function(next) {
  if (!this.passwordHash && !this.googleId) {
    this.invalidate('passwordHash', 'Usuário deve ter senha ou Google ID');
  }
  next();
});

// ✅ MIDDLEWARE PARA ATUALIZAR lastActive AUTOMATICAMENTE
UserSchema.pre('save', function(next) {
  this.lastActive = new Date();
  next();
});

export default mongoose.model<IUser>('User', UserSchema);