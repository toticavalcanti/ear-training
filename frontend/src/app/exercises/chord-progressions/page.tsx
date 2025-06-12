// src/app/exercises/chord-progressions/page.tsx
// Página principal que integra seleção de dificuldade + exercício

'use client';

import React, { useState } from 'react';
import ChordProgressionDifficultyPage from '../../../components/ChordProgressionDifficultyPage';
import ChordProgressionExercise from '../../../components/ChordProgressionExercise';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

const ChordProgressionsPage: React.FC = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [showExercise, setShowExercise] = useState<boolean>(false);

  // Quando usuário seleciona dificuldade
  const handleSelectDifficulty = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    setShowExercise(true);
  };

  // Voltar para seleção de dificuldade
  const handleBackToSelection = () => {
    setShowExercise(false);
    setSelectedDifficulty(null);
  };

  // Callback quando completa um exercício
  const handleExerciseComplete = (result: {
    correct: boolean;
    userAnswer: string;
    expected: string;
    timeSpent: number;
  }) => {
    console.log('Exercício completado:', result);
    // Aqui você pode salvar estatísticas, enviar para analytics, etc.
  };

  // Se não selecionou dificuldade, mostra página de seleção
  if (!showExercise || !selectedDifficulty) {
    return (
      <ChordProgressionDifficultyPage 
        onSelectDifficulty={handleSelectDifficulty}
      />
    );
  }

  // Se selecionou, mostra o exercício
  return (
    <div className="relative">
      {/* Botão voltar */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={handleBackToSelection}
          className="bg-white shadow-md rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 border"
        >
          <span className="text-lg">←</span>
          <span className="font-medium">Voltar</span>
        </button>
      </div>

      {/* Exercício */}
      <ChordProgressionExercise
        difficulty={selectedDifficulty}
        onComplete={handleExerciseComplete}
      />
    </div>
  );
};

export default ChordProgressionsPage;