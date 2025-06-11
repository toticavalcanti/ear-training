// src/components/ChordProgressionExercise.tsx
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
// INTERFACES PARA PROGRESSÕES HARMÔNICAS
// =============================================

interface ChordProgression {
  _id: string;
  name: string;
  degrees: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'pop' | 'jazz' | 'classical' | 'bossa' | 'modal' | 'funk' | 'rock' | 'samba' | 'mpb' | 'blues';
  mode: 'major' | 'minor';
  timeSignature: string;
  tempo: number;
  description: string;
  reference?: string;
  isActive: boolean;
}

// Interfaces de progresso (iguais aos outros exercícios)
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
    pointsBreakdown?: {
      basePoints: number;
      correctnessBonus: number;
      thoughtfulnessBonus: number;
      improvementBonus: number;
      participationBonus: number;
      recoveryBonus: number;
      difficultyMultiplier: number;
      encouragement: string;
    };
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
// PROGRESS SERVICE (mesmo dos outros exercícios)
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

// =============================================
// CHORD PROGRESSION SERVICE
// =============================================

class ChordProgressionService {
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

  async getProgressions(
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    limit: number = 20
  ): Promise<ChordProgression[]> {
    try {
      console.log(`🎼 Buscando progressões (${difficulty})...`);
      
      const response = await fetch(
        `${this.baseUrl}/api/progressions?difficulty=${difficulty}&limit=${limit}&isActive=true`,
        {
          method: 'GET',
          headers: this.getAuthHeaders()
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log(`✅ ${result.data.progressions.length} progressões carregadas`);
      return result.data.progressions;

    } catch (error) {
      console.error('❌ Erro ao buscar progressões:', error);
      throw error;
    }
  }

  async getRandomProgression(difficulty: 'beginner' | 'intermediate' | 'advanced'): Promise<ChordProgression> {
    try {
      console.log(`🎲 Buscando progressão aleatória (${difficulty})...`);
      
      const response = await fetch(
        `${this.baseUrl}/api/progressions?difficulty=${difficulty}&limit=1&random=true&isActive=true`,
        {
          method: 'GET',
          headers: this.getAuthHeaders()
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      if (result.data.progressions.length === 0) {
        throw new Error('Nenhuma progressão encontrada para esta dificuldade');
      }

      console.log('✅ Progressão aleatória carregada:', result.data.progressions[0].name);
      return result.data.progressions[0];

    } catch (error) {
      console.error('❌ Erro ao buscar progressão aleatória:', error);
      throw error;
    }
  }
}

const chordProgressionService = new ChordProgressionService();

// =============================================
// UTILITÁRIOS MUSICAIS
// =============================================

// Mapeamento de graus para acordes
const CHORD_MAPPINGS: Record<string, { notes: number[]; name: string }> = {
  // Graus básicos em C maior (MIDI numbers)
  'I': { notes: [60, 64, 67], name: 'C major' },
  'ii': { notes: [62, 65, 69], name: 'D minor' },
  'iii': { notes: [64, 67, 71], name: 'E minor' },
  'IV': { notes: [65, 69, 72], name: 'F major' },
  'V': { notes: [67, 71, 74], name: 'G major' },
  'vi': { notes: [69, 72, 76], name: 'A minor' },
  'vii°': { notes: [71, 74, 77], name: 'B diminished' },
  
  // Graus com sétimas
  'I^maj7': { notes: [60, 64, 67, 71], name: 'C major 7' },
  'ii7': { notes: [62, 65, 69, 72], name: 'D minor 7' },
  'iii7': { notes: [64, 67, 71, 74], name: 'E minor 7' },
  'IV^maj7': { notes: [65, 69, 72, 76], name: 'F major 7' },
  'V7': { notes: [67, 71, 74, 77], name: 'G dominant 7' },
  'vi7': { notes: [69, 72, 76, 79], name: 'A minor 7' },
  'vii7(b5)': { notes: [71, 74, 77, 81], name: 'B half-diminished 7' },
  
  // Dominantes secundárias
  'VI7': { notes: [69, 73, 76, 79], name: 'A dominant 7' },
  'III7': { notes: [64, 68, 71, 74], name: 'E dominant 7' },
  
  // Acordes emprestados do menor
  'iv': { notes: [65, 68, 72], name: 'F minor' },
  'bVII': { notes: [70, 74, 77], name: 'Bb major' },
  'bVI': { notes: [68, 72, 75], name: 'Ab major' },
  'bIII': { notes: [63, 67, 70], name: 'Eb major' },
  
  // Menor natural
  'i': { notes: [60, 63, 67], name: 'C minor' },
  'bII': { notes: [61, 65, 68], name: 'Db major' },
  'bV': { notes: [66, 70, 73], name: 'Gb major' },
  'v': { notes: [67, 70, 74], name: 'G minor' },
};

const formatPoints = (points: number): string => {
  if (points >= 1000000) return `${Math.floor(points/1000000)}M`;
  if (points >= 1000) return `${Math.floor(points/1000)}k`;
  return points.toString();
};

// =============================================
// COMPONENTE PRINCIPAL
// =============================================

interface ChordProgressionExerciseProps {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  onComplete?: (result: {
    correct: boolean;
    userAnswer: string;
    expected: string;
    timeSpent: number;
  }) => void;
}

const ChordProgressionExercise: React.FC<ChordProgressionExerciseProps> = ({
  difficulty,
  onComplete
}) => {
  // Estados do exercício
  const [currentProgression, setCurrentProgression] = useState<ChordProgression | null>(null);
  const [availableProgressions, setAvailableProgressions] = useState<ChordProgression[]>([]);
  const [optionsPool, setOptionsPool] = useState<ChordProgression[]>([]);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPianoReady, setIsPianoReady] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Estados do histórico da sessão
  const [sessionHistory, setSessionHistory] = useState<Array<{
    correct: boolean;
    timeSpent: number;
    timestamp: number;
  }>>([]);

  // Estados para backend
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [backendResult, setBackendResult] = useState<UpdateProgressResponse | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  
  // Estado para progresso do usuário
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);

  // ✅ DETECTAR INATIVIDADE PARA PAUSAR TIMER
  useEffect(() => {
    let pausedTime = 0;
    let isPageActive = !document.hidden;
    
    const handleBlur = () => {
      if (startTime > 0 && !showResult && pausedTime === 0) {
        pausedTime = Date.now();
        isPageActive = false;
        console.log('⏸️ Timer pausado - usuário saiu da página');
      }
    };
    
    const handleFocus = () => {
      if (pausedTime > 0 && startTime > 0) {
        const pauseDuration = Date.now() - pausedTime;
        if (pauseDuration > 2000) {
          setStartTime(prev => {
            const newStartTime = prev + pauseDuration;
            console.log(`▶️ Timer retomado - compensando ${(pauseDuration/1000).toFixed(1)}s de inatividade`);
            return newStartTime;
          });
        }
        pausedTime = 0;
        isPageActive = true;
      }
    };
    
    const handleVisibilityChange = () => {
      if (document.hidden && isPageActive) {
        handleBlur();
      } else if (!document.hidden && !isPageActive) {
        handleFocus();
      }
    };
    
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [startTime, showResult]);

  // Buscar progresso inicial
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

  // Carregar progressões do banco
  useEffect(() => {
    const loadProgressions = async () => {
      setIsLoading(true);
      setLoadError(null);
      
      try {
        const progressions = await chordProgressionService.getProgressions(difficulty, 50);
        
        if (progressions.length === 0) {
          throw new Error('Nenhuma progressão encontrada para esta dificuldade');
        }
        
        setAvailableProgressions(progressions);
        
        // Criar pool de opções para as escolhas múltiplas
        const shuffled = [...progressions].sort(() => Math.random() - 0.5);
        setOptionsPool(shuffled);
        
        console.log(`🎼 ${progressions.length} progressões carregadas para ${difficulty}`);
      } catch (error) {
        console.error('❌ Erro ao carregar progressões:', error);
        setLoadError(error instanceof Error ? error.message : 'Erro ao carregar progressões');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProgressions();
  }, [difficulty]);

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

  // ✅ TOCAR PROGRESSÃO HARMÔNICA
  const playProgression = useCallback(async () => {
    if (!currentProgression || !isPianoReady) {
      console.log('🎹 Piano ainda não está pronto ou progressão não definida');
      return;
    }

    setIsPlaying(true);

    try {
      console.log(`🎼 Tocando progressão: ${currentProgression.name}`);
      console.log(`🎵 Graus: ${currentProgression.degrees.join(' - ')}`);

      const playNote = window.playPianoNote;
      const stopNote = window.stopPianoNote;

      if (typeof playNote !== 'function' || typeof stopNote !== 'function') {
        console.error('❌ Funções do piano não estão disponíveis');
        setIsPlaying(false);
        return;
      }

      // Tocar cada acorde da progressão em sequência
      for (let i = 0; i < currentProgression.degrees.length; i++) {
        const degree = currentProgression.degrees[i];
        const chordData = CHORD_MAPPINGS[degree];
        
        if (!chordData) {
          console.warn(`⚠️ Grau não mapeado: ${degree}`);
          continue;
        }

        console.log(`🎵 Acorde ${i + 1}/${currentProgression.degrees.length}: ${degree} (${chordData.name})`);

        // Parar notas anteriores
        chordData.notes.forEach(midiNote => {
          try {
            stopNote(getNoteNameFromMidi(midiNote));
          } catch {}
        });

        // Pequena pausa entre acordes
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Tocar todas as notas do acorde simultaneamente
        const chordPromises = chordData.notes.map(midiNote => {
          const noteName = getNoteNameFromMidi(midiNote);
          const frequency = midiToFrequency(midiNote);
          return playNote(noteName, frequency);
        });

        await Promise.all(chordPromises);

        // Duração de cada acorde baseada no tempo
        const chordDuration = 60000 / currentProgression.tempo; // ms por batida
        await new Promise(resolve => setTimeout(resolve, chordDuration));

        // Parar as notas do acorde atual
        chordData.notes.forEach(midiNote => {
          try {
            stopNote(getNoteNameFromMidi(midiNote));
          } catch {}
        });
      }

      setIsPlaying(false);

    } catch (err) {
      console.error('❌ Erro ao tocar progressão:', err);
      setIsPlaying(false);
    }
  }, [currentProgression, getNoteNameFromMidi, midiToFrequency, isPianoReady]);

  // Gerar novo exercício
  const generateNewExercise = useCallback(() => {
    if (availableProgressions.length === 0) {
      console.warn('⚠️ Nenhuma progressão disponível');
      return;
    }
    
    // Escolher progressão aleatória
    const randomIndex = Math.floor(Math.random() * availableProgressions.length);
    const selectedProgression = availableProgressions[randomIndex];
    
    console.log(`🎲 Nova progressão: ${selectedProgression.name} (${selectedProgression.category})`);
    
    setCurrentProgression(selectedProgression);
    setUserAnswer('');
    setShowResult(false);
    setStartTime(Date.now());
    setBackendResult(null);
    setBackendError(null);
  }, [availableProgressions]);

  // Inicialização do exercício
  useEffect(() => {
    if (availableProgressions.length > 0 && !isLoading) {
      const initTimer = setTimeout(() => {
        console.log('🚀 Inicializando exercício de progressões...');
        generateNewExercise();
      }, 500);
      
      return () => clearTimeout(initTimer);
    }
  }, [availableProgressions, isLoading, generateNewExercise]);

  // ✅ VERIFICAR RESPOSTA
  const checkAnswer = useCallback(async () => {
    if (!currentProgression || !userAnswer) return;
    
    const correct = userAnswer === currentProgression.name;
    const timeSpent = (Date.now() - startTime) / 1000;

    console.log(`🔍 Verificando resposta: ${userAnswer} vs ${currentProgression.name} = ${correct ? 'CORRETO' : 'INCORRETO'}`);

    // Atualizar histórico da sessão
    const sessionEntry = {
      correct,
      timeSpent,
      timestamp: Date.now()
    };
    setSessionHistory(prev => [...prev, sessionEntry]);

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
        expected: currentProgression.name,
        timeSpent: timeSpent * 1000
      });
    }

    // Enviar para backend
    setIsSubmitting(true);
    setBackendError(null);
    
    try {
      const sessionData: SessionResult = {
        exerciseType: 'chord-progressions',
        difficulty,
        totalQuestions: 1,
        correctAnswers: correct ? 1 : 0,
        timeSpent: timeSpent,
        averageResponseTime: timeSpent
      };

      const result = await progressService.updateProgress(sessionData);
      setBackendResult(result);
      console.log('✅ Progresso salvo:', result);
      
      // Recarregar progresso
      const updatedProgress = await progressService.getUserProgress();
      setUserProgress(updatedProgress);
      
    } catch (error) {
      console.error('⚠️ Erro ao salvar progresso:', error);
      setBackendError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentProgression, userAnswer, startTime, difficulty, onComplete]);

  const nextQuestion = useCallback(() => {
    generateNewExercise();
  }, [generateNewExercise]);

  // Helper para buscar estatísticas
  const getProgressionStats = useCallback(() => {
    if (!userProgress) return null;
    return userProgress.exerciseStats.find(stat => stat.exerciseType === 'chord-progressions');
  }, [userProgress]);

  // Opções para escolha múltipla
  const exerciseOptions = useMemo(() => {
    if (!currentProgression || optionsPool.length < 4) return [];
    
    // Garantir que a resposta correta esteja incluída
    const options = [currentProgression];
    
    // Adicionar 3 opções incorretas da mesma dificuldade
    const incorrectOptions = optionsPool
      .filter(p => p._id !== currentProgression._id && p.difficulty === difficulty)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    options.push(...incorrectOptions);
    
    // Embaralhar as opções
    return options.sort(() => Math.random() - 0.5);
  }, [currentProgression, optionsPool, difficulty]);

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 text-center max-w-xs sm:max-w-md w-full">
          <div className="text-3xl sm:text-6xl mb-3 sm:mb-4">🎼</div>
          <div className="text-gray-800 text-sm sm:text-xl font-medium mb-2">Carregando progressões...</div>
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

  // Error
  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
          <div className="text-6xl mb-4">❌</div>
          <div className="text-gray-800 text-xl font-medium mb-4">Erro ao carregar</div>
          <div className="text-red-600 text-sm mb-6">{loadError}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!currentProgression || exerciseOptions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 text-center max-w-xs sm:max-w-md w-full">
          <div className="text-3xl sm:text-6xl mb-3 sm:mb-4">🎼</div>
          <div className="text-gray-800 text-sm sm:text-xl font-medium mb-2">Preparando...</div>
          <div className="text-gray-600 text-xs sm:text-sm">Progressões harmônicas</div>
          <div className="mt-3 sm:mt-4">
            <div className="animate-pulse bg-gray-200 h-1.5 sm:h-2 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  const progressionStats = getProgressionStats();

  return (
    <div className="min-h-screen bg-gray-50 p-1.5 sm:p-3 md:p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="bg-white rounded-lg shadow-sm mb-3 sm:mb-6 p-3 sm:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            
            {/* Título e Dificuldade */}
            <div className="text-center">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                🎼 Progressões Harmônicas
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
                  Ouça sequências de acordes e identifique a progressão
                  <br />
                  <span className="text-purple-600 font-medium">
                    {availableProgressions.length} progressões disponíveis
                  </span>
                </span>
              </div>
            </div>

            {/* Progresso */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              <div className="bg-green-50 border border-green-200 rounded-md px-2 py-1.5 text-center">
                <div className="text-green-700 text-xs font-medium">Sessão</div>
                <div className="text-green-800 font-bold text-sm">{score}/{totalQuestions}</div>
              </div>
              
              {userProgress && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-md px-2 py-1.5 text-center">
                    <div className="text-blue-700 text-xs font-medium">Nível</div>
                    <div className="text-blue-800 font-bold text-sm">{userProgress.currentLevel}</div>
                  </div>
                  
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
                    <div className="text-yellow-800 font-bold text-sm">{formatPoints(userProgress.totalPoints)}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tendência da Sessão */}
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

        {/* LAYOUT PRINCIPAL */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* COLUNA PRINCIPAL */}
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
                  onClick={playProgression}
                  disabled={isPlaying || !isPianoReady}
                  className={`w-full py-4 sm:py-6 px-4 sm:px-8 rounded-xl font-bold text-lg sm:text-xl transition-all ${
                    isPlaying || !isPianoReady
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                  }`}
                >
                  {isPlaying ? (
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      <div className="animate-pulse text-xl sm:text-2xl">🎼</div>
                      <span className="text-sm sm:text-base">Tocando progressão...</span>
                    </div>
                  ) : !isPianoReady ? (
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      <div className="animate-spin text-xl sm:text-2xl">⏳</div>
                      <span className="text-sm sm:text-base">Aguardando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      <div className="text-2xl sm:text-3xl">🎼</div>
                      <span className="text-sm sm:text-base">Tocar Progressão</span>
                    </div>
                  )}
                </button>
                
                <p className="mt-4 text-gray-600 text-sm">
                  Ouça a sequência de acordes e identifique a progressão harmônica
                </p>
                
                {currentProgression && (
                  <div className="mt-3 text-xs text-gray-500">
                    <span className="capitalize">{currentProgression.category}</span>
                    <span className="mx-2">•</span>
                    <span className="capitalize">{currentProgression.mode}</span>
                    <span className="mx-2">•</span>
                    <span>{currentProgression.timeSignature}</span>
                    <span className="mx-2">•</span>
                    <span>{currentProgression.tempo} BPM</span>
                    {currentProgression.reference && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="text-purple-600">{currentProgression.reference}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Opções de Resposta */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center text-gray-800">
                Qual progressão harmônica você ouviu?
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                {exerciseOptions.map((progression) => (
                  <button
                    key={progression._id}
                    onClick={() => setUserAnswer(progression.name)}
                    disabled={showResult}
                    className={`p-4 rounded-lg text-left transition-all ${
                      showResult
                        ? 'opacity-50 cursor-not-allowed'
                        : userAnswer === progression.name
                        ? 'bg-green-100 border-2 border-green-500 text-green-900 shadow-md'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:shadow-md'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-base mb-1">{progression.name}</div>
                        <div className="text-sm text-gray-600 mb-2">{progression.description}</div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="bg-gray-200 px-2 py-1 rounded capitalize">{progression.category}</span>
                          <span className="bg-gray-200 px-2 py-1 rounded capitalize">{progression.mode}</span>
                          <span className="bg-gray-200 px-2 py-1 rounded">{progression.degrees.join(' - ')}</span>
                        </div>
                      </div>
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

          {/* COLUNA LATERAL */}
          <div className="space-y-6">
            
            {/* Estatísticas */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-xl">📊</span>
                Estatísticas
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Total de Sessões</span>
                  <span className="font-bold">{progressionStats?.totalSessions || 0}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Precisão Média</span>
                  <span className="font-bold">{progressionStats?.averageAccuracy?.toFixed(1) || '0.0'}%</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Melhor Sequência</span>
                  <span className="font-bold">{progressionStats?.bestStreak || 0}</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">XP Total</span>
                  <span className="font-bold text-green-600">{progressionStats?.totalXpEarned || 0}</span>
                </div>
              </div>
            </div>

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
                        ? `Muito bem! Era realmente "${currentProgression.name}".`
                        : `A resposta correta era: "${currentProgression.name}"`}
                    </div>
                    {!isCorrect && currentProgression && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg text-left">
                        <div className="text-xs text-gray-600 mb-1">Progressão correta:</div>
                        <div className="font-medium text-sm mb-1">{currentProgression.name}</div>
                        <div className="text-xs text-gray-600 mb-2">{currentProgression.description}</div>
                        <div className="text-xs">
                          <span className="bg-gray-200 px-2 py-1 rounded mr-2">{currentProgression.degrees.join(' - ')}</span>
                          <span className="bg-purple-100 px-2 py-1 rounded capitalize">{currentProgression.category}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pontuação do Backend */}
                {backendResult && backendResult.sessionResults.pointsBreakdown && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-xl border border-purple-300">
                        <span className="text-2xl">💎</span>
                        <span className="text-purple-800 font-bold text-xl">
                          {backendResult.sessionResults.pointsEarned}
                        </span>
                        <span className="text-purple-600 font-medium">pontos</span>
                      </div>
                    </div>
                    
                    {/* Breakdown dos Pontos */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                      {backendResult.sessionResults.pointsBreakdown.basePoints > 0 && (
                        <div className="bg-gray-50 p-2 rounded text-center border">
                          <div className="text-sm mb-1">🏁</div>
                          <div className="text-xs text-gray-600">Base</div>
                          <div className="font-bold text-purple-700 text-sm">+{backendResult.sessionResults.pointsBreakdown.basePoints}</div>
                        </div>
                      )}
                      
                      {backendResult.sessionResults.pointsBreakdown.correctnessBonus > 0 && (
                        <div className="bg-gray-50 p-2 rounded text-center border">
                          <div className="text-sm mb-1">{isCorrect ? '✅' : '🎯'}</div>
                          <div className="text-xs text-gray-600">{isCorrect ? 'Acerto' : 'Tentativa'}</div>
                          <div className="font-bold text-purple-700 text-sm">+{backendResult.sessionResults.pointsBreakdown.correctnessBonus}</div>
                        </div>
                      )}
                      
                      {backendResult.sessionResults.pointsBreakdown.thoughtfulnessBonus > 0 && (
                        <div className="bg-gray-50 p-2 rounded text-center border">
                          <div className="text-sm mb-1">🧠</div>
                          <div className="text-xs text-gray-600">Reflexão</div>
                          <div className="font-bold text-purple-700 text-sm">+{backendResult.sessionResults.pointsBreakdown.thoughtfulnessBonus}</div>
                        </div>
                      )}
                      
                      {backendResult.sessionResults.pointsBreakdown.improvementBonus > 0 && (
                        <div className="bg-gray-50 p-2 rounded text-center border">
                          <div className="text-sm mb-1">📈</div>
                          <div className="text-xs text-gray-600">Melhoria</div>
                          <div className="font-bold text-purple-700 text-sm">+{backendResult.sessionResults.pointsBreakdown.improvementBonus}</div>
                        </div>
                      )}
                      
                      {backendResult.sessionResults.pointsBreakdown.participationBonus > 0 && (
                        <div className="bg-gray-50 p-2 rounded text-center border">
                          <div className="text-sm mb-1">🎵</div>
                          <div className="text-xs text-gray-600">Participação</div>
                          <div className="font-bold text-purple-700 text-sm">+{backendResult.sessionResults.pointsBreakdown.participationBonus}</div>
                        </div>
                      )}
                      
                      {backendResult.sessionResults.pointsBreakdown.recoveryBonus > 0 && (
                        <div className="bg-gray-50 p-2 rounded text-center border">
                          <div className="text-sm mb-1">🔄</div>
                          <div className="text-xs text-gray-600">Recuperação</div>
                          <div className="font-bold text-purple-700 text-sm">+{backendResult.sessionResults.pointsBreakdown.recoveryBonus}</div>
                        </div>
                      )}
                    </div>
                    
                    {/* Mensagem de Encorajamento */}
                    <div className="bg-purple-50 p-3 rounded-lg text-center border border-purple-200">
                      <div className="text-purple-800 font-medium text-sm">
                        {backendResult.sessionResults.pointsBreakdown.encouragement}
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
                  className="w-full bg-green-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-base sm:text-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
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

        {/* PIANO */}
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

export default ChordProgressionExercise;