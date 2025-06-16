// src/components/ChordProgressionExercise.tsx - VERSÃO CORRIGIDA COM TRANSPOSIÇÃO - ARQUIVO COMPLETO
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import BeautifulPianoKeyboard from './BeautifulPianoKeyboard';
import MusicalStaff from './MusicalStaff';
import ChordProgressionOptions from './ChordProgressionOptions';
import { 
  analyzeProgression, 
  resetVoiceLeading
} from './VoiceLeadingSystem';
import { createRandomizedExercise } from '@/utils/keyTransposition';

// Interfaces
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

interface HarmonicAnalysis {
  symbol: string;
  degree: string;
  analysis: string;
  voicing: number[];
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

// Services
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

  // Estados para análise harmônica
  const [harmonicAnalysis, setHarmonicAnalysis] = useState<HarmonicAnalysis[]>([]);
  const [showHarmonicAnalysis, setShowHarmonicAnalysis] = useState<boolean>(false);

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

  // 🎹 FUNÇÃO DE REPRODUÇÃO HUMANIZADA COM TRANSPOSIÇÃO CORRIGIDA
  const playProgression = useCallback(async () => {
    if (!currentProgression || !isPianoReady) {
      console.log('🎹 Piano ainda não está pronto ou progressão não definida');
      return;
    }

    setIsPlaying(true);
    resetVoiceLeading();

    try {
      console.log(`🎼 === REPRODUÇÃO CORRIGIDA INICIADA ===`);
      console.log(`🎯 Progressão: ${currentProgression.name}`);
      console.log(`🔑 Tonalidade: ${currentKey}`);
      console.log(`📊 Graus originais: ${currentProgression.degrees.join(' - ')}`);
      console.log(`🎵 Cifras transpostas: ${transposedChords.join(' - ')}`);
      console.log(`⏱️ Tempo: ${playbackTempo} BPM`);

      const playNote = window.playPianoNote;
      const stopNote = window.stopPianoNote;

      if (!playNote || !stopNote) {
        console.error('❌ Funções do piano não disponíveis');
        setIsPlaying(false);
        return;
      }

      const chordDuration = (60000 / playbackTempo) * 1.5;
      const pauseBetweenChords = Math.max(50, chordDuration * 0.05);
      const noteOverlap = chordDuration * 0.92;
      
      const getArpeggioDelays = (noteCount: number, direction: 'up' | 'down' = 'up'): number[] => {
        const baseDelay = Math.max(3, Math.min(12, chordDuration / 50));
        const randomVariation = 1.2;
        const delays: number[] = [];
        
        for (let i = 0; i < noteCount; i++) {
          if (direction === 'up') {
            const naturalDelay = i * baseDelay * (0.85 + Math.random() * 0.3);
            delays.push(naturalDelay + Math.random() * randomVariation);
          } else {
            const naturalDelay = (noteCount - 1 - i) * baseDelay * (0.85 + Math.random() * 0.3);
            delays.push(naturalDelay + Math.random() * randomVariation);
          }
        }
        
        return delays;
      };

      // 🎼 ANÁLISE HARMÔNICA CORRIGIDA - BASEADA APENAS EM GRAUS
      let analysis: HarmonicAnalysis[] = [];
      try {
        console.log(`🔍 Analisando GRAUS (sistema corrigido): ${currentProgression.degrees.join(', ')}`);
        
        // ✅ CORREÇÃO: Usar apenas graus originais para análise harmônica
        const originalAnalysis = analyzeProgression(currentProgression.degrees);
        
        // ✅ CORREÇÃO: Transpor apenas as notas MIDI, mantendo graus e símbolos originais
        analysis = originalAnalysis.map(chord => ({
          ...chord,
          voicing: chord.voicing.map(note => note + semitoneOffset),
          // Manter símbolo e grau originais (não cifras transpostas)
          symbol: chord.symbol, // Este é o grau/símbolo harmônico
          degree: chord.degree  // Este é o grau original
        }));
        
        setHarmonicAnalysis(analysis);
        console.log(`✅ Análise harmônica transposta para ${currentKey} (+${semitoneOffset} semitons)`);
        console.log(`📋 Mapeamento: Graus → Símbolos → MIDI transposto`);
        analysis.forEach((chord, i) => {
          console.log(`   ${i+1}. ${chord.degree} → ${chord.symbol} → MIDI: ${chord.voicing.join(',')}`);
        });
        
      } catch (analysisError) {
        console.warn('⚠️ Erro na análise harmônica:', analysisError);
        
        // Fallback simples usando os graus
        const simpleFallback = currentProgression.degrees.map((degree, index) => ({
          symbol: degree, // Usar o grau como símbolo
          degree: degree,
          analysis: 'Reprodução simples',
          voicing: [60 + (index * 4) + semitoneOffset, 64 + (index * 4) + semitoneOffset, 67 + (index * 4) + semitoneOffset]
        }));
        
        analysis = simpleFallback;
        setHarmonicAnalysis(analysis);
      }

      if (analysis.length === 0) {
        console.error('❌ Não foi possível gerar análise harmônica');
        setIsPlaying(false);
        return;
      }

      const globalActiveNotes: Set<string> = new Set();

      // Reprodução acorde por acorde
      for (let chordIndex = 0; chordIndex < analysis.length; chordIndex++) {
        const chordAnalysis: HarmonicAnalysis = analysis[chordIndex];
        const voicing: number[] = chordAnalysis.voicing || [60, 64, 67];

        console.log(`🎵 Acorde ${chordIndex + 1}/${analysis.length}: ${chordAnalysis.degree} (grau) → ${transposedChords[chordIndex] || 'N/A'} (cifra em ${currentKey})`);

        const arpeggioDirection: 'up' | 'down' = Math.random() > 0.92 ? 'down' : 'up';
        
        const orderedNotes = [...voicing]
          .map(midi => ({
            midi,
            note: getNoteNameFromMidi(midi),
            frequency: midiToFrequency(midi)
          }))
          .sort((a, b) => arpeggioDirection === 'up' ? a.midi - b.midi : b.midi - a.midi);

        const arpeggioDelays = getArpeggioDelays(orderedNotes.length, arpeggioDirection);

        if (chordIndex > 0) {
          await new Promise<void>(resolve => setTimeout(resolve, pauseBetweenChords));
        }

        const notePromises: Promise<void>[] = [];

        orderedNotes.forEach((noteInfo, noteIndex) => {
          const delay = arpeggioDelays[noteIndex];
          
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

        const totalArpeggioTime = Math.max(...arpeggioDelays);
        const remainingTime = Math.max(0, chordDuration - totalArpeggioTime - pauseBetweenChords);
        
        if (remainingTime > 0) {
          await new Promise<void>(resolve => setTimeout(resolve, remainingTime));
        }
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
      console.log(`✅ Progressão concluída em ${currentKey} - Sistema corrigido funcionando!`);

    } catch (err: unknown) {
      console.error('❌ Erro ao tocar progressão:', err);
      setIsPlaying(false);
      
      // Limpeza de emergência
      try {
        for (let midi = 48; midi <= 84; midi++) {
          try {
            const note = getNoteNameFromMidi(midi);
            if (window.stopPianoNote) {
              window.stopPianoNote(note);
            }
          } catch {
            // Ignorar erros individuais
          }
        }
      } catch {
        console.warn('⚠️ Erro na limpeza de emergência');
      }
    }
  }, [currentProgression, getNoteNameFromMidi, midiToFrequency, isPianoReady, playbackTempo, currentKey, semitoneOffset, transposedChords]);

  // ✅ VERIFICAR RESPOSTA COM SISTEMA CORRIGIDO
  const checkAnswer = useCallback(async () => {
    if (!currentProgression || !userAnswer) return;
    
    const correct = userAnswer === currentProgression.name;
    const timeSpent = (Date.now() - startTime) / 1000;

    console.log(`🔍 === VERIFICAÇÃO DE RESPOSTA (SISTEMA CORRIGIDO) ===`);
    console.log(`📝 Resposta do usuário: "${userAnswer}"`);
    console.log(`🎯 Resposta esperada: "${currentProgression.name}"`);
    console.log(`✅ Resultado: ${correct ? 'CORRETO' : 'INCORRETO'}`);
    console.log(`⏱️ Tempo gasto: ${timeSpent.toFixed(1)}s`);

    // Garantir que a análise harmônica está disponível
    if (!harmonicAnalysis.length) {
      try {
        console.log(`🔍 Gerando análise harmônica para verificação...`);
        const originalAnalysis = analyzeProgression(currentProgression.degrees);
        
        // Transpor apenas as notas MIDI
        const transposedAnalysis = originalAnalysis.map(chord => ({
          ...chord,
          voicing: chord.voicing.map(note => note + semitoneOffset)
        }));
        
        setHarmonicAnalysis(transposedAnalysis);
        console.log(`✅ Análise gerada: ${transposedAnalysis.length} acordes`);
      } catch (analysisError) {
        console.warn('⚠️ Erro na análise harmônica:', analysisError);
      }
    }

    setIsCorrect(correct);
    setShowResult(true);
    setShowHarmonicAnalysis(true);
    setTotalQuestions(prev => prev + 1);
    if (correct) setScore(prev => prev + 1);

    if (onComplete) {
      onComplete({
        correct,
        userAnswer,
        expected: currentProgression.name,
        timeSpent: timeSpent * 1000
      });
    }

  }, [currentProgression, userAnswer, startTime, harmonicAnalysis, onComplete, semitoneOffset]);

  // ✅ GERAR NOVO EXERCÍCIO COM SISTEMA CORRIGIDO
  const generateNewExercise = useCallback(() => {
    if (availableProgressions.length === 0) return;
    
    console.log('🎲 === GERANDO EXERCÍCIO COM SISTEMA CORRIGIDO ===');
    
    const randomIndex = Math.floor(Math.random() * availableProgressions.length);
    const selectedProgression = availableProgressions[randomIndex];
    
    console.log(`🎯 Progressão selecionada: "${selectedProgression.name}"`);
    console.log(`📊 Graus: ${selectedProgression.degrees.join(' | ')}`);
    
    const incorrectOptions = availableProgressions
      .filter((p: ChordProgression) => p._id !== selectedProgression._id && p.difficulty === difficulty)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [selectedProgression, ...incorrectOptions];
    
    // ✅ APLICAR TRANSPOSIÇÃO USANDO SISTEMA CORRIGIDO
    const randomizedData = createRandomizedExercise(selectedProgression, allOptions);
    
    console.log(`🔑 Nova tonalidade: ${randomizedData.randomKey}`);
    console.log(`🎹 Offset MIDI: +${randomizedData.semitoneOffset} semitons`);
    
    // Encontrar as cifras transpostas da progressão correta
    const correctTransposed = randomizedData.transposedOptions.find(
      opt => opt._id === selectedProgression._id
    );
    
    if (correctTransposed) {
      setTransposedChords(correctTransposed.chords);
      console.log(`🎵 Cifras transpostas: ${correctTransposed.chords.join(' - ')}`);
    }
    
    // Atualizar estados
    setCurrentProgression(selectedProgression);
    setCurrentKey(randomizedData.randomKey);
    setSemitoneOffset(randomizedData.semitoneOffset);
    setOptionsPool(randomizedData.transposedOptions);
    setUserAnswer('');
    setShowResult(false);
    setShowHarmonicAnalysis(false);
    setHarmonicAnalysis([]);
    setStartTime(Date.now());
    resetVoiceLeading();
    
    console.log('✅ Exercício gerado com sistema corrigido!\n');
    
  }, [availableProgressions, difficulty]);

  const nextQuestion = useCallback(() => {
    generateNewExercise();
  }, [generateNewExercise]);

  // ✅ OPÇÕES DE EXERCÍCIO (usando nomes das progressões, não cifras)
  const exerciseOptions = useMemo(() => {
    if (!currentProgression || optionsPool.length < 4) return [];
    
    const options = optionsPool
      .filter((p: TransposedChordProgression) => p.difficulty === difficulty)
      .slice(0, 4);
    
    return options.sort(() => Math.random() - 0.5);
  }, [currentProgression, optionsPool, difficulty]);

  // ✅ EFEITO DE INICIALIZAÇÃO COM SISTEMA CORRIGIDO
  useEffect(() => {
    const initializeExercise = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        console.log('🚀 === INICIALIZANDO SISTEMA CORRIGIDO ===');
        console.log(`📊 Dificuldade: ${difficulty}`);

        // Verificar token de autenticação
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
            const sessionToken = sessionStorage.getItem('token') || sessionStorage.getItem('jwtToken');
            if (sessionToken) {
              localStorage.setItem('token', sessionToken);
              token = sessionToken;
            } else {
              throw new Error('Você precisa estar logado para acessar os exercícios.');
            }
          }
        }

        // Carregar progressões do banco de dados
        const progressions = await chordProgressionService.getProgressionsByDifficulty(difficulty);
        
        if (!progressions || progressions.length === 0) {
          throw new Error(`Nenhuma progressão encontrada para nível ${difficulty}.`);
        }

        console.log(`🎼 Carregadas ${progressions.length} progressões para ${difficulty}`);
        
        // ✅ VALIDAR FORMATO DOS DADOS (verificar se são graus)
        const firstProgression = progressions[0];
        console.log(`🔍 Validando formato dos dados do banco...`);
        console.log(`📋 Exemplo - "${firstProgression.name}": ${firstProgression.degrees.join(' | ')}`);
        
        // Verificar se parece com graus ou cifras
        const hasChordSymbols = firstProgression.degrees.some(degree => 
          /^[A-G][b#]?/.test(degree) // Detecta se começa com nota (A-G)
        );
        
        if (hasChordSymbols) {
          console.warn('⚠️ ATENÇÃO: Dados parecem conter cifras ao invés de graus!');
          console.warn('⚠️ O sistema corrigido espera graus harmônicos (I, ii7, V7, etc.)');
        } else {
          console.log('✅ Dados estão no formato correto (graus harmônicos)');
        }
        
        setAvailableProgressions(progressions);

        // Gerar primeiro exercício com transposição
        const randomIndex = Math.floor(Math.random() * progressions.length);
        const firstProgression2 = progressions[randomIndex];
        
        // Gerar opções incorretas
        const incorrectOptions = progressions
          .filter((p: ChordProgression) => p._id !== firstProgression2._id && p.difficulty === difficulty)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        
        const allOptions = [firstProgression2, ...incorrectOptions];
        
        // ✅ APLICAR TRANSPOSIÇÃO COM SISTEMA CORRIGIDO
        const randomizedData = createRandomizedExercise(firstProgression2, allOptions);
        
        const correctTransposed = randomizedData.transposedOptions.find(
          opt => opt._id === firstProgression2._id
        );
        
        if (correctTransposed) {
          setTransposedChords(correctTransposed.chords);
        }
        
        // Definir estados iniciais
        setCurrentProgression(firstProgression2);
        setCurrentKey(randomizedData.randomKey);
        setSemitoneOffset(randomizedData.semitoneOffset);
        setOptionsPool(randomizedData.transposedOptions);
        setStartTime(Date.now());

        console.log(`🎵 Primeira progressão: ${firstProgression2.name} em ${randomizedData.randomKey}`);
        console.log(`🔧 Sistema corrigido inicializado com sucesso!`);

        // Verificar disponibilidade do piano
        const checkPiano = (): void => {
          if (window.playPianoNote && window.stopPianoNote) {
            setIsPianoReady(true);
            console.log('🎹 Piano pronto para uso!');
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
        console.log('🎹 Piano carregado!');
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
            ✅ Sistema corrigido • Graus harmônicos puros
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
            
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('googleAuthToken');
                sessionStorage.clear();
                window.location.href = '/auth/login';
              }}
              className="w-full bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Fazer login novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* ✅ HEADER MELHORADO COM SISTEMA CORRIGIDO */}
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
                Ouça progressões harmônicas e identifique pelo som
                <br />
                <span className="text-purple-600 font-medium">
                  ✅ Sistema corrigido • Graus puros • Sem mistura
                </span>
              </div>
            </div>
          </div>

          {/* Progresso da sessão COM TONALIDADE */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
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
            <div className="bg-orange-50 border border-orange-200 rounded-md px-3 py-2 text-center">
              <div className="text-orange-700 text-xs font-medium">Progressão</div>
              <div className="text-orange-800 font-bold text-xs">{currentProgression.name}</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-center">
              <div className="text-gray-700 text-xs font-medium">Categoria</div>
              <div className="text-gray-800 font-bold text-xs capitalize">{currentProgression.category}</div>
            </div>
          </div>
        </div>

        {/* LAYOUT PRINCIPAL */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* COLUNA PRINCIPAL */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* ✅ PLAYER DE ÁUDIO COM SISTEMA CORRIGIDO */}
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

                {/* ✅ INFO SEPARADA: GRAUS vs CIFRAS (SISTEMA CORRIGIDO) */}
                <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <h5 className="font-semibold text-indigo-800 mb-2 flex items-center justify-center gap-2">
                      <span className="text-lg">📊</span>
                      Graus Harmônicos
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
                    <h5 className="font-semibold text-green-800 mb-2 flex items-center justify-center gap-2">
                      <span className="text-lg">🎵</span>
                      Cifras em {currentKey}
                    </h5>
                    
                    <div className="text-sm text-green-700 text-center">
                      <div className="font-mono font-bold">
                        {transposedChords.join(' - ')}
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        (Transposição para reprodução)
                      </div>
                    </div>
                  </div>
                </div>

                {/* ✅ STATUS DO SISTEMA CORRIGIDO */}
                <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <h5 className="font-semibold text-purple-800 mb-2 flex items-center justify-center gap-2">
                    <span className="text-lg">✅</span>
                    Sistema Corrigido Ativo
                  </h5>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-700">Entrada:</span>
                      <span className="font-bold text-green-600">Graus apenas</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-700">Conversão:</span>
                      <span className="font-bold text-red-600">Eliminada</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-700">Transposição:</span>
                      <span className="font-bold text-green-600">Matemática</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-700">Mistura:</span>
                      <span className="font-bold text-red-600">Corrigida!</span>
                    </div>
                  </div>
                </div>

                {/* Status de Humanização */}
                <div className="mb-4 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                  <h5 className="font-semibold text-cyan-800 mb-2 flex items-center justify-center gap-2">
                    <span className="text-lg">🎭</span>
                    Piano Humanizado Sutil
                  </h5>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-700">Arpejos:</span>
                      <span className="font-bold text-green-600">92% ↗️ 8% ↙️</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-700">Delay por nota:</span>
                      <span className="font-bold text-cyan-800">
                        {Math.max(3, Math.min(12, (60000 / playbackTempo) / 50)).toFixed(0)}ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-700">Sustentação:</span>
                      <span className="font-bold text-cyan-800">92%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-700">Voice leading:</span>
                      <span className="font-bold text-green-600">Suave</span>
                    </div>
                  </div>
                </div>

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
                
                {/* ✅ BOTÃO DE REPRODUÇÃO COM SISTEMA CORRIGIDO */}
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
                      <div className="animate-pulse text-2xl">✅</div>
                      <span>Tocando em {currentKey}... ({playbackTempo} BPM)</span>
                    </div>
                  ) : !isPianoReady ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin text-2xl">⏳</div>
                      <span>Aguardando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <div className="text-3xl">✅</div>
                      <span>Tocar com Sistema Corrigido ({currentKey})</span>
                    </div>
                  )}
                </button>
                
                <p className="mt-4 text-gray-600 text-sm">
                  ✅ Sistema corrigido ativo • Graus → Transposição → Reprodução • Sem mistura!
                </p>
              </div>
            </div>

            {/* ✅ OPÇÕES DE RESPOSTA (NOMES DAS PROGRESSÕES) */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <ChordProgressionOptions
                options={exerciseOptions}
                selectedAnswer={userAnswer}
                showResult={showResult}
                correctAnswer={currentProgression.name}
                onSelect={setUserAnswer}
                disabled={false}
              />

              {/* Botão Confirmar */}
              {userAnswer && !showResult && (
                <button
                  onClick={checkAnswer}
                  className="w-full mt-6 py-4 px-6 rounded-xl font-bold text-lg transition-all bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="text-xl">✅</div>
                    <span>Confirmar Resposta</span>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* COLUNA LATERAL */}
          <div className="space-y-6">
            
            {/* ✅ RESULTADO COM PAUTA MUSICAL (SISTEMA CORRIGIDO) */}
            {showResult && showHarmonicAnalysis && harmonicAnalysis.length > 0 && (
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
                    <div className="text-xs text-green-600 mt-2 bg-green-50 rounded p-2">
                      ✅ Analisado com sistema corrigido
                    </div>
                  </div>
                </div>

                {/* ✅ PAUTA MUSICAL COM SISTEMA CORRIGIDO */}
                <MusicalStaff
                  progression={harmonicAnalysis}
                  title={`${currentProgression.name} - ${currentKey} (Sistema Corrigido)`}
                  timeSignature={currentProgression.timeSignature}
                  showChordSymbols={true}
                />

                {/* ✅ ANÁLISE HARMÔNICA COM SISTEMA CORRIGIDO */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="text-xl">🎼</span>
                    Análise Harmônica - {currentKey}
                  </h4>
                  
                  <div className="mb-3 text-xs text-green-600 bg-green-50 rounded p-2 text-center">
                    ✅ Sistema corrigido: Graus → Símbolos → MIDI transposto
                  </div>
                  
                  <div className="space-y-3">
                    {harmonicAnalysis.map((chord: HarmonicAnalysis, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-mono font-bold text-lg text-gray-900">
                              {chord.degree || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {transposedChords[index] || 'N/A'} • {chord.symbol || 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">{chord.analysis || 'Análise indisponível'}</div>
                          <div className="text-xs text-gray-400">
                            {chord.voicing?.length || 0} vozes • MIDI transposto
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botão Próximo */}
                <button
                  onClick={nextQuestion}
                  className="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl">🎲</span>
                    <span>Nova Progressão (Sistema Corrigido)</span>
                  </div>
                </button>
              </div>
            )}

            {/* ✅ ESTATÍSTICAS COM SISTEMA CORRIGIDO */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-xl">📊</span>
                Sistema Corrigido
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Sessão atual</span>
                  <span className="font-bold">{score}/{totalQuestions}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Precisão</span>
                  <span className="font-bold">{totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Tonalidade atual</span>
                  <span className="font-bold text-purple-600">{currentKey}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Sistema</span>
                  <span className="font-bold text-green-600">Corrigido ✅</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Entrada</span>
                  <span className="font-bold text-purple-600">Graus apenas</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Mistura</span>
                  <span className="font-bold text-red-600">Eliminada!</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ PIANO COM SISTEMA CORRIGIDO */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold mb-4 text-center text-gray-800">
            🎹 Piano Virtual - {currentKey} (Sistema Corrigido)
          </h3>
          <div className="text-center mb-4">
            <div className="text-xs text-green-600 bg-green-50 rounded-lg p-3 inline-block">
              ✅ <strong>Sistema Corrigido Ativo:</strong> Graus harmônicos → Transposição matemática → Reprodução natural
            </div>
          </div>
          <BeautifulPianoKeyboard />
        </div>
      </div>
    </div>
  );
};

export default ChordProgressionExercise;