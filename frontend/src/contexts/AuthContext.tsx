// frontend/src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// 🔥 TIPOS LOCAIS (evita problemas de path)
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

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>; // ✅ TIPADO
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// 🔥 CONTEXTO
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🔥 PROVIDER
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // ✅ MÉTODO REFRESH USER - Agora com useCallback
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      setUser(null);
    }
  }, [API_URL]); // ✅ Dependência do API_URL

  // ✅ MÉTODO LOGIN
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro no login');
      }

      setUser(data.user);
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  // ✅ MÉTODO REGISTER (era isso que estava faltando!)
  const register = async (name: string, email: string, password: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro no registro');
      }

      setUser(data.user);
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  };

  // ✅ MÉTODO LOGOUT
  const logout = async (): Promise<void> => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setUser(null);
      router.push('/');
    }
  };

  // ✅ EFEITO INICIAL - Agora com refreshUser nas dependências
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      await refreshUser();
      setIsLoading(false);
    };

    checkAuth();
  }, [refreshUser]); // ✅ Agora inclui refreshUser nas dependências

  // ✅ EFEITO PARA GOOGLE OAUTH CALLBACK
  useEffect(() => {
    const handleGoogleCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const error = urlParams.get('error');

      if (token) {
        // Google login bem-sucedido
        refreshUser();
        // Limpar URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (error) {
        console.error('Erro no Google OAuth:', error);
        // Você pode mostrar uma mensagem de erro aqui
      }
    };

    handleGoogleCallback();
  }, [refreshUser]); // ✅ Inclui refreshUser aqui também

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register, // ✅ AGORA ESTÁ INCLUÍDO!
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ HOOK CUSTOMIZADO
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}