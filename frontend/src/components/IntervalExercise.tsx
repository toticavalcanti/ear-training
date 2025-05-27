// frontend/src/components/IntervalExercise.tsx - VERSÃO COM SOM REALISTA
'use client';

import { useState, useEffect, useCallback } from 'react';
import { realisticPiano } from '@/lib/pianoSynthesizer';
import BeautifulPianoKeyboard from './BeautifulPianoKeyboard';

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
  const [isPianoLoaded, setIsPianoLoaded] = useState(false);
  const [isLoadingPiano, setIsLoadingPiano] = useState(false);

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
    
    console.log(`🎯 Novo exercício - Intervalo: ${currentInterval}`);
    
    // Tocar as notas sequencialmente com som de piano
    setTimeout(async () => {
      try {
        await realisticPiano.playNote(baseNote, 80, 800);
        
        setTimeout(async () => {
          await realisticPiano.playNote(secondNote, 80, 800);
          setIsPlaying(false);
        }, 900);
      } catch (error) {
        console.error('❌ Erro ao tocar exercício:', error);
        setIsPlaying(false);
      }
    }, 500);
  }, [generateInterval, currentInterval]);

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
    if (notes.length === 2 && !isPlaying && isPianoLoaded) {
      setIsPlaying(true);
      
      try {
        console.log('🔄 Repetindo intervalo...');
        await realisticPiano.playNote(notes[0], 80, 800);
        
        setTimeout(async () => {
          await realisticPiano.playNote(notes[1], 80, 800);
          setIsPlaying(false);
        }, 900);
      } catch (error) {
        console.error('❌ Erro ao repetir intervalo:', error);
        setIsPlaying(false);
      }
    }
  }, [notes, isPlaying, isPianoLoaded]);

  // Carregar piano quando componente monta
  useEffect(() => {
    const loadPiano = async () => {
      setIsLoadingPiano(true);
      try {
        const loaded = await realisticPiano.preload();
        setIsPianoLoaded(loaded);
      } catch (error) {
        console.error('❌ Erro ao carregar piano:', error);
        setIsPianoLoaded(false);
      } finally {
        setIsLoadingPiano(false);
      }
    };
    
    loadPiano();
  }, []);

  // Iniciar exercício quando piano estiver carregado
  useEffect(() => {
    if (isPianoLoaded && !isPlaying && !currentInterval) {
      startExercise();
    }
  }, [isPianoLoaded, isPlaying, currentInterval, startExercise]);

  // Status do piano
  const getPianoStatus = () => {
    if (isLoadingPiano) return 'Carregando piano realista...';
    if (!isPianoLoaded) return 'Piano não carregado';
    return 'Piano realista pronto!';
  };

  return (
    <div className="interval-exercise">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Identificação de Intervalos</h2>
        <p className="text-gray-600">
          Ouça o intervalo e identifique-o. Clique em &quot;Ouvir Novamente&quot; para repetir o som.
        </p>
        
        {/* Status do Piano */}
        <div className={`mt-2 text-sm p-2 rounded ${
          isPianoLoaded 
            ? 'bg-green-100 text-green-800' 
            : isLoadingPiano 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-red-100 text-red-800'
        }`}>
          🎹 {getPianoStatus()}
        </div>
      </div>
      
      <div className="flex justify-center mb-4">
        <button 
          onClick={playInterval}
          disabled={isPlaying || !isPianoLoaded}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            isPlaying || !isPianoLoaded
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105'
          }`}
        >
          {isPlaying ? '🎵 Tocando...' : !isPianoLoaded ? (isLoadingPiano ? '⏳ Carregando...' : '❌ Piano não carregado') : '🎹 Ouvir Novamente'}
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        {Object.entries(INTERVALS).map(([interval, { name }]) => (
          <button
            key={interval}
            onClick={() => checkAnswer(interval)}
            disabled={showFeedback || !isPianoLoaded}
            className={`p-3 border rounded transition-colors font-medium ${
              showFeedback
                ? interval === currentInterval
                  ? 'bg-green-100 border-green-500 text-green-800'
                  : interval === userAnswer
                    ? 'bg-red-100 border-red-500 text-red-800'
                    : 'bg-gray-100 border-gray-300 text-gray-500'
                : !isPianoLoaded
                  ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:scale-105'
            }`}
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
          disabled={!isPianoLoaded || isLoadingPiano}
          className={`px-6 py-2 rounded font-medium transition-colors ${
            !isPianoLoaded || isLoadingPiano
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          Próximo Exercício
        </button>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 text-center">🎹 Piano Virtual</h3>
        <BeautifulPianoKeyboard 
          width={800}
          height={200}
          octaves={3}
          startNote="C3"
          onNotePlay={(note, frequency) => {
            console.log(`🎵 Tocando: ${note} (${frequency.toFixed(2)}Hz)`);
          }}
        />
      </div>
    </div>
  );
}