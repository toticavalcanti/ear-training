// src/app/exercises/harmonic-intervals/page.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import HarmonicIntervalExercise from '@/components/HarmonicIntervalExercise';
import Loading from '@/components/Loading';
import { useState } from 'react';

export default function HarmonicIntervalsPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [exerciseCount, setExerciseCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

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
              Você precisa estar logado para acessar os exercícios de intervalos harmônicos.
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
    console.log('Harmonic interval exercise result:', result);
    setExerciseCount(prev => prev + 1);
    if (result.correct) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleDifficultyChange = (newDifficulty: 'beginner' | 'intermediate' | 'advanced') => {
    if ((newDifficulty === 'intermediate' || newDifficulty === 'advanced') && user?.subscription !== 'premium') {
      alert('Você precisa de uma assinatura premium para acessar os níveis intermediário e avançado.');
      return;
    }
    
    setDifficulty(newDifficulty);
    setExerciseCount(0);
    setCorrectCount(0);
  };

  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4">
      {/* Breadcrumb */}
      <div className="mb-3 sm:mb-4 flex items-center gap-2 text-sm">
        <Link href="/" className="text-indigo-600 hover:text-indigo-800">
          Início
        </Link>
        <span className="text-gray-400">›</span>
        <span className="text-gray-600">Intervalos Harmônicos</span>
      </div>

      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-purple-100 p-2 rounded-lg">
            <span className="text-xl sm:text-2xl">🎹</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Intervalos Harmônicos
          </h1>
        </div>
        <p className="text-gray-600 text-sm sm:text-base">
          Olá, {user?.name}! Desenvolva seu ouvido musical identificando intervalos
          harmônicos - duas notas tocadas simultaneamente, criando harmonia.
        </p>
        
        {/* Session Progress */}
        {exerciseCount > 0 && (
          <div className="mt-3 sm:mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-green-800 text-sm">
              <strong>Sessão atual:</strong> {correctCount}/{exerciseCount} corretos 
              ({exerciseCount > 0 ? Math.round((correctCount / exerciseCount) * 100) : 0}% de acerto)
            </div>
          </div>
        )}
      </div>

      {/* Difficulty Selection - OTIMIZADO PARA MOBILE */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3">Escolha a dificuldade:</h3>
        
        {/* Grid responsivo para os botões */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 max-w-md sm:max-w-none">
          {/* Iniciante */}
          <button
            onClick={() => handleDifficultyChange('beginner')}
            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              difficulty === 'beginner'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Iniciante
          </button>

          {/* Intermediário */}
          <button
            onClick={() => handleDifficultyChange('intermediate')}
            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              difficulty === 'intermediate'
                ? 'bg-purple-600 text-white shadow-md'
                : user?.subscription === 'premium'
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            disabled={user?.subscription !== 'premium'}
          >
            <span className="flex items-center justify-center gap-1">
              <span>Intermediário</span>
              {user?.subscription !== 'premium' && (
                <span className="text-xs">🔒</span>
              )}
            </span>
          </button>

          {/* Avançado */}
          <button
            onClick={() => handleDifficultyChange('advanced')}
            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              difficulty === 'advanced'
                ? 'bg-purple-600 text-white shadow-md'
                : user?.subscription === 'premium'
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            disabled={user?.subscription !== 'premium'}
          >
            <span className="flex items-center justify-center gap-1">
              <span>Avançado</span>
              {user?.subscription !== 'premium' && (
                <span className="text-xs">🔒</span>
              )}
            </span>
          </button>
        </div>

        {/* Premium Notice - Mais compacto no mobile */}
        {user?.subscription !== 'premium' && (
          <div className="mt-3 p-2 sm:p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-amber-600 text-base sm:text-lg mt-0.5">✨</span>
              <div className="text-amber-800 text-xs sm:text-sm">
                <strong>Upgrade para Premium:</strong> Desbloqueie os níveis intermediário e avançado para treinar intervalos harmônicos mais complexos!
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Exercise Component */}
      <HarmonicIntervalExercise 
        key={difficulty}
        difficulty={difficulty} 
        onComplete={handleExerciseComplete} 
      />
      
      {/* Tips Section - Mais compacto no mobile */}
      <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <h4 className="font-semibold text-purple-800 mb-2 text-sm sm:text-base flex items-center gap-2">
          <span className="text-base sm:text-lg">💡</span>
          <span>Dicas para intervalos harmônicos</span>
        </h4>
        <ul className="text-purple-700 text-xs sm:text-sm space-y-1">
          <li>• Escute atentamente: duas notas tocadas simultaneamente</li>
          <li>• Concentre-se na sonoridade e tensão harmônica</li>
          <li>• Use o piano para explorar diferentes intervalos</li>
          <li>• Compare com intervalos melódicos que já conhece</li>
          <li>• Pratique identificando a cor sonora de cada intervalo</li>
        </ul>
      </div>
    </div>
  );
}