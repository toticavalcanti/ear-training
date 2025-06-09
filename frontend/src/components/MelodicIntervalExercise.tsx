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

// ✅ NOVO: Interface para métricas detalhadas de engajamento
interface EngagementMetrics {
  basePoints: number;
  correctnessBonus: number;
  thoughtfulnessBonus: number;
  improvementBonus: number;
  participationBonus: number;
  recoveryBonus: number;
  totalPoints: number;
  feedback: string[];
  encouragement: string;
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

  // ✅ NOVOS ESTADOS para métricas de engajamento
  const [sessionHistory, setSessionHistory] = useState<Array<{
    correct: boolean;
    timeSpent: number;
    difficulty: number;
    timestamp: number;
  }>>([]);
  const [currentEngagement, setCurrentEngagement] = useState<EngagementMetrics | null>(null);
  const [consecutiveErrors, setConsecutiveErrors] = useState<number>(0);
  const [lastAccuracyTrend, setLastAccuracyTrend] = useState<number[]>([]);

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

  // ✅ NOVO: Sistema de Pontuação Engajante
  const calculateEngagementScore = useCallback((
    correct: boolean,
    timeSpent: number,
    intervalDifficulty: number
  ): EngagementMetrics => {
    const feedback: string[] = [];
    
    // 1. PONTOS BASE - Todos sempre ganham algo
    const basePoints = Math.round(20 * intervalDifficulty); // 20-40 pontos base
    feedback.push(`+${basePoints} pontos base`);

    // 2. BONUS DE CORREÇÃO - Não é tudo ou nada
    let correctnessBonus = 0;
    if (correct) {
      correctnessBonus = Math.round(30 * intervalDifficulty);
      feedback.push(`+${correctnessBonus} pontos por acerto!`);
    } else {
      // ✅ Ainda ganha alguma coisa por tentar
      correctnessBonus = Math.round(5 * intervalDifficulty);
      feedback.push(`+${correctnessBonus} pontos por tentativa`);
    }

    // 3. BONUS DE REFLEXÃO - Encoraja análise cuidadosa
    let thoughtfulnessBonus = 0;
    const idealTime = 8; // 8 segundos = tempo ideal para análise
    const timeRatio = timeSpent / idealTime;
    
    if (timeSpent < 3) {
      // Muito rápido = provável chute
      thoughtfulnessBonus = 0;
      feedback.push(`⚡ Resposta muito rápida - tente refletir mais`);
    } else if (timeSpent >= 3 && timeSpent <= 15) {
      // Tempo bom de análise
      thoughtfulnessBonus = Math.round(15 * intervalDifficulty * Math.min(1, timeRatio));
      feedback.push(`+${thoughtfulnessBonus} pontos por análise cuidadosa`);
    } else {
      // Tempo excessivo, mas ainda positivo
      thoughtfulnessBonus = Math.round(5 * intervalDifficulty);
      feedback.push(`+${thoughtfulnessBonus} pontos por persistência`);
    }

    // 4. BONUS DE MELHORIA - Recompensa progresso
    let improvementBonus = 0;
    if (sessionHistory.length >= 3) {
      const recent = sessionHistory.slice(-3);
      const recentAccuracy = recent.filter(h => h.correct).length / recent.length;
      const previousAccuracy = lastAccuracyTrend.length > 0 ? lastAccuracyTrend[lastAccuracyTrend.length - 1] : 0;
      
      if (recentAccuracy > previousAccuracy) {
        improvementBonus = Math.round(20 * intervalDifficulty);
        feedback.push(`+${improvementBonus} pontos por melhoria!`);
      }
    }

    // 5. BONUS DE PARTICIPAÇÃO - Encoraja prática
    const participationBonus = Math.round(10 * intervalDifficulty);
    feedback.push(`+${participationBonus} pontos por participação`);

    // 6. BONUS DE RECUPERAÇÃO - Recovery mechanics
    let recoveryBonus = 0;
    if (!correct && consecutiveErrors >= 2) {
      // Após 2+ erros, próxima tentativa vale mais
      recoveryBonus = Math.round(15 * intervalDifficulty);
      feedback.push(`+${recoveryBonus} pontos de recuperação - não desista!`);
    } else if (correct && consecutiveErrors >= 1) {
      // Acertou após erro(s)
      recoveryBonus = Math.round(25 * intervalDifficulty * Math.min(consecutiveErrors, 3));
      feedback.push(`+${recoveryBonus} pontos por quebrar sequência de erros! 🎉`);
    }

    const totalPoints = basePoints + correctnessBonus + thoughtfulnessBonus + 
                       improvementBonus + participationBonus + recoveryBonus;

    // 7. MENSAGEM DE ENCORAJAMENTO
    let encouragement = '';
    if (correct) {
      const excellentReasons = [];
      if (thoughtfulnessBonus > 10) excellentReasons.push('análise cuidadosa');
      if (recoveryBonus > 0) excellentReasons.push('recuperação');
      if (improvementBonus > 0) excellentReasons.push('melhoria consistente');
      
      if (excellentReasons.length > 0) {
        encouragement = `Excelente! Destaque em: ${excellentReasons.join(', ')}`;
      } else {
        encouragement = 'Muito bem! Continue assim!';
      }
    } else {
      if (timeSpent >= 5) {
        encouragement = 'Boa análise! A prática leva à perfeição 🎯';
      } else {
        encouragement = 'Tente ouvir novamente e analise com calma 🎵';
      }
    }

    return {
      basePoints,
      correctnessBonus,
      thoughtfulnessBonus,
      improvementBonus,
      participationBonus,
      recoveryBonus,
      totalPoints,
      feedback,
      encouragement
    };
  }, [sessionHistory, consecutiveErrors, lastAccuracyTrend]);

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
    setCurrentEngagement(null);

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

  // ✅ VERIFICAR RESPOSTA COM SISTEMA DE PONTUAÇÃO ENGAJANTE
  const checkAnswer = useCallback(async () => {
    if (!currentInterval || !userAnswer) return;
    
    const correct = userAnswer === currentInterval.name;
    const timeSpent = (Date.now() - startTime) / 1000; // em segundos

    console.log(`🔍 Verificando resposta: ${userAnswer} vs ${currentInterval.name} = ${correct ? 'CORRETO' : 'INCORRETO'}`);
    console.log(`🎯 Dificuldade do intervalo: ${currentInterval.difficulty}x (${currentInterval.semitones} semitons)`);

    // ✅ CALCULAR MÉTRICAS DE ENGAJAMENTO
    const engagement = calculateEngagementScore(correct, timeSpent, currentInterval.difficulty);
    setCurrentEngagement(engagement);

    // ✅ ATUALIZAR HISTÓRICO DA SESSÃO
    const sessionEntry = {
      correct,
      timeSpent,
      difficulty: currentInterval.difficulty,
      timestamp: Date.now()
    };
    setSessionHistory(prev => [...prev, sessionEntry]);

    // ✅ ATUALIZAR CONTADORES DE ERRO/TENDÊNCIA
    if (correct) {
      setConsecutiveErrors(0);
    } else {
      setConsecutiveErrors(prev => prev + 1);
    }

    // Atualizar tendência de precisão
    if (sessionHistory.length >= 4) {
      const recent = sessionHistory.slice(-4);
      const accuracy = recent.filter(h => h.correct).length / recent.length;
      setLastAccuracyTrend(prev => [...prev.slice(-2), accuracy]);
    }

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

    // ✅ ENVIAR PARA BACKEND COM PONTUAÇÃO CUSTOMIZADA
    setIsSubmitting(true);
    setBackendError(null);
    
    try {
      console.log(`💯 Enviando dados com pontuação engajante: ${engagement.totalPoints} pontos`);

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

  }, [currentInterval, userAnswer, startTime, difficulty, onComplete, calculateEngagementScore, sessionHistory]);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 text-center max-w-xs sm:max-w-md w-full">
          <div className="text-3xl sm:text-6xl mb-3 sm:mb-4">🎯</div>
          <div className="text-gray-800 text-sm sm:text-xl font-medium mb-2">Preparando...</div>
          <div className="text-gray-600 text-xs sm:text-sm">
            {difficulty === 'beginner' ? 'Iniciante' : difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="animate-pulse bg-gray-200 h-1.5 sm:h-2 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  const intervalStats = getIntervalStats();

  return (
    <div className="min-h-screen bg-gray-50 p-1.5 sm:p-3 md:p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER COMPACTO E LIMPO */}
        <div className="bg-white rounded-lg shadow-sm mb-3 sm:mb-6 p-3 sm:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            
            {/* Título e Dificuldade */}
            <div className="text-center">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                🎵 Intervalos Melódicos
              </h1>
              <div className="flex flex-col items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-white text-xs sm:text-sm font-medium ${
                  difficulty === 'beginner' ? 'bg-green-500' :
                  difficulty === 'intermediate' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}>
                  {difficulty === 'beginner' ? 'Iniciante' : difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
                </span>
                <span className="text-gray-600 text-xs text-center max-w-xs">
                  Ouça duas notas em sequência
                </span>
              </div>
            </div>

            {/* Progresso Essencial - Só os mais importantes no mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {/* Sessão Atual */}
              <div className="bg-green-50 border border-green-200 rounded-md px-2 py-1.5 text-center">
                <div className="text-green-700 text-xs font-medium">Sessão</div>
                <div className="text-green-800 font-bold text-sm">{score}/{totalQuestions}</div>
              </div>
              
              {userProgress && (
                <>
                  {/* Nível */}
                  <div className="bg-blue-50 border border-blue-200 rounded-md px-2 py-1.5 text-center">
                    <div className="text-blue-700 text-xs font-medium">Nível</div>
                    <div className="text-blue-800 font-bold text-sm">{userProgress.currentLevel}</div>
                  </div>
                  
                  {/* Nos breakpoints maiores, mostrar mais métricas */}
                  <div className="hidden sm:block bg-purple-50 border border-purple-200 rounded-md px-2 py-1.5 text-center">
                    <div className="text-purple-700 text-xs font-medium">Precisão</div>
                    <div className="text-purple-800 font-bold text-sm">{userProgress.overallAccuracy.toFixed(0)}%</div>
                  </div>
                  
                  <div className="hidden sm:block bg-orange-50 border border-orange-200 rounded-md px-2 py-1.5 text-center">
                    <div className="text-orange-700 text-xs font-medium">Streak</div>
                    <div className="text-orange-800 font-bold text-sm">{userProgress.currentGlobalStreak}</div>
                  </div>
                  
                  <div className="hidden lg:block bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5 text-center">
                    <div className="text-gray-700 text-xs font-medium">Total</div>
                    <div className="text-gray-800 font-bold text-sm">{userProgress.totalExercises}</div>
                  </div>
                  
                  <div className="hidden lg:block bg-yellow-50 border border-yellow-200 rounded-md px-2 py-1.5 text-center">
                    <div className="text-yellow-700 text-xs font-medium">Pontos</div>
                    <div className="text-yellow-800 font-bold text-sm">{Math.floor(userProgress.totalPoints/1000)}k</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tendência da Sessão - APENAS quando há dados suficientes */}
          {sessionHistory.length >= 3 && (
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
              <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">📈 Tendência</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="text-center">
                  <div className="text-xs text-gray-600">Tempo Médio</div>
                  <div className="font-bold text-gray-800 text-sm">
                    {(sessionHistory.reduce((sum, h) => sum + h.timeSpent, 0) / sessionHistory.length).toFixed(1)}s
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600">Últimas 3</div>
                  <div className="font-bold text-gray-800 text-sm">
                    {sessionHistory.slice(-3).filter(h => h.correct).length}/3
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600">Reflexiva</div>
                  <div className="font-bold text-gray-800 text-sm">
                    {sessionHistory.filter(h => h.timeSpent >= 3 && h.timeSpent <= 15).length}/{sessionHistory.length}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* LAYOUT PRINCIPAL - 2 COLUNAS RESPONSIVAS */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* COLUNA PRINCIPAL - EXERCÍCIO (2/3 da tela) */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Player de Áudio */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="text-center">
                {!isPianoReady && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-amber-800">
                      <div className="animate-spin text-lg">⏳</div>
                      <span className="text-sm font-medium">Aguardando piano carregar...</span>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={playInterval}
                  disabled={isPlaying || !isPianoReady}
                  className={`w-full py-4 sm:py-6 px-4 sm:px-8 rounded-xl font-bold text-lg sm:text-xl transition-all ${
                    isPlaying || !isPianoReady
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                  }`}
                >
                  {isPlaying ? (
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      <div className="animate-pulse text-xl sm:text-2xl">🎵</div>
                      <span className="text-sm sm:text-base">Tocando...</span>
                    </div>
                  ) : !isPianoReady ? (
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      <div className="animate-spin text-xl sm:text-2xl">⏳</div>
                      <span className="text-sm sm:text-base">Aguardando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      <div className="text-2xl sm:text-3xl">🎵</div>
                      <span className="text-sm sm:text-base">Tocar Intervalo</span>
                    </div>
                  )}
                </button>
                
                <p className="mt-4 text-gray-600 text-sm">
                  Clique para ouvir o intervalo (primeira nota → segunda nota em sequência)
                </p>
                
                {currentInterval && (
                  <div className="mt-3 text-xs text-gray-500">
                    Dificuldade: {currentInterval.difficulty}x
                    {currentInterval.semitones > 12 && <span className="ml-2">⭐</span>}
                    <span className="ml-2">• {currentInterval.semitones} semitons</span>
                  </div>
                )}
              </div>
            </div>

            {/* Opções de Resposta */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center text-gray-800">
                Qual intervalo você ouviu?
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableIntervals.map((interval) => (
                  <button
                    key={interval.name}
                    onClick={() => setUserAnswer(interval.name)}
                    disabled={showResult}
                    className={`p-4 rounded-lg text-left transition-all ${
                      showResult
                        ? 'opacity-50 cursor-not-allowed'
                        : userAnswer === interval.name
                        ? 'bg-blue-100 border-2 border-blue-500 text-blue-900 shadow-md'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:shadow-md'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{interval.displayName}</span>
                      {interval.difficulty > 1 && (
                        <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                          {interval.difficulty}x
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Botão Confirmar */}
              {userAnswer && !showResult && (
                <button
                  onClick={checkAnswer}
                  disabled={isSubmitting}
                  className={`w-full mt-6 py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                    isSubmitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin text-xl">⏳</div>
                      <span>Salvando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <div className="text-xl">✅</div>
                      <span>Confirmar Resposta</span>
                    </div>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* COLUNA LATERAL - FEEDBACK E ESTATÍSTICAS (1/3 da tela) */}
          <div className="space-y-6">
            
            {/* Estatísticas */}
            {intervalStats && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  Estatísticas
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Total de Sessões</span>
                    <span className="font-bold">{intervalStats.totalSessions}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Precisão Média</span>
                    <span className="font-bold">{intervalStats.averageAccuracy.toFixed(1)}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Melhor Sequência</span>
                    <span className="font-bold">{intervalStats.bestStreak}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">XP Total</span>
                    <span className="font-bold text-blue-600">{intervalStats.totalXpEarned}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Feedback APENAS quando há resultado */}
            {showResult && (
              <div className="space-y-4">
                
                {/* Resultado Principal */}
                <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${
                  isCorrect ? 'border-green-500' : 'border-orange-500'
                }`}>
                  <div className={`text-center ${isCorrect ? 'text-green-800' : 'text-orange-800'}`}>
                    <div className="text-4xl mb-2">{isCorrect ? '✅' : '🎯'}</div>
                    <div className="text-xl font-bold mb-2">
                      {isCorrect ? 'Correto!' : 'Continue praticando'}
                    </div>
                    <div className="text-sm">
                      {isCorrect
                        ? `Muito bem! Era realmente ${currentInterval.displayName}.`
                        : `A resposta correta era: ${currentInterval.displayName}`}
                    </div>
                  </div>
                </div>

                {/* Pontuação Detalhada */}
                {currentEngagement && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-xl border border-purple-300">
                        <span className="text-2xl">💎</span>
                        <span className="text-purple-800 font-bold text-xl">
                          {currentEngagement.totalPoints}
                        </span>
                        <span className="text-purple-600 font-medium">pontos</span>
                      </div>
                    </div>
                    
                    {/* Breakdown dos Pontos */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                      {currentEngagement.basePoints > 0 && (
                        <div className="bg-gray-50 p-2 rounded text-center border">
                          <div className="text-sm mb-1">🏁</div>
                          <div className="text-xs text-gray-600">Base</div>
                          <div className="font-bold text-purple-700 text-sm">+{currentEngagement.basePoints}</div>
                        </div>
                      )}
                      
                      {currentEngagement.correctnessBonus > 0 && (
                        <div className="bg-gray-50 p-2 rounded text-center border">
                          <div className="text-sm mb-1">{isCorrect ? '✅' : '🎯'}</div>
                          <div className="text-xs text-gray-600">{isCorrect ? 'Acerto' : 'Tentativa'}</div>
                          <div className="font-bold text-purple-700 text-sm">+{currentEngagement.correctnessBonus}</div>
                        </div>
                      )}
                      
                      {currentEngagement.thoughtfulnessBonus > 0 && (
                        <div className="bg-gray-50 p-2 rounded text-center border">
                          <div className="text-sm mb-1">🧠</div>
                          <div className="text-xs text-gray-600">Reflexão</div>
                          <div className="font-bold text-purple-700 text-sm">+{currentEngagement.thoughtfulnessBonus}</div>
                        </div>
                      )}
                      
                      {currentEngagement.improvementBonus > 0 && (
                        <div className="bg-gray-50 p-2 rounded text-center border">
                          <div className="text-sm mb-1">📈</div>
                          <div className="text-xs text-gray-600">Melhoria</div>
                          <div className="font-bold text-purple-700 text-sm">+{currentEngagement.improvementBonus}</div>
                        </div>
                      )}
                      
                      {currentEngagement.participationBonus > 0 && (
                        <div className="bg-gray-50 p-2 rounded text-center border">
                          <div className="text-sm mb-1">🎵</div>
                          <div className="text-xs text-gray-600">Participação</div>
                          <div className="font-bold text-purple-700 text-sm">+{currentEngagement.participationBonus}</div>
                        </div>
                      )}
                      
                      {currentEngagement.recoveryBonus > 0 && (
                        <div className="bg-gray-50 p-2 rounded text-center border">
                          <div className="text-sm mb-1">🔄</div>
                          <div className="text-xs text-gray-600">Recuperação</div>
                          <div className="font-bold text-purple-700 text-sm">+{currentEngagement.recoveryBonus}</div>
                        </div>
                      )}
                    </div>
                    
                    {/* Mensagem de Encorajamento */}
                    <div className="bg-purple-50 p-3 rounded-lg text-center border border-purple-200">
                      <div className="text-purple-800 font-medium text-sm">
                        {currentEngagement.encouragement}
                      </div>
                    </div>
                  </div>
                )}

                {/* Feedback do Backend */}
                {backendResult && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center gap-2 bg-blue-100 px-3 py-2 rounded-lg border border-blue-300">
                        <span className="text-lg">💾</span>
                        <span className="text-blue-800 font-medium text-sm">Progresso salvo!</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-200">
                        <div className="text-blue-600 text-lg">⚡</div>
                        <div className="text-xs text-blue-600">XP Ganho</div>
                        <div className="font-bold text-blue-700">+{backendResult.sessionResults.xpEarned}</div>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-200">
                        <div className="text-blue-600 text-lg">💎</div>
                        <div className="text-xs text-blue-600">Pontos</div>
                        <div className="font-bold text-blue-700">+{backendResult.sessionResults.pointsEarned}</div>
                      </div>
                    </div>
                    
                    {backendResult.sessionResults.levelUp && (
                      <div className="mb-3 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-center">
                        <div className="text-xl mb-1">🎉</div>
                        <div className="text-yellow-800 font-bold text-sm">
                          Level Up! Nível {backendResult.sessionResults.newLevel}!
                        </div>
                      </div>
                    )}
                    
                    {backendResult.sessionResults.newBadges.length > 0 && (
                      <div className="p-3 bg-purple-100 border border-purple-300 rounded-lg text-center">
                        <div className="text-xl mb-1">🏆</div>
                        <div className="text-purple-800 font-bold text-sm">
                          Novo badge: {backendResult.sessionResults.newBadges[0].name}!
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Botão Próximo */}
                <button
                  onClick={nextQuestion}
                  className="w-full bg-blue-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-base sm:text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl">➡️</span>
                    <span>Próximo Exercício</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PIANO - SEÇÃO COMPACTA */}
        <div className="mt-4 sm:mt-8 bg-white rounded-lg shadow-sm p-3 sm:p-6">
          <h3 className="text-base sm:text-xl font-bold mb-2 sm:mb-4 text-center text-gray-800">
            🎹 Piano Virtual
          </h3>
          <BeautifulPianoKeyboard />
        </div>

        {/* Erro de Backend */}
        {backendError && (
          <div className="mt-3 sm:mt-6 p-2 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-yellow-800 font-medium text-xs sm:text-sm">
              ⚠️ Erro: {backendError}
            </div>
            <div className="text-xs text-yellow-700 mt-1">
              Continue praticando normalmente.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MelodicIntervalExercise;