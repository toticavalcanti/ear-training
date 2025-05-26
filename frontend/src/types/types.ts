// frontend/src/lib/types.ts
// Tipos principais da aplicação

// User
export interface User {
  id: string;
  name: string;
  email: string;
  subscription: 'free' | 'premium';
  avatar?: string;
  googleId?: string;
  createdAt: string;
  updatedAt: string;
  lastActive?: string;
}

// Exercise types
export type ExerciseType = 'intervals' | 'progressions' | 'melodic' | 'rhythmic';
export type DifficultyLevel = 'Iniciante' | 'Intermediário' | 'Avançado';

export interface ExerciseProgress {
  level: number;
  exercisesCompleted: number;
  accuracy: number;
  timeSpent: number;
  lastActivity?: string;
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Component Props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Form State
export interface FormState {
  isLoading: boolean;
  error?: string;
  success?: string;
}