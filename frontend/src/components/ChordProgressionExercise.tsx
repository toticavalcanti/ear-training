// src/components/ChordProgressionExercise.tsx - VERSÃO LIMPA CORRIGIDA
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import BeautifulPianoKeyboard from './BeautifulPianoKeyboard';
import MusicalStaff from './MusicalStaff';
import ChordProgressionOptions from './ChordProgressionOptions';
import { 
  analyzeProgression, 
  resetVoiceLeading
} from './VoiceLeadingSystem';

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
      
      // Correção: Acessar o array aninhado em "data.progressions"
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

  // 🎹 FUNÇÃO DE REPRODUÇÃO HUMANIZADA (CORRIGIDA)
  const playProgression = useCallback(async () => {
    if (!currentProgression || !isPianoReady) {
      console.log('🎹 Piano ainda não está pronto ou progressão não definida');
      return;
    }

    setIsPlaying(true);
    resetVoiceLeading();

    try {
      console.log(`🎼 Tocando progressão HUMANIZADA: ${currentProgression.name}`);
      console.log(`🎵 Graus: ${currentProgression.degrees.join(' - ')}`);
      console.log(`⏱️ Tempo: ${playbackTempo} BPM`);

      const playNote = window.playPianoNote;
      const stopNote = window.stopPianoNote;

      if (!playNote || !stopNote) {
        console.error('❌ Funções do piano não disponíveis');
        setIsPlaying(false);
        return;
      }

      // 🎯 PARÂMETROS DE HUMANIZAÇÃO SUTIL
      const chordDuration = (60000 / playbackTempo) * 1.5; // Duração total do acorde
      const pauseBetweenChords = Math.max(50, chordDuration * 0.05); // Pausa mínima entre acordes
      const noteOverlap = chordDuration * 0.92; // Notas duram 92% do tempo total (mais legato)
      
      // 🎭 HUMANIZAÇÃO SUTIL: Delays mais naturais
      const getArpeggioDelays = (noteCount: number, direction: 'up' | 'down' = 'up'): number[] => {
        const baseDelay = Math.max(3, Math.min(12, chordDuration / 50)); // 3-12ms (mais sutil)
        const randomVariation = 1.2; // Variação mínima (0-1.2ms)
        const delays: number[] = [];
        
        for (let i = 0; i < noteCount; i++) {
          if (direction === 'up') {
            // Grave → Agudo: crescimento natural mais suave
            const naturalDelay = i * baseDelay * (0.85 + Math.random() * 0.3); // 85%-115%
            delays.push(naturalDelay + Math.random() * randomVariation);
          } else {
            // Agudo → Grave: decrescimento natural
            const naturalDelay = (noteCount - 1 - i) * baseDelay * (0.85 + Math.random() * 0.3);
            delays.push(naturalDelay + Math.random() * randomVariation);
          }
        }
        
        return delays;
      };

      console.log(`🎭 Humanização SUTIL ativa:`);
      console.log(`   🎵 Duração por acorde: ${chordDuration.toFixed(0)}ms`);
      console.log(`   🎶 Delays entre notas: 3-12ms (sutil)`);
      console.log(`   🎹 Sobreposição: ${noteOverlap.toFixed(0)}ms (legato)`);
      console.log(`   🎯 Direção: 92% ↗️ / 8% ↙️`);

      // Gerar análise harmônica com voice leading
      let analysis: HarmonicAnalysis[] = [];
      try {
        analysis = analyzeProgression(currentProgression.degrees);
        setHarmonicAnalysis(analysis);
      } catch (analysisError) {
        console.warn('⚠️ Erro na análise harmônica:', analysisError);
        
        // Fallback: reprodução simples sem voice leading
        const simpleFallback = currentProgression.degrees.map((degree, index) => ({
          symbol: degree,
          degree: degree,
          analysis: 'Reprodução simples',
          voicing: [60 + (index * 4), 64 + (index * 4), 67 + (index * 4)] // C4, E4, G4 transposto
        }));
        
        analysis = simpleFallback;
        setHarmonicAnalysis(analysis);
      }

      if (analysis.length === 0) {
        console.error('❌ Não foi possível gerar análise harmônica');
        setIsPlaying(false);
        return;
      }

      // 🎼 EXECUÇÃO HUMANIZADA ACORDE POR ACORDE
      const globalActiveNotes: Set<string> = new Set(); // Controla todas as notas ativas

      for (let chordIndex = 0; chordIndex < analysis.length; chordIndex++) {
        const chordAnalysis: HarmonicAnalysis = analysis[chordIndex];
        const voicing: number[] = chordAnalysis.voicing || [60, 64, 67];

        console.log(`🎵 Acorde ${chordIndex + 1}/${analysis.length}: ${chordAnalysis.symbol}`);

        // 🎭 HUMANIZAÇÃO SUTIL: Direção mais natural
        const arpeggioDirection: 'up' | 'down' = Math.random() > 0.92 ? 'down' : 'up'; // 92% up, 8% down (mais natural)
        
        // Preparar notas ordenadas por direção
        const orderedNotes = [...voicing]
          .map(midi => ({
            midi,
            note: getNoteNameFromMidi(midi),
            frequency: midiToFrequency(midi)
          }))
          .sort((a, b) => arpeggioDirection === 'up' ? a.midi - b.midi : b.midi - a.midi);

        // Calcular delays do arpejo
        const arpeggioDelays = getArpeggioDelays(orderedNotes.length, arpeggioDirection);

        console.log(`🎭 Arpejo ${arpeggioDirection === 'up' ? '↗️ Grave→Agudo' : '↙️ Agudo→Grave'}: ${orderedNotes.map(n => n.note).join('→')}`);

        // Pausa entre acordes (mas não no primeiro)
        if (chordIndex > 0) {
          await new Promise<void>(resolve => setTimeout(resolve, pauseBetweenChords));
        }

        // 🎹 TOCAR ARPEJO HUMANIZADO
        const notePromises: Promise<void>[] = [];

        orderedNotes.forEach((noteInfo, noteIndex) => {
          const delay = arpeggioDelays[noteIndex];
          
          const notePromise = new Promise<void>((resolve) => {
            setTimeout(async () => {
              try {
                // ✅ TOCAR A NOTA
                await playNote(noteInfo.note, noteInfo.frequency);
                globalActiveNotes.add(noteInfo.note);
                
                console.log(`🎵 ▶️ ${noteInfo.note} (${noteInfo.midi}) delay: ${delay.toFixed(1)}ms`);
                
                // ⏰ PROGRAMAR PARADA DA NOTA (com overlap para sustentação)
                setTimeout(() => {
                  try {
                    stopNote(noteInfo.note);
                    globalActiveNotes.delete(noteInfo.note);
                    console.log(`🎵 ⏹️ ${noteInfo.note} (parada automática)`);
                  } catch (stopError) {
                    console.warn(`⚠️ Erro ao parar ${noteInfo.note}:`, stopError);
                  }
                }, noteOverlap); // Sustenta por 85% do tempo do acorde
                
              } catch (playError) {
                console.warn(`⚠️ Erro ao tocar ${noteInfo.note}:`, playError);
              } finally {
                resolve();
              }
            }, delay);
          });
          
          notePromises.push(notePromise);
        });

        // ⏳ AGUARDAR todas as notas do arpejo começarem
        await Promise.all(notePromises);

        // ⏳ AGUARDAR duração total do acorde (considerando o último delay)
        const totalArpeggioTime = Math.max(...arpeggioDelays);
        const remainingTime = Math.max(0, chordDuration - totalArpeggioTime - pauseBetweenChords);
        
        if (remainingTime > 0) {
          await new Promise<void>(resolve => setTimeout(resolve, remainingTime));
        }

        // 📊 LOG DO VOICE LEADING (para debug)
        if (chordIndex < analysis.length - 1) {
          const currentVoicing = voicing.map(getNoteNameFromMidi);
          const nextVoicing = analysis[chordIndex + 1].voicing.map(getNoteNameFromMidi);
          console.log(`🔄 Voice leading: ${currentVoicing.join('+')} → ${nextVoicing.join('+')}`);
        }
      }

      // 🧹 LIMPEZA FINAL: Parar todas as notas que ainda estão tocando
      console.log(`🧹 Limpeza final: ${globalActiveNotes.size} notas ativas`);
      globalActiveNotes.forEach(note => {
        try {
          stopNote(note);
          console.log(`🎵 🧹 ${note} (limpeza final)`);
        } catch (error) {
          console.warn(`⚠️ Erro na limpeza final de ${note}:`, error);
        }
      });
      globalActiveNotes.clear();

      setIsPlaying(false);
      console.log('✅ Progressão humanizada (sutil) concluída com arpejos naturais');

    } catch (err: unknown) {
      console.error('❌ Erro ao tocar progressão humanizada:', err);
      setIsPlaying(false);
      
      // 🚨 LIMPEZA DE EMERGÊNCIA
      try {
        console.log('🚨 Executando limpeza de emergência...');
        // Parar todas as notas possíveis (C3 a C6)
        for (let midi = 48; midi <= 84; midi++) {
          try {
            const note = getNoteNameFromMidi(midi);
            if (window.stopPianoNote) {
              window.stopPianoNote(note);
            }
          } catch {
            // Ignorar erros individuais de limpeza
          }
        }
        console.log('✅ Limpeza de emergência concluída');
      } catch {
        console.warn('⚠️ Erro na limpeza de emergência');
      }
    }
  }, [currentProgression, getNoteNameFromMidi, midiToFrequency, isPianoReady, playbackTempo]);

  // VERIFICAR RESPOSTA MELHORADA
  const checkAnswer = useCallback(async () => {
    if (!currentProgression || !userAnswer) return;
    
    const correct = userAnswer === currentProgression.name;
    const timeSpent = (Date.now() - startTime) / 1000;

    console.log(`🔍 Verificando: ${userAnswer} vs ${currentProgression.name} = ${correct ? 'CORRETO' : 'INCORRETO'}`);

    // Gerar análise harmônica para mostrar no resultado
    if (!harmonicAnalysis.length) {
      try {
        const analysis: HarmonicAnalysis[] = analyzeProgression(currentProgression.degrees);
        setHarmonicAnalysis(analysis);
      } catch (analysisError) {
        console.warn('⚠️ Erro na análise harmônica:', analysisError);
        // Análise harmônica será mostrada como vazia
      }
    }

    // Atualizar estados
    setIsCorrect(correct);
    setShowResult(true);
    setShowHarmonicAnalysis(true);
    setTotalQuestions(prev => prev + 1);
    if (correct) setScore(prev => prev + 1);

    // Callback original
    if (onComplete) {
      onComplete({
        correct,
        userAnswer,
        expected: currentProgression.name,
        timeSpent: timeSpent * 1000
      });
    }

  }, [currentProgression, userAnswer, startTime, harmonicAnalysis, onComplete]);

  // Gerar novo exercício
  const generateNewExercise = useCallback(() => {
    if (availableProgressions.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * availableProgressions.length);
    const selectedProgression = availableProgressions[randomIndex];
    
    console.log(`🎲 Nova progressão: ${selectedProgression.name}`);
    
    setCurrentProgression(selectedProgression);
    setUserAnswer('');
    setShowResult(false);
    setShowHarmonicAnalysis(false);
    setHarmonicAnalysis([]);
    setStartTime(Date.now());
    resetVoiceLeading();
  }, [availableProgressions]);

  const nextQuestion = useCallback(() => {
    generateNewExercise();
  }, [generateNewExercise]);

  // Opções para escolha múltipla
  const exerciseOptions = useMemo(() => {
    if (!currentProgression || optionsPool.length < 4) return [];
    
    const options = [currentProgression];
    const incorrectOptions = optionsPool
      .filter((p: ChordProgression) => p._id !== currentProgression._id && p.difficulty === difficulty)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    options.push(...incorrectOptions);
    return options.sort(() => Math.random() - 0.5);
  }, [currentProgression, optionsPool, difficulty]);

  // Effects de inicialização
  useEffect(() => {
    const initializeExercise = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        // Debug: verificar localStorage
        console.log('🔍 === INÍCIO DEBUG EXERCÍCIO ===');
        console.log('🔍 Verificando token no localStorage...');
        console.log('🔍 URL atual:', window.location.href);
        console.log('🔍 Difficulty:', difficulty);
        
        console.log('🔍 localStorage keys:', Object.keys(localStorage));
        console.log('🔍 sessionStorage keys:', Object.keys(sessionStorage));
        console.log('🔍 Cookies:', document.cookie);
        
        // Debug completo do localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            const value = localStorage.getItem(key);
            console.log(`🔍 localStorage[${key}]:`, value?.substring(0, 100));
          }
        }
        
        // Debug completo do sessionStorage
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key) {
            const value = sessionStorage.getItem(key);
            console.log(`🔍 sessionStorage[${key}]:`, value?.substring(0, 100));
          }
        }
        
        // Aguardar um pouco para garantir que a página carregou completamente
        console.log('🔍 Aguardando 100ms...');
        await new Promise(resolve => setTimeout(resolve, 100));
        
        let token = localStorage.getItem('token') || localStorage.getItem('jwtToken');
        console.log('🔍 Token (chave "token") encontrado:', localStorage.getItem('token') ? 'SIM' : 'NÃO');
        console.log('🔍 Token (chave "jwtToken") encontrado:', localStorage.getItem('jwtToken') ? 'SIM' : 'NÃO');
        console.log('🔍 Token final usado:', token ? 'SIM' : 'NÃO');
        
        if (token) {
          console.log('🔍 Token (primeiros 50 chars):', token.substring(0, 50));
        }

        if (!token) {
          // Verificar se token está na URL (redirect do login)
          const urlParams = new URLSearchParams(window.location.search);
          const urlToken = urlParams.get('token');
          
          if (urlToken) {
            console.log('✅ Token encontrado na URL, salvando...');
            localStorage.setItem('token', urlToken);
            token = urlToken;
            
            // Limpar URL
            const url = new URL(window.location.href);
            url.searchParams.delete('token');
            window.history.replaceState({}, '', url.pathname);
            
            console.log('💾 Token salvo no localStorage');
          } else {
            // Verificar se há dados de sessão no sessionStorage ou cookies
            const sessionToken = sessionStorage.getItem('token') || sessionStorage.getItem('jwtToken');
            if (sessionToken) {
              console.log('✅ Token encontrado no sessionStorage, copiando...');
              localStorage.setItem('token', sessionToken);
              token = sessionToken;
            } else {
              console.log('❌ Nenhum token encontrado em localStorage ou sessionStorage');
              throw new Error('Você precisa estar logado para acessar os exercícios. Redirecionando...');
            }
          }
        }

        console.log('🎼 Inicializando exercício de progressões harmônicas...');

        // Carregar progressões do backend
        const progressions = await chordProgressionService.getProgressionsByDifficulty(difficulty);
        
        if (!progressions || progressions.length === 0) {
          throw new Error(`Nenhuma progressão encontrada para nível ${difficulty}. Verifique se há dados no banco.`);
        }

        console.log(`🎼 Carregadas ${progressions.length} progressões para ${difficulty}`);
        setAvailableProgressions(progressions);
        setOptionsPool(progressions);

        // Gerar primeiro exercício
        const randomIndex = Math.floor(Math.random() * progressions.length);
        const firstProgression = progressions[randomIndex];
        setCurrentProgression(firstProgression);
        setStartTime(Date.now());

        console.log(`🎵 Primeira progressão: ${firstProgression.name}`);

        // Verificar se piano está pronto
        const checkPiano = (): void => {
          if (window.playPianoNote && window.stopPianoNote) {
            setIsPianoReady(true);
            console.log('🎹 Piano pronto!');
          } else {
            console.log('🎹 Aguardando piano...');
            setTimeout(checkPiano, 500);
          }
        };
        checkPiano();

      } catch (error: unknown) {
        console.error('❌ Erro ao inicializar exercício:', error);
        
        if (error instanceof Error && error.message.includes('logado')) {
          // Verificar se realmente não há token ou se é problema de API
          const tokenCheck = localStorage.getItem('token') || localStorage.getItem('jwtToken') || sessionStorage.getItem('token') || sessionStorage.getItem('jwtToken');
          if (!tokenCheck) {
            setLoadError('Redirecionando para login...');
            setTimeout(() => {
              window.location.href = '/auth/login';
            }, 2000);
          } else {
            setLoadError('Erro de autenticação. Tentando novamente...');
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        } else {
          setLoadError(error instanceof Error ? error.message : 'Erro ao carregar progressões');
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Só executar no cliente
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

  // Loading states
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
          <div className="text-6xl mb-4">🎼</div>
          <div className="text-xl font-medium mb-2">Carregando progressões...</div>
          <div className="text-sm text-gray-600">
            {difficulty === 'beginner' ? 'Iniciante' : difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
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
                // Limpar todos os dados e ir para o login
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
            
            <button
              onClick={() => {
                console.log('🔧 Informações de debug:');
                console.log('localStorage:', localStorage);
                console.log('sessionStorage:', sessionStorage);
                console.log('cookies:', document.cookie);
                
                // Mostrar informações na tela também
                const debugInfo: string[] = [];
                debugInfo.push('=== DEBUG INFO ===');
                debugInfo.push(`URL: ${window.location.href}`);
                debugInfo.push(`localStorage length: ${localStorage.length}`);
                debugInfo.push(`sessionStorage length: ${sessionStorage.length}`);
                debugInfo.push(`cookies: ${document.cookie || 'VAZIO'}`);
                
                // Mostrar todas as chaves do localStorage
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key) {
                    const value = localStorage.getItem(key);
                    debugInfo.push(`localStorage[${key}]: ${value?.substring(0, 50)}...`);
                  }
                }
                
                // Mostrar todas as chaves do sessionStorage
                for (let i = 0; i < sessionStorage.length; i++) {
                  const key = sessionStorage.key(i);
                  if (key) {
                    const value = sessionStorage.getItem(key);
                    debugInfo.push(`sessionStorage[${key}]: ${value?.substring(0, 50)}...`);
                  }
                }
                
                // Testar API diretamente
                const token = localStorage.getItem('token') || localStorage.getItem('jwtToken') || sessionStorage.getItem('token') || sessionStorage.getItem('jwtToken');
                debugInfo.push(`Token encontrado: ${token ? 'SIM' : 'NÃO'}`);
                debugInfo.push(`Token (primeiros 50 chars): ${token?.substring(0, 50)}`);
                
                if (token) {
                  debugInfo.push('Testando API...');
                  fetch('http://localhost:5000/api/progressions?difficulty=beginner', {
                    headers: { 'Authorization': `Bearer ${token}` }
                  })
                  .then(r => {
                    debugInfo.push(`API Status: ${r.status}`);
                    return r.json();
                  })
                  .then(data => {
                    debugInfo.push(`API Response: ${JSON.stringify(data).substring(0, 100)}`);
                    console.log('✅ Teste API:', data);
                  })
                  .catch(err => {
                    debugInfo.push(`API Error: ${err.message}`);
                    console.log('❌ Erro API:', err);
                  });
                }
                
                // Mostrar todas as informações em um alert
                alert(debugInfo.join('\n'));
              }}
              className="w-full bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 text-sm"
            >
              Debug no Console + Alert
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER MELHORADO */}
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
                  🎭 Piano humanizado • Voice leading otimizado
                </span>
              </div>
            </div>
          </div>

          {/* Progresso da sessão */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-md px-3 py-2 text-center">
              <div className="text-green-700 text-xs font-medium">Sessão</div>
              <div className="text-green-800 font-bold">{score}/{totalQuestions}</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 text-center">
              <div className="text-blue-700 text-xs font-medium">Velocidade</div>
              <div className="text-blue-800 font-bold">{playbackTempo} BPM</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-md px-3 py-2 text-center">
              <div className="text-purple-700 text-xs font-medium">Progressão</div>
              <div className="text-purple-800 font-bold text-xs">{currentProgression.name}</div>
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
            
            {/* PLAYER DE ÁUDIO MELHORADO */}
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

                {/* 🎭 Status de Humanização Sutil */}
                <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <h5 className="font-semibold text-purple-800 mb-2 flex items-center justify-center gap-2">
                    <span className="text-lg">🎭</span>
                    Piano Humanizado Sutil
                  </h5>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-700">Arpejos:</span>
                      <span className="font-bold text-green-600">92% ↗️ 8% ↙️</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-700">Delay por nota:</span>
                      <span className="font-bold text-purple-800">
                        {Math.max(3, Math.min(12, (60000 / playbackTempo) / 50)).toFixed(0)}ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-700">Sustentação:</span>
                      <span className="font-bold text-purple-800">92%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-700">Voice leading:</span>
                      <span className="font-bold text-green-600">Suave</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-center">
                    <span className="text-xs text-purple-600 italic">
                      🎼 Sutileza natural como pianista real
                    </span>
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
                
                {/* Botão de reprodução */}
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
                      <div className="animate-pulse text-2xl">🎭</div>
                      <span>Tocando sutilmente... ({playbackTempo} BPM)</span>
                    </div>
                  ) : !isPianoReady ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin text-2xl">⏳</div>
                      <span>Aguardando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <div className="text-3xl">🎭</div>
                      <span>Piano Humanizado Sutil ({playbackTempo} BPM)</span>
                    </div>
                  )}
                </button>
                
                <p className="mt-4 text-gray-600 text-sm">
                  🎼 Arpejos sutis (3-12ms) e legato natural como pianista real
                </p>
                
                {/* Info da progressão atual */}
                {currentProgression && (
                  <div className="mt-3 text-xs text-gray-500">
                    <span className="capitalize">{currentProgression.category}</span>
                    <span className="mx-2">•</span>
                    <span className="capitalize">{currentProgression.mode}</span>
                    <span className="mx-2">•</span>
                    <span>{currentProgression.timeSignature}</span>
                    <span className="mx-2">•</span>
                    <span className="text-purple-600">Piano sutil</span>
                  </div>
                )}
              </div>
            </div>

            {/* OPÇÕES DE RESPOSTA MELHORADAS */}
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
            
            {/* Resultado com Pauta Musical */}
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
                  </div>
                </div>

                {/* PAUTA MUSICAL COM A PROGRESSÃO */}
                <MusicalStaff
                  progression={harmonicAnalysis}
                  title={currentProgression.name}
                  timeSignature={currentProgression.timeSignature}
                  showChordSymbols={true}
                />

                {/* Análise Harmônica Detalhada */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="text-xl">🎼</span>
                    Análise Harmônica
                  </h4>
                  
                  <div className="space-y-3">
                    {harmonicAnalysis.map((chord: HarmonicAnalysis, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-mono font-bold text-lg text-gray-900">
                              {chord.symbol || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">{chord.degree || 'N/A'}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">{chord.analysis || 'Análise indisponível'}</div>
                          <div className="text-xs text-gray-400">
                            {chord.voicing?.length || 0} vozes
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
                    <span className="text-xl">➡️</span>
                    <span>Próximo Exercício</span>
                  </div>
                </button>
              </div>
            )}

            {/* Estatísticas */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-xl">📊</span>
                Estatísticas
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
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Piano humanizado</span>
                  <span className="font-bold text-purple-600">Sutil</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PIANO */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold mb-4 text-center text-gray-800">
            🎹 Piano Virtual
          </h3>
          <BeautifulPianoKeyboard />
        </div>
      </div>
    </div>
  );
};

export default ChordProgressionExercise;