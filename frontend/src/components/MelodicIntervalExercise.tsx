// src/components/MelodicIntervalExercise.tsx
'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react';
import BeautifulPianoKeyboard from './BeautifulPianoKeyboard';

declare global {
  interface Window {
    playPianoNote?: (note: string, frequency: number) => Promise<void>;
    stopPianoNote?: (note: string) => void;
  }
}

// =============================================
// INTERFACES TYPESCRIPT
// =============================================

interface IntervalExerciseData {
  baseNote: number;
  targetNote: number;
  semitones: number;
  intervalName: string;
}

interface ExerciseSubmissionResult {
  success: boolean;
  isCorrect: boolean;
  correctAnswer: string;
  userAnswer: string;
  score: number;
  accuracy: number;
  experienceGained: number;
  isPerfect: boolean;
  levelUp: boolean;
  currentLevel: number;
  totalExperience: number;
  newAchievements: Achievement[];
  message: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'progress' | 'mastery' | 'speed' | 'streak' | 'special';
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface UserProgressData {
  level: number;
  experience: number;
  totalExperiences: number;
  perfectScores: number;
  averageScore: number;
  streakDays: number;
  levelProgress: {
    current: number;
    needed: number;
    percentage: number;
  };
  byType: {
    intervals: {
      completed: number;
      averageScore: number;
      bestTime: number;
    };
    rhythmic: {
      completed: number;
      averageScore: number;
      bestTime: number;
    };
    melodic: {
      completed: number;
      averageScore: number;
      bestTime: number;
    };
    progression: {
      completed: number;
      averageScore: number;
      bestTime: number;
    };
  };
  user: {
    name: string;
    subscription: 'free' | 'premium';
  };
}

// =============================================
// FUNÇÃO PARA ENVIAR EXERCÍCIO PARA BACKEND
// =============================================
async function submitFrontendExercise(
  exerciseType: 'interval',
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  userAnswer: string,
  correctAnswer: string,
  timeSpent: number,
  exerciseData: IntervalExerciseData
): Promise<ExerciseSubmissionResult | null> {
  try {
    const token = localStorage.getItem('authToken') || '';
    
    const payload = {
      exerciseType,
      difficulty,
      userAnswer,
      correctAnswer,
      timeSpent,
      exerciseData
    };
    
    console.log('📤 Enviando exercício frontend:', payload);

    const response = await fetch('/api/gamification/submit-frontend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro do backend:', errorText);
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('📥 Resposta do backend:', result);
    
    return result;

  } catch (error) {
    console.error('❌ Erro ao enviar exercício:', error);
    return null;
  }
}

// =============================================
// FUNÇÃO PARA BUSCAR PROGRESSO
// =============================================
async function getUserProgress(): Promise<UserProgressData | null> {
  try {
    const token = localStorage.getItem('authToken') || '';
    
    const response = await fetch('/api/gamification/progress', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Erro ao buscar progresso:', error);
    return null;
  }
}

// =============================================
// DEFINIÇÃO DOS INTERVALOS POR DIFICULDADE
// =============================================
const intervalsByDifficulty = {
  beginner: [
    { name: 'Segunda menor', semitones: 1, displayName: 'Segunda menor (1 semitom)' },
    { name: 'Segunda maior', semitones: 2, displayName: 'Segunda maior (2 semitons)' },
    { name: 'Terça menor', semitones: 3, displayName: 'Terça menor (3 semitons)' },
    { name: 'Terça maior', semitones: 4, displayName: 'Terça maior (4 semitons)' },
    { name: 'Quinta justa', semitones: 7, displayName: 'Quinta justa (7 semitons)' },
    { name: 'Oitava', semitones: 12, displayName: 'Oitava (12 semitons)' }
  ],
  intermediate: [
    { name: 'Segunda menor', semitones: 1, displayName: 'Segunda menor' },
    { name: 'Segunda maior', semitones: 2, displayName: 'Segunda maior' },
    { name: 'Terça menor', semitones: 3, displayName: 'Terça menor' },
    { name: 'Terça maior', semitones: 4, displayName: 'Terça maior' },
    { name: 'Quarta justa', semitones: 5, displayName: 'Quarta justa' },
    { name: 'Trítono', semitones: 6, displayName: 'Trítono' },
    { name: 'Quinta justa', semitones: 7, displayName: 'Quinta justa' },
    { name: 'Sexta menor', semitones: 8, displayName: 'Sexta menor' },
    { name: 'Sexta maior', semitones: 9, displayName: 'Sexta maior' },
    { name: 'Sétima menor', semitones: 10, displayName: 'Sétima menor' },
    { name: 'Sétima maior', semitones: 11, displayName: 'Sétima maior' },
    { name: 'Oitava', semitones: 12, displayName: 'Oitava' }
  ],
  advanced: [
    { name: 'Segunda menor', semitones: 1, displayName: 'Segunda menor' },
    { name: 'Segunda maior', semitones: 2, displayName: 'Segunda maior' },
    { name: 'Terça menor', semitones: 3, displayName: 'Terça menor' },
    { name: 'Terça maior', semitones: 4, displayName: 'Terça maior' },
    { name: 'Quarta justa', semitones: 5, displayName: 'Quarta justa' },
    { name: 'Trítono', semitones: 6, displayName: 'Trítono' },
    { name: 'Quinta justa', semitones: 7, displayName: 'Quinta justa' },
    { name: 'Sexta menor', semitones: 8, displayName: 'Sexta menor' },
    { name: 'Sexta maior', semitones: 9, displayName: 'Sexta maior' },
    { name: 'Sétima menor', semitones: 10, displayName: 'Sétima menor' },
    { name: 'Sétima maior', semitones: 11, displayName: 'Sétima maior' },
    { name: 'Oitava', semitones: 12, displayName: 'Oitava' },
    { name: 'Nona menor', semitones: 13, displayName: 'Nona menor' },
    { name: 'Nona maior', semitones: 14, displayName: 'Nona maior' }
  ]
};

interface MelodicIntervalExerciseProps {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  onComplete?: (result: {
    correct: boolean;
    userAnswer: string;
    expected: string;
    timeSpent: number;
  }) => void;
}

const MelodicIntervalExercise: React.FC<MelodicIntervalExerciseProps> = ({
  difficulty,
  onComplete
}) => {
  // Estados do exercício
  const [currentInterval, setCurrentInterval] = useState<{
    name: string;
    semitones: number;
    displayName: string;
  } | null>(null);

  const [baseNote, setBaseNote] = useState<number>(60); // C4
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPianoReady, setIsPianoReady] = useState<boolean>(false);

  // Estados para backend
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [backendResult, setBackendResult] = useState<ExerciseSubmissionResult | null>(null);
  
  // Estado para progresso do usuário
  const [userProgress, setUserProgress] = useState<UserProgressData | null>(null);

  const availableIntervals = useMemo(
    () => intervalsByDifficulty[difficulty] || [],
    [difficulty]
  );

  // Buscar progresso inicial
  useEffect(() => {
    const fetchProgress = async () => {
      const progress = await getUserProgress();
      if (progress) {
        setUserProgress(progress);
        console.log('📊 Progresso carregado:', progress);
      }
    };
    
    fetchProgress();
  }, []);

  // Verificar se piano está pronto
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 100;
    
    const checkPianoReady = () => {
      if (typeof window !== 'undefined' && typeof window.playPianoNote === 'function') {
        console.log('✅ Piano ready detectado!');
        setIsPianoReady(true);
        return;
      }
      
      attempts++;
      if (attempts < maxAttempts) {
        const delay = attempts < 20 ? 100 : attempts < 50 ? 200 : 500;
        setTimeout(checkPianoReady, delay);
      } else {
        console.warn('⚠️ Piano não ficou pronto após várias tentativas');
      }
    };
    
    checkPianoReady();
  }, []);

  // Funções utilitárias
  const midiToFrequency = useCallback((midi: number): number => {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }, []);

  const getNoteNameFromMidi = useCallback((midiNote: number): string => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    const note = noteNames[midiNote % 12];
    return `${note}${octave}`;
  }, []);

  const playInterval = useCallback(async () => {
    if (!currentInterval || !isPianoReady) {
      console.log('🎹 Piano ainda não está pronto ou intervalo não definido');
      return;
    }

    setIsPlaying(true);

    try {
      const baseName = getNoteNameFromMidi(baseNote);
      const topName = getNoteNameFromMidi(baseNote + currentInterval.semitones);
      const baseFreq = midiToFrequency(baseNote);
      const topFreq = midiToFrequency(baseNote + currentInterval.semitones);

      console.log(`🎵 Tocando intervalo: ${baseName} → ${topName} (${currentInterval.name})`);

      const playNote = window.playPianoNote;
      const stopNote = window.stopPianoNote;

      if (typeof playNote === 'function' && typeof stopNote === 'function') {
        await playNote(baseName, baseFreq);

        setTimeout(async () => {
          const playNote2 = window.playPianoNote;
          const stopNote2 = window.stopPianoNote;
          
          if (typeof playNote2 === 'function' && typeof stopNote2 === 'function') {
            stopNote2(baseName);
            
            setTimeout(async () => {
              await playNote2(topName, topFreq);
              setTimeout(() => setIsPlaying(false), 800);
            }, 50);
          } else {
            setIsPlaying(false);
          }
        }, 1200);
      } else {
        console.error('❌ Funções do piano não estão disponíveis');
        setIsPlaying(false);
      }

    } catch (err) {
      console.error('❌ Erro ao tocar intervalo:', err);
      setIsPlaying(false);
    }
  }, [baseNote, currentInterval, getNoteNameFromMidi, midiToFrequency, isPianoReady]);

  // GERAÇÃO ALEATÓRIA CORRIGIDA
  const generateNewExercise = useCallback(() => {
    if (availableIntervals.length === 0) {
      console.warn('⚠️ Nenhum intervalo disponível para a dificuldade:', difficulty);
      return;
    }
    
    console.log(`🎲 Gerando novo exercício. Intervalos disponíveis: ${availableIntervals.length}`);
    
    // Garantir aleatoriedade real
    const randomIndex = Math.floor(Math.random() * availableIntervals.length);
    const randomInterval = availableIntervals[randomIndex];
    
    // Calcular nota base válida (evitar notas muito altas/baixas)
    const maxBaseNote = Math.min(84, 72 - randomInterval.semitones);
    const minBaseNote = Math.max(48, 36 + randomInterval.semitones);
    const randomBaseNote = minBaseNote + Math.floor(Math.random() * (maxBaseNote - minBaseNote + 1));

    console.log(`🎯 Intervalo escolhido: ${randomInterval.name} (${randomInterval.semitones} semitons)`);
    console.log(`🎹 Nota base: ${randomBaseNote} (${getNoteNameFromMidi(randomBaseNote)})`);

    setCurrentInterval(randomInterval);
    setBaseNote(randomBaseNote);
    setUserAnswer('');
    setShowResult(false);
    setStartTime(Date.now());
    setBackendResult(null);

  }, [availableIntervals, difficulty, getNoteNameFromMidi]);

  // INICIALIZAÇÃO CORRIGIDA
  useEffect(() => {
    const initTimer = setTimeout(() => {
      if (availableIntervals.length > 0) {
        console.log('🚀 Inicializando exercício...');
        generateNewExercise();
      }
    }, 500);
    
    return () => clearTimeout(initTimer);
  }, [availableIntervals, generateNewExercise]);

  // VERIFICAR RESPOSTA COM BACKEND MELHORADO
  const checkAnswer = useCallback(async () => {
    if (!currentInterval || !userAnswer) return;
    
    const correct = userAnswer === currentInterval.name;
    const timeSpent = Date.now() - startTime;

    console.log(`🔍 Verificando resposta: ${userAnswer} vs ${currentInterval.name} = ${correct ? 'CORRETO' : 'INCORRETO'}`);

    // Atualizar estado local
    setIsCorrect(correct);
    setShowResult(true);
    setTotalQuestions(prev => prev + 1);
    if (correct) {
      setScore(prev => prev + 1);
    }

    // Callback original
    if (onComplete) {
      onComplete({
        correct,
        userAnswer,
        expected: currentInterval.name,
        timeSpent
      });
    }

    // ENVIAR PARA BACKEND
    setIsSubmitting(true);
    
    const result = await submitFrontendExercise(
      'interval',
      difficulty,
      userAnswer,
      currentInterval.name,
      timeSpent,
      {
        baseNote,
        targetNote: baseNote + currentInterval.semitones,
        semitones: currentInterval.semitones,
        intervalName: currentInterval.name
      }
    );

    setIsSubmitting(false);
    setBackendResult(result);

    // Se sucesso, atualizar progresso local
    if (result?.success) {
      console.log('✅ Exercício salvo com sucesso!', result);
      
      // Recarregar progresso do usuário
      const updatedProgress = await getUserProgress();
      if (updatedProgress) {
        setUserProgress(updatedProgress);
      }
    } else {
      console.warn('⚠️ Falha ao salvar no backend, mas continuando localmente');
    }

  }, [currentInterval, userAnswer, startTime, difficulty, baseNote, onComplete]);

  const nextQuestion = useCallback(() => {
    generateNewExercise();
  }, [generateNewExercise]);

  // Loading
  if (!currentInterval) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-2xl mb-2">🎯</div>
          <div className="text-gray-600">Preparando exercício...</div>
          <div className="text-sm text-gray-500 mt-2">
            Dificuldade: {difficulty === 'beginner' ? 'Iniciante' : difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg space-y-6">
      {/* CABEÇALHO COM PROGRESSO DO USUÁRIO */}
      <div className="text-center">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Intervalos Melódicos
          </h2>
          <div className="flex gap-3 text-sm">
            {/* Pontuação local */}
            <div className="text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
              Sessão: {score}/{totalQuestions}{' '}
              {totalQuestions > 0 ? `(${Math.round((score / totalQuestions) * 100)}%)` : ''}
            </div>
            {/* Progresso global */}
            {userProgress && (
              <div className="text-blue-600 bg-blue-100 px-3 py-1 rounded-lg">
                Nível {userProgress.level} | {userProgress.experience} XP
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            <strong>Dificuldade:</strong>{' '}
            {difficulty === 'beginner' ? 'Iniciante' : difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
          </p>
          <p className="text-blue-700 text-sm mt-1">
            Ouça as duas notas em sequência (melodicamente) e identifique o intervalo. Use o piano para experimentar.
          </p>
          
          {/* Progresso nos intervalos */}
          {userProgress?.byType?.intervals && (
            <div className="mt-2 text-blue-700 text-sm">
              Intervalos completados: {userProgress.byType.intervals.completed} | 
              Média: {userProgress.byType.intervals.averageScore.toFixed(1)}%
            </div>
          )}
        </div>
      </div>

      {/* EXERCÍCIO ATUAL */}
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4">🎵 Exercício Atual</h3>
          
          {!isPianoReady && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <span>⏳</span>
                <span className="text-sm">Aguardando piano carregar...</span>
              </div>
            </div>
          )}
          
          <button
            onClick={playInterval}
            disabled={isPlaying || !isPianoReady}
            className={`w-full py-3 sm:py-4 px-6 rounded-lg font-semibold text-base sm:text-lg transition-colors ${
              isPlaying || !isPianoReady
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isPlaying ? '🎵 Tocando...' : !isPianoReady ? '⏳ Aguardando piano...' : '🎵 Tocar Intervalo Melódico'}
          </button>
          <div className="mt-3 text-center text-sm text-gray-600">
            Clique para ouvir o intervalo (primeira nota → segunda nota em sequência)
          </div>
        </div>

        {/* OPÇÕES DE RESPOSTA */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Qual intervalo melódico você ouviu?</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableIntervals.map((interval) => (
              <button
                key={interval.name}
                onClick={() => setUserAnswer(interval.name)}
                disabled={showResult}
                className={`p-3 sm:p-4 rounded-lg text-left transition-colors ${
                  showResult
                    ? 'opacity-50 cursor-not-allowed'
                    : userAnswer === interval.name
                    ? 'bg-indigo-100 border-2 border-indigo-500 text-indigo-800'
                    : 'bg-gray-100 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                {interval.displayName}
              </button>
            ))}
          </div>
        </div>

        {/* BOTÃO CONFIRMAR */}
        {userAnswer && !showResult && (
          <button
            onClick={checkAnswer}
            disabled={isSubmitting}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
              isSubmitting
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isSubmitting ? '⏳ Salvando...' : '✅ Confirmar Resposta'}
          </button>
        )}

        {/* RESULTADO COM GAMIFICAÇÃO */}
        {showResult && (
          <div className="space-y-3">
            {/* Resultado básico */}
            <div className={`p-4 rounded-lg ${
              isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrect ? '✅ Correto!' : '❌ Incorreto'}
              </div>
              <div className={`text-sm mt-1 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect
                  ? `Muito bem! Era realmente ${currentInterval.displayName}.`
                  : `A resposta correta era: ${currentInterval.displayName}`}
              </div>
            </div>

            {/* FEEDBACK DE GAMIFICAÇÃO */}
            {backendResult?.success && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-blue-800 font-medium">
                  {backendResult.message}
                </div>
                
                {/* XP e Level Up */}
                <div className="flex gap-4 mt-2 text-sm text-blue-700">
                  <span>+{backendResult.experienceGained} XP</span>
                  <span>Total: {backendResult.totalExperience} XP</span>
                  <span>Nível: {backendResult.currentLevel}</span>
                </div>
                
                {/* Level Up */}
                {backendResult.levelUp && (
                  <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 font-medium">
                    🎉 Level Up! Você chegou ao nível {backendResult.currentLevel}!
                  </div>
                )}
                
                {/* Novos achievements */}
                {backendResult.newAchievements && backendResult.newAchievements.length > 0 && (
                  <div className="mt-2 p-2 bg-purple-100 border border-purple-300 rounded text-purple-800">
                    🏆 Novo achievement desbloqueado!
                  </div>
                )}
              </div>
            )}

            <button
              onClick={nextQuestion}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              ➡️ Próximo Exercício
            </button>
          </div>
        )}

        {/* Piano */}
        <div className="border-t border-gray-200 pt-6">
          <BeautifulPianoKeyboard />
        </div>
      </div>
    </div>
  );
};

export default MelodicIntervalExercise;