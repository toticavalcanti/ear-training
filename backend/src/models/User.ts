//src\models\User.ts
import mongoose, { Document, Schema } from 'mongoose';
import bcryptjs from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  subscription: 'free' | 'premium';
  lastActive: Date;
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
    required: [true, 'Senha é obrigatória'],
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
}, {
  timestamps: true,
});

// Método para comparar senha
UserSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  return await bcryptjs.compare(password, this.passwordHash);
};

export default mongoose.model<IUser>('User', UserSchema);