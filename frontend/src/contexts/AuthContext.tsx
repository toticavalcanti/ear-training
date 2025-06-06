// frontend/src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { User, AuthResponse, ErrorResponse, AuthContextType } from '@/types/types';

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

  // Backend na porta 5000
  const API_URL = 'http://localhost:5000/api';

  const processAuthSuccess = useCallback((jwtToken: string, userData: User) => {
    console.log('[AUTH_CONTEXT DEBUG] processAuthSuccess: Processando. JWT:', !!jwtToken, 'Usuário:', userData?.email);
    localStorage.setItem('jwtToken', jwtToken);
    setToken(jwtToken);
    setUser(userData);
    setIsLoading(false);
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

    const fullUrl = `${API_URL}/users/me`;
    console.log('[AUTH_CONTEXT DEBUG] API_URL:', API_URL);
    console.log('[AUTH_CONTEXT DEBUG] URL completa:', fullUrl);
    
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${storedToken}` },
      });
      
      console.log(`[AUTH_CONTEXT DEBUG] refreshUser: Resposta - Status: ${response.status}`);
      
      if (response.ok) {
        const userData = await response.json() as User;
        setUser(userData); 
        console.log('[AUTH_CONTEXT DEBUG] refreshUser: Sucesso! Usuário:', userData?.email);
        return userData;
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        console.warn(`[AUTH_CONTEXT DEBUG] refreshUser: Falha. Status: ${response.status}, Erro:`, errorData);
        clearAuthData();
        return null;
      }
    } catch (error) {
      let errMsg = 'Erro desconhecido';
      if (error instanceof Error) errMsg = error.message;
      else if (typeof error === 'string') errMsg = error;
      console.error(`[AUTH_CONTEXT DEBUG] refreshUser: Exceção no fetch ${fullUrl}:`, errMsg);
      clearAuthData();
      return null;
    }
  }, [clearAuthData, token, API_URL]);

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

  // EFEITO PARA CAPTURAR TOKEN DE QUALQUER URL (EXCETO RESET DE SENHA)
  useEffect(() => {
    if (typeof window !== 'undefined') { 
      const jwtFromUrl = searchParams.get('token');
      const oauthError = searchParams.get('error');

      // ✅ IGNORAR TOKEN SE ESTIVER NA PÁGINA DE RESET DE SENHA
      if (pathname === '/auth/reset-password') {
        console.log('[AUTH_CONTEXT DEBUG] Ignorando token na página de reset de senha');
        return;
      }

      // CAPTURA TOKEN DE QUALQUER PÁGINA (especialmente /auth/success)
      if (jwtFromUrl) {
        console.log('[AUTH_CONTEXT DEBUG] Token detectado na URL:', pathname);
        
        // Limpa os parâmetros da URL IMEDIATAMENTE
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete('token');
        currentUrl.searchParams.delete('error');
        window.history.replaceState({}, '', currentUrl.toString());
        
        setIsLoading(true);
        localStorage.setItem('jwtToken', jwtFromUrl);
        setToken(jwtFromUrl);

        refreshUser().then(refreshedUser => {
          if (refreshedUser) {
            console.log('[AUTH_CONTEXT DEBUG] Google OAuth bem-sucedido! Redirecionando para home...');
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
      console.log('[AUTH_CONTEXT DEBUG] login: Tentando login para:', email);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      console.log('[AUTH_CONTEXT DEBUG] login: Resposta recebida, status:', response.status);
      
      if (!response.ok) {
        throw new Error((data as ErrorResponse).error || (data as ErrorResponse).message || 'Erro no login');
      }
      
      processAuthSuccess((data as AuthResponse).token, (data as AuthResponse).user);
      console.log('[AUTH_CONTEXT DEBUG] login: Sucesso!');
      
    } catch (error) { 
      const err = error as Error;
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
      console.log('[AUTH_CONTEXT DEBUG] register: Tentando registro para:', email);
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await response.json();
      console.log('[AUTH_CONTEXT DEBUG] register: Resposta recebida, status:', response.status);
      
      if (!response.ok) {
        throw new Error((data as ErrorResponse).error || (data as ErrorResponse).message || 'Erro no registro');
      }
      
      processAuthSuccess((data as AuthResponse).token, (data as AuthResponse).user);
      console.log('[AUTH_CONTEXT DEBUG] register: Sucesso!');
      
    } catch (error) { 
      console.error('[AUTH_CONTEXT DEBUG] register: Falha.', error);
      clearAuthData(); 
      throw error; 
    } finally { 
      setIsLoading(false); 
    }
  };

  const logout = async (): Promise<void> => {
    console.log('[AUTH_CONTEXT DEBUG] logout: Fazendo logout');
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