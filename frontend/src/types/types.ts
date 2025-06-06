// frontend/src/types/types.ts

// Tipos principais do usuário
export interface User {
  id: string;
  name?: string; // Name is optional
  email: string;
  subscription?: 'free' | 'premium'; // Marcar como opcional se nem todos os usuários tiverem
  subscriptionType?: 'free' | 'premium' | 'annual';
  subscriptionStatus?: 'active' | 'inactive' | 'canceled';
  avatar?: string; // Mudado de avatarUrl para avatar (consistência com backend)
  avatarUrl?: string; // Mantido para compatibilidade
  googleId?: string;
  level?: number;
  xp?: number;
  isGoogleUser?: boolean;
  lastActive?: string; // Como string ISO para JSON
  createdAt?: string; // Como string ISO para JSON
  updatedAt?: string; // Como string ISO para JSON
}

// Tipos para assinatura
export type SubscriptionType = 'free' | 'premium' | 'annual';
export type SubscriptionStatus = 'active' | 'inactive' | 'canceled';

// Corpo esperado no login (request body)
export interface LoginRequest {
  email: string;
  password: string;
}

// Corpo esperado no registro (request body)
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// Corpo esperado no Google OAuth (request body)
export interface GoogleAuthRequest {
  email: string;
  name: string;
  googleId: string;
  avatar?: string;
}

// Resposta de sucesso (ex.: login ou registro bem-sucedido)
export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// Resposta de erro genérica da API
export interface ErrorResponse {
  error: string;
  message?: string;
  code?: string;
  isGoogleUser?: boolean; // Para casos específicos de usuário Google
}

// Tipos para o contexto de autenticação
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
}

// Tipos para resposta da API de usuários
export interface UsersResponse {
  users: User[];
  total: number;
}

// Tipos para payload do JWT
export interface JwtPayload {
  id?: string;
  userId?: string;
  email?: string;
  name?: string;
  subscription?: string;
  level?: number;
  xp?: number;
  iat?: number;
  exp?: number;
}

// Tipos para middleware de autenticação
export interface AuthResult {
  userId: string;
  email?: string;
}

// Tipos para dados do Google OAuth
export interface GoogleUserData {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

// Tipos para resposta da API do Google
export interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}