// src/types/auth.ts

// Tipos para o plano de assinatura do usuário
export type SubscriptionType = 'free' | 'premium' | 'annual';

// Tipos para o status da assinatura do usuário
export type SubscriptionStatus = 'active' | 'inactive' | 'canceled';

// Dados básicos do usuário autenticado (payload do JWT, por exemplo)
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  level: number;
  xp: number;
  subscription: 'free' | 'premium';
  subscriptionType: SubscriptionType;
  subscriptionStatus: SubscriptionStatus;
  avatar?: string;
  isGoogleUser?: boolean;
  lastActive?: string;
  createdAt?: string;   // Opcional, caso queira retornar data de criação
  updatedAt?: string;   // Opcional, caso queira retornar data de atualização
}

// Alias para compatibilidade
export type User = AuthUser;

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
// - message: texto de confirmação
// - token: token JWT retornado
// - user: objeto com dados do usuário (tipo AuthUser)
export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

// Resposta de erro genérica da API
// - error: mensagem de erro
// - code?: código de erro opcional (ex.: 'MISSING_FIELDS', 'INVALID_CREDENTIALS', etc.)
export interface ErrorResponse {
  error: string;
  message?: string;
  code?: string;
  isGoogleUser?: boolean; // Para casos específicos de usuário Google
}

// Tipos para o contexto de autenticação
export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<AuthUser | null>;
}

// Tipos para resposta da API de usuários
export interface UsersResponse {
  users: AuthUser[];
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