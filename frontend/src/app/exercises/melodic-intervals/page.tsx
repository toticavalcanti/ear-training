// src/app/exercises/melodic-intervals/page.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import MelodicIntervalExercise from '@/components/MelodicIntervalExercise';
import Loading from '@/components/Loading';
import { useState } from 'react';

export default function MelodicIntervalsPage() {
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
              Você precisa estar logado para acessar os exercícios de intervalos melódicos.
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
    console.log('Melodic interval exercise result:', result);
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
    <div className="container mx-auto py-6 px-4">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/" className="text-indigo-600 hover:text-indigo-800">
          Início
        </Link>
        <span className="text-gray-400">›</span>
        <span className="text-gray-600">Intervalos Melódicos</span>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-100 p-2 rounded-lg">
            <span className="text-2xl">🎼</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            Intervalos Melódicos
          </h1>
        </div>
        <p className="text-gray-600">
          Olá, {user?.name}! Desenvolva seu ouvido musical identificando intervalos
          melódicos - notas tocadas em sequência, uma após a outra.
        </p>
        
        {exerciseCount > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-green-800 text-sm">
              <strong>Sessão atual:</strong> {correctCount}/{exerciseCount} corretos 
              ({exerciseCount > 0 ? Math.round((correctCount / exerciseCount) * 100) : 0}% de acerto)
            </div>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Escolha a dificuldade:</h3>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => handleDifficultyChange('beginner')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              difficulty === 'beginner'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Iniciante
          </button>
          <button
            onClick={() => handleDifficultyChange('intermediate')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              difficulty === 'intermediate'
                ? 'bg-blue-600 text-white'
                : user?.subscription === 'premium'
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            disabled={user?.subscription !== 'premium'}
          >
            Intermediário {user?.subscription !== 'premium' && '🔒'}
          </button>
          <button
            onClick={() => handleDifficultyChange('advanced')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              difficulty === 'advanced'
                ? 'bg-blue-600 text-white'
                : user?.subscription === 'premium'
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            disabled={user?.subscription !== 'premium'}
          >
            Avançado {user?.subscription !== 'premium' && '🔒'}
          </button>
        </div>
      </div>

      <MelodicIntervalExercise 
        key={difficulty}
        difficulty={difficulty} 
        onComplete={handleExerciseComplete} 
      />
      
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">💡 Dicas para intervalos melódicos:</h4>
        <ul className="text-yellow-700 text-sm space-y-1">
          <li>• Escute atentamente a sequência: primeira nota → segunda nota</li>
          <li>• Use o piano para explorar os intervalos antes de responder</li>
          <li>• Tente cantar ou visualizar a distância entre as notas</li>
          <li>• Pratique regularmente para desenvolver a memória auditiva</li>
        </ul>
      </div>
    </div>
  );
}