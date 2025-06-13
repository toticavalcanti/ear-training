// frontend/src/app/exercises/chord-progressions/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/Loading';
import ChordProgressionDifficultyPage from '@/components/ChordProgressionDifficultyPage';
import ChordProgressionExercise from '@/components/ChordProgressionExercise';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

const ChordProgressionsPage: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [showExercise, setShowExercise] = useState<boolean>(false);

  const handleSelectDifficulty = (difficulty: Difficulty) => {
    if ((difficulty === 'intermediate' || difficulty === 'advanced') && user?.subscription !== 'premium') {
      alert('Você precisa de uma assinatura premium para acessar este nível.');
      return;
    }
    setSelectedDifficulty(difficulty);
    setShowExercise(true);
  };

  const handleBackToSelection = () => {
    setShowExercise(false);
    setSelectedDifficulty(null);
  };

  const handleExerciseComplete = (result: {
    correct: boolean;
    userAnswer: string;
    expected: string;
    timeSpent: number;
  }) => {
    console.log('Exercício de progressão completado:', result);
  };

  // ADICIONADO: Guarda de Carregamento para esperar a autenticação
  if (isLoading) {
    return <Loading message="Verificando autenticação..." fullScreen />;
  }

  // ADICIONADO: Guarda de Autenticação para proteger a página
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
          <p className="mb-6">Você precisa estar logado para acessar este exercício.</p>
          <Link href="/auth/login" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  if (!showExercise || !selectedDifficulty) {
    return (
      <ChordProgressionDifficultyPage 
        onSelectDifficulty={handleSelectDifficulty}
      />
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={handleBackToSelection}
          className="bg-white shadow-md rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 border"
        >
          <span className="text-lg">←</span>
          <span className="font-medium">Voltar</span>
        </button>
      </div>
      <ChordProgressionExercise
        key={selectedDifficulty} // Adicionar key para forçar recriação ao mudar dificuldade
        difficulty={selectedDifficulty}
        onComplete={handleExerciseComplete}
      />
    </div>
  );
};

export default ChordProgressionsPage;