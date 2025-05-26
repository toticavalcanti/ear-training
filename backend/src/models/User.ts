//src/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';
import bcryptjs from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string; // Agora opcional para Google users
  subscription: 'free' | 'premium';
  lastActive: Date;
  
  // 🆕 CAMPOS GOOGLE OAUTH:
  googleId?: string;
  avatar?: string;
  
  // 🆕 TIMESTAMPS (adicionados pelo Mongoose)
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
  
  // 🆕 NOVOS CAMPOS GOOGLE OAUTH:
  googleId: {
    type: String,
    unique: true,        // ✅ MANTÉM: unique cria índice automaticamente
    sparse: true,        // ✅ MANTÉM: permite null/undefined únicos
  },
  avatar: {
    type: String,
  },
}, {
  timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  suppressReservedKeysWarning: true, // Remove warning do mongoose
});

// ❌ REMOVER ESTA LINHA (se existir em algum lugar):
// UserSchema.index({ googleId: 1 });

// Método para comparar senha
UserSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  if (!this.passwordHash) {
    return false; // Usuários do Google não têm senha
  }
  return await bcryptjs.compare(password, this.passwordHash);
};

// Validação customizada: deve ter senha OU googleId
UserSchema.pre('validate', function(next) {
  if (!this.passwordHash && !this.googleId) {
    this.invalidate('passwordHash', 'Usuário deve ter senha ou Google ID');
  }
  next();
});

export default mongoose.model<IUser>('User', UserSchema);