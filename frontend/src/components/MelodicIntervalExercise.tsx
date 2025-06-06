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
// INTERFACES E TIPOS ADAPTADOS ÀS SUAS APIS
// =============================================

interface IntervalDefinition {
  name: string;
  semitones: number;
  displayName: string;
  difficulty: number;
}

// Tipos baseados nas suas APIs existentes
interface UserProgress {
  totalXp: number;
  currentLevel: number;
  xpForNextLevel: number;
  totalPoints: number;
  totalExercises: number;
  totalCorrectAnswers: number;
  overallAccuracy: number;
  currentGlobalStreak: number;
  bestGlobalStreak: number;
  lastActiveDate: Date;
  exerciseStats: ExerciseStats[];
  recentSessions: ExerciseSession[];
  badges: Badge[];
  createdAt: Date;
  updatedAt: Date;
}

interface ExerciseStats {
  exerciseType: 'melodic-intervals' | 'harmonic-intervals' | 'chord-progressions' | 'rhythmic-patterns';
  totalSessions: number;
  totalQuestions: number;
  totalCorrect: number;
  bestAccuracy: number;
  averageAccuracy: number;
  totalTimeSpent: number;
  totalPointsEarned: number;
  totalXpEarned: number;
  currentStreak: number;
  bestStreak: number;
  lastPlayed: Date;
}

