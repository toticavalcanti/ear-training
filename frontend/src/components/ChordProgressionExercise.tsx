// src/components/ChordProgressionExercise.tsx - VERSÃO COMPLETA E CORRIGIDA
// ✅ GARANTIR que a análise harmônica use exatamente as mesmas notas MIDI do áudio
// ✅ ELIMINAR geração duplicada de acordes
// ✅ SINCRONIZAR 100% áudio, pauta e análise
// ✅ TIPAGEM TYPESCRIPT RIGOROSA - ZERO ANY

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import BeautifulPianoKeyboard from './BeautifulPianoKeyboard';
import VexFlowMusicalStaff from './VexFlowMusicalStaff';
import ChordProgressionOptions from './ChordProgressionOptions';
import { testHarmonicSystem, testBluesOnly } from '@/utils/harmonicSystemTests';
import { 
  analyzeProgression, 
  resetVoiceLeading,
  ChordAnalysis
} from './VoiceLeadingSystem';
import { createRandomizedExercise } from '@/utils/keyTransposition';

// ✅ INTERFACES PARA GAMIFICAÇÃO - SEM ANY
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
    newBadges: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      unlockedAt: string;
    }>;
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
  exerciseType: string;
  difficulty: string;
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

// ✅ INTERFACE PARA ANÁLISE HARMÔNICA (COMPATÍVEL COM VEXFLOW)
interface HarmonicAnalysis {
  symbol: string;
  degree: string;
  analysis: string;
  voicing: number[];
}

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

interface TransposedChordProgression extends ChordProgression {
  chords: string[];
}

interface ChordProgressionExerciseProps {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  onComplete?: (result: {
    correct: boolean;
    userAnswer: string;
    expected: string;
    timeSpent: number;
  }) => void;
}

// ✅ PROGRESS SERVICE COM TIPAGEM CORRETA
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
      const response = await fetch(`${this.baseUrl}/api/progress/user`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const progress = await response.json();
      return progress;

    } catch (error) {
      console.error('❌ Erro no progressService.getUserProgress:', error);
      throw error;
    }
  }

  async updateProgress(sessionResult: SessionResult): Promise<UpdateProgressResponse> {
    try {
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
      return result;

    } catch (error) {
      console.error('❌ Erro no progressService.updateProgress:', error);
      throw error;
    }
  }
}

const progressService = new ProgressService();

// ✅ FUNÇÃO PARA FORMATAR PONTOS
const formatPoints = (points: number): string => {
  if (points >= 1000000) return `${Math.floor(points/1000000)}M`;
  if (points >= 1000) return `${Math.floor(points/1000)}k`;
  return points.toString();
};

// ✅ SERVICES COM TIPAGEM CORRETA
class ChordProgressionService {
  private baseUrl: string;
  constructor() {
    this.baseUrl = 'http://localhost:5000';
  }

  async getProgressionsByDifficulty(difficulty: string): Promise<ChordProgression[]> {
    try {
      const token = localStorage.getItem('jwtToken');
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.');
      }

      const response = await fetch(`${this.baseUrl}/api/progressions?difficulty=${difficulty}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao carregar progressões');
      }
      
      const data = await response.json();
      return data.data?.progressions || [];

    } catch (error: unknown) {
      console.error('❌ Erro detalhado no serviço:', error);
      throw error;
    }
  }
}

const chordProgressionService = new ChordProgressionService();

// ✅ TIPOS PARA FUNÇÕES DO PIANO (window)
declare global {
  interface Window {
    playPianoNote?: (note: string, frequency: number) => Promise<void>;
    stopPianoNote?: (note: string) => void;
  }
}

const ChordProgressionExercise: React.FC<ChordProgressionExerciseProps> = ({
  difficulty,
  onComplete
}) => {
  // Estados principais
  const [currentProgression, setCurrentProgression] = useState<ChordProgression | null>(null);
  const [availableProgressions, setAvailableProgressions] = useState<ChordProgression[]>([]);
  const [optionsPool, setOptionsPool] = useState<TransposedChordProgression[]>([]);
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

  // Estados de transposição
  const [currentKey, setCurrentKey] = useState<string>('C');
  const [semitoneOffset, setSemitoneOffset] = useState<number>(0);
  const [transposedChords, setTransposedChords] = useState<string[]>([]);

  // Controle de velocidade
  const [playbackTempo, setPlaybackTempo] = useState<number>(60);

  // ✅ ESTADO CRÍTICO: ANÁLISE HARMÔNICA ÚNICA E CENTRALIZADA
  const [harmonicAnalysis, setHarmonicAnalysis] = useState<HarmonicAnalysis[]>([]);
  const [showHarmonicAnalysis, setShowHarmonicAnalysis] = useState<boolean>(false);

  // ✅ GAMIFICAÇÃO COM TIPAGEM CORRETA
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [backendResult, setBackendResult] = useState<UpdateProgressResponse | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [sessionHistory, setSessionHistory] = useState<Array<{
    correct: boolean;
    timeSpent: number;
    timestamp: number;
  }>>([]);

// useEffect temporário para testes (tipagem correta)
useEffect(() => {
  if (typeof window !== 'undefined') {
    // Declarar tipos para window
    (window as typeof window & {
      testHarmonicSystem: () => void;
      testBluesOnly: () => void;
    }).testHarmonicSystem = testHarmonicSystem;
    
    (window as typeof window & {
      testHarmonicSystem: () => void;
      testBluesOnly: () => void;
    }).testBluesOnly = testBluesOnly;
    
    console.log('🧪 TESTES CARREGADOS! Digite testHarmonicSystem() no console');
  }
}, []);

  // ✅ BUSCAR PROGRESSO INICIAL
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

  // ✅ FUNÇÃO CENTRAL: GERAR ANÁLISE HARMÔNICA ÚNICA
  const generateHarmonicAnalysis = useCallback((progression: ChordProgression): HarmonicAnalysis[] => {
    if (!progression) return [];

    console.log('\n🎯 === GERANDO ANÁLISE HARMÔNICA ÚNICA ===');
    console.log(`📝 Progressão: ${progression.name}`);
    console.log(`🎼 Graus: ${progression.degrees.join(' - ')}`);
    console.log(`🔑 Tonalidade: ${currentKey}`);
    console.log(`🎵 Transposição: ${semitoneOffset} semitons`);

    try {
      // ✅ USAR O SISTEMA DE VOICE LEADING PARA GERAR AS NOTAS MIDI
      resetVoiceLeading();
      const voiceLeadingAnalysis: ChordAnalysis[] = analyzeProgression(progression.degrees);
      
      console.log(`✅ VoiceLeading gerou ${voiceLeadingAnalysis.length} acordes`);

      // ✅ CONVERTER PARA FORMATO HARMONICANALYSIS
      const harmonicAnalysis: HarmonicAnalysis[] = voiceLeadingAnalysis.map((chord, index) => {
        const transposedVoicing = chord.voicing.map(midi => midi + semitoneOffset);
        const chordSymbol = transposedChords[index] || chord.symbol;

        console.log(`🎹 Acorde ${index + 1}: ${chord.degree} → ${chordSymbol}`);
        console.log(`   📊 MIDI original: [${chord.voicing.join(', ')}]`);
        console.log(`   📊 MIDI transposto: [${transposedVoicing.join(', ')}]`);

        return {
          symbol: chordSymbol,
          degree: chord.degree,
          analysis: chord.analysis,
          voicing: transposedVoicing
        };
      });

      console.log(`✅ Análise harmônica gerada: ${harmonicAnalysis.length} acordes`);
      return harmonicAnalysis;

    } catch (error) {
      console.error('❌ Erro ao gerar análise harmônica:', error);
      return [];
    }
  }, [currentKey, semitoneOffset, transposedChords]);

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

  // ✅ FUNÇÃO DE REPRODUÇÃO CORRIGIDA
  const playProgression = useCallback(async () => {
    if (!currentProgression || !isPianoReady) {
      console.log('🎹 Piano ainda não está pronto ou progressão não definida');
      return;
    }

    setIsPlaying(true);

    try {
      console.log(`🎼 === REPRODUÇÃO INICIADA ===`);
      console.log(`🎯 Progressão: ${currentProgression.name}`);
      console.log(`🔑 Tonalidade: ${currentKey}`);

      const playNote = window.playPianoNote;
      const stopNote = window.stopPianoNote;

      if (!playNote || !stopNote) {
        console.error('❌ Funções do piano não disponíveis');
        setIsPlaying(false);
        return;
      }

      // ✅ USAR A ANÁLISE HARMÔNICA ÚNICA JÁ GERADA
      let analysisToPlay = harmonicAnalysis;
      
      // Se ainda não foi gerada, gerar agora
      if (analysisToPlay.length === 0) {
        analysisToPlay = generateHarmonicAnalysis(currentProgression);
        setHarmonicAnalysis(analysisToPlay);
      }

      console.log(`🎹 Usando análise com ${analysisToPlay.length} acordes`);

      const chordDuration = (60000 / playbackTempo) * 1.5;
      const pauseBetweenChords = Math.max(50, chordDuration * 0.05);
      const noteOverlap = chordDuration * 0.92;

      const globalActiveNotes: Set<string> = new Set();

      // ✅ REPRODUÇÃO ACORDE POR ACORDE
      for (let chordIndex = 0; chordIndex < analysisToPlay.length; chordIndex++) {
        const chordAnalysis = analysisToPlay[chordIndex];
        const voicing: number[] = chordAnalysis.voicing || [60, 64, 67];

        console.log(`🎹 Tocando ${chordAnalysis.symbol}: MIDI [${voicing.join(', ')}]`);

        const orderedNotes = [...voicing]
          .map(midi => ({
            midi,
            note: getNoteNameFromMidi(midi),
            frequency: midiToFrequency(midi)
          }))
          .sort((a, b) => a.midi - b.midi);

        if (chordIndex > 0) {
          await new Promise<void>(resolve => setTimeout(resolve, pauseBetweenChords));
        }

        const notePromises: Promise<void>[] = [];

        orderedNotes.forEach((noteInfo, noteIndex) => {
          const delay = noteIndex * 8;
          
          const notePromise = new Promise<void>((resolve) => {
            setTimeout(async () => {
              try {
                await playNote(noteInfo.note, noteInfo.frequency);
                globalActiveNotes.add(noteInfo.note);
                
                setTimeout(() => {
                  try {
                    stopNote(noteInfo.note);
                    globalActiveNotes.delete(noteInfo.note);
                  } catch (stopError) {
                    console.warn(`⚠️ Erro ao parar ${noteInfo.note}:`, stopError);
                  }
                }, noteOverlap);
                
              } catch (playError) {
                console.warn(`⚠️ Erro ao tocar ${noteInfo.note}:`, playError);
              } finally {
                resolve();
              }
            }, delay);
          });
          
          notePromises.push(notePromise);
        });

        await Promise.all(notePromises);
        await new Promise<void>(resolve => setTimeout(resolve, chordDuration));
      }

      // Limpeza final
      globalActiveNotes.forEach(note => {
        try {
          stopNote(note);
        } catch (error) {
          console.warn(`⚠️ Erro na limpeza final de ${note}:`, error);
        }
      });
      globalActiveNotes.clear();

      setIsPlaying(false);
      console.log(`✅ Progressão concluída em ${currentKey}`);

    } catch (err: unknown) {
      console.error('❌ Erro ao tocar progressão:', err);
      setIsPlaying(false);
    }
  }, [currentProgression, isPianoReady, playbackTempo, currentKey, harmonicAnalysis, generateHarmonicAnalysis, getNoteNameFromMidi, midiToFrequency]);

  // ✅ VERIFICAR RESPOSTA CORRIGIDA
  const checkAnswer = useCallback(async () => {
    if (!currentProgression || !userAnswer) return;
    
    const correct = userAnswer === currentProgression.name;
    const timeSpent = (Date.now() - startTime) / 1000;

    console.log(`🔍 === VERIFICAÇÃO DE RESPOSTA ===`);
    console.log(`📝 Resposta: "${userAnswer}"`);
    console.log(`🎯 Esperado: "${currentProgression.name}"`);
    console.log(`✅ Resultado: ${correct ? 'CORRETO' : 'INCORRETO'}`);

    // ✅ HISTÓRICO DA SESSÃO
    const sessionEntry = {
      correct,
      timeSpent,
      timestamp: Date.now()
    };
    setSessionHistory(prev => [...prev, sessionEntry]);

    // ✅ GARANTIR QUE A ANÁLISE HARMÔNICA ESTÁ GERADA
    if (harmonicAnalysis.length === 0) {
      const newAnalysis = generateHarmonicAnalysis(currentProgression);
      setHarmonicAnalysis(newAnalysis);
      console.log(`🎼 Análise harmônica gerada para feedback: ${newAnalysis.length} acordes`);
    }

    setIsCorrect(correct);
    setShowResult(true);
    setShowHarmonicAnalysis(true);
    setTotalQuestions(prev => prev + 1);
    if (correct) setScore(prev => prev + 1);

    // ✅ CALLBACK ORIGINAL
    if (onComplete) {
      onComplete({
        correct,
        userAnswer,
        expected: currentProgression.name,
        timeSpent: timeSpent * 1000
      });
    }

    // ✅ GAMIFICAÇÃO COM TIPAGEM CORRETA
    setIsSubmitting(true);
    setBackendError(null);
    
    try {
      console.log(`💾 Enviando dados para backend calcular pontuação...`);

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
      console.log('✅ Exercício salvo e pontuação calculada pelo backend:', result);
      
      // Recarregar progresso do usuário
      const updatedProgress = await progressService.getUserProgress();
      setUserProgress(updatedProgress);
      
    } catch (error) {
      console.error('⚠️ Erro ao salvar progresso:', error);
      setBackendError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsSubmitting(false);
    }

  }, [currentProgression, userAnswer, startTime, harmonicAnalysis, generateHarmonicAnalysis, onComplete, difficulty]);

  // ✅ GERAR NOVO EXERCÍCIO CORRIGIDO
  const generateNewExercise = useCallback(() => {
    if (availableProgressions.length === 0) return;
    
    console.log('🎲 === GERANDO NOVO EXERCÍCIO ===');
    
    const randomIndex = Math.floor(Math.random() * availableProgressions.length);
    const selectedProgression = availableProgressions[randomIndex];
    
    const incorrectOptions = availableProgressions
      .filter((p: ChordProgression) => p._id !== selectedProgression._id && p.difficulty === difficulty)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [selectedProgression, ...incorrectOptions];
    
    const randomizedData = createRandomizedExercise(selectedProgression, allOptions);
    
    const correctTransposed = randomizedData.transposedOptions.find(
      opt => opt._id === selectedProgression._id
    );
    
    if (correctTransposed) {
      setTransposedChords(correctTransposed.chords);
    }
    
    // ✅ LIMPAR ANÁLISE ANTERIOR
    setHarmonicAnalysis([]);
    setShowHarmonicAnalysis(false);
    
    // Atualizar estados
    setCurrentProgression(selectedProgression);
    setCurrentKey(randomizedData.randomKey);
    setSemitoneOffset(randomizedData.semitoneOffset);
    setOptionsPool(randomizedData.transposedOptions);
    setUserAnswer('');
    setShowResult(false);
    setStartTime(Date.now());
    setBackendResult(null);
    setBackendError(null);
    resetVoiceLeading();
    
    console.log(`✅ Novo exercício: ${selectedProgression.name} em ${randomizedData.randomKey}`);
    
  }, [availableProgressions, difficulty]);

  const nextQuestion = useCallback(() => {
    generateNewExercise();
  }, [generateNewExercise]);

  // ✅ ATUALIZAR ANÁLISE QUANDO DADOS MUDAREM
  useEffect(() => {
    if (currentProgression && transposedChords.length > 0 && currentKey && semitoneOffset !== undefined) {
      console.log('🔄 Gerando análise harmônica para novo exercício...');
      const newAnalysis = generateHarmonicAnalysis(currentProgression);
      setHarmonicAnalysis(newAnalysis);
    }
  }, [currentProgression, transposedChords, currentKey, semitoneOffset, generateHarmonicAnalysis]);

  // Opções de exercício
  const exerciseOptions = useMemo(() => {
    if (!currentProgression || optionsPool.length < 4) return [];
    
    const options = optionsPool
      .filter((p: TransposedChordProgression) => p.difficulty === difficulty)
      .slice(0, 4);
    
    return options.sort(() => Math.random() - 0.5);
  }, [currentProgression, optionsPool, difficulty]);

  // Helper para buscar estatísticas
  const getProgressionStats = useCallback((): ExerciseStats | null => {
    if (!userProgress) return null;
    return userProgress.exerciseStats.find(stat => stat.exerciseType === 'chord-progressions') || null;
  }, [userProgress]);

  // ✅ INICIALIZAÇÃO CORRIGIDA
  useEffect(() => {
    const initializeExercise = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        let token = localStorage.getItem('token') || localStorage.getItem('jwtToken');

        if (!token) {
          const urlParams = new URLSearchParams(window.location.search);
          const urlToken = urlParams.get('token');
          
          if (urlToken) {
            localStorage.setItem('token', urlToken);
            token = urlToken;
            
            const url = new URL(window.location.href);
            url.searchParams.delete('token');
            window.history.replaceState({}, '', url.pathname);
          } else {
            throw new Error('Você precisa estar logado para acessar os exercícios.');
          }
        }

        const progressions = await chordProgressionService.getProgressionsByDifficulty(difficulty);
        
        if (!progressions || progressions.length === 0) {
          throw new Error(`Nenhuma progressão encontrada para nível ${difficulty}.`);
        }

        setAvailableProgressions(progressions);

        // Gerar primeiro exercício
        const randomIndex = Math.floor(Math.random() * progressions.length);
        const firstProgression = progressions[randomIndex];
        
        const incorrectOptions = progressions
          .filter((p: ChordProgression) => p._id !== firstProgression._id && p.difficulty === difficulty)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        
        const allOptions = [firstProgression, ...incorrectOptions];
        const randomizedData = createRandomizedExercise(firstProgression, allOptions);
        
        const correctTransposed = randomizedData.transposedOptions.find(
          opt => opt._id === firstProgression._id
        );
        
        if (correctTransposed) {
          setTransposedChords(correctTransposed.chords);
        }
        
        setCurrentProgression(firstProgression);
        setCurrentKey(randomizedData.randomKey);
        setSemitoneOffset(randomizedData.semitoneOffset);
        setOptionsPool(randomizedData.transposedOptions);
        setStartTime(Date.now());

        // Verificar piano
        const checkPiano = (): void => {
          if (window.playPianoNote && window.stopPianoNote) {
            setIsPianoReady(true);
          } else {
            setTimeout(checkPiano, 500);
          }
        };
        checkPiano();

      } catch (error: unknown) {
        console.error('❌ Erro ao inicializar exercício:', error);
        setLoadError(error instanceof Error ? error.message : 'Erro ao carregar progressões');
      } finally {
        setIsLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      initializeExercise();
    }
  }, [difficulty]);

  // Verificar piano periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPianoReady && window.playPianoNote && window.stopPianoNote) {
        setIsPianoReady(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPianoReady]);

  // ✅ ESTADOS DE CARREGAMENTO
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
          <div className="text-6xl mb-4">🎼</div>
          <div className="text-xl font-medium mb-2">Carregando progressões...</div>
          <div className="text-sm text-gray-600 mb-4">
            {difficulty === 'beginner' ? 'Iniciante' : difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
          </div>
          <div className="text-xs text-green-600 bg-green-50 rounded-lg p-3">
            ✅ Sistema com VexFlow • Áudio-visual sincronizado
          </div>
        </div>
      </div>
    );
  }

  if (loadError || !currentProgression || exerciseOptions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
          <div className="text-6xl mb-4">❌</div>
          <div className="text-xl font-medium mb-4">Erro ao carregar</div>
          <div className="text-red-600 text-sm mb-6">{loadError || 'Preparando exercício...'}</div>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🎼 Progressões Harmônicas
            </h1>
            <div className="flex flex-col items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
                difficulty === 'beginner' ? 'bg-green-500' :
                difficulty === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                {difficulty === 'beginner' ? 'Iniciante' : difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
              </span>
              <div className="text-gray-600 text-sm text-center">
                Ouça progressões harmônicas e identifique pelo nome
                <br />
                <span className="text-purple-600 font-medium">
                  🎹 Tocando em {currentKey} • VexFlow ativo
                </span>
              </div>
            </div>
          </div>

          {/* PROGRESSO DA SESSÃO */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-6 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-md px-3 py-2 text-center">
              <div className="text-green-700 text-xs font-medium">Sessão</div>
              <div className="text-green-800 font-bold">{score}/{totalQuestions}</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 text-center">
              <div className="text-blue-700 text-xs font-medium">Velocidade</div>
              <div className="text-blue-800 font-bold">{playbackTempo} BPM</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-md px-3 py-2 text-center">
              <div className="text-purple-700 text-xs font-medium">Tonalidade</div>
              <div className="text-purple-800 font-bold">{currentKey}</div>
            </div>
            {userProgress && (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2 text-center">
                  <div className="text-yellow-700 text-xs font-medium">Nível</div>
                  <div className="text-yellow-800 font-bold">{userProgress.currentLevel}</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-md px-3 py-2 text-center">
                  <div className="text-orange-700 text-xs font-medium">Pontos</div>
                  <div className="text-orange-800 font-bold">{formatPoints(userProgress.totalPoints)}</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-center">
                  <div className="text-gray-700 text-xs font-medium">Streak</div>
                  <div className="text-gray-800 font-bold">{userProgress.currentGlobalStreak}</div>
                </div>
              </>
            )}
          </div>

          {/* TENDÊNCIA DA SESSÃO */}
          {sessionHistory.length >= 3 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm font-medium text-gray-700 mb-3">📈 Tendência da Sessão</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xs text-gray-600">Tempo Médio</div>
                  <div className="font-bold text-gray-800">
                    {(sessionHistory.reduce((sum, h) => sum + h.timeSpent, 0) / sessionHistory.length).toFixed(1)}s
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600">Últimas 3</div>
                  <div className="font-bold text-gray-800">
                    {sessionHistory.slice(-3).filter(h => h.correct).length}/3
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600">Reflexiva</div>
                  <div className="font-bold text-gray-800">
                    {sessionHistory.filter(h => h.timeSpent >= 5 && h.timeSpent <= 20).length}/{sessionHistory.length}
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
            
            {/* PLAYER DE ÁUDIO */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center">
                {!isPianoReady && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-amber-800">
                      <div className="animate-spin text-lg">⏳</div>
                      <span className="text-sm font-medium">Aguardando piano carregar...</span>
                    </div>
                  </div>
                )}

                {/* Controle de Velocidade */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center justify-center gap-2">
                    <span className="text-lg">⏱️</span>
                    Velocidade de Reprodução
                  </h4>
                  
                  <div className="flex items-center gap-4 justify-center mb-3">
                    <span className="text-sm text-gray-600 font-medium">Lento</span>
                    <input
                      type="range"
                      min="40"
                      max="120"
                      step="10"
                      value={playbackTempo}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlaybackTempo(Number(e.target.value))}
                      className="flex-1 max-w-xs h-2 bg-gray-200 rounded-lg cursor-pointer"
                      disabled={isPlaying}
                    />
                    <span className="text-sm text-gray-600 font-medium">Rápido</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-sm font-bold text-blue-600">{playbackTempo} BPM</span>
                    <button
                      onClick={() => setPlaybackTempo(60)}
                      disabled={isPlaying}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 disabled:opacity-50"
                    >
                      Reset (60)
                    </button>
                  </div>
                </div>
                
                {/* BOTÃO DE REPRODUÇÃO */}
                <button
                  onClick={playProgression}
                  disabled={isPlaying || !isPianoReady}
                  className={`w-full py-6 px-8 rounded-xl font-bold text-xl transition-all ${
                    isPlaying || !isPianoReady
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                  }`}
                >
                  {isPlaying ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-pulse text-2xl">🎼</div>
                      <span>Tocando em {currentKey}... ({playbackTempo} BPM)</span>
                    </div>
                  ) : !isPianoReady ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin text-2xl">⏳</div>
                      <span>Aguardando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <div className="text-3xl">🎼</div>
                      <span>Tocar Progressão ({currentKey})</span>
                    </div>
                  )}
                </button>
                
                <p className="mt-4 text-gray-600 text-sm">
                  🎹 Ouça a progressão harmônica e identifique pelo nome
                </p>

                {sessionHistory.length >= 2 && (
                  <div className="mt-2 text-xs text-purple-600">
                    💡 Dica: Tempo ideal entre 5-20 segundos para máximo bonus de reflexão
                  </div>
                )}
              </div>
            </div>

            {/* OPÇÕES DE RESPOSTA */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <ChordProgressionOptions
                options={exerciseOptions}
                selectedAnswer={userAnswer}
                showResult={showResult}
                correctAnswer={currentProgression.name}
                onSelect={setUserAnswer}
                disabled={false}
                currentKey={currentKey}
              />

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
            
            {/* ESTATÍSTICAS */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-xl">📊</span>
                Estatísticas
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Total de Sessões</span>
                  <span className="font-bold">{getProgressionStats()?.totalSessions || 0}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Precisão Média</span>
                  <span className="font-bold">{getProgressionStats()?.averageAccuracy?.toFixed(1) || '0.0'}%</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Melhor Sequência</span>
                  <span className="font-bold">{getProgressionStats()?.bestStreak || 0}</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">XP Total</span>
                  <span className="font-bold text-purple-600">{getProgressionStats()?.totalXpEarned || 0}</span>
                </div>
              </div>
            </div>

            {/* FEEDBACK APÓS RESPONDER */}
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
                  </div>
                </div>

                {/* ANÁLISE DA PROGRESSÃO */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="text-xl">🔍</span>
                    Análise da Progressão
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                      <h5 className="font-semibold text-indigo-800 mb-2 text-center">
                        📊 Graus Harmônicos
                      </h5>
                      <div className="text-sm text-indigo-700 text-center">
                        <div className="font-mono font-bold">
                          {currentProgression.degrees.join(' - ')}
                        </div>
                        <div className="text-xs text-indigo-600 mt-1">
                          (Análise harmônica funcional)
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <h5 className="font-semibold text-green-800 mb-2 text-center">
                        🎵 Cifras em {currentKey}
                      </h5>
                      <div className="text-sm text-green-700 text-center">
                        <div className="font-mono font-bold">
                          {transposedChords.join(' - ')}
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          (Áudio sincronizado ✅)
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 text-center p-2 bg-gray-50 rounded">
                    ✅ Informações reveladas após responder • VexFlow ativo
                  </div>
                </div>

                {/* PONTUAÇÃO DO BACKEND */}
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
                  className="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl">🎲</span>
                    <span>Nova Progressão</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ✅ PAUTA MUSICAL - LARGURA TOTAL (FORA DO GRID) */}
        {showResult && showHarmonicAnalysis && harmonicAnalysis.length > 0 && (
          <div className="mt-8 -mx-4 px-4">
            <VexFlowMusicalStaff
              progression={harmonicAnalysis}
              title={`${currentProgression.name} - ${currentKey}`}
              timeSignature={currentProgression.timeSignature}
              showChordSymbols={true}
              showRomanNumerals={false}
              chordSymbols={transposedChords} // ✅ PASSAR CIFRAS CORRETAS
            />
          </div>
        )}

        {/* PIANO */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold mb-4 text-center text-gray-800">
            🎹 Piano Virtual - {currentKey}
          </h3>
          <BeautifulPianoKeyboard />
        </div>

        {/* ERRO DE BACKEND */}
        {backendError && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-yellow-800 font-medium text-sm">
              ⚠️ Erro: {backendError}
            </div>
            <div className="text-xs text-yellow-700 mt-1">
              Continue praticando normalmente. O progresso será salvo quando possível.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChordProgressionExercise;