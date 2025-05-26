// frontend/src/app/auth/register/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    if (name.trim().length < 2) {
      setError('Nome deve ter pelo menos 2 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      await register(name.trim(), email, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no registro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/google`;
  };

  return (
    <>     
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <span className="text-white text-2xl">🎵</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Crie sua conta
            </h2>
            <p className="text-gray-600">
              Comece sua jornada musical hoje mesmo
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
            <form className="space-y-6" onSubmit={handleSubmit}>
              
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome completo
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmar senha
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Digite a senha novamente"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Criando conta...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>🚀</span>
                      <span>Criar Conta Gratuita</span>
                    </div>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">ou</span>
                </div>
              </div>

              {/* Google Button */}
              <div>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-semibold transition-all flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continuar com Google</span>
                </button>
              </div>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Já tem uma conta?{' '}
                <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-500 font-semibold transition-colors">
                  Entrar aqui
                </Link>
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6 shadow-lg">
            <h3 className="text-center font-bold text-gray-900 mb-4">
              ✨ O que você ganha com sua conta:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2 text-gray-700">
                <span>🎯</span>
                <span>Exercícios personalizados</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <span>📈</span>
                <span>Acompanhamento de progresso</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <span>🏅</span>
                <span>Sistema de conquistas</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <span>🏆</span>
                <span>Ranking global</span>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <span className="text-xs text-gray-500">
                ✅ Sempre gratuito • ✅ Sem spam • ✅ Cancele quando quiser
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}