interface ExerciseSession {
  exerciseType: 'melodic-intervals' | 'harmonic-intervals' | 'chord-progressions' | 'rhythmic-patterns';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  averageResponseTime: number;
  pointsEarned: number;
  xpEarned: number;
  completedAt: Date;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

interface SessionResult {
  exerciseType: string;
  difficulty: string;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  averageResponseTime: number;
}

interface UpdateProgressResponse {
  sessionResults: {
    pointsEarned: number;
    xpEarned: number;
    accuracy: number;
    levelUp: boolean;
    newLevel: number;
    newBadges: Badge[];
  };
  updatedProgress: {
    totalXp: number;
    currentLevel: number;
    totalPoints: number;
    currentGlobalStreak: number;
    overallAccuracy: number;
  };
}

// =============================================
// PROGRESS SERVICE ADAPTADO ÀS SUAS APIS
// =============================================

class ProgressService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'http://localhost:5000';
  }

  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('jwtToken') || ''
      : '';
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getUserProgress(): Promise<UserProgress> {
    try {
      console.log('📊 Buscando progresso do usuário...');
      
      const response = await fetch(`${this.baseUrl}/api/progress/user`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const progress = await response.json();
      console.log('✅ Progresso carregado:', progress);
      return progress;

    } catch (error) {
      console.error('❌ Erro no progressService.getUserProgress:', error);
      throw error;
    }
  }

  async updateProgress(sessionResult: SessionResult): Promise<UpdateProgressResponse> {
    try {
      console.log('💾 Atualizando progresso com resultado:', sessionResult);
      
      const response = await fetch(`${this.baseUrl}/api/progress/update`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(sessionResult)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Progresso atualizado:', result);
      return result;

    } catch (error) {
      console.error('❌ Erro no progressService.updateProgress:', error);
      throw error;
    }
  }
}

const progressService = new ProgressService();

// ✅ FUNÇÃO DE DIFICULDADE AGORA USADA
const getIntervalDifficulty = (semitones: number): number => {
  if (semitones <= 12) return 1; // Dentro de uma oitava = fácil
  if (semitones <= 24) return 1.5; // Segunda oitava = médio
  return 2; // Mais que duas oitavas = difícil
};

// =============================================
// ✅ DEFINIÇÃO DOS INTERVALOS COM DIFICULDADE CALCULADA
// =============================================
const intervalsByDifficulty: Record<string, IntervalDefinition[]> = {
  beginner: [
    { name: 'Segunda menor', semitones: 1, displayName: 'Segunda menor (1 semitom)', difficulty: getIntervalDifficulty(1) },
    { name: 'Segunda maior', semitones: 2, displayName: 'Segunda maior (2 semitons)', difficulty: getIntervalDifficulty(2) },
    { name: 'Terça menor', semitones: 3, displayName: 'Terça menor (3 semitons)', difficulty: getIntervalDifficulty(3) },
    { name: 'Terça maior', semitones: 4, displayName: 'Terça maior (4 semitons)', difficulty: getIntervalDifficulty(4) },
    { name: 'Quinta justa', semitones: 7, displayName: 'Quinta justa (7 semitons)', difficulty: getIntervalDifficulty(7) },
    { name: 'Oitava', semitones: 12, displayName: 'Oitava (12 semitons)', difficulty: getIntervalDifficulty(12) }
  ],
  intermediate: [
    { name: 'Segunda menor', semitones: 1, displayName: 'Segunda menor', difficulty: getIntervalDifficulty(1) },
    { name: 'Segunda maior', semitones: 2, displayName: 'Segunda maior', difficulty: getIntervalDifficulty(2) },
    { name: 'Terça menor', semitones: 3, displayName: 'Terça menor', difficulty: getIntervalDifficulty(3) },
    { name: 'Terça maior', semitones: 4, displayName: 'Terça maior', difficulty: getIntervalDifficulty(4) },
    { name: 'Quarta justa', semitones: 5, displayName: 'Quarta justa', difficulty: getIntervalDifficulty(5) },
    { name: 'Trítono', semitones: 6, displayName: 'Trítono', difficulty: getIntervalDifficulty(6) },
    { name: 'Quinta justa', semitones: 7, displayName: 'Quinta justa', difficulty: getIntervalDifficulty(7) },
    { name: 'Sexta menor', semitones: 8, displayName: 'Sexta menor', difficulty: getIntervalDifficulty(8) },
    { name: 'Sexta maior', semitones: 9, displayName: 'Sexta maior', difficulty: getIntervalDifficulty(9) },
    { name: 'Sétima menor', semitones: 10, displayName: 'Sétima menor', difficulty: getIntervalDifficulty(10) },
    { name: 'Sétima maior', semitones: 11, displayName: 'Sétima maior', difficulty: getIntervalDifficulty(11) },
    { name: 'Oitava', semitones: 12, displayName: 'Oitava', difficulty: getIntervalDifficulty(12) }
  ],
  advanced: [
    { name: 'Segunda menor', semitones: 1, displayName: 'Segunda menor', difficulty: getIntervalDifficulty(1) },
    { name: 'Segunda maior', semitones: 2, displayName: 'Segunda maior', difficulty: getIntervalDifficulty(2) },
    { name: 'Terça menor', semitones: 3, displayName: 'Terça menor', difficulty: getIntervalDifficulty(3) },
    { name: 'Terça maior', semitones: 4, displayName: 'Terça maior', difficulty: getIntervalDifficulty(4) },
    { name: 'Quarta justa', semitones: 5, displayName: 'Quarta justa', difficulty: getIntervalDifficulty(5) },
    { name: 'Trítono', semitones: 6, displayName: 'Trítono', difficulty: getIntervalDifficulty(6) },
    { name: 'Quinta justa', semitones: 7, displayName: 'Quinta justa', difficulty: getIntervalDifficulty(7) },
    { name: 'Sexta menor', semitones: 8, displayName: 'Sexta menor', difficulty: getIntervalDifficulty(8) },
    { name: 'Sexta maior', semitones: 9, displayName: 'Sexta maior', difficulty: getIntervalDifficulty(9) },
    { name: 'Sétima menor', semitones: 10, displayName: 'Sétima menor', difficulty: getIntervalDifficulty(10) },
    { name: 'Sétima maior', semitones: 11, displayName: 'Sétima maior', difficulty: getIntervalDifficulty(11) },
    { name: 'Oitava', semitones: 12, displayName: 'Oitava', difficulty: getIntervalDifficulty(12) },
    { name: 'Nona menor', semitones: 13, displayName: 'Nona menor ⭐', difficulty: getIntervalDifficulty(13) },
    { name: 'Nona maior', semitones: 14, displayName: 'Nona maior ⭐', difficulty: getIntervalDifficulty(14) }
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
  const [currentInterval, setCurrentInterval] = useState<IntervalDefinition | null>(null);
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
  const [backendResult, setBackendResult] = useState<UpdateProgressResponse | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  
  // Estado para progresso do usuário
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);

  const availableIntervals = useMemo(
    () => intervalsByDifficulty[difficulty] || [],
    [difficulty]
  );

  // Buscar progresso inicial usando progressService
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const progress = await progressService.getUserProgress();
        setUserProgress(progress);
        console.log('📊 Progresso carregado via progressService:', progress);
      } catch (error) {
        console.error('❌ Erro ao buscar progresso:', error);
        setBackendError('Erro ao carregar progresso do usuário');
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

      console.log(`🎵 Tocando intervalo: ${baseName} → ${topName} (${currentInterval.name}, dificuldade ${currentInterval.difficulty}x)`);

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

  // Geração de novo exercício
  const generateNewExercise = useCallback(() => {
    if (availableIntervals.length === 0) {
      console.warn('⚠️ Nenhum intervalo disponível para a dificuldade:', difficulty);
      return;
    }
    
    console.log(`🎲 Gerando novo exercício. Intervalos disponíveis: ${availableIntervals.length}`);
    
    const randomIndex = Math.floor(Math.random() * availableIntervals.length);
    const randomInterval = availableIntervals[randomIndex];
    
    // Calcular nota base válida
    const maxBaseNote = Math.min(84, 72 - randomInterval.semitones);
    const minBaseNote = Math.max(48, 36 + randomInterval.semitones);
    const randomBaseNote = minBaseNote + Math.floor(Math.random() * (maxBaseNote - minBaseNote + 1));

    console.log(`🎯 Intervalo escolhido: ${randomInterval.name} (${randomInterval.semitones} semitons, dificuldade ${randomInterval.difficulty}x)`);
    console.log(`🎹 Nota base: ${randomBaseNote} (${getNoteNameFromMidi(randomBaseNote)})`);

    setCurrentInterval(randomInterval);
    setBaseNote(randomBaseNote);
    setUserAnswer('');
    setShowResult(false);
    setStartTime(Date.now());
    setBackendResult(null);
    setBackendError(null);

  }, [availableIntervals, difficulty, getNoteNameFromMidi]);

  // Inicialização
  useEffect(() => {
    const initTimer = setTimeout(() => {
      if (availableIntervals.length > 0) {
        console.log('🚀 Inicializando exercício...');
        generateNewExercise();
      }
    }, 500);
    
    return () => clearTimeout(initTimer);
  }, [availableIntervals, generateNewExercise]);

  // ✅ VERIFICAR RESPOSTA COM SISTEMA DE PONTUAÇÃO
  const checkAnswer = useCallback(async () => {
    if (!currentInterval || !userAnswer) return;
    
    const correct = userAnswer === currentInterval.name;
    const timeSpent = (Date.now() - startTime) / 1000; // em segundos

    console.log(`🔍 Verificando resposta: ${userAnswer} vs ${currentInterval.name} = ${correct ? 'CORRETO' : 'INCORRETO'}`);
    console.log(`🎯 Dificuldade do intervalo: ${currentInterval.difficulty}x (${currentInterval.semitones} semitons)`);

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
        timeSpent: timeSpent * 1000 // callback espera em ms
      });
    }

    // ✅ ENVIAR PARA BACKEND VIA SUAS APIS
    setIsSubmitting(true);
    setBackendError(null);
    
    try {
      console.log(`💯 Enviando dados com dificuldade: ${currentInterval.difficulty}x`);

      const sessionData: SessionResult = {
        exerciseType: 'melodic-intervals',
        difficulty,
        totalQuestions: 1,
        correctAnswers: correct ? 1 : 0,
        timeSpent: timeSpent,
        averageResponseTime: timeSpent
      };

      const result = await progressService.updateProgress(sessionData);
      setBackendResult(result);
      console.log('✅ Exercício salvo via suas APIs!', result);
      
      // Recarregar progresso do usuário
      const updatedProgress = await progressService.getUserProgress();
      setUserProgress(updatedProgress);
      
    } catch (error) {
      console.error('⚠️ Erro ao salvar progresso:', error);
      setBackendError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsSubmitting(false);
    }

  }, [currentInterval, userAnswer, startTime, difficulty, onComplete]);

  const nextQuestion = useCallback(() => {
    generateNewExercise();
  }, [generateNewExercise]);

  // Helper para buscar estatísticas de intervalos
  const getIntervalStats = useCallback(() => {
    if (!userProgress) return null;
    return userProgress.exerciseStats.find(stat => stat.exerciseType === 'melodic-intervals');
  }, [userProgress]);

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

  const intervalStats = getIntervalStats();

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
                Nível {userProgress.currentLevel} | {userProgress.totalXp} XP
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
          {userProgress && (
            <div className="mt-2 text-blue-700 text-sm">
              Total de exercícios: {userProgress.totalExercises} | 
              Precisão geral: {userProgress.overallAccuracy.toFixed(1)}% |
              Streak: {userProgress.currentGlobalStreak}
              {intervalStats && (
                <span> | Intervalos: {intervalStats.totalSessions} sessões, {intervalStats.averageAccuracy.toFixed(1)}% precisão</span>
              )}
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
                <div className="flex justify-between items-center">
                  <span>{interval.displayName}</span>
                  {interval.difficulty > 1 && (
                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                      {interval.difficulty}x
                    </span>
                  )}
                </div>
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

        {/* RESULTADO COM FEEDBACK */}
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
              {/* Mostrar dificuldade do intervalo */}
              {currentInterval && (
                <div className="text-xs mt-2 text-gray-600">
                  <span>Dificuldade: {currentInterval.difficulty}x</span>
                  {currentInterval.semitones > 12 && <span className="ml-2">⭐ (Intervalo composto)</span>}
                  <span className="ml-2">• {currentInterval.semitones} semitons</span>
                </div>
              )}
            </div>

            {/* Feedback do backend */}
            {backendResult && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-blue-800 font-medium">
                  ✅ Progresso salvo com sucesso!
                </div>
                
                {/* XP e Level Up */}
                <div className="flex gap-4 mt-2 text-sm text-blue-700">
                  <span>+{backendResult.sessionResults.xpEarned} XP</span>
                  <span>+{backendResult.sessionResults.pointsEarned} pontos</span>
                  <span>Total: {backendResult.updatedProgress.totalXp} XP</span>
                  <span>Nível: {backendResult.updatedProgress.currentLevel}</span>
                </div>
                
                {/* Level Up */}
                {backendResult.sessionResults.levelUp && (
                  <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 font-medium">
                    🎉 Level Up! Você chegou ao nível {backendResult.sessionResults.newLevel}!
                  </div>
                )}
                
                {/* Novos badges */}
                {backendResult.sessionResults.newBadges.length > 0 && (
                  <div className="mt-2 p-2 bg-purple-100 border border-purple-300 rounded text-purple-800">
                    🏆 Novo badge desbloqueado: {backendResult.sessionResults.newBadges[0].name}!
                  </div>
                )}
              </div>
            )}

            {/* Erro ao salvar */}
            {backendError && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-yellow-800">
                  ⚠️ Erro ao salvar progresso: {backendError}
                </div>
                <div className="text-sm text-yellow-700 mt-1">
                  Você pode continuar praticando normalmente.
                </div>
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