//src\components\IntervalExercise.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface BeautifulPianoKeyboardProps {
  octaves?: number;
  startNote?: string;
  onNotePlay?: (note: string, frequency: number) => void;
}

interface MIDIConnectionEvent extends Event {
  port?: {
    name: string;
    state: string;
    connection: string;
  };
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

// Piano soundfont options - mantendo estrutura original
const pianoOptions = {
  grand: {
    name: '🎹 Grand Piano Clássico',
    description: 'Som rico e profundo de piano de cauda'
  },
  bright: {
    name: '✨ Grand Piano Brilhante', 
    description: 'Som cristalino e definido'
  },
  warm: {
    name: '🔥 Grand Piano Caloroso',
    description: 'Som encorpado e envolvente'
  },
  vintage: {
    name: '📻 Piano Vintage',
    description: 'Som clássico dos anos 70-80'
  },
  studio: {
    name: '🎙️ Piano de Estúdio',
    description: 'Som profissional de gravação'
  },
  simple: {
    name: '🎼 Piano Simples (Backup)',
    description: 'Piano básico para conexões lentas'
  }
} as const;

const BeautifulPianoKeyboard: React.FC<BeautifulPianoKeyboardProps> = ({
  octaves = 4,
  startNote = 'C2',
  onNotePlay,
}) => {
  // Estados principais - mantendo estrutura original
  const [mounted, setMounted] = useState(false);
  const [audioFontLoaded, setAudioFontLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pianoReady, setPianoReady] = useState(false);
  const [midiInputs, setMidiInputs] = useState<string[]>([]);
  const [lastMidiActivity, setLastMidiActivity] = useState<string>('');
  
  // Piano selection state - mantendo estrutura original
  const [selectedPiano, setSelectedPiano] = useState('grand');
  const [currentInstrument, setCurrentInstrument] = useState<Map<number, AudioBuffer> | null>(null);
  const [actualLoadedPiano, setActualLoadedPiano] = useState<string>('');
  
  // Estado para piano HTML personalizado - mantendo estrutura original
  const [useHtmlPiano, setUseHtmlPiano] = useState(false);
  
  // Refs - mantendo estrutura original
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSources = useRef<Map<number, AudioBufferSourceNode>>(new Map());

  // Memoizar notas do piano HTML - mantendo original
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

  // Converter nome da nota para número MIDI - mantendo original
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

  // Converter número MIDI para nome da nota - mantendo original
  const getNoteNameFromMidi = useCallback((midiNote: number): string => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    const note = noteNames[midiNote % 12];
    return `${note}${octave}`;
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

  // Função para tocar nota usando samples - simplificada
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

  // Status do piano - mantendo estrutura original
  const status = {
    text: error 
      ? `❌ ${error}`
      : !mounted
        ? '🔄 Inicializando componente...'
        : !audioFontLoaded 
          ? '🔄 Carregando sistema de áudio...'
          : !pianoReady
            ? '🔄 Carregando samples de piano...'
            : !currentInstrument
              ? '🔄 Preparando instrumento...'
              : actualLoadedPiano === 'simple' && selectedPiano !== 'simple'
                ? `⚠️ Piano backup ativo (${pianoOptions.simple.name}) - conexão lenta detectada`
                : useHtmlPiano
                  ? `✅ Piano HTML com ${pianoOptions[actualLoadedPiano as keyof typeof pianoOptions]?.name || 'samples reais'} pronto!`
                  : `✅ Piano com ${pianoOptions[actualLoadedPiano as keyof typeof pianoOptions]?.name || 'samples reais'} pronto!`,
    color: error 
      ? 'bg-red-100 text-red-800 border border-red-200'
      : !mounted || !audioFontLoaded || !pianoReady || !currentInstrument
        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
        : actualLoadedPiano === 'simple' && selectedPiano !== 'simple'
          ? 'bg-orange-100 text-orange-800 border border-orange-200'
          : useHtmlPiano
            ? 'bg-blue-100 text-blue-800 border border-blue-200'
            : 'bg-green-100 text-green-800 border border-green-200',
    icon: error 
      ? '❌' 
      : !mounted || !audioFontLoaded || !pianoReady || !currentInstrument 
        ? '⏳' 
        : actualLoadedPiano === 'simple' && selectedPiano !== 'simple'
          ? '⚠️'
          : useHtmlPiano 
            ? '🖥️' 
            : '🎹'
  };

  // Handler para mensagens MIDI - mantendo original
  const handleMIDIMessage = useCallback((message: WebMidi.MIDIMessageEvent) => {
    console.log('🎹 === MIDI MESSAGE RECEIVED ===');
    const [command, note, velocity] = message.data;
    
    const timestamp = new Date().toLocaleTimeString();
    const activityText = `${timestamp} - Note ${note}, Vel ${velocity}`;
    setLastMidiActivity(activityText);
    
    const isNoteOn = (command & 0xf0) === 0x90 && velocity > 0;
    
    if (isNoteOn && currentInstrument && audioContextRef.current) {
      console.log(`🎹 Playing MIDI note: ${note} (velocity: ${velocity})`);
      
      try {
        const frequency = 440 * Math.pow(2, (note - 69) / 12);
        const noteName = getNoteNameFromMidi(note);
        playPianoNote(noteName, frequency);
        
        console.log('✅ MIDI Note played successfully!');
      } catch (midiPlayError) {
        console.error('❌ Erro ao tocar nota MIDI:', midiPlayError);
      }
    }
    
    console.log('🎹 === END MIDI MESSAGE ===\n');
  }, [getNoteNameFromMidi, playPianoNote, currentInstrument]);

  // Carregar samples - simplificado
  const loadPiano = useCallback(async (pianoType: keyof typeof pianoOptions): Promise<void> => {
    console.log(`🎹 === CARREGANDO PIANO ${pianoType.toUpperCase()} ===`);
    
    if (!audioContextRef.current) {
      throw new Error('AudioContext não disponível');
    }
    
    try {
      const sampleMap = new Map<number, AudioBuffer>();
      let loadedCount = 0;
      
      for (const [midi, url] of PIANO_SAMPLES) {
        try {
          console.log(`🎵 Carregando sample MIDI ${midi}: ${url}`);
          
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
      setActualLoadedPiano(pianoType);
      console.log(`✅ Piano ${pianoType} carregado com ${loadedCount} samples`);
      
    } catch (loadError) {
      console.error(`❌ Erro ao carregar piano:`, loadError);
      throw loadError;
    }
  }, []);

  // Inicializar sistema - simplificado
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
      await loadPiano('grand');
      
      console.log('✅ === SISTEMA INICIALIZADO ===');
      setPianoReady(true);
      
    } catch (initError) {
      const errorMessage = initError instanceof Error ? initError.message : String(initError);
      console.error('❌ Erro ao inicializar:', errorMessage);
      setError(`Erro: ${errorMessage}`);
      setPianoReady(false);
    }
  }, [loadPiano]);

  // Inicializar MIDI - mantendo original
  const initMIDI = useCallback(async (): Promise<void> => {
    try {
      if (navigator.requestMIDIAccess) {
        console.log('🎹 === INICIALIZANDO MIDI ===');
        const midiAccess = await navigator.requestMIDIAccess();
        
        const inputs = Array.from(midiAccess.inputs.values());
        const inputNames = inputs.map(input => input.name || 'Unknown Device');
        setMidiInputs(inputNames);
        
        console.log(`🎹 MIDI inicializado! ${inputs.length} dispositivos:`);
        inputs.forEach((input, i) => {
          console.log(`🎹   [${i}] ${input.name || 'Unknown'}`);
        });
        
        inputs.forEach((input) => {
          input.onmidimessage = (event: WebMidi.MIDIMessageEvent) => {
            handleMIDIMessage(event);
          };
        });
        
        midiAccess.onstatechange = (event: Event) => {
          const midiEvent = event as MIDIConnectionEvent;
          console.log('🎹 MIDI State change:', midiEvent);
          if (midiEvent.port) {
            console.log('🎹 Port:', midiEvent.port.name, 'State:', midiEvent.port.state);
          }
        };
        
        console.log('🎹 === MIDI SETUP COMPLETE ===');
        
      } else {
        console.log('❌ Web MIDI API não suportada');
      }
    } catch (midiError) {
      console.error('❌ Erro ao inicializar MIDI:', midiError);
    }
  }, [handleMIDIMessage]);

  // Componente de Piano HTML - mantendo original
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

    // Keyboard event handler - mantendo original
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
      <div className="relative bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '200px' }}>
        <div className="text-center py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-sm text-gray-600 border-b">
          🎹 Piano HTML Personalizado • Clique nas teclas ou use o teclado do PC
        </div>
        
        {/* Container das teclas - mantendo original */}
        <div className="relative h-full flex">
          {/* Teclas brancas */}
          <div className="flex h-full">
            {whiteKeys.map((noteData, index) => (
              <button
                key={`${noteData.note}${noteData.octave}`}
                onMouseDown={() => playNote(noteData)}
                className={`flex-1 h-full border border-gray-300 transition-colors flex flex-col justify-end items-center pb-4 relative group ${
                  activeNotes.has(noteData.key) 
                    ? 'bg-green-200' 
                    : 'bg-white hover:bg-gray-50 active:bg-gray-200'
                }`}
                style={{ 
                  minWidth: '40px',
                  borderRight: index === whiteKeys.length - 1 ? '1px solid #d1d5db' : '1px solid #d1d5db'
                }}
              >
                <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-800">
                  {noteData.note}{noteData.octave}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  {noteData.key}
                </span>
              </button>
            ))}
          </div>
          
          {/* Teclas pretas */}
          <div className="absolute top-0 left-0 h-2/3 flex pointer-events-none">
            {blackKeys.map((noteData) => {
              const whiteKeyIndex = whiteKeys.findIndex(w => w.midi === noteData.midi - 1);
              const position = whiteKeyIndex * (100 / whiteKeys.length) + (100 / whiteKeys.length / 2);
              
              return (
                <button
                  key={`${noteData.note}${noteData.octave}`}
                  onMouseDown={() => playNote(noteData)}
                  className={`absolute text-white text-xs font-semibold flex flex-col items-center justify-end pb-2 transition-colors pointer-events-auto shadow-lg ${
                    activeNotes.has(noteData.key)
                      ? 'bg-green-600'
                      : 'bg-gray-800 hover:bg-gray-700 active:bg-gray-900'
                  }`}
                  style={{
                    left: `${position}%`,
                    width: '30px',
                    height: '100%',
                    transform: 'translateX(-50%)',
                    zIndex: 10
                  }}
                >
                  <span>{noteData.note}{noteData.octave}</span>
                  <span className="text-xs opacity-75 mt-1">{noteData.key}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Effect principal - simplificado
  useEffect(() => {
    if (!mounted) {
      console.log('🚀 === MONTANDO COMPONENTE ===');
      setMounted(true);
      setAudioFontLoaded(true);
    }
  }, [mounted]);

  // Effect para inicializar
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (audioFontLoaded && mounted) {
      console.log('🎹 === INICIALIZANDO SISTEMA ===');
      
      const initTimer = setTimeout(() => {
        initWebAudioFont().catch((initError) => {
          const errorMessage = initError instanceof Error ? initError.message : String(initError);
          console.error('❌ Erro na inicialização:', errorMessage);
          setError(`Erro: ${errorMessage}`);
        });
        
        initMIDI().catch((midiError) => {
          console.error('❌ Erro MIDI:', midiError);
        });
      }, 100);
      
      return () => clearTimeout(initTimer);
    }
  }, [audioFontLoaded, mounted, initWebAudioFont, initMIDI]);

  // Ativar piano HTML quando pronto
  useEffect(() => {
    if (pianoReady && mounted) {
      setUseHtmlPiano(true);
    }
  }, [pianoReady, mounted]);

  // Função para trocar piano - mantendo original
  const changePiano = useCallback(async (pianoType: keyof typeof pianoOptions): Promise<void> => {
    if (pianoType === selectedPiano) return;
    
    console.log(`🎹 Trocando para piano: ${pianoOptions[pianoType].name}`);
    setSelectedPiano(pianoType);
    
    try {
      await loadPiano(pianoType);
      console.log('✅ Piano trocado!');
    } catch (changeError) {
      console.error('❌ Erro ao trocar piano:', changeError);
    }
  }, [selectedPiano, loadPiano]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-center mb-4 text-gray-800 flex items-center justify-center gap-2">
        🎹 Piano Virtual com Samples Reais
      </h2>
      
      <p className="text-center text-gray-600 mb-6">
        Piano de alta qualidade com soundfonts reais de pianos profissionais
      </p>

      {/* Seletor de Piano - mantendo original */}
      <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          🎨 Escolha seu Piano
          <span className="text-xs text-gray-500 font-normal">Samples reais de pianos profissionais</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {Object.entries(pianoOptions).map(([key, piano]) => (
            <button
              key={key}
              onClick={() => changePiano(key as keyof typeof pianoOptions)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                selectedPiano === key
                  ? 'border-purple-500 bg-purple-100 text-purple-800'
                  : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
              } ${key === 'simple' ? 'border-yellow-300 bg-yellow-50' : ''}`}
            >
              <div className="font-semibold text-sm">{piano.name}</div>
              <div className="text-xs text-gray-600 mt-1">{piano.description}</div>
              {key === 'simple' && (
                <div className="text-xs text-yellow-600 mt-1 font-semibold">⚡ Carregamento rápido</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Status - mantendo original */}
      <div className="mb-4">
        <div className={`text-sm p-3 rounded-lg ${status.color}`}>
          <div className="flex items-center gap-2">
            <span>{status.icon}</span>
            <span className="flex-1 min-w-0">{status.text}</span>
          </div>
        </div>
        
        {/* Debug info - mantendo original */}
        {(error || !pianoReady) && (
          <div className="mt-2 bg-gray-100 rounded-lg p-3">
            <div className="text-xs text-gray-600">
              <div className="font-semibold mb-2">🔍 Debug Info:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>mounted: {mounted ? '✅' : '❌'}</div>
                <div>audioFontLoaded: {audioFontLoaded ? '✅' : '❌'}</div>
                <div>pianoReady: {pianoReady ? '✅' : '❌'}</div>
                <div>samples: {currentInstrument?.size || 0}</div>
                <div>Piano selecionado: {selectedPiano}</div>
                <div>Piano carregado: {actualLoadedPiano || 'nenhum'}</div>
                <div>AudioContext: {audioContextRef.current ? '✅' : '❌'}</div>
                <div>Piano HTML: {useHtmlPiano ? '✅ Ativo' : '❌ Inativo'}</div>
              </div>
              <div className="mt-2">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      console.log('🔍 === DEBUG COMPLETO ===');
                      console.log('Estado:', {
                        mounted,
                        audioFontLoaded,
                        pianoReady,
                        selectedPiano,
                        actualLoadedPiano,
                        samplesCount: currentInstrument?.size || 0,
                        error
                      });
                    }}
                    className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs hover:bg-blue-300"
                  >
                    Debug Console
                  </button>
                  
                  <button
                    onClick={async () => {
                      console.log('🔧 === FORÇA INICIALIZAÇÃO ===');
                      try {
                        setError(null);
                        setPianoReady(false);
                        setCurrentInstrument(null);
                        await initWebAudioFont();
                      } catch (forceError) {
                        console.error('❌ Erro força init:', forceError);
                      }
                    }}
                    className="px-2 py-1 bg-orange-200 text-orange-800 rounded text-xs hover:bg-orange-300"
                  >
                    Força Init
                  </button>
                  
                  <button
                    onClick={async () => {
                      console.log('🧪 === TESTE MANUAL ===');
                      if (currentInstrument && audioContextRef.current) {
                        try {
                          if (audioContextRef.current.state === 'suspended') {
                            await audioContextRef.current.resume();
                          }
                          
                          console.log('🎵 Tocando C4...');
                          playPianoNote('C4', 261.63);
                          console.log('✅ Teste OK!');
                        } catch (testError) {
                          console.error('❌ Erro teste:', testError);
                        }
                      } else {
                        console.error('❌ Piano não disponível');
                      }
                    }}
                    className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs hover:bg-green-300"
                  >
                    🎵 Teste Som
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Status MIDI - mantendo original */}
        {midiInputs.length > 0 && (
          <div className="mt-2 space-y-2">
            <div className="text-xs p-2 rounded bg-blue-50 text-blue-800 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <span>🎹</span>
                <span className="ml-2">
                  <strong>MIDI conectado:</strong> {midiInputs.join(', ')}
                </span>
              </div>
            </div>
            
            {lastMidiActivity && (
              <div className="text-xs p-2 rounded bg-purple-50 text-purple-800">
                <span>🎵</span>
                <span className="ml-2">
                  <strong>Última atividade MIDI:</strong> {lastMidiActivity}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Container do piano - mantendo original */}
      <div className="w-full bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
        {useHtmlPiano ? (
          <HtmlPiano />
        ) : (
          <div id="piano-container" className="min-w-fit mx-auto" style={{ minWidth: '800px' }}>
            {!pianoReady && (
              <div className="flex items-center justify-center h-48 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎹</div>
                  <div className="text-gray-600">Carregando piano...</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instruções - mantendo original */}
      <div className="mt-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold text-green-800 mb-3 text-center">🎹 Como tocar este piano virtual</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🖱️</span>
                <span className="font-semibold text-gray-700">Mouse</span>
              </div>
              <p className="text-gray-600">Clique diretamente nas teclas do piano para tocar as notas</p>
            </div>
            
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⌨️</span>
                <span className="font-semibold text-gray-700">Teclado do Computador</span>
              </div>
              <p className="text-gray-600 mb-2">Use as teclas do seu teclado para tocar:</p>
              <div>
                <div className="text-xs mb-2">
                  <div className="font-semibold mb-1">Teclas brancas:</div>
                  <div className="flex flex-wrap gap-1">
                    {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map(key => (
                      <span key={key} className="bg-gray-100 px-2 py-1 rounded">{key}</span>
                    ))}
                  </div>
                </div>
                <div className="text-xs">
                  <div className="font-semibold mb-1">Teclas pretas:</div>
                  <div className="flex flex-wrap gap-1">
                    {['2', '3', '5', '6', '7', '9', '0'].map(key => (
                      <span key={key} className="bg-gray-800 text-white px-2 py-1 rounded">{key}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {midiInputs.length > 0 && (
            <div className="mt-4 bg-blue-100 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🎛️</span>
                <span className="font-semibold text-blue-800">Controlador MIDI</span>
              </div>
              <p className="text-blue-700 text-sm">
                Conectado: <strong>{midiInputs.join(', ')}</strong> - Toque diretamente no seu controlador!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Informações técnicas - mantendo original */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-700">📊</span>
            <span>{octaves} oitavas • {startNote}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-700">🔊</span>
            <span>{pianoReady ? '🟢 Samples Diretos' : '🟡 Carregando...'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-700">⚡</span>
            <span>Salamander Grand Piano</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-700">🎹</span>
            <span>{useHtmlPiano ? 'Piano HTML Personalizado' : 'Piano Visual'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-700">🎨</span>
            <span>{pianoOptions[actualLoadedPiano as keyof typeof pianoOptions]?.name || 'Carregando...'}</span>
            {actualLoadedPiano === 'simple' && selectedPiano !== 'simple' && (
              <span className="text-xs bg-orange-100 text-orange-600 px-1 rounded">(backup)</span>
            )}
          </div>
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

  // Refs para áudio
  const audioContextRef = useRef<AudioContext | null>(null);

  // Obter intervalos disponíveis baseado na dificuldade
  const availableIntervals = intervalsByDifficulty[difficulty];

  // Converter MIDI para frequência
  const midiToFrequency = useCallback((midi: number): number => {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }, []);

  // Inicializar áudio
  const initAudio = useCallback(async () => {
    if (audioContextRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    } catch {
      console.error('AudioContext não disponível');
    }
  }, []);

  // Tocar intervalo
  const playInterval = useCallback(async () => {
    if (!currentInterval || !audioContextRef.current) return;
    
    setIsPlaying(true);
    
    try {
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const baseFreq = midiToFrequency(baseNote);
      const topFreq = midiToFrequency(baseNote + currentInterval.semitones);

      // Tocar primeira nota
      const osc1 = audioContextRef.current.createOscillator();
      const gain1 = audioContextRef.current.createGain();
      
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(baseFreq, audioContextRef.current.currentTime);
      gain1.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
      
      osc1.connect(gain1);
      gain1.connect(audioContextRef.current.destination);
      
      osc1.start();
      osc1.stop(audioContextRef.current.currentTime + 1);

      // Tocar segunda nota após 1.2 segundos
      setTimeout(() => {
        if (audioContextRef.current) {
          const osc2 = audioContextRef.current.createOscillator();
          const gain2 = audioContextRef.current.createGain();
          
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(topFreq, audioContextRef.current.currentTime);
          gain2.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
          
          osc2.connect(gain2);
          gain2.connect(audioContextRef.current.destination);
          
          osc2.start();
          osc2.stop(audioContextRef.current.currentTime + 1);
        }
        
        setTimeout(() => setIsPlaying(false), 1000);
      }, 1200);

    } catch {
      setIsPlaying(false);
    }
  }, [currentInterval, baseNote, midiToFrequency]);

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
    initAudio();
    generateNewExercise();
  }, [initAudio, generateNewExercise]);

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
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Identificação de Intervalos</h2>
          <div className="text-sm text-gray-600">
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Área do exercício */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">🎵 Exercício Atual</h3>
            
            <button
              onClick={playInterval}
              disabled={isPlaying}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
                isPlaying
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isPlaying ? '🎵 Tocando...' : '🎵 Tocar Intervalo'}
            </button>
            
            <div className="mt-4 text-center text-sm text-gray-600">
              Clique para ouvir o intervalo (primeira nota → segunda nota)
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Qual intervalo você ouviu?</h4>
            <div className="grid grid-cols-1 gap-2">
              {availableIntervals.map((interval) => (
                <button
                  key={interval.name}
                  onClick={() => setUserAnswer(interval.name)}
                  className={`p-3 rounded-lg text-left transition-colors ${
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

          {userAnswer && !showResult && (
            <button
              onClick={checkAnswer}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              ✅ Confirmar Resposta
            </button>
          )}

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
        </div>

        {/* Piano */}
        <div>
          <BeautifulPianoKeyboard 
            octaves={3}
            startNote="C3"
            onNotePlay={(note, freq) => console.log(`Tocou: ${note} (${freq}Hz)`)} 
          />
        </div>
      </div>
    </div>
  );
};

export default IntervalExercise;