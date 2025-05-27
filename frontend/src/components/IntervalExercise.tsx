// frontend/src/components/IntervalExercise.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { pianoSynth } from '@/lib/pianoSynthesizer';
import VirtualKeyboard from './VirtualKeyboard';

interface IntervalExerciseProps {
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  onComplete?: (result: { correct: boolean; userAnswer: string; expected: string; timeSpent: number }) => void;
}

// Mapeamento dos intervalos
const INTERVALS = {
  'm2': { semitones: 1, name: 'Segunda Menor' },
  'M2': { semitones: 2, name: 'Segunda Maior' },
  'm3': { semitones: 3, name: 'Terça Menor' },
  'M3': { semitones: 4, name: 'Terça Maior' },
  'P4': { semitones: 5, name: 'Quarta Justa' },
  'TT': { semitones: 6, name: 'Trítono' },
  'P5': { semitones: 7, name: 'Quinta Justa' },
  'm6': { semitones: 8, name: 'Sexta Menor' },
  'M6': { semitones: 9, name: 'Sexta Maior' },
  'm7': { semitones: 10, name: 'Sétima Menor' },
  'M7': { semitones: 11, name: 'Sétima Maior' },
  'P8': { semitones: 12, name: 'Oitava' },
};

export default function IntervalExercise({ 
  difficulty = 'beginner',
  onComplete 
}: IntervalExerciseProps) {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentInterval, setCurrentInterval] = useState<string | null>(null);
  const [notes, setNotes] = useState<number[]>([]);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Gerar um intervalo aleatorio baseado na dificuldade
  const generateInterval = useCallback(() => {
    let availableIntervals: string[] = [];
    
    switch (difficulty) {
      case 'beginner':
        availableIntervals = ['M2', 'M3', 'P4', 'P5', 'P8'];
        break;
      case 'intermediate':
        availableIntervals = ['m2', 'M2', 'm3', 'M3', 'P4', 'P5', 'M6', 'P8'];
        break;
      case 'advanced':
        availableIntervals = Object.keys(INTERVALS);
        break;
      default:
        availableIntervals = ['M2', 'M3', 'P4', 'P5', 'P8'];
    }
    
    // Escolher um intervalo aleatório
    const randomInterval = availableIntervals[Math.floor(Math.random() * availableIntervals.length)];
    setCurrentInterval(randomInterval);
    
    // Gerar notas para o intervalo
    const baseNote = Math.floor(Math.random() * 12) + 60; // C4 a B4
    const intervalSemitones = INTERVALS[randomInterval as keyof typeof INTERVALS].semitones;
    const secondNote = baseNote + intervalSemitones;
    
    setNotes([baseNote, secondNote]);
    return [baseNote, secondNote];
  }, [difficulty]);

  // Iniciar um novo exercício
  const startExercise = useCallback(async () => {
    setUserAnswer(null);
    setIsCorrect(null);
    setShowFeedback(false);
    setIsPlaying(true);
    
    const [baseNote, secondNote] = generateInterval();
    setStartTime(Date.now());
    
    // Tocar as notas sequencialmente com som de piano
    setTimeout(async () => {
      await pianoSynth.playNote(baseNote, 80, 800);
      
      setTimeout(async () => {
        await pianoSynth.playNote(secondNote, 80, 800);
        setIsPlaying(false);
      }, 900);
    }, 500);
  }, [generateInterval]);

  // Verificar a resposta do usuário
  const checkAnswer = useCallback((answer: string) => {
    setUserAnswer(answer);
    const isAnswerCorrect = answer === currentInterval;
    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);
    
    const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    
    if (onComplete) {
      onComplete({
        correct: isAnswerCorrect,
        userAnswer: answer,
        expected: currentInterval || '',
        timeSpent
      });
    }
  }, [currentInterval, onComplete, startTime]);

  // Tocar o intervalo novamente
  const playInterval = useCallback(async () => {
    if (notes.length === 2 && !isPlaying) {
      setIsPlaying(true);
      
      await pianoSynth.playNote(notes[0], 80, 800);
      await new Promise(resolve => setTimeout(resolve, 900));
      await pianoSynth.playNote(notes[1], 80, 800);
      
      setIsPlaying(false);
    }
  }, [notes, isPlaying]);

  // Iniciar exercício quando o componente carrega
  useEffect(() => {
    startExercise();
  }, [startExercise]);

  return (
    <div className="interval-exercise">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Identificação de Intervalos</h2>
        <p className="text-gray-600">
          Ouça o intervalo e identifique-o. Clique em &quot;Ouvir Novamente&quot; para repetir o som.
        </p>
      </div>
      
      <div className="flex justify-center mb-4">
        <button 
          onClick={playInterval}
          disabled={isPlaying}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            isPlaying 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105'
          }`}
        >
          {isPlaying ? '🎵 Tocando...' : '🎹 Ouvir Novamente'}
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        {Object.entries(INTERVALS).map(([interval, { name }]) => (
          <button
            key={interval}
            onClick={() => checkAnswer(interval)}
            disabled={showFeedback}
            className={`p-3 border rounded transition-colors
              ${userAnswer === interval && isCorrect ? 'bg-green-100 border-green-500' : ''}
              ${userAnswer === interval && !isCorrect ? 'bg-red-100 border-red-500' : ''}
              ${!userAnswer ? 'hover:bg-gray-100' : ''}
            `}
          >
            {name} ({interval})
          </button>
        ))}
      </div>
      
      {showFeedback && (
        <div className={`p-4 rounded mb-6 ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
          <p className="font-bold">
            {isCorrect 
              ? '✓ Correto!' 
              : `✗ Incorreto. O intervalo correto era ${INTERVALS[currentInterval as keyof typeof INTERVALS].name} (${currentInterval}).`
            }
          </p>
        </div>
      )}
      
      <div className="mt-4">
        <button
          onClick={startExercise}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition-colors"
        >
          Próximo Exercício
        </button>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Teclado Virtual</h3>
        <VirtualKeyboard />
      </div>
    </div>
  );
}