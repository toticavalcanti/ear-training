// src/app/exercises/chord-progressions/page.tsx
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Loading from '@/components/Loading';
import dynamic from 'next/dynamic';

// Import dinâmico para evitar problemas de SSR
const ChordProgressionExercise = dynamic(
  () => import('../../../components/ChordProgressionExercise'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎼</div>
          <div className="text-xl font-semibold text-gray-700">Carregando exercício...</div>
        </div>
      </div>
    )
  }
);

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface DifficultyOption {
  value: Difficulty;
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  examples: string[];
}

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  {
    value: 'beginner',
    label: 'Iniciante',
    description: 'Progressões básicas e populares',
    icon: '🌱',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    examples: ['I-V-vi-IV', 'ii-V-I', 'vi-IV-I-V']
  },
  {
    value: 'intermediate',
    label: 'Intermediário',
    description: 'Progressões com acordes de sétima e dominantes secundárias',
    icon: '🎯',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    examples: ['I^maj7-vi7-ii7-V7', 'vi-IV-I-V7', 'iii7-VI7-ii7-V7']
  },
  {
    value: 'advanced',
    label: 'Avançado',
    description: 'Progressões complexas com empréstimos modais e jazz',
    icon: '🚀',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    examples: ['I^maj7-iii7-VI7-ii7-V7', 'i-bVI-bVII-iv', 'IVmaj7-V7sus4-vi7-iii7']
  }
];

export default function ChordProgressionsPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [isExerciseStarted, setIsExerciseStarted] = useState<boolean>(false);
  const [exerciseCount, setExerciseCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Loading state
  if (isLoading) {
    return <Loading message="Verificando autenticação..." fullScreen />;
  }

  // Auth check
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
              Você precisa estar logado para acessar os exercícios de progressões de acordes.
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
                href="/dashboard"
                className="text-gray-500 hover:text-gray-700 text-sm block"
              >
                ← Voltar ao Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleStartExercise = (difficulty: Difficulty) => {
    // Verificar se o usuário tem acesso ao nível
    if ((difficulty === 'intermediate' || difficulty === 'advanced') && user?.subscription !== 'premium') {
      alert('Você precisa de uma assinatura premium para acessar os níveis intermediário e avançado.');
      return;
    }

    console.log('Iniciando exercício de progressões com dificuldade:', difficulty);
    setSelectedDifficulty(difficulty);
    setIsExerciseStarted(true);
    setExerciseCount(0);
    setCorrectCount(0);
  };

  const handleExerciseComplete = (result: {
    correct: boolean;
    userAnswer: string;
    expected: string;
    timeSpent: number;
  }) => {
    console.log('Chord progression exercise result:', result);
    setExerciseCount(prev => prev + 1);
    if (result.correct) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleBackToSelection = () => {
    console.log('Voltando para seleção de dificuldade...');
    setIsExerciseStarted(false);
    setSelectedDifficulty(null);
    setExerciseCount(0);
    setCorrectCount(0);
  };

  // Se o exercício já começou, renderizar o componente do exercício
  if (isExerciseStarted && selectedDifficulty) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header com botão de voltar */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={handleBackToSelection}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Voltar à seleção</span>
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎼</span>
                <span className="font-bold text-lg text-gray-900">Progressões de Acordes</span>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedDifficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                selectedDifficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {DIFFICULTY_OPTIONS.find(opt => opt.value === selectedDifficulty)?.label}
              </div>
            </div>
          </div>
        </div>

        {/* Session Progress */}
        {exerciseCount > 0 && (
          <div className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="text-center text-sm text-gray-600">
                <strong>Sessão atual:</strong> {correctCount}/{exerciseCount} corretos 
                ({exerciseCount > 0 ? Math.round((correctCount / exerciseCount) * 100) : 0}% de acerto)
              </div>
            </div>
          </div>
        )}

        {/* Componente do Exercício */}
        <ChordProgressionExercise
          difficulty={selectedDifficulty}
          onComplete={handleExerciseComplete}
        />
      </div>
    );
  }

  // Seleção de dificuldade
  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4">
      {/* Breadcrumb */}
      <div className="mb-3 sm:mb-4 flex items-center gap-2 text-sm">
        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800">
          Dashboard
        </Link>
        <span className="text-gray-400">›</span>
        <span className="text-gray-600">Progressões de Acordes</span>
      </div>

      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-purple-100 p-2 rounded-lg">
            <span className="text-xl sm:text-2xl">🎼</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Progressões de Acordes
          </h1>
        </div>
        <p className="text-gray-600 text-sm sm:text-base">
          Olá, {user?.name}! Desenvolva seu ouvido harmônico identificando progressões
          de acordes - sequências de acordes que criam a harmonia de uma música.
        </p>
      </div>

      {/* Seleção de Dificuldade */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3">Escolha a dificuldade:</h3>
        
        {/* Grid responsivo para os cartões */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {DIFFICULTY_OPTIONS.map((option) => (
            <div
              key={option.value}
              className={`${option.bgColor} ${option.borderColor} border-2 rounded-xl p-4 sm:p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                (option.value === 'intermediate' || option.value === 'advanced') && user?.subscription !== 'premium'
                  ? 'opacity-60 cursor-not-allowed'
                  : ''
              }`}
              onClick={() => handleStartExercise(option.value)}
            >
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-3">{option.icon}</div>
                <h3 className={`text-lg sm:text-xl font-bold mb-2 ${option.color} flex items-center justify-center gap-2`}>
                  <span>{option.label}</span>
                  {(option.value === 'intermediate' || option.value === 'advanced') && user?.subscription !== 'premium' && (
                    <span className="text-sm">🔒</span>
                  )}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-4">
                  {option.description}
                </p>
                
                {/* Exemplos */}
                <div className="mb-4">
                  <div className="text-xs font-medium text-gray-500 mb-2">Exemplos:</div>
                  <div className="space-y-1">
                    {option.examples.map((example, index) => (
                      <div
                        key={index}
                        className="bg-white bg-opacity-60 px-2 py-1 rounded text-xs font-mono"
                      >
                        {example}
                      </div>
                    ))}
                  </div>
                </div>
                
                <button 
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                    (option.value === 'intermediate' || option.value === 'advanced') && user?.subscription !== 'premium'
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                  disabled={(option.value === 'intermediate' || option.value === 'advanced') && user?.subscription !== 'premium'}
                >
                  {(option.value === 'intermediate' || option.value === 'advanced') && user?.subscription !== 'premium'
                    ? 'Premium Necessário'
                    : 'Começar'
                  }
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Premium Notice */}
        {user?.subscription !== 'premium' && (
          <div className="mt-4 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-amber-600 text-base sm:text-lg mt-0.5">✨</span>
              <div className="text-amber-800 text-xs sm:text-sm">
                <strong>Upgrade para Premium:</strong> Desbloqueie os níveis intermediário e avançado para treinar progressões mais complexas!
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instruções */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 text-center">
          Como funciona?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="bg-blue-100 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg sm:text-xl">🎵</span>
            </div>
            <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">1. Ouça</h4>
            <p className="text-xs sm:text-sm text-gray-600">
              Clique em Tocar Progressão para ouvir a sequência de acordes
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg sm:text-xl">🎯</span>
            </div>
            <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">2. Identifique</h4>
            <p className="text-xs sm:text-sm text-gray-600">
              Escolha qual progressão harmônica você ouviu entre as opções
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg sm:text-xl">✅</span>
            </div>
            <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">3. Confirme</h4>
            <p className="text-xs sm:text-sm text-gray-600">
              Confirme sua resposta e receba feedback imediato
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-yellow-100 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg sm:text-xl">📈</span>
            </div>
            <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">4. Evolua</h4>
            <p className="text-xs sm:text-sm text-gray-600">
              Ganhe pontos e XP, e acompanhe seu progresso
            </p>
          </div>
        </div>
      </div>

      {/* Dicas */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold text-blue-900 mb-3 sm:mb-4 flex items-center gap-2">
          <span className="text-lg sm:text-xl">💡</span>
          Dicas para progressões de acordes
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Foque na função harmônica de cada acorde na tonalidade</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Pratique identificar as cadências mais comuns primeiro</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Use o piano virtual para tocar e comparar progressões</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Ouça múltiplas vezes antes de escolher sua resposta</span>
          </div>
        </div>
      </div>
    </div>
  );
}