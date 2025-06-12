// src/app/exercises/harmonic-progress/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function HarmonicProgressPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [isExerciseStarted, setIsExerciseStarted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<boolean>(false);
  const router = useRouter();

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = () => {
      try {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('jwtToken');
          if (!token) {
            console.log('Token não encontrado, redirecionando para login...');
            setAuthError(true);
            // Usar timeout para evitar problemas de hidratação
            setTimeout(() => {
              router.push('/auth/login');
            }, 100);
            return;
          }
          console.log('Usuário autenticado, carregando página...');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setAuthError(true);
        setIsLoading(false);
      }
    };

    // Aguardar hidratação
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router]);

  const handleStartExercise = (difficulty: Difficulty) => {
    console.log('Iniciando exercício com dificuldade:', difficulty);
    setSelectedDifficulty(difficulty);
    setIsExerciseStarted(true);
  };

  const handleExerciseComplete = (result: {
    correct: boolean;
    userAnswer: string;
    expected: string;
    timeSpent: number;
  }) => {
    console.log('Exercício concluído:', result);
    // Aqui você pode adicionar lógica adicional se necessário
  };

  const handleBackToSelection = () => {
    console.log('Voltando para seleção de dificuldade...');
    setIsExerciseStarted(false);
    setSelectedDifficulty(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🎼</div>
          <div className="text-xl font-semibold text-gray-700">Carregando...</div>
          <div className="text-sm text-gray-500 mt-2">Verificando autenticação...</div>
        </div>
      </div>
    );
  }

  // Auth error state
  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <div className="text-xl font-semibold text-gray-700 mb-2">Acesso Negado</div>
          <div className="text-sm text-gray-500 mb-4">Redirecionando para login...</div>
          <button 
            onClick={() => router.push('/auth/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

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
                <span className="font-bold text-lg text-gray-900">Progressões Harmônicas</span>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Dashboard</span>
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎼</span>
              <span className="font-bold text-lg text-gray-900">Progressões Harmônicas</span>
            </div>
            
            <div className="w-20"></div> {/* Spacer for balance */}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Introdução */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">🎼</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Progressões Harmônicas
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Desenvolva seu ouvido harmônico identificando sequências de acordes. 
            Ouça progressões e identifique qual padrão harmônico está sendo tocado.
          </p>
        </div>

        {/* Seleção de Dificuldade */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Escolha sua dificuldade
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DIFFICULTY_OPTIONS.map((option) => (
              <div
                key={option.value}
                className={`${option.bgColor} ${option.borderColor} border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105`}
                onClick={() => handleStartExercise(option.value)}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{option.icon}</div>
                  <h3 className={`text-xl font-bold mb-2 ${option.color}`}>
                    {option.label}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
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
                  
                  <button className={`w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors`}>
                    Começar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Como funciona?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🎵</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">1. Ouça</h4>
              <p className="text-sm text-gray-600">
                Clique em Tocar Progressão para ouvir a sequência de acordes
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🎯</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">2. Identifique</h4>
              <p className="text-sm text-gray-600">
                Escolha qual progressão harmônica você ouviu entre as opções
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">✅</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">3. Confirme</h4>
              <p className="text-sm text-gray-600">
                Confirme sua resposta e receba feedback imediato
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">📈</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">4. Evolua</h4>
              <p className="text-sm text-gray-600">
                Ganhe pontos e XP, e acompanhe seu progresso
              </p>
            </div>
          </div>
        </div>

        {/* Dicas */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
            <span className="text-xl">💡</span>
            Dicas para melhorar
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
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
    </div>
  );
}