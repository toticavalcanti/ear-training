import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface BeautifulPianoKeyboardProps {
  width?: number;
  height?: number;
  octaves?: number;
  startNote?: string;
  onNotePlay?: (note: string, frequency: number) => void;
  onNoteStop?: (note: string, frequency: number) => void;
}

interface MIDIConnectionEvent extends Event {
  port?: {
    name: string;
    state: string;
    connection: string;
  };
}

// Tipos para WebAudioFont
interface WebAudioFontPlayer {
  loader: {
    startLoad: (context: AudioContext, url: string, variable: string) => void;
    waitLoad: (callback: () => void) => void;
  };
  queueWaveTable: (
    context: AudioContext,
    destination: AudioDestinationNode,
    instrument: WebAudioFontInstrument,
    when: number,
    pitch: number,
    duration: number,
    volume: number
  ) => void;
}

interface WebAudioFontInstrument {
  zones: Array<{
    keyRangeLow: number;
    keyRangeHigh: number;
    sample: string;
  }>;
}

interface QwertyHancockKeyboard {
  keyDown: (note: string, frequency: number) => void;
  keyUp: (note: string, frequency: number) => void;
}

interface QwertyHancockConfig {
  id: string;
  width: number;
  height: number;
  octaves: number;
  startNote: string;
  whiteNotesColour: string;
  blackNotesColour: string;
  hoverColour: string;
  activeColour: string;
  borderColour: string;
  keyboardLayout: string;
}

// Extensão do Window para WebAudioFont e QwertyHancock
declare global {
  interface Window {
    AudioContext: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
    WebAudioFontPlayer: {
      new (): WebAudioFontPlayer;
    };
    QwertyHancock: {
      new (config: QwertyHancockConfig): QwertyHancockKeyboard;
    };
    qwertyHancockFailed?: boolean;
    [key: string]: unknown;
  }
}

// Helper para acessar instrumentos WebAudioFont
const getWebAudioFontInstrument = (variableName: string): WebAudioFontInstrument | null => {
  if (typeof window === 'undefined') {
    console.log('❌ Window não disponível no getWebAudioFontInstrument');
    return null;
  }
  
  console.log(`🔍 Procurando instrumento: ${variableName}`);
  const instrument = (window as Record<string, unknown>)[variableName];
  
  if (!instrument) {
    console.error(`❌ Instrumento ${variableName} não encontrado`);
    console.log('🔍 Variáveis do window que contêm "tone":', 
      Object.keys(window).filter(key => key.toLowerCase().includes('tone')));
    return null;
  }
  
  if (typeof instrument !== 'object') {
    console.error(`❌ Instrumento ${variableName} não é um objeto:`, typeof instrument);
    return null;
  }
  
  console.log(`✅ Instrumento ${variableName} encontrado`);
  return instrument as WebAudioFontInstrument;
};

// Piano soundfont options with real samples and fallbacks
const pianoOptions = {
  grand: {
    name: '🎹 Grand Piano Clássico',
    urls: [
      'https://surikov.github.io/webaudiofontdata/sound/0001_JCLive_sf2_file.js',
      'https://cdn.jsdelivr.net/gh/surikov/webaudiofontdata@master/sound/0001_JCLive_sf2_file.js',
      'https://unpkg.com/webaudiofont@1.0.0/sound/0001_JCLive_sf2_file.js'
    ],
    variable: '_tone_0001_JCLive_sf2_file',
    description: 'Som rico e profundo de piano de cauda'
  },
  bright: {
    name: '✨ Grand Piano Brilhante', 
    urls: [
      'https://surikov.github.io/webaudiofontdata/sound/0020_Aspirin_sf2_file.js',
      'https://cdn.jsdelivr.net/gh/surikov/webaudiofontdata@master/sound/0020_Aspirin_sf2_file.js'
    ],
    variable: '_tone_0020_Aspirin_sf2_file',
    description: 'Som cristalino e definido'
  },
  warm: {
    name: '🔥 Grand Piano Caloroso',
    urls: [
      'https://surikov.github.io/webaudiofontdata/sound/0000_JCLive_sf2_file.js',
      'https://cdn.jsdelivr.net/gh/surikov/webaudiofontdata@master/sound/0000_JCLive_sf2_file.js'
    ],
    variable: '_tone_0000_JCLive_sf2_file',
    description: 'Som encorpado e envolvente'
  },
  vintage: {
    name: '📻 Piano Vintage',
    urls: [
      'https://surikov.github.io/webaudiofontdata/sound/0002_JCLive_sf2_file.js',
      'https://cdn.jsdelivr.net/gh/surikov/webaudiofontdata@master/sound/0002_JCLive_sf2_file.js'
    ],
    variable: '_tone_0002_JCLive_sf2_file', 
    description: 'Som clássico dos anos 70-80'
  },
  studio: {
    name: '🎙️ Piano de Estúdio',
    urls: [
      'https://surikov.github.io/webaudiofontdata/sound/0003_JCLive_sf2_file.js',
      'https://cdn.jsdelivr.net/gh/surikov/webaudiofontdata@master/sound/0003_JCLive_sf2_file.js'
    ],
    variable: '_tone_0003_JCLive_sf2_file',
    description: 'Som profissional de gravação'
  },
  simple: {
    name: '🎼 Piano Simples (Backup)',
    urls: [
      'https://surikov.github.io/webaudiofont/examples/sf2/0000_JCLive_sf2_file.js'
    ],
    variable: '_tone_0000_JCLive_sf2_file',
    description: 'Piano básico para conexões lentas'
  }
} as const;

const BeautifulPianoKeyboard: React.FC<BeautifulPianoKeyboardProps> = ({
  width,
  height,
  octaves = 4,
  startNote = 'C2',
  onNotePlay,
  onNoteStop,
}) => {
  // Estados principais
  const [mounted, setMounted] = useState(false);
  const [audioFontLoaded, setAudioFontLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pianoReady, setPianoReady] = useState(false);
  const [midiInputs, setMidiInputs] = useState<string[]>([]);
  const [lastMidiActivity, setLastMidiActivity] = useState<string>('');
  
  // Piano selection state
  const [selectedPiano, setSelectedPiano] = useState('grand');
  const [currentInstrument, setCurrentInstrument] = useState<WebAudioFontInstrument | null>(null);
  const [actualLoadedPiano, setActualLoadedPiano] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para piano HTML personalizado
  const [useHtmlPiano, setUseHtmlPiano] = useState(false);
  
  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const playerRef = useRef<WebAudioFontPlayer | null>(null);
  const keyboardRef = useRef<QwertyHancockKeyboard | null>(null);

  // Memoizar notas do piano HTML para evitar re-renders
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
    if (!match) return 60;
    
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
  }, []);

  // Função para tocar nota (usada por ambos os pianos)
  const playPianoNote = useCallback(async (note: string, frequency: number) => {
    if (!playerRef.current || !currentInstrument || !audioContextRef.current) {
      console.error('❌ Piano não disponível');
      return;
    }

    try {
      console.log(`🎵 Tocando nota: ${note} (${frequency}Hz)`);
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const midiNote = noteNameToMidi(note);
      
      playerRef.current.queueWaveTable(
        audioContextRef.current,
        audioContextRef.current.destination,
        currentInstrument,
        0,
        midiNote,
        2,
        0.8
      );

      if (onNotePlay) {
        onNotePlay(note, frequency);
      }
    } catch (playError) {
      console.error('❌ Erro ao tocar nota:', playError);
    }
  }, [noteNameToMidi, onNotePlay, currentInstrument]);

  // Status do piano com informações detalhadas
  const status = {
    text: error 
      ? `❌ ${error}`
      : !mounted
        ? '🔄 Inicializando componente...'
        : !audioFontLoaded 
          ? '🔄 Carregando WebAudioFont Player...'
          : isLoading
            ? '🔄 Carregando samples de piano...'
            : !pianoReady
              ? '🔄 Inicializando engine de áudio...'
              : !currentInstrument
                ? '🔄 Carregando soundfont do piano...'
                : actualLoadedPiano === 'simple' && selectedPiano !== 'simple'
                  ? `⚠️ Piano backup ativo (${pianoOptions.simple.name}) - conexão lenta detectada`
                  : useHtmlPiano
                    ? `✅ Piano HTML com ${pianoOptions[actualLoadedPiano as keyof typeof pianoOptions]?.name || 'samples reais'} pronto!`
                    : `✅ Piano QwertyHancock com ${pianoOptions[actualLoadedPiano as keyof typeof pianoOptions]?.name || 'samples reais'} pronto!`,
    color: error 
      ? 'bg-red-100 text-red-800 border border-red-200'
      : !mounted || !audioFontLoaded || isLoading || !pianoReady || !currentInstrument
        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
        : actualLoadedPiano === 'simple' && selectedPiano !== 'simple'
          ? 'bg-orange-100 text-orange-800 border border-orange-200'
          : useHtmlPiano
            ? 'bg-blue-100 text-blue-800 border border-blue-200'
            : 'bg-green-100 text-green-800 border border-green-200',
    icon: error 
      ? '❌' 
      : !mounted || !audioFontLoaded || isLoading || !pianoReady || !currentInstrument 
        ? '⏳' 
        : actualLoadedPiano === 'simple' && selectedPiano !== 'simple'
          ? '⚠️'
          : useHtmlPiano 
            ? '🖥️' 
            : '🎹'
  };

  // Handler para mensagens MIDI
  const handleMIDIMessage = useCallback((message: WebMidi.MIDIMessageEvent) => {
    console.log('🎹 === MIDI MESSAGE RECEIVED ===');
    const [command, note, velocity] = message.data;
    
    const timestamp = new Date().toLocaleTimeString();
    const activityText = `${timestamp} - Note ${note}, Vel ${velocity}`;
    setLastMidiActivity(activityText);
    
    const isNoteOn = (command & 0xf0) === 0x90 && velocity > 0;
    
    if (isNoteOn && playerRef.current && currentInstrument && audioContextRef.current) {
      console.log(`🎹 Playing MIDI note: ${note} (velocity: ${velocity})`);
      
      try {
        playerRef.current.queueWaveTable(
          audioContextRef.current, 
          audioContextRef.current.destination,
          currentInstrument, 
          0,
          note,
          (60 / 120) * velocity / 127,
          velocity / 127
        );
        
        if (onNotePlay) {
          const frequency = 440 * Math.pow(2, (note - 69) / 12);
          const noteName = getNoteNameFromMidi(note);
          onNotePlay(noteName, frequency);
        }
        
        console.log('✅ MIDI Note played successfully!');
      } catch (midiPlayError) {
        const errorMessage = midiPlayError instanceof Error ? midiPlayError.message : String(midiPlayError);
        console.error('❌ Erro ao tocar nota MIDI:', errorMessage);
      }
    }
    
    console.log('🎹 === END MIDI MESSAGE ===\n');
  }, [onNotePlay, getNoteNameFromMidi, currentInstrument]);

  // Carregar piano específico com sistema de fallback
  const loadPiano = useCallback(async (pianoType: keyof typeof pianoOptions): Promise<void> => {
    console.log(`🎹 === CARREGANDO PIANO ${pianoType.toUpperCase()} ===`);
    
    if (!playerRef.current || !audioContextRef.current) {
      console.error('❌ Player ou AudioContext não disponível');
      throw new Error('Player ou AudioContext não disponível');
    }
    
    const piano = pianoOptions[pianoType];
    setIsLoading(true);
    
    for (let urlIndex = 0; urlIndex < piano.urls.length; urlIndex++) {
      const url = piano.urls[urlIndex];
      console.log(`🎹 Tentativa ${urlIndex + 1}/${piano.urls.length}: ${url}`);
      
      try {
        if (!playerRef.current.loader?.startLoad || !playerRef.current.loader?.waitLoad) {
          throw new Error('WebAudioFontPlayer.loader não disponível');
        }
        
        playerRef.current.loader.startLoad(audioContextRef.current, url, piano.variable);
        
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error(`Timeout no carregamento via ${url} (10s)`));
          }, 10000);
          
          playerRef.current!.loader.waitLoad(() => {
            clearTimeout(timeout);
            
            try {
              const instrument = getWebAudioFontInstrument(piano.variable);
              
              if (!instrument) {
                reject(new Error(`Instrumento não encontrado: ${piano.variable}`));
                return;
              }
              
              setCurrentInstrument(instrument);
              setActualLoadedPiano(pianoType);
              resolve();
            } catch (instrumentError) {
              reject(instrumentError);
            }
          });
        });
        
        console.log(`✅ === PIANO ${pianoType.toUpperCase()} CARREGADO COM SUCESSO ===`);
        return;
        
      } catch (loadError) {
        const errorMessage = loadError instanceof Error ? loadError.message : String(loadError);
        console.error(`❌ Erro na tentativa ${urlIndex + 1}:`, errorMessage);
        
        if (urlIndex === piano.urls.length - 1) {
          if (pianoType !== 'simple') {
            console.log('🔄 Todas as tentativas falharam, tentando piano de backup...');
            try {
              await loadPiano('simple');
              setActualLoadedPiano('simple');
              return;
            } catch (backupLoadError) {
              const backupErrorMessage = backupLoadError instanceof Error ? backupLoadError.message : String(backupLoadError);
              throw new Error(`Falha completa: ${errorMessage}. Backup: ${backupErrorMessage}`);
            }
          } else {
            throw new Error(`Todas as tentativas falharam: ${errorMessage}`);
          }
        }
      }
    }
  }, []);

  // Inicializar WebAudioFont
  const initWebAudioFont = useCallback(async (): Promise<void> => {
    try {
      console.log('🎹 === INICIALIZANDO WEBAUDIOFONT ===');
      
      if (typeof window === 'undefined') {
        throw new Error('Window não disponível (SSR)');
      }
      
      if (!window.WebAudioFontPlayer) {
        throw new Error('WebAudioFontPlayer não está disponível');
      }
      
      const AudioContextFunc = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextFunc) {
        throw new Error('AudioContext not supported');
      }
      
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        const audioContext = new AudioContextFunc();
        audioContextRef.current = audioContext;
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      const player = new window.WebAudioFontPlayer();
      playerRef.current = player;
      
      if (!player.loader) {
        throw new Error('WebAudioFontPlayer.loader não disponível');
      }
      
      try {
        await loadPiano('grand');
      } catch (loadError) {
        console.log('⚠️ Piano padrão falhou:', loadError instanceof Error ? loadError.message : 'erro desconhecido');
        await loadPiano('simple');
      }
      
      setPianoReady(true);
      
    } catch (webAudioError) {
      const errorMessage = webAudioError instanceof Error ? webAudioError.message : String(webAudioError);
      console.error('❌ === ERRO WEBAUDIOFONT ===', errorMessage);
      setError(`Erro ao carregar engine de áudio: ${errorMessage}`);
      setPianoReady(false);
    } finally {
      setIsLoading(false);
    }
  }, [loadPiano]);

  // Inicializar MIDI
  const initMIDI = useCallback(async (): Promise<void> => {
    try {
      if (navigator.requestMIDIAccess) {
        const midiAccess = await navigator.requestMIDIAccess();
        
        const inputs = Array.from(midiAccess.inputs.values());
        const inputNames = inputs.map(input => input.name || 'Unknown Device');
        setMidiInputs(inputNames);
        
        inputs.forEach((input) => {
          input.onmidimessage = (event: WebMidi.MIDIMessageEvent) => {
            handleMIDIMessage(event);
          };
        });
        
        midiAccess.onstatechange = (event: Event) => {
          const midiEvent = event as MIDIConnectionEvent;
          console.log('🎹 MIDI State change:', midiEvent);
        };
      }
    } catch (midiError) {
      const errorMessage = midiError instanceof Error ? midiError.message : String(midiError);
      console.error('❌ Erro ao inicializar MIDI:', errorMessage);
    }
  }, [handleMIDIMessage]);

  // Componente de Piano HTML personalizado
  const HtmlPiano = React.memo(() => {
    const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());

    const playNote = useCallback(async (noteData: { note: string, octave: number, midi: number }) => {
      if (!playerRef.current || !currentInstrument || !audioContextRef.current) {
        console.error('❌ Piano não disponível para tocar');
        return;
      }

      try {
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }

        playerRef.current.queueWaveTable(
          audioContextRef.current,
          audioContextRef.current.destination,
          currentInstrument,
          0,
          noteData.midi,
          2,
          0.8
        );

        if (onNotePlay) {
          const frequency = 440 * Math.pow(2, (noteData.midi - 69) / 12);
          onNotePlay(`${noteData.note}${noteData.octave}`, frequency);
        }
      } catch (pianoError) {
        const errorMessage = pianoError instanceof Error ? pianoError.message : String(pianoError);
        console.error('❌ Erro ao tocar nota:', errorMessage);
      }
    }, []);

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
    }, [activeNotes, playNote]);

    const whiteKeys = pianoNotes.filter(n => n.white);
    const blackKeys = pianoNotes.filter(n => !n.white);

    return (
      <div className="w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="text-center py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
          <div className="text-sm text-gray-700 font-medium">
            🎹 Piano HTML Personalizado
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Clique nas teclas ou use o teclado do PC
          </div>
        </div>
        
        <div className="relative bg-gray-900 p-4" style={{ minHeight: '200px', height: '220px' }}>
          <div className="relative h-full flex justify-center items-center">
            <div className="flex h-full shadow-lg rounded-b-lg overflow-hidden">
              {whiteKeys.map((noteData) => (
                <button
                  key={`${noteData.note}${noteData.octave}`}
                  onMouseDown={() => playNote(noteData)}
                  className={`border-r border-gray-300 last:border-r-0 transition-all duration-150 flex flex-col justify-end items-center pb-3 relative group ${
                    activeNotes.has(noteData.key) 
                      ? 'bg-green-200 shadow-inner' 
                      : 'bg-white hover:bg-gray-50 active:bg-gray-100'
                  }`}
                  style={{ 
                    width: '45px',
                    height: '180px',
                    minWidth: '40px'
                  }}
                >
                  <div className="text-center">
                    <div className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">
                      {noteData.note}{noteData.octave}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 bg-gray-100 px-1 rounded">
                      {noteData.key}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-full flex pointer-events-none">
              {blackKeys.map((noteData) => {
                const whiteKeyIndex = whiteKeys.findIndex(w => w.midi === noteData.midi - 1);
                const whiteKeyWidth = 45;
                const startOffset = -(whiteKeys.length * whiteKeyWidth) / 2;
                const position = startOffset + (whiteKeyIndex * whiteKeyWidth) + (whiteKeyWidth / 2);
                
                return (
                  <button
                    key={`${noteData.note}${noteData.octave}`}
                    onMouseDown={() => playNote(noteData)}
                    className={`absolute text-white font-bold flex flex-col items-center justify-end pb-2 transition-all duration-150 pointer-events-auto shadow-xl rounded-b-md ${
                      activeNotes.has(noteData.key)
                        ? 'bg-green-700 shadow-inner'
                        : 'bg-gray-900 hover:bg-gray-800 active:bg-black'
                    }`}
                    style={{
                      left: `${position}px`,
                      width: '28px',
                      height: '120px',
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
  });

  HtmlPiano.displayName = 'HtmlPiano';

  // Função para trocar piano
  const changePiano = useCallback(async (pianoType: keyof typeof pianoOptions): Promise<void> => {
    if (pianoType === selectedPiano || isLoading) return;
    
    console.log(`🎹 Trocando para piano: ${pianoOptions[pianoType].name}`);
    setSelectedPiano(pianoType);
    
    try {
      await loadPiano(pianoType);
      setActualLoadedPiano(pianoType);
      console.log('✅ Piano trocado com sucesso!');
    } catch (changeError) {
      const errorMessage = changeError instanceof Error ? changeError.message : String(changeError);
      console.error('❌ Erro ao trocar piano:', errorMessage);
      setSelectedPiano(actualLoadedPiano);
    }
  }, [selectedPiano, loadPiano, actualLoadedPiano, isLoading]);

  // Effect para carregar scripts
  useEffect(() => {
    const loadScripts = (): void => {
      try {
        if (typeof window === 'undefined') return;
        
        if (!window.WebAudioFontPlayer) {
          const playerScript = document.createElement('script');
          playerScript.src = 'https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js';
          playerScript.onload = () => setAudioFontLoaded(true);
          playerScript.onerror = () => setError('Erro ao carregar WebAudioFont');
          document.head.appendChild(playerScript);
        } else {
          setAudioFontLoaded(true);
        }
        
        if (!window.QwertyHancock) {
          const keyboardScript = document.createElement('script');
          keyboardScript.src = 'https://cdn.jsdelivr.net/npm/qwerty-hancock@0.6.2/dist/qwerty-hancock.min.js';
          keyboardScript.onerror = () => {
            const fallbackScript = document.createElement('script');
            fallbackScript.src = 'https://unpkg.com/qwerty-hancock@0.6.2/dist/qwerty-hancock.min.js';
            fallbackScript.onerror = () => {
              window.qwertyHancockFailed = true;
            };
            document.head.appendChild(fallbackScript);
          };
          document.head.appendChild(keyboardScript);
        }
      } catch (scriptError) {
        const errorMessage = scriptError instanceof Error ? scriptError.message : String(scriptError);
        setError('Erro ao carregar bibliotecas');
      }
    };

    if (!mounted) {
      setMounted(true);
      loadScripts();
    }
  }, [mounted]);

  // Effect para inicializar quando scripts estiverem prontos
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (audioFontLoaded && mounted) {
      if (!window.WebAudioFontPlayer) {
        setError('WebAudioFontPlayer não carregado corretamente');
        return;
      }
      
      const initTimer = setTimeout(() => {
        initWebAudioFont().catch((initError) => {
          const errorMessage = initError instanceof Error ? initError.message : String(initError);
          setError(`Erro na inicialização: ${errorMessage}`);
        });
        
        initMIDI().catch((midiError) => {
          const errorMessage = midiError instanceof Error ? midiError.message : String(midiError);
          console.error('❌ Erro na inicialização do MIDI:', errorMessage);
        });
      }, 100);
      
      return () => clearTimeout(initTimer);
    }
  }, [audioFontLoaded, mounted, initWebAudioFont, initMIDI]);

  // Effect para inicializar teclado visual quando piano estiver pronto
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!pianoReady || !mounted) return;

    const initTimer = setTimeout(() => {
      if (!window.QwertyHancock && !useHtmlPiano) {
        setUseHtmlPiano(true);
        return;
      }

      if (!window.QwertyHancock) return;

      const initKeyboard = () => {
        try {
          const container = document.getElementById('piano-container');
          if (container) {
            container.innerHTML = '';
            
            const containerWidth = container.offsetWidth;
            const pianoWidth = Math.min(width || containerWidth - 40, containerWidth - 20);
            const pianoHeight = height || 180;

            const keyboard = new window.QwertyHancock({
              id: 'piano-container',
              width: pianoWidth,
              height: pianoHeight,
              octaves: octaves || 4,
              startNote: startNote || 'C2',
              whiteNotesColour: '#ffffff',
              blackNotesColour: '#333333',
              hoverColour: '#f0f0f0',
              activeColour: '#4CAF50',
              borderColour: '#000000',
              keyboardLayout: 'en'
            });

            keyboardRef.current = keyboard;

            keyboard.keyDown = (note: string, frequency: number) => {
              playPianoNote(note, frequency);
            };

            keyboard.keyUp = (note: string, frequency: number) => {
              if (onNoteStop) {
                onNoteStop(note, frequency);
              }
            };
          }
        } catch (keyboardError) {
          const errorMessage = keyboardError instanceof Error ? keyboardError.message : String(keyboardError);
          console.error('❌ Erro ao inicializar QwertyHancock:', errorMessage);
          console.log('🎹 Fallback para piano HTML...');
          setUseHtmlPiano(true);
        }
      };

      initKeyboard();
    }, 1000);

    return () => clearTimeout(initTimer);
  }, [pianoReady, mounted, width, height, octaves, startNote, onNoteStop, playPianoNote, useHtmlPiano]);

  return (
    <div className="w-full max-w-3xl mx-auto p-3 sm:p-4 lg:p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800">
          🎹 Piano Virtual com Samples Reais
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Piano de alta qualidade com soundfonts reais de pianos profissionais
        </p>
      </div>

      {/* Seletor de Piano */}
      <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 sm:p-4 border border-purple-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center sm:text-left">
          🎨 Escolha seu Piano
          <span className="block sm:inline text-xs text-gray-500 font-normal mt-1 sm:mt-0 sm:ml-2">
            Samples reais de pianos profissionais
          </span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(pianoOptions).map(([key, piano]) => (
            <button
              key={key}
              onClick={() => changePiano(key as keyof typeof pianoOptions)}
              disabled={isLoading}
              className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                selectedPiano === key
                  ? 'border-purple-500 bg-purple-100 text-purple-800'
                  : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${key === 'simple' ? 'border-yellow-300 bg-yellow-50' : ''}`}
            >
              <div className="font-semibold text-sm">{piano.name}</div>
              <div className="text-xs text-gray-600 mt-1">{piano.description}</div>
              {key === 'simple' && (
                <div className="text-xs text-yellow-600 mt-1 font-semibold">⚡ Carregamento rápido</div>
              )}
              {isLoading && selectedPiano === key && (
                <div className="text-xs text-orange-600 mt-1 font-semibold">🔄 Carregando...</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="mb-4">
        <div className={`text-sm p-3 rounded-lg ${status.color}`}>
          <div className="flex items-center gap-2">
            <span>{status.icon}</span>
            <span className="flex-1 min-w-0">{status.text}</span>
          </div>
        </div>
        
        {/* Debug info quando em desenvolvimento */}
        {(error || !pianoReady) && (
          <div className="mt-2 bg-gray-100 rounded-lg p-3">
            <div className="text-xs text-gray-600">
              <div className="font-semibold mb-2">🔍 Debug Info:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                <div>mounted: {mounted ? '✅' : '❌'}</div>
                <div>audioFontLoaded: {audioFontLoaded ? '✅' : '❌'}</div>
                <div>pianoReady: {pianoReady ? '✅' : '❌'}</div>
                <div>currentInstrument: {currentInstrument ? '✅' : '❌'}</div>
                <div>Piano selecionado: {selectedPiano}</div>
                <div>Piano carregado: {actualLoadedPiano || 'nenhum'}</div>
                <div>WebAudioFontPlayer: {typeof window !== 'undefined' && typeof window.WebAudioFontPlayer !== 'undefined' ? '✅' : '❌'}</div>
                <div>QwertyHancock: {typeof window !== 'undefined' && typeof window.QwertyHancock !== 'undefined' ? '✅' : '❌'}</div>
                <div className="sm:col-span-2">Piano HTML: {useHtmlPiano ? '✅ Ativo' : '❌ Inativo'}</div>
              </div>
              <div className="flex gap-1 flex-wrap justify-center sm:justify-start">
                <button
                  onClick={() => {
                    console.log('🔍 === DEBUG COMPLETO ===');
                    console.log('Estado do componente:', {
                      mounted,
                      audioFontLoaded,
                      pianoReady,
                      currentInstrument: !!currentInstrument,
                      selectedPiano,
                      error
                    });
                  }}
                  className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs hover:bg-blue-300"
                >
                  Debug Console
                </button>
                
                <button
                  onClick={async () => {
                    if (typeof window !== 'undefined' && window.WebAudioFontPlayer) {
                      try {
                        setError(null);
                        setPianoReady(false);
                        setCurrentInstrument(null);
                        await initWebAudioFont();
                      } catch (forceError) {
                        const errorMessage = forceError instanceof Error ? forceError.message : String(forceError);
                        console.error('❌ Erro na força inicialização:', errorMessage);
                      }
                    }
                  }}
                  className="px-2 py-1 bg-orange-200 text-orange-800 rounded text-xs hover:bg-orange-300"
                >
                  Força Init
                </button>
                
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      document.querySelectorAll('script[src*="webaudiofont"], script[src*="qwerty-hancock"]').forEach(script => {
                        script.remove();
                      });
                      
                      setAudioFontLoaded(false);
                      setPianoReady(false);
                      setCurrentInstrument(null);
                      setActualLoadedPiano('');
                      setError(null);
                      
                      setTimeout(() => {
                        setMounted(false);
                        setTimeout(() => setMounted(true), 100);
                      }, 100);
                    }
                  }}
                  className="px-2 py-1 bg-purple-200 text-purple-800 rounded text-xs hover:bg-purple-300"
                >
                  Recarregar
                </button>
                
                <button
                  onClick={() => {
                    setUseHtmlPiano(!useHtmlPiano);
                  }}
                  className="px-2 py-1 bg-indigo-200 text-indigo-800 rounded text-xs hover:bg-indigo-300"
                >
                  {useHtmlPiano ? '🎹 → QwertyHancock' : '🖥️ → Piano HTML'}
                </button>
                
                <button
                  onClick={async () => {
                    if (playerRef.current && currentInstrument && audioContextRef.current) {
                      try {
                        if (audioContextRef.current.state === 'suspended') {
                          await audioContextRef.current.resume();
                        }
                        
                        playerRef.current.queueWaveTable(
                          audioContextRef.current, 
                          audioContextRef.current.destination,
                          currentInstrument, 
                          0,
                          60,
                          2,
                          0.8
                        );
                      } catch (manualError) {
                        const errorMessage = manualError instanceof Error ? manualError.message : String(manualError);
                        console.error('❌ Erro no teste manual:', errorMessage);
                      }
                    }
                  }}
                  className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs hover:bg-green-300"
                >
                  🎵 Teste Som
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Status MIDI separado se houver dispositivos conectados */}
        {midiInputs.length > 0 && (
          <div className="mt-2 space-y-2">
            <div className="text-xs p-2 rounded bg-blue-50 text-blue-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span>🎹</span>
                  <span className="ml-2">
                    <strong>MIDI conectado:</strong> {midiInputs.join(', ')}
                  </span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={async () => {
                      if (playerRef.current && currentInstrument && audioContextRef.current) {
                        try {
                          playerRef.current.queueWaveTable(
                            audioContextRef.current, 
                            audioContextRef.current.destination,
                            currentInstrument, 
                            0,
                            60,
                            1,
                            0.8
                          );
                        } catch (pianoTestError) {
                          const errorMessage = pianoTestError instanceof Error ? pianoTestError.message : String(pianoTestError);
                          console.error('❌ Erro no teste do piano:', errorMessage);
                        }
                      }
                    }}
                    className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs hover:bg-blue-300 whitespace-nowrap"
                  >
                    Teste Piano
                  </button>
                  <button
                    onClick={() => {
                      console.log('🎹 === DEBUG MIDI ===');
                      console.log('🎹 MIDI Inputs:', midiInputs);
                      console.log('🎹 Piano ready:', pianoReady);
                      console.log('🎹 Current instrument:', currentInstrument);
                    }}
                    className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs hover:bg-green-300 whitespace-nowrap"
                  >
                    Debug MIDI
                  </button>
                </div>
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

      {/* Container do piano */}
      <div className="mb-6">
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
          {useHtmlPiano ? (
            <HtmlPiano />
          ) : (
            <div id="piano-container" className="w-full flex justify-center">
              {!pianoReady && (
                <div className="flex items-center justify-center w-full h-48 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎹</div>
                    <div className="text-gray-600">Carregando piano...</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Instruções de como tocar */}
      <div className="mb-6">
        <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200">
          <h4 className="font-semibold text-green-800 mb-4 text-center text-base sm:text-lg">
            🎹 Como tocar este piano virtual
          </h4>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-3 shadow-sm border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🖱️</span>
                <span className="font-semibold text-gray-700">Mouse</span>
              </div>
              <p className="text-sm text-gray-600">
                Clique diretamente nas teclas do piano para tocar as notas
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-3 shadow-sm border border-green-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">⌨️</span>
                <span className="font-semibold text-gray-700">Teclado do Computador</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Use as teclas do seu teclado para tocar:
              </p>
              
              {useHtmlPiano ? (
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-700 mb-2">Teclas brancas:</div>
                    <div className="flex flex-wrap gap-1">
                      {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map(key => (
                        <span key={key} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-mono">
                          {key}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-700 mb-2">Teclas pretas:</div>
                    <div className="flex flex-wrap gap-1">
                      {['2', '3', '5', '6', '7', '9', '0'].map(key => (
                        <span key={key} className="bg-gray-800 text-white px-2 py-1 rounded text-xs font-mono">
                          {key}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map(key => (
                      <span key={key} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-mono">
                        {key}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Teclas pretas: W, E, T, Y, U, O, P
                  </p>
                </div>
              )}
            </div>
            
            {midiInputs.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🎛️</span>
                  <span className="font-semibold text-blue-800">Controlador MIDI</span>
                </div>
                <p className="text-sm text-blue-700">
                  <strong>Conectado:</strong> {midiInputs.join(', ')}
                  <br />
                  <span className="text-xs">Toque diretamente no seu controlador!</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Informações técnicas */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <div className="text-center">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700">📊</span>
              <span>{octaves} oitavas • {startNote}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700">🔊</span>
              <span>{pianoReady ? '🟢 WebAudioFont' : '🟡 Carregando...'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700">⚡</span>
              <span>Samples reais de piano</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700">🎹</span>
              <span>{useHtmlPiano ? 'Piano HTML' : 'QwertyHancock'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700">🎨</span>
              <span className="truncate max-w-32 sm:max-w-none">
                {pianoOptions[actualLoadedPiano as keyof typeof pianoOptions]?.name || 'Carregando...'}
                {actualLoadedPiano === 'simple' && selectedPiano !== 'simple' && (
                  <span className="text-xs bg-orange-100 text-orange-600 px-1 rounded ml-1">(backup)</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(BeautifulPianoKeyboard);