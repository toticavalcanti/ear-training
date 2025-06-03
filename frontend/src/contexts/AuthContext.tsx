// frontend/src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { User } from '@/types/types'; // Usando o tipo do seu repositório

// Interface para a resposta do backend (login, register)
interface AuthResponse {
  token: string;
  user: User;
}

// Tipo para a resposta de erro da API de login/registro
interface ApiErrorResponse {
  message: string;
  isGoogleUser?: boolean; // Específico para o erro de login
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null; // Para armazenar o JWT
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const processAuthSuccess = useCallback((jwtToken: string, userData: User) => {
    console.log('[AUTH_CONTEXT DEBUG] processAuthSuccess: Processando. JWT:', !!jwtToken, 'Usuário:', userData?.email);
    localStorage.setItem('jwtToken', jwtToken);
    setToken(jwtToken);
    setUser(userData);
    setIsLoading(false); // Para o loading APÓS a autenticação ser resolvida
  }, []);

  const clearAuthData = useCallback(() => {
    console.log('[AUTH_CONTEXT DEBUG] clearAuthData: Limpando dados de auth.');
    localStorage.removeItem('jwtToken');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    console.log('[AUTH_CONTEXT DEBUG] refreshUser: Iniciando.');
    const storedToken = localStorage.getItem('jwtToken');

    if (!storedToken) {
      console.log('[AUTH_CONTEXT DEBUG] refreshUser: Nenhum JWT no localStorage.');
      clearAuthData();
      return null;
    }
    
    if (!token && storedToken) {
        console.log('[AUTH_CONTEXT DEBUG] refreshUser: JWT no localStorage, atualizando estado do token.');
        setToken(storedToken);
    }

    console.log('[AUTH_CONTEXT DEBUG] refreshUser: Fetch /auth/me com token:', storedToken ? 'Presente' : 'Ausente');
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${storedToken}` },
      });
      console.log(`[AUTH_CONTEXT DEBUG] refreshUser: Resposta /auth/me - Status: ${response.status}`);
      if (response.ok) {
        const userData = await response.json() as User;
        setUser(userData); 
        console.log('[AUTH_CONTEXT DEBUG] refreshUser: Sucesso! Usuário:', userData?.email);
        return userData;
      } else {
        console.warn(`[AUTH_CONTEXT DEBUG] refreshUser: Falha. Status: ${response.status}. Limpando auth.`);
        clearAuthData();
        return null;
      }
    } catch (error) {
      let errMsg = 'Erro desconhecido';
      if (error instanceof Error) errMsg = error.message;
      else if (typeof error === 'string') errMsg = error;
      console.error('[AUTH_CONTEXT DEBUG] refreshUser: Exceção no fetch /auth/me:', errMsg);
      clearAuthData();
      return null;
    }
  }, [API_URL, clearAuthData, token]);

  // Efeito para verificação inicial na montagem
  useEffect(() => {
    const initialAuthCheck = async () => {
      console.log('[AUTH_CONTEXT DEBUG] useEffect[] (Montagem inicial): Verificação de auth.');
      setIsLoading(true);
      await refreshUser();
      setIsLoading(false);
    };
    initialAuthCheck();
  }, [refreshUser]); 

  // Efeito para logar o estado após a verificação inicial ou mudanças
  useEffect(() => {
    if (!isLoading) { 
        console.log('[AUTH_CONTEXT DEBUG] Estado após check/mudança: isLoading:', isLoading, 'User Email:', user?.email, 'isAuthenticated:', !!user);
    }
  }, [isLoading, user]); 

  // ✅ EFEITO PARA CAPTURAR TOKEN DE QUALQUER URL
  useEffect(() => {
    if (typeof window !== 'undefined') { 
      const jwtFromUrl = searchParams.get('token');
      const oauthError = searchParams.get('error');

      // ✅ CAPTURA TOKEN DE QUALQUER PÁGINA (especialmente /auth/success)
      if (jwtFromUrl) {
        console.log('[AUTH_CONTEXT DEBUG] Token detectado na URL:', pathname);
        
        // Limpa os parâmetros da URL IMEDIATAMENTE
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete('token');
        currentUrl.searchParams.delete('error');
        window.history.replaceState({}, '', currentUrl.toString());
        
        setIsLoading(true); // Indica que estamos processando este token
        localStorage.setItem('jwtToken', jwtFromUrl);
        setToken(jwtFromUrl); // Atualiza o estado do token IMEDIATAMENTE

        refreshUser().then(refreshedUser => {
          if (refreshedUser) {
            console.log('[AUTH_CONTEXT DEBUG] Google OAuth bem-sucedido! Redirecionando para home...');
            // ✅ REDIRECIONAR PARA HOME
            router.push('/');
          } else {
            console.error('[AUTH_CONTEXT DEBUG] Falha ao obter dados do usuário com token da URL.');
            clearAuthData(); 
            router.push('/auth/login?error=google_token_validation_failed');
          }
          setIsLoading(false);
        }).catch(() => {
            console.error('[AUTH_CONTEXT DEBUG] Erro em refreshUser pós-Google.');
            clearAuthData();
            setIsLoading(false);
            router.push('/auth/login?error=google_refresh_user_exception');
        });

      } else if (oauthError) { 
        // Trata erros redirecionados pelo backend
        console.error(`[AUTH_CONTEXT DEBUG] Erro de OAuth na URL (${pathname}): ${oauthError}`);
        
        // Limpa a URL
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete('error');
        window.history.replaceState({}, '', currentUrl.toString());
        
        // Redireciona para login com erro
        router.push(`/auth/login?error=${oauthError}`);
      }
    }
  }, [pathname, searchParams, router, clearAuthData, refreshUser]);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw data as ApiErrorResponse; 
      processAuthSuccess((data as AuthResponse).token, (data as AuthResponse).user);
    } catch (error) { 
      const err = error as ApiErrorResponse | Error;
      console.error('[AUTH_CONTEXT DEBUG] login: Falha.', err.message);
      clearAuthData(); 
      throw err; 
    } finally { 
      setIsLoading(false); 
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error((data as ApiErrorResponse).message || 'Erro no registro');
      processAuthSuccess((data as AuthResponse).token, (data as AuthResponse).user);
    } catch (error) { 
      console.error('[AUTH_CONTEXT DEBUG] register: Falha.', error);
      clearAuthData(); 
      throw error; 
    } finally { 
      setIsLoading(false); 
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true); 
    clearAuthData();
    setIsLoading(false);
    router.push('/auth/login');
  };

  const value: AuthContextType = {
    user, 
    isAuthenticated: !!user, 
    isLoading, 
    token,
    login, 
    register, 
    logout, 
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
}