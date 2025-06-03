// Converter nome da nota para número MIDI
  const noteNameToMidi = useCallback((noteName: string): number => {
    const noteMap: { [key: string]: number } = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5,
      'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
    };
    
    const match = noteName.match(/^([A-G][#b]?)(\d+)$/);
    if (!match) return 60; // C4 padrão
    
    const [, note, octaveStr] = match;
    const octave = parseInt(octaveStr);
    return (octave + 1) * 12 + noteMap[note];
  }, []);

  // Converter número MIDI para nome da nota
  const getNoteNameFromMidi = useCallback((midiNote: number): string => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    const note = noteNames[midiNote % 12];
    return `${note}${octave}`;
  }, []);//src\components\IntervalExercise.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Extend Window interface to include webkitAudioContext and piano function
declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
    playPianoNote?: (note: string, frequency: number) => Promise<void>;
  }
}

interface BeautifulPianoKeyboardProps {
  octaves?: number;
  onNotePlay?: (note: string, frequency: number) => void;
}

// Piano samples - simples e direto
const PIANO_SAMPLES = new Map([
  [48, 'https://tonejs.github.io/audio/salamander/C3.mp3'],   // C3
  [51, 'https://tonejs.github.io/audio/salamander/Ds3.mp3'],  // D#3
  [54, 'https://tonejs.github.io/audio/salamander/Fs3.mp3'],  // F#3
  [57, 'https://tonejs.github.io/audio/salamander/A3.mp3'],   // A3
  [60, 'https://tonejs.github.io/audio/salamander/C4.mp3'],   // C4
  [63, 'https://tonejs.github.io/audio/salamander/Ds4.mp3'],  // D#4
  [66, 'https://tonejs.github.io/audio/salamander/Fs4.mp3'],  // F#4
  [69, 'https://tonejs.github.io/audio/salamander/A4.mp3'],   // A4
  [72, 'https://tonejs.github.io/audio/salamander/C5.mp3'],   // C5
  [75, 'https://tonejs.github.io/audio/salamander/Ds5.mp3']   // D#5
]);

const BeautifulPianoKeyboard: React.FC<BeautifulPianoKeyboardProps> = ({
  octaves = 3,
  onNotePlay,
}) => {
  // Estados principais
  const [mounted, setMounted] = useState(false);
  const [pianoReady, setPianoReady] = useState(false);
  const [currentInstrument, setCurrentInstrument] = useState<Map<number, AudioBuffer> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSources = useRef<Map<number, AudioBufferSourceNode>>(new Map());

  // Memoizar notas do piano HTML
  const pianoNotes = useMemo(() => [
    { note: 'C', octave: 3, midi: 48, white: true, key: 'Z' },
    { note: 'C#', octave: 3, midi: 49, white: false, key: 'S' },
    { note: 'D', octave: 3, midi: 50, white: true, key: 'X' },
    { note: 'D#', octave: 3, midi: 51, white: false, key: 'D' },
    { note: 'E', octave: 3, midi: 52, white: true, key: 'C' },
    { note: 'F', octave: 3, midi: 53, white: true, key: 'V' },
    { note: 'F#', octave: 3, midi: 54, white: false, key: 'G' },
    { note: 'G', octave: 3, midi: 55, white: true, key: 'B' },
    { note: 'G#', octave: 3, midi: 56, white: false, key: 'H' },
    { note: 'A', octave: 3, midi: 57, white: true, key: 'N' },
    { note: 'A#', octave: 3, midi: 58, white: false, key: 'J' },
    { note: 'B', octave: 3, midi: 59, white: true, key: 'M' },
    
    { note: 'C', octave: 4, midi: 60, white: true, key: 'Q' },
    { note: 'C#', octave: 4, midi: 61, white: false, key: '2' },
    { note: 'D', octave: 4, midi: 62, white: true, key: 'W' },
    { note: 'D#', octave: 4, midi: 63, white: false, key: '3' },
    { note: 'E', octave: 4, midi: 64, white: true, key: 'E' },
    { note: 'F', octave: 4, midi: 65, white: true, key: 'R' },
    { note: 'F#', octave: 4, midi: 66, white: false, key: '5' },
    { note: 'G', octave: 4, midi: 67, white: true, key: 'T' },
    { note: 'G#', octave: 4, midi: 68, white: false, key: '6' },
    { note: 'A', octave: 4, midi: 69, white: true, key: 'Y' },
    { note: 'A#', octave: 4, midi: 70, white: false, key: '7' },
    { note: 'B', octave: 4, midi: 71, white: true, key: 'U' },
    
    { note: 'C', octave: 5, midi: 72, white: true, key: 'I' },
    { note: 'C#', octave: 5, midi: 73, white: false, key: '9' },
    { note: 'D', octave: 5, midi: 74, white: true, key: 'O' },
    { note: 'D#', octave: 5, midi: 75, white: false, key: '0' },
    { note: 'E', octave: 5, midi: 76, white: true, key: 'P' },
  ], []);

  // Converter nome da nota para número MIDI
  const noteNameToMidi = useCallback((noteName: string): number => {
    const noteMap: { [key: string]: number } = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5,
      'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
    };
    
    const match = noteName.match(/^([A-G][#b]?)(\d+)$/);
    if (!match) return 60; // C4 padrão
    
    const [, note, octaveStr] = match;
    const octave = parseInt(octaveStr);
    return (octave + 1) * 12 + noteMap[note];
  }, []);

  // Encontrar sample mais próximo e calcular detune
  const findClosestSample = useCallback((targetMidi: number) => {
    if (!currentInstrument) return null;
    
    let closestMidi = 60; // C4 padrão
    let minDistance = Infinity;
    
    for (const [midi] of currentInstrument) {
      const distance = Math.abs(midi - targetMidi);
      if (distance < minDistance) {
        minDistance = distance;
        closestMidi = midi;
      }
    }
    
    const buffer = currentInstrument.get(closestMidi);
    if (!buffer) return null;
    
    const detune = (targetMidi - closestMidi) * 100; // cents
    return { buffer, detune };
  }, [currentInstrument]);

  // Função para tocar nota usando samples
  const playPianoNote = useCallback(async (note: string, frequency: number) => {
    if (!audioContextRef.current || !currentInstrument) {
      console.error('❌ Piano não disponível');
      return;
    }

    try {
      console.log(`🎵 Tocando nota: ${note} (${frequency}Hz)`);
      
      // Retomar contexto se suspenso
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const midiNote = noteNameToMidi(note);
      
      // Parar nota anterior
      const existingSource = activeSources.current.get(midiNote);
      if (existingSource) {
        try {
          existingSource.stop();
        } catch {
          // Already stopped
        }
        activeSources.current.delete(midiNote);
      }

      // Encontrar sample mais próximo
      const sampleData = findClosestSample(midiNote);
      if (!sampleData) {
        console.error(`❌ Sample não disponível para nota ${note}`);
        return;
      }

      // Criar source e gain
      const source = audioContextRef.current.createBufferSource();
      const gainNode = audioContextRef.current.createGain();
      
      source.buffer = sampleData.buffer;
      source.detune.value = sampleData.detune;

      // Envelope simples
      const now = audioContextRef.current.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.8, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.3, now + 0.3);

      // Conectar e tocar
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      source.start(now);

      // Armazenar referência
      activeSources.current.set(midiNote, source);

      // Auto stop
      setTimeout(() => {
        if (activeSources.current.get(midiNote) === source) {
          try {
            source.stop();
          } catch {
            // Already stopped
          }
          activeSources.current.delete(midiNote);
        }
      }, 5000);

      if (onNotePlay) {
        onNotePlay(note, frequency);
      }

    } catch (playError) {
      console.error('❌ Erro ao tocar nota:', playError);
    }
  }, [noteNameToMidi, findClosestSample, onNotePlay]);

  // Carregar samples
  const loadPiano = useCallback(async (): Promise<void> => {
    console.log('🎹 === CARREGANDO PIANO ===');
    
    if (!audioContextRef.current) {
      throw new Error('AudioContext não disponível');
    }
    
    try {
      const sampleMap = new Map<number, AudioBuffer>();
      let loadedCount = 0;
      
      for (const [midi, url] of PIANO_SAMPLES) {
        try {
          console.log(`🎵 Carregando sample MIDI ${midi}`);
          
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
          
          sampleMap.set(midi, audioBuffer);
          loadedCount++;
          console.log(`✅ Sample MIDI ${midi} carregado`);
        } catch (sampleError) {
          console.error(`❌ Erro ao carregar sample MIDI ${midi}:`, sampleError);
        }
      }
      
      if (loadedCount === 0) {
        throw new Error('Nenhum sample foi carregado');
      }
      
      setCurrentInstrument(sampleMap);
      console.log(`✅ Piano carregado com ${loadedCount} samples`);
      
    } catch (loadError) {
      console.error(`❌ Erro ao carregar piano:`, loadError);
      throw loadError;
    }
  }, []);

  // Inicializar sistema
  const initWebAudioFont = useCallback(async (): Promise<void> => {
    try {
      console.log('🎹 === INICIALIZANDO SISTEMA DE SAMPLES ===');
      
      if (typeof window === 'undefined') {
        throw new Error('Window não disponível (SSR)');
      }
      
      console.log('🎹 Criando AudioContext...');
      const AudioContextFunc = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextFunc) {
        throw new Error('AudioContext não suportado');
      }
      
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        const audioContext = new AudioContextFunc();
        audioContextRef.current = audioContext;
        console.log('✅ AudioContext criado:', audioContext.state);
      }
      
      if (audioContextRef.current.state === 'suspended') {
        console.log('🔄 Retomando AudioContext...');
        await audioContextRef.current.resume();
        console.log('✅ AudioContext retomado:', audioContextRef.current.state);
      }
      
      console.log('🎹 Carregando samples...');
      await loadPiano();
      
      console.log('✅ === SISTEMA INICIALIZADO ===');
      setPianoReady(true);
      
    } catch (initError) {
      console.error('❌ Erro ao inicializar:', initError);
      setError(`Erro: ${initError instanceof Error ? initError.message : 'Erro desconhecido'}`);
      setPianoReady(false);
    }
  }, [loadPiano]);

  // Componente de Piano HTML
  const HtmlPiano = () => {
    const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());

    const playNote = async (noteData: { note: string, octave: number, midi: number }) => {
      if (!currentInstrument || !audioContextRef.current) {
        console.error('❌ Piano não disponível para tocar');
        return;
      }

      try {
        console.log(`🎵 Tocando ${noteData.note}${noteData.octave} (MIDI: ${noteData.midi})`);
        
        const frequency = 440 * Math.pow(2, (noteData.midi - 69) / 12);
        playPianoNote(`${noteData.note}${noteData.octave}`, frequency);

      } catch (playError) {
        console.error('❌ Erro ao tocar nota:', playError);
      }
    };

    // Keyboard event handler
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        const key = event.key.toUpperCase();
        const noteData = pianoNotes.find(n => n.key === key);
        if (noteData && !activeNotes.has(key)) {
          setActiveNotes(prev => new Set(prev).add(key));
          playNote(noteData);
        }
      };

      const handleKeyUp = (event: KeyboardEvent) => {
        const key = event.key.toUpperCase();
        setActiveNotes(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }, [activeNotes]);

    const whiteKeys = pianoNotes.filter(n => n.white);
    const blackKeys = pianoNotes.filter(n => !n.white);

    return (
      <div className="w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="text-center py-2 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
          <div className="text-sm text-gray-700 font-medium">
            🎹 Piano Virtual - Clique nas teclas ou use o teclado
          </div>
        </div>
        
        <div className="relative bg-gray-100 p-4" style={{ height: '180px' }}>
          <div className="relative h-full flex justify-center">
            {/* Container das teclas brancas */}
            <div className="flex h-full">
              {whiteKeys.map((noteData) => (
                <button
                  key={`${noteData.note}${noteData.octave}`}
                  onMouseDown={() => playNote(noteData)}
                  className={`w-10 sm:w-12 h-full border border-r-gray-300 transition-all duration-150 flex flex-col justify-end items-center pb-2 text-xs ${
                    activeNotes.has(noteData.key) 
                      ? 'bg-green-200 shadow-inner' 
                      : 'bg-white hover:bg-gray-50 active:bg-gray-100'
                  }`}
                  style={{ minWidth: '35px' }}
                >
                  <div className="text-center">
                    <div className="text-xs font-semibold text-gray-700">
                      {noteData.note}{noteData.octave}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 bg-gray-100 px-1 rounded">
                      {noteData.key}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Teclas pretas */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-2/3 flex pointer-events-none">
              {blackKeys.map((noteData) => {
                const whiteKeyIndex = whiteKeys.findIndex(w => w.midi === noteData.midi - 1);
                if (whiteKeyIndex === -1) return null;
                
                const keyWidth = 40; // largura aproximada da tecla branca
                const startOffset = -(whiteKeys.length * keyWidth) / 2;
                const position = startOffset + (whiteKeyIndex * keyWidth) + (keyWidth / 2);
                
                return (
                  <button
                    key={`${noteData.note}${noteData.octave}`}
                    onMouseDown={() => playNote(noteData)}
                    className={`absolute text-white text-xs font-bold flex flex-col items-center justify-end pb-2 transition-all duration-150 pointer-events-auto shadow-lg rounded-b-md ${
                      activeNotes.has(noteData.key)
                        ? 'bg-green-700 shadow-inner'
                        : 'bg-gray-900 hover:bg-gray-800 active:bg-black'
                    }`}
                    style={{
                      left: `${position}px`,
                      width: '24px',
                      height: '100%',
                      zIndex: 10,
                      top: '4px'
                    }}
                  >
                    <div className="text-center">
                      <div className="text-xs font-bold">
                        {noteData.note}{noteData.octave}
                      </div>
                      <div className="text-xs opacity-75 mt-1 bg-white bg-opacity-20 px-1 rounded">
                        {noteData.key}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Effect principal
  useEffect(() => {
    if (!mounted) {
      console.log('🚀 === MONTANDO COMPONENTE ===');
      setMounted(true);
    }
  }, [mounted]);

  // Effect para inicializar
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (mounted) {
      console.log('🎹 === INICIALIZANDO SISTEMA ===');
      setIsLoading(true);
      
      const initTimer = setTimeout(() => {
        initWebAudioFont().finally(() => {
          setIsLoading(false);
        });
      }, 100);
      
      return () => clearTimeout(initTimer);
    }
  }, [mounted, initWebAudioFont]);

  // Status do piano
  const status = {
    text: error 
      ? `❌ ${error}`
      : !mounted
        ? '🔄 Inicializando componente...'
        : isLoading
          ? '🔄 Carregando samples de piano...'
          : !pianoReady
            ? '🔄 Preparando piano...'
            : !currentInstrument
              ? '🔄 Preparando instrumento...'
              : `✅ Piano pronto com ${currentInstrument.size} samples!`,
    color: error 
      ? 'bg-red-100 text-red-800 border border-red-200'
      : !mounted || isLoading || !pianoReady || !currentInstrument
        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
        : 'bg-green-100 text-green-800 border border-green-200',
    icon: error 
      ? '❌' 
      : !mounted || isLoading || !pianoReady || !currentInstrument 
        ? '⏳' 
        : '🎹'
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-bold text-center mb-4 text-gray-800 flex items-center justify-center gap-2">
        🎹 Piano Virtual
      </h3>

      {/* Status */}
      <div className="mb-4">
        <div className={`text-sm p-3 rounded-lg ${status.color}`}>
          <div className="flex items-center gap-2">
            <span>{status.icon}</span>
            <span className="flex-1 min-w-0">{status.text}</span>
          </div>
        </div>
      </div>

      {/* Piano */}
      <div className="w-full">
        {pianoReady && currentInstrument ? (
          <HtmlPiano />
        ) : (
          <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <div className="text-4xl mb-2">🎹</div>
              <div className="text-gray-600">
                {isLoading ? 'Carregando piano...' : 'Preparando piano...'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instruções */}
      <div className="mt-4">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2 text-sm">🎹 Como usar:</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white rounded p-2">
              <div className="flex items-center gap-1 mb-1">
                <span>🖱️</span>
                <span className="font-semibold text-gray-700">Mouse</span>
              </div>
              <p className="text-gray-600">Clique nas teclas para tocar</p>
            </div>
            
            <div className="bg-white rounded p-2">
              <div className="flex items-center gap-1 mb-1">
                <span>⌨️</span>
                <span className="font-semibold text-gray-700">Teclado</span>
              </div>
              <p className="text-gray-600">Use Q, W, E, R, T, Y, U, I, O, P</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info técnica */}
      <div className="mt-3 text-center">
        <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-600">
          <span>📊 {octaves} oitavas</span>
          <span>🔊 {pianoReady ? 'Salamander Piano' : 'Carregando...'}</span>
          <span>⚡ Samples reais</span>
        </div>
      </div>
    </div>
  );
};

// ===================================
// EXERCÍCIO DE INTERVALOS
// ===================================

// Definição dos intervalos por dificuldade
const intervalsByDifficulty = {
  beginner: [
    { name: 'Unísono', semitones: 0, displayName: 'Unísono (0 semitons)' },
    { name: 'Segunda menor', semitones: 1, displayName: 'Segunda menor (1 semitom)' },
    { name: 'Segunda maior', semitones: 2, displayName: 'Segunda maior (2 semitons)' },
    { name: 'Terça menor', semitones: 3, displayName: 'Terça menor (3 semitons)' },
    { name: 'Terça maior', semitones: 4, displayName: 'Terça maior (4 semitons)' },
    { name: 'Quinta justa', semitones: 7, displayName: 'Quinta justa (7 semitons)' },
    { name: 'Oitava', semitones: 12, displayName: 'Oitava (12 semitons)' }
  ],
  intermediate: [
    { name: 'Unísono', semitones: 0, displayName: 'Unísono' },
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
    { name: 'Unísono', semitones: 0, displayName: 'Unísono' },
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

interface IntervalExerciseProps {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  onComplete?: (result: {
    correct: boolean;
    userAnswer: string;
    expected: string;
    timeSpent: number;
  }) => void;
}

const IntervalExercise: React.FC<IntervalExerciseProps> = ({ 
  difficulty, 
  onComplete 
}) => {
  // Estados do exercício
  const [currentInterval, setCurrentInterval] = useState<{ name: string; semitones: number; displayName: string } | null>(null);
  const [baseNote, setBaseNote] = useState<number>(60); // C4
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Obter intervalos disponíveis baseado na dificuldade
  const availableIntervals = intervalsByDifficulty[difficulty];

  // Converter MIDI para frequência
  const midiToFrequency = useCallback((midi: number): number => {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }, []);

  // Converter número MIDI para nome da nota
  const getNoteNameFromMidi = useCallback((midiNote: number): string => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    const note = noteNames[midiNote % 12];
    return `${note}${octave}`;
  }, []);

  // Tocar intervalo usando o PIANO REAL com soundfont (NÃO SÍNTESE!)
  const playInterval = useCallback(async () => {
    if (!currentInterval) return;
    
    setIsPlaying(true);
    
    try {
      // Usar o piano real com soundfont
      const playPianoFunc = window.playPianoNote;
      
      if (!playPianoFunc) {
        console.error('❌ Piano não está disponível ainda');
        setIsPlaying(false);
        return;
      }
      
      const baseNoteName = getNoteNameFromMidi(baseNote);
      const topNoteName = getNoteNameFromMidi(baseNote + currentInterval.semitones);
      
      const baseFreq = midiToFrequency(baseNote);
      const topFreq = midiToFrequency(baseNote + currentInterval.semitones);
      
      console.log(`🎵 Tocando intervalo com PIANO REAL: ${baseNoteName} → ${topNoteName}`);
      
      // Tocar primeira nota do piano (som real!)
      await playPianoFunc(baseNoteName, baseFreq);
      
      // Tocar segunda nota após 1.2 segundos
      setTimeout(async () => {
        if (window.playPianoNote) {
          await window.playPianoNote(topNoteName, topFreq);
        }
        
        setTimeout(() => setIsPlaying(false), 1000);
      }, 1200);

    } catch (error) {
      console.error('❌ Erro ao tocar intervalo:', error);
      setIsPlaying(false);
    }
  }, [currentInterval, baseNote, midiToFrequency, getNoteNameFromMidi]);

  // Gerar novo exercício
  const generateNewExercise = useCallback(() => {
    const randomInterval = availableIntervals[Math.floor(Math.random() * availableIntervals.length)];
    const randomBaseNote = 60 + Math.floor(Math.random() * 8); // C4 a G4
    
    setCurrentInterval(randomInterval);
    setBaseNote(randomBaseNote);
    setUserAnswer('');
    setShowResult(false);
    setStartTime(Date.now());
    
    console.log(`🎯 Novo exercício: ${randomInterval.name} (${randomInterval.semitones} semitons) a partir da nota MIDI ${randomBaseNote}`);
  }, [availableIntervals]);

  // Verificar resposta
  const checkAnswer = useCallback(() => {
    if (!currentInterval || !userAnswer) return;

    const correct = userAnswer === currentInterval.name;
    const timeSpent = Date.now() - startTime;
    
    setIsCorrect(correct);
    setShowResult(true);
    setTotalQuestions(prev => prev + 1);
    
    if (correct) {
      setScore(prev => prev + 1);
    }

    if (onComplete) {
      onComplete({
        correct,
        userAnswer,
        expected: currentInterval.name,
        timeSpent
      });
    }
  }, [currentInterval, userAnswer, startTime, onComplete]);

  // Próxima pergunta
  const nextQuestion = useCallback(() => {
    generateNewExercise();
  }, [generateNewExercise]);

  // Inicialização
  useEffect(() => {
    generateNewExercise();
  }, [generateNewExercise]);

  if (!currentInterval) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-2xl mb-2">🎯</div>
          <div className="text-gray-600">Preparando exercício...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Identificação de Intervalos</h2>
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
            Pontuação: {score}/{totalQuestions} ({totalQuestions > 0 ? Math.round((score/totalQuestions) * 100) : 0}%)
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            <strong>Dificuldade:</strong> {difficulty === 'beginner' ? 'Iniciante' : difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
          </p>
          <p className="text-blue-700 text-sm mt-1">
            Ouça o intervalo e identifique qual tipo é. Use o piano para experimentar.
          </p>
        </div>
      </div>

      {/* Layout em uma coluna única */}
      <div className="space-y-6">
        {/* Área do exercício */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4">🎵 Exercício Atual</h3>
          
          <button
            onClick={playInterval}
            disabled={isPlaying}
            className={`w-full py-3 sm:py-4 px-6 rounded-lg font-semibold text-base sm:text-lg transition-colors ${
              isPlaying
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isPlaying ? '🎵 Tocando...' : '🎵 Tocar Intervalo'}
          </button>
          
          <div className="mt-3 text-center text-sm text-gray-600">
            Clique para ouvir o intervalo (primeira nota → segunda nota)
          </div>
        </div>

        {/* Opções de resposta */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Qual intervalo você ouviu?</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableIntervals.map((interval) => (
              <button
                key={interval.name}
                onClick={() => setUserAnswer(interval.name)}
                className={`p-3 sm:p-4 rounded-lg text-left transition-colors ${
                  userAnswer === interval.name
                    ? 'bg-indigo-100 border-2 border-indigo-500 text-indigo-800'
                    : 'bg-gray-100 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                {interval.displayName}
              </button>
            ))}
          </div>
        </div>

        {/* Botão confirmar */}
        {userAnswer && !showResult && (
          <button
            onClick={checkAnswer}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            ✅ Confirmar Resposta
          </button>
        )}

        {/* Resultado */}
        {showResult && (
          <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
              {isCorrect ? '✅ Correto!' : '❌ Incorreto'}
            </div>
            <div className={`text-sm mt-1 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
              {isCorrect 
                ? `Muito bem! Era realmente ${currentInterval.displayName}.`
                : `A resposta correta era: ${currentInterval.displayName}`
              }
            </div>
            <button
              onClick={nextQuestion}
              className="mt-3 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              ➡️ Próximo Exercício
            </button>
          </div>
        )}

        {/* Piano */}
        <div className="border-t border-gray-200 pt-6">
          <BeautifulPianoKeyboard 
            octaves={3}
            onNotePlay={(note, freq) => console.log(`Tocou: ${note} (${freq}Hz)`)} 
          />
        </div>
      </div>
    </div>
  );
};

export default IntervalExercise;