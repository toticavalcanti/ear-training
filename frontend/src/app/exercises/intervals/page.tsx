// src/app/exercises/intervals/page.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import IntervalExercise from '@/components/IntervalExercise';
import Loading from '@/components/Loading';

export default function IntervalsPage() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <Loading message="Verificando autenticação..." fullScreen />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="bg-yellow-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-yellow-600 text-2xl">🔒</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Acesso Restrito</h1>
            <p className="text-gray-600 mb-6">
              Você precisa estar logado para acessar os exercícios de intervalos.
            </p>
            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors block"
              >
                Fazer Login
              </Link>
              <Link
                href="/auth/register"
                className="w-full border border-indigo-600 text-indigo-600 py-3 px-4 rounded-lg font-medium hover:bg-indigo-50 transition-colors block"
              >
                Criar Conta Gratuita
              </Link>
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-700 text-sm block"
              >
                ← Voltar ao Início
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleExerciseComplete = (result: {
    correct: boolean;
    userAnswer: string;
    expected: string;
    timeSpent: number;
  }) => {
    console.log('Exercise result:', result);
    // Aqui você pode implementar lógica para salvar resultados no backend
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-4">
        <Link href="/" className="text-indigo-600 hover:text-indigo-800">
          ← Voltar para a página inicial
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Identificação de Intervalos
        </h1>
        <p className="text-gray-600">
          Olá, {user?.name}! Desenvolva seu ouvido musical identificando intervalos
          musicais.
        </p>
      </div>

      <IntervalExercise difficulty="beginner" onComplete={handleExerciseComplete} />
    </div>
  );
}
