// frontend/src/components/IntervalExercise.tsx - VERSÃO CORRIGIDA
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSimpleWebAudioPiano } from '@/lib/pianoSynthesizer';
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
  const [pianoError, setPianoError] = useState<string | null>(null);
  
  // Refs para controle de timeouts
  const playTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const secondNoteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pianoRef = useRef(getSimpleWebAudioPiano());

  // Filtrar intervalos baseado na dificuldade
  const getAvailableIntervals = useCallback(() => {
    switch (difficulty) {
      case 'beginner':
        return ['M2', 'M3', 'P4', 'P5', 'P8'];
      case 'intermediate':
        return ['m2', 'M2', 'm3', 'M3', 'P4', 'P5', 'M6', 'P8'];
      case 'advanced':
        return Object.keys(INTERVALS);
      default:
        return ['M2', 'M3', 'P4', 'P5', 'P8'];
    }
  }, [difficulty]);

  // Gerar um intervalo aleatório baseado na dificuldade
  const generateInterval = useCallback(() => {
    const availableIntervals = getAvailableIntervals();
    
    // Escolher um intervalo aleatório
    const randomInterval = availableIntervals[Math.floor(Math.random() * availableIntervals.length)];
    setCurrentInterval(randomInterval);
    
    // Gerar notas para o intervalo
    const baseNote = Math.floor(Math.random() * 12) + 60; // C4 a B4
    const intervalSemitones = INTERVALS[randomInterval as keyof typeof INTERVALS].semitones;
    const secondNote = baseNote + intervalSemitones;
    
    setNotes([baseNote, secondNote]);
    return { interval: randomInterval, notes: [baseNote, secondNote] };
  }, [getAvailableIntervals]);

  // Função para tocar sequência de notas
  const playNoteSequence = useCallback(async (noteArray: number[]) => {
    if (noteArray.length !== 2 || !isPianoLoaded) return;
    
    setIsPlaying(true);
    
    try {
      console.log(`🎵 Tocando sequência: ${noteArray.join(', ')}`);
      
      // Tocar primeira nota
      await pianoRef.current.playNote(noteArray[0], 80, 800);
      
      // Esperar um pouco e tocar segunda nota
      secondNoteTimeoutRef.current = setTimeout(async () => {
        try {
          await pianoRef.current.playNote(noteArray[1], 80, 800);
        } catch (error) {
          console.error('❌ Erro ao tocar segunda nota:', error);
        } finally {
          setIsPlaying(false);
        }
      }, 900);
      
    } catch (error) {
      console.error('❌ Erro ao tocar primeira nota:', error);
      setIsPlaying(false);
    }
  }, [isPianoLoaded]);

  // Iniciar um novo exercício
  const startExercise = useCallback(async () => {
    // Limpar timeouts anteriores
    if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
    if (secondNoteTimeoutRef.current) clearTimeout(secondNoteTimeoutRef.current);
    
    // Reset do estado
    setUserAnswer(null);
    setIsCorrect(null);
    setShowFeedback(false);
    setStartTime(Date.now());
    
    // Gerar novo intervalo
    const { interval, notes: newNotes } = generateInterval();
    
    console.log(`🎯 Novo exercício - Intervalo: ${interval}`);
    
    // Tocar o exercício após um pequeno delay
    playTimeoutRef.current = setTimeout(() => {
      playNoteSequence(newNotes);
    }, 500);
  }, [generateInterval, playNoteSequence]);

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
      await playNoteSequence(notes);
    }
  }, [notes, isPlaying, isPianoLoaded, playNoteSequence]);

  // Carregar piano quando componente monta
  useEffect(() => {
    const loadPiano = async () => {
      setIsLoadingPiano(true);
      setPianoError(null);
      
      try {
        console.log('🎹 Iniciando carregamento do piano...');
        const loaded = await pianoRef.current.preload();
        
        if (loaded) {
          setIsPianoLoaded(true);
          console.log('✅ Piano carregado com sucesso!');
        } else {
          throw new Error('Falha ao carregar piano');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar piano:', error);
        setIsPianoLoaded(false);
        setPianoError(error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
        setIsLoadingPiano(false);
      }
    };
    
    loadPiano();
    
    // Cleanup
    return () => {
      if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
      if (secondNoteTimeoutRef.current) clearTimeout(secondNoteTimeoutRef.current);
    };
  }, []);

  // Iniciar exercício quando piano estiver carregado
  useEffect(() => {
    if (isPianoLoaded && !isPlaying && !currentInterval) {
      startExercise();
    }
  }, [isPianoLoaded, isPlaying, currentInterval, startExercise]);

  const getPianoStatus = () => {
    if (pianoError) return `Erro: ${pianoError}`;
    if (isLoadingPiano) return 'Carregando piano realista...';
    if (!isPianoLoaded) return 'Piano não carregado';
    return 'Piano realista pronto!';
  };

  const getStatusClass = () => {
    if (pianoError) return 'bg-red-100 text-red-800';
    if (isLoadingPiano) return 'bg-yellow-100 text-yellow-800';
    if (!isPianoLoaded) return 'bg-gray-100 text-gray-600';
    return 'bg-green-100 text-green-800';
  };

  const getDifficultyBadge = () => {
    const badges = {
      beginner: { label: 'Iniciante', class: 'bg-green-100 text-green-800' },
      intermediate: { label: 'Intermediário', class: 'bg-yellow-100 text-yellow-800' },
      advanced: { label: 'Avançado', class: 'bg-red-100 text-red-800' }
    };
    
    return badges[difficulty] || badges.beginner;
  };

  return (
    <div className="interval-exercise max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Identificação de Intervalos</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyBadge().class}`}>
            {getDifficultyBadge().label}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4">
          Ouça o intervalo e identifique-o. Clique em &quot;Ouvir Novamente&quot; para repetir o som.
        </p>
        
        {/* Status do Piano */}
        <div className={`text-sm p-3 rounded-lg ${getStatusClass()}`}>
          <div className="flex items-center gap-2">
            <span>🎹</span>
            <span>{getPianoStatus()}</span>
          </div>
        </div>
      </div>
      
      {/* Controles de Áudio */}
      <div className="flex justify-center mb-8">
        <button 
          onClick={playInterval}
          disabled={isPlaying || !isPianoLoaded}
          className={`px-8 py-4 rounded-xl font-bold text-lg transition-all transform ${
            isPlaying || !isPianoLoaded
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105 shadow-lg'
          }`}
        >
          {isPlaying ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>🎵 Tocando...</span>
            </div>
          ) : !isPianoLoaded ? (
            isLoadingPiano ? '⏳ Carregando...' : '❌ Piano não carregado'
          ) : (
            '🎹 Ouvir Intervalo'
          )}
        </button>
      </div>
      
      {/* Grid de Opções */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
        {Object.entries(INTERVALS).map(([interval, { name }]) => {
          const isCorrectAnswer = showFeedback && interval === currentInterval;
          const isUserWrongAnswer = showFeedback && interval === userAnswer && interval !== currentInterval;
          const isDisabled = showFeedback || !isPianoLoaded;
          
          let buttonClass = 'p-4 border-2 rounded-xl font-bold text-center transition-all transform ';
          
          if (isCorrectAnswer) {
            buttonClass += 'bg-green-100 border-green-500 text-green-800 scale-105';
          } else if (isUserWrongAnswer) {
            buttonClass += 'bg-red-100 border-red-500 text-red-800';
          } else if (isDisabled) {
            buttonClass += 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed';
          } else {
            buttonClass += 'bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:scale-105 cursor-pointer shadow-sm hover:shadow-md';
          }
          
          return (
            <button
              key={interval}
              onClick={() => checkAnswer(interval)}
              disabled={isDisabled}
              className={buttonClass}
            >
              <div className="text-lg mb-1">{name}</div>
              <div className="text-sm text-gray-600">({interval})</div>
            </button>
          );
        })}
      </div>
      
      {/* Feedback */}
      {showFeedback && (
        <div className={`p-6 rounded-xl mb-8 text-center ${
          isCorrect ? 'bg-green-100 border-2 border-green-300' : 'bg-red-100 border-2 border-red-300'
        }`}>
          <div className="text-2xl mb-2">
            {isCorrect ? '🎉' : '❌'}
          </div>
          <p className="text-lg font-bold mb-2">
            {isCorrect 
              ? '✅ Correto!' 
              : '❌ Incorreto!'
            }
          </p>
          {!isCorrect && currentInterval && (
            <p className="text-gray-700">
              O intervalo correto era <strong>{INTERVALS[currentInterval as keyof typeof INTERVALS].name}</strong> ({currentInterval})
            </p>
          )}
        </div>
      )}
      
      {/* Controles de Exercício */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={startExercise}
          disabled={!isPianoLoaded || isLoadingPiano}
          className={`px-6 py-3 rounded-xl font-bold transition-all ${
            !isPianoLoaded || isLoadingPiano
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 shadow-lg'
          }`}
        >
          {showFeedback ? 'Próximo Exercício' : 'Novo Exercício'}
        </button>
        
        {showFeedback && (
          <button
            onClick={playInterval}
            disabled={isPlaying || !isPianoLoaded}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              isPlaying || !isPianoLoaded
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700 hover:scale-105 shadow-lg'
            }`}
          >
            🔄 Ouvir Novamente
          </button>
        )}
      </div>
      
      {/* Piano Virtual */}
      <div className="mt-12 p-6 bg-gray-50 rounded-2xl overflow-x-auto">
        <h3 className="text-xl font-bold mb-6 text-center text-gray-800">
          🎹 Piano Virtual
        </h3>
        <p className="text-sm text-gray-600 text-center mb-6">
          Use o piano abaixo para explorar os intervalos ou praticar suas habilidades
        </p>
        <div className="flex justify-center">
          <BeautifulPianoKeyboard 
            width={1000}
            height={220}
            octaves={4}
            startNote="C2"
            onNotePlay={(note, frequency) => {
              console.log(`🎵 Piano tocando: ${note} (${frequency.toFixed(2)}Hz)`);
            }}
            onNoteStop={(note) => {
              console.log(`🛑 Piano parou: ${note}`);
            }}
          />
        </div>
      </div>
      
      {/* Informações do Exercício */}
      <div className="mt-8 p-4 bg-blue-50 rounded-xl">
        <h4 className="font-bold text-blue-900 mb-2">💡 Dicas para Identificação de Intervalos:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Segunda Maior:</strong> Som como &quot;Happy Birthday&quot; (duas primeiras notas)</li>
          <li>• <strong>Terça Maior:</strong> Som alegre, como o início de &quot;Kumbaya&quot;</li>
          <li>• <strong>Quarta Justa:</strong> Som como &quot;Here Comes the Bride&quot; ou &quot;Amazing Grace&quot;</li>
          <li>• <strong>Quinta Justa:</strong> Som poderoso, como &quot;Twinkle Twinkle Little Star&quot;</li>
          <li>          • <strong>Oitava:</strong> A mesma nota, só que mais aguda</li>
        </ul>
      </div>
    </div>
  );
}