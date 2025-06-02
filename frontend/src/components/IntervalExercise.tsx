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
  // Definição básica do instrumento WebAudioFont
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
  // Piano de emergência - mais leve e rápido
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
  const [actualLoadedPiano, setActualLoadedPiano] = useState<string>(''); // Piano que realmente carregou
  
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
  }, []);

  // Função para tocar nota (usada por ambos os pianos)
  const playPianoNote = useCallback(async (note: string, frequency: number) => {
    if (!playerRef.current || !currentInstrument || !audioContextRef.current) {
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
      
      playerRef.current.queueWaveTable(
        audioContextRef.current,
        audioContextRef.current.destination,
        currentInstrument,
        0, // when
        midiNote, // pitch
        2, // duration
        0.8 // volume
      );

      if (onNotePlay) {
        onNotePlay(note, frequency);
      }
    } catch (error) {
      console.error('❌ Erro ao tocar nota:', error);
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

  // Handler para mensagens MIDI
  const handleMIDIMessage = useCallback((message: WebMidi.MIDIMessageEvent) => {
    console.log('🎹 === MIDI MESSAGE RECEIVED ===');
    const [command, note, velocity] = message.data;
    
    // Atualizar indicador de atividade MIDI
    const timestamp = new Date().toLocaleTimeString();
    const activityText = `${timestamp} - Note ${note}, Vel ${velocity}`;
    setLastMidiActivity(activityText);
    
    // Note On (144) e Note Off (128)
    const isNoteOn = (command & 0xf0) === 0x90 && velocity > 0;
    
    if (isNoteOn && playerRef.current && currentInstrument && audioContextRef.current) {
      console.log(`🎹 Playing MIDI note: ${note} (velocity: ${velocity})`);
      
      try {
        // Tocar nota usando WebAudioFont
        playerRef.current.queueWaveTable(
          audioContextRef.current, 
          audioContextRef.current.destination,
          currentInstrument, 
          0, // when (now)
          note, // pitch 
          (60 / 120) * velocity / 127, // duration based on velocity
          velocity / 127 // volume
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
      console.error('❌ Player ou AudioContext não disponível:');
      console.error('  - player:', !!playerRef.current);
      console.error('  - audioContext:', !!audioContextRef.current);
      throw new Error('Player ou AudioContext não disponível');
    }
    
    const piano = pianoOptions[pianoType];
    console.log(`🎹 Carregando: ${piano.name}`);
    console.log(`🎹 URLs disponíveis: ${piano.urls.length}`);
    console.log(`🎹 Variable: ${piano.variable}`);
    
    // Tentar carregar com cada URL disponível
    for (let urlIndex = 0; urlIndex < piano.urls.length; urlIndex++) {
      const url = piano.urls[urlIndex];
      console.log(`🎹 Tentativa ${urlIndex + 1}/${piano.urls.length}: ${url}`);
      
      try {
        console.log('📥 Iniciando download do soundfont...');
        
        // Verificar se o loader existe
        if (!playerRef.current.loader) {
          throw new Error('WebAudioFontPlayer.loader não disponível');
        }
        
        if (!playerRef.current.loader.startLoad) {
          throw new Error('WebAudioFontPlayer.loader.startLoad não disponível');
        }
        
        if (!playerRef.current.loader.waitLoad) {
          throw new Error('WebAudioFontPlayer.loader.waitLoad não disponível');
        }
        
        // Load the soundfont com timeout menor para cada tentativa
        playerRef.current.loader.startLoad(audioContextRef.current, url, piano.variable);
        console.log('✅ startLoad executado');
        
        console.log('⏳ Aguardando carregamento (timeout: 10s)...');
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error(`Timeout no carregamento via ${url} (10s)`));
          }, 10000); // Timeout menor de 10s por tentativa
          
          playerRef.current!.loader.waitLoad(() => {
            clearTimeout(timeout);
            console.log('✅ Download completo, verificando instrumento...');
            
            try {
              const instrument = getWebAudioFontInstrument(piano.variable);
              
              if (!instrument) {
                console.error(`❌ Instrumento não encontrado: ${piano.variable}`);
                console.error('🔍 Variáveis disponíveis no window:', Object.keys(window).filter(key => key.includes('tone')));
                reject(new Error(`Instrumento não encontrado: ${piano.variable}`));
                return;
              }
              
              console.log('✅ Instrumento carregado:', piano.variable);
              console.log('🔍 Zones do instrumento:', instrument.zones?.length || 0);
              setCurrentInstrument(instrument);
              setActualLoadedPiano(pianoType); // Definir qual piano foi carregado
              console.log(`✅ Piano ${piano.name} configurado!`);
              resolve();
            } catch (instrumentError) {
              const errorMessage = instrumentError instanceof Error ? instrumentError.message : String(instrumentError);
              console.error('❌ Erro ao processar instrumento:', errorMessage);
              reject(instrumentError);
            }
          });
        });
        
        console.log(`✅ === PIANO ${pianoType.toUpperCase()} CARREGADO COM SUCESSO ===`);
        return; // Sucesso! Sair do loop
        
      } catch (loadError) {
        const errorMessage = loadError instanceof Error ? loadError.message : String(loadError);
        console.error(`❌ Erro na tentativa ${urlIndex + 1}:`, errorMessage);
        
        // Se é a última tentativa, tentar piano de backup
        if (urlIndex === piano.urls.length - 1) {
          if (pianoType !== 'simple') {
            console.log('🔄 Todas as tentativas falharam, tentando piano de backup...');
            try {
              await loadPiano('simple');
              setActualLoadedPiano('simple'); // Piano de backup carregado
              console.log('✅ Piano de backup carregado com sucesso!');
              return;
            } catch (backupLoadError) {
              const backupErrorMessage = backupLoadError instanceof Error ? backupLoadError.message : String(backupLoadError);
              console.error('❌ Piano de backup também falhou:', backupErrorMessage);
              throw new Error(`Falha completa: ${errorMessage}. Backup: ${backupErrorMessage}`);
            }
          } else {
            throw new Error(`Todas as tentativas falharam: ${errorMessage}`);
          }
        }
        
        // Continuar para próxima URL
        console.log(`🔄 Tentando próxima URL...`);
      }
    }
  }, []);

  // Inicializar WebAudioFont
  const initWebAudioFont = useCallback(async (): Promise<void> => {
    try {
      console.log('🎹 === INICIALIZANDO WEBAUDIOFONT ===');
      
      // Verificar se está no cliente
      if (typeof window === 'undefined') {
        throw new Error('Window não disponível (SSR)');
      }
      
      // Verificar se WebAudioFontPlayer está disponível
      if (!window.WebAudioFontPlayer) {
        throw new Error('WebAudioFontPlayer não está disponível');
      }
      
      console.log('🎹 Criando AudioContext...');
      // Create audio context
      const AudioContextFunc = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextFunc) {
        throw new Error('AudioContext not supported');
      }
      
      // Criar novo contexto se não existir ou estiver fechado
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        const audioContext = new AudioContextFunc();
        audioContextRef.current = audioContext;
        console.log('✅ Novo AudioContext criado:', audioContext.state);
      } else {
        console.log('✅ AudioContext existente:', audioContextRef.current.state);
      }
      
      // Retomar contexto se estiver suspenso
      if (audioContextRef.current.state === 'suspended') {
        console.log('🔄 Retomando AudioContext suspenso...');
        await audioContextRef.current.resume();
        console.log('✅ AudioContext retomado:', audioContextRef.current.state);
      }
      
      console.log('🎹 Criando WebAudioFontPlayer...');
      // Create player
      const player = new window.WebAudioFontPlayer();
      playerRef.current = player;
      console.log('✅ WebAudioFontPlayer criado');
      
      // Verificar se o loader existe
      if (!player.loader) {
        throw new Error('WebAudioFontPlayer.loader não disponível');
      }
      
      console.log('🎹 Carregando piano padrão...');
      // Tentar carregar piano padrão com fallback para piano simples
      try {
        await loadPiano('grand');
      } catch (error) {
        console.log('⚠️ Piano padrão falhou, tentando piano simples...');
        await loadPiano('simple');
      }
      
      console.log('✅ === WEBAUDIOFONT INICIALIZADO ===');
      setPianoReady(true);
      
    } catch (webAudioError) {
      const errorMessage = webAudioError instanceof Error ? webAudioError.message : String(webAudioError);
      console.error('❌ === ERRO WEBAUDIOFONT ===');
      console.error('Erro:', errorMessage);
      console.error('Stack:', webAudioError instanceof Error ? webAudioError.stack : 'N/A');
      setError(`Erro ao carregar engine de áudio: ${errorMessage}`);
      setPianoReady(false);
    }
  }, [loadPiano]);

  // Inicializar MIDI
  const initMIDI = useCallback(async (): Promise<void> => {
    try {
      if (navigator.requestMIDIAccess) {
        console.log('🎹 === INICIALIZANDO MIDI ===');
        const midiAccess = await navigator.requestMIDIAccess();
        
        const inputs = Array.from(midiAccess.inputs.values());
        const inputNames = inputs.map(input => input.name || 'Unknown Device');
        setMidiInputs(inputNames);
        
        console.log(`🎹 MIDI inicializado! ${inputs.length} dispositivos encontrados:`);
        inputs.forEach((input, i) => {
          console.log(`🎹   [${i}] ${input.name || 'Unknown'}`);
        });
        
        // Configurar listeners para cada input MIDI
        inputs.forEach((input) => {
          input.onmidimessage = (event: WebMidi.MIDIMessageEvent) => {
            handleMIDIMessage(event);
          };
        });
        
        // Evento para detectar mudanças nos dispositivos MIDI
        midiAccess.onstatechange = (event: Event) => {
          const midiEvent = event as MIDIConnectionEvent;
          console.log('🎹 MIDI State change:', midiEvent);
          if (midiEvent.port) {
            console.log('🎹 Port:', midiEvent.port.name, 'State:', midiEvent.port.state);
          }
        };
        
        console.log('🎹 === MIDI SETUP COMPLETE ===');
        
      } else {
        console.log('❌ Web MIDI API não suportada neste navegador');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Erro ao inicializar MIDI:', errorMessage);
    }
  }, [handleMIDIMessage]);

  // Componente de Piano HTML personalizado
  const HtmlPiano = () => {
    const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());

    const playNote = async (noteData: { note: string, octave: number, midi: number }) => {
      if (!playerRef.current || !currentInstrument || !audioContextRef.current) {
        console.error('❌ Piano não disponível para tocar');
        return;
      }

      try {
        console.log(`🎵 Tocando ${noteData.note}${noteData.octave} (MIDI: ${noteData.midi})`);
        
        // Retomar contexto se suspenso
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }

        playerRef.current.queueWaveTable(
          audioContextRef.current,
          audioContextRef.current.destination,
          currentInstrument,
          0, // when
          noteData.midi, // pitch
          2, // duration
          0.8 // volume
        );

        if (onNotePlay) {
          const frequency = 440 * Math.pow(2, (noteData.midi - 69) / 12);
          onNotePlay(`${noteData.note}${noteData.octave}`, frequency);
        }
      } catch (pianoError) {
        const errorMessage = pianoError instanceof Error ? pianoError.message : String(pianoError);
        console.error('❌ Erro ao tocar nota:', errorMessage);
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
    }, [activeNotes]); // Removido pianoNotes das dependências

    const whiteKeys = pianoNotes.filter(n => n.white);
    const blackKeys = pianoNotes.filter(n => !n.white);

    return (
      <div className="relative bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '200px' }}>
        <div className="text-center py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-sm text-gray-600 border-b">
          🎹 Piano HTML Personalizado • Clique nas teclas ou use o teclado do PC
        </div>
        
        {/* Container das teclas */}
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

  // Effect para carregar scripts
  useEffect(() => {
    const loadScripts = (): void => {
      try {
        console.log('📦 === CARREGANDO SCRIPTS ===');
        
        // Verificar se está no cliente
        if (typeof window === 'undefined') {
          console.log('⚠️ Não está no cliente, pulando carregamento de scripts');
          return;
        }
        
        // Load WebAudioFont Player
        if (!window.WebAudioFontPlayer) {
          console.log('📦 Carregando WebAudioFontPlayer...');
          const playerScript = document.createElement('script');
          playerScript.src = 'https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js';
          playerScript.onload = () => {
            console.log('✅ WebAudioFontPlayer carregado com sucesso!');
            console.log('🔍 Verificando WebAudioFontPlayer:', typeof window.WebAudioFontPlayer);
            setAudioFontLoaded(true);
          };
          playerScript.onerror = (scriptError) => {
            const errorMessage = 'Erro ao carregar WebAudioFontPlayer';
            console.error('❌', errorMessage, scriptError);
            setError('Erro ao carregar WebAudioFont');
          };
          document.head.appendChild(playerScript);
        } else {
          console.log('✅ WebAudioFontPlayer já estava carregado');
          setAudioFontLoaded(true);
        }
        
        // Load QwertyHancock for visual keyboard
        if (!window.QwertyHancock) {
          console.log('📦 Carregando QwertyHancock...');
          const keyboardScript = document.createElement('script');
          // Tentar URLs alternativas para QwertyHancock
          keyboardScript.src = 'https://cdn.jsdelivr.net/npm/qwerty-hancock@0.6.2/dist/qwerty-hancock.min.js';
          keyboardScript.onload = () => {
            console.log('✅ QwertyHancock carregado com sucesso!');
            console.log('🔍 Verificando QwertyHancock:', typeof window.QwertyHancock);
          };
          keyboardScript.onerror = () => {
            console.error('❌ Erro ao carregar QwertyHancock (jsDelivr)');
            console.log('🔄 Tentando URL alternativa...');
            
            // Tentar URL alternativa
            const fallbackScript = document.createElement('script');
            fallbackScript.src = 'https://unpkg.com/qwerty-hancock@0.6.2/dist/qwerty-hancock.min.js';
            fallbackScript.onload = () => {
              console.log('✅ QwertyHancock carregado com URL alternativa!');
            };
            fallbackScript.onerror = () => {
              console.error('❌ Todas as tentativas de carregar QwertyHancock falharam');
              console.log('🎹 Continuando com piano HTML personalizado...');
              // Definir flag para usar piano HTML
              window.qwertyHancockFailed = true;
            };
            document.head.appendChild(fallbackScript);
          };
          document.head.appendChild(keyboardScript);
        } else {
          console.log('✅ QwertyHancock já estava carregado');
        }
        
        console.log('📦 === FIM CARREGAMENTO SCRIPTS ===');
        
      } catch (scriptError) {
        const errorMessage = scriptError instanceof Error ? scriptError.message : String(scriptError);
        console.error('❌ Erro ao carregar scripts:', errorMessage);
        setError('Erro ao carregar bibliotecas');
      }
    };

    if (!mounted) {
      console.log('🚀 === MONTANDO COMPONENTE ===');
      setMounted(true);
      loadScripts();
    }
  }, [mounted]);

  // Effect para inicializar quando scripts estiverem prontos
  useEffect(() => {
    // Verificar se está no cliente
    if (typeof window === 'undefined') {
      console.log('⚠️ Não está no cliente, pulando inicialização');
      return;
    }

    if (audioFontLoaded && mounted) {
      console.log('🎹 === INICIALIZANDO SISTEMA ===');
      console.log('🔍 Estado atual:');
      console.log('  - audioFontLoaded:', audioFontLoaded);
      console.log('  - mounted:', mounted);
      console.log('  - WebAudioFontPlayer:', typeof window.WebAudioFontPlayer);
      console.log('  - QwertyHancock:', typeof window.QwertyHancock);
      
      // Verificar se WebAudioFontPlayer realmente existe
      if (!window.WebAudioFontPlayer) {
        console.error('❌ WebAudioFontPlayer não encontrado mesmo com audioFontLoaded=true!');
        setError('WebAudioFontPlayer não carregado corretamente');
        return;
      }
      
      // Pequeno delay para garantir que os scripts estão totalmente carregados
      const initTimer = setTimeout(() => {
        console.log('🎹 Iniciando WebAudioFont...');
        initWebAudioFont().catch((initError) => {
          const errorMessage = initError instanceof Error ? initError.message : String(initError);
          console.error('❌ Erro na inicialização do WebAudioFont:', errorMessage);
          setError(`Erro na inicialização: ${errorMessage}`);
        });
        
        console.log('🎹 Iniciando MIDI...');
        initMIDI().catch((midiError) => {
          const errorMessage = midiError instanceof Error ? midiError.message : String(midiError);
          console.error('❌ Erro na inicialização do MIDI:', errorMessage);
        });
      }, 100);
      
      return () => clearTimeout(initTimer);
    } else {
      console.log('⏳ Aguardando scripts... audioFontLoaded:', audioFontLoaded, 'mounted:', mounted);
    }
  }, [audioFontLoaded, mounted, initWebAudioFont, initMIDI]);

  // Effect para inicializar teclado visual quando piano estiver pronto
  useEffect(() => {
    // Verificar se está no cliente
    if (typeof window === 'undefined') {
      console.log('⚠️ Não está no cliente, pulando inicialização do teclado');
      return;
    }

    if (!pianoReady || !mounted) {
      console.log('⏳ Aguardando piano... pianoReady:', pianoReady, 'mounted:', mounted);
      return;
    }

    // Delay para dar tempo dos scripts carregarem
    const initTimer = setTimeout(() => {
      if (!window.QwertyHancock && !useHtmlPiano) {
        console.log('🎹 QwertyHancock não disponível, usando piano HTML personalizado');
        setUseHtmlPiano(true);
        return;
      }

      if (!window.QwertyHancock) {
        console.log('⏳ QwertyHancock ainda não disponível...');
        return;
      }

      const initKeyboard = () => {
        try {
          console.log('🎹 === INICIALIZANDO TECLADO QWERTY HANCOCK ===');
          
          // Clear existing keyboard
          const container = document.getElementById('piano-container');
          if (container) {
            console.log('🧹 Limpando container do piano...');
            container.innerHTML = '';
          } else {
            console.error('❌ Container piano-container não encontrado!');
            return;
          }
          
          // Configurações do piano ajustadas para responsividade
          const pianoWidth = Math.min(width || 1000, window.innerWidth - 100);
          const pianoHeight = height || 180;

          console.log(`🎹 Criando teclado QwertyHancock: ${pianoWidth} x ${pianoHeight}`);

          // Criar o teclado visual responsivo
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
          console.log('✅ Teclado QwertyHancock criado!');

          // Configurar eventos
          keyboard.keyDown = (note: string, frequency: number) => {
            playPianoNote(note, frequency);
          };

          keyboard.keyUp = (note: string, frequency: number) => {
            console.log(`🎵 Tecla solta: ${note}`);
            if (onNoteStop) {
              onNoteStop(note, frequency);
            }
          };

          console.log('✅ === TECLADO QWERTY HANCOCK INICIALIZADO ===');
          
        } catch (keyboardError) {
          const errorMessage = keyboardError instanceof Error ? keyboardError.message : String(keyboardError);
          console.error('❌ Erro ao inicializar QwertyHancock:', errorMessage);
          console.log('🎹 Fallback para piano HTML...');
          setUseHtmlPiano(true);
        }
      };

      initKeyboard();
    }, 1000); // Dar mais tempo para scripts carregarem

    return () => clearTimeout(initTimer);
  }, [pianoReady, mounted, width, height, octaves, startNote, onNoteStop, playPianoNote, useHtmlPiano]);

  // Função para trocar piano
  const changePiano = useCallback(async (pianoType: keyof typeof pianoOptions): Promise<void> => {
    if (pianoType === selectedPiano) return;
    
    console.log(`🎹 Trocando para piano: ${pianoOptions[pianoType].name}`);
    setSelectedPiano(pianoType);
    
    try {
      await loadPiano(pianoType);
      setActualLoadedPiano(pianoType); // Piano escolhido carregou com sucesso
      console.log('✅ Piano trocado com sucesso!');
    } catch (changeError) {
      const errorMessage = changeError instanceof Error ? changeError.message : String(changeError);
      console.error('❌ Erro ao trocar piano:', errorMessage);
      // Manter o piano anterior se a troca falhar
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

      {/* Seletor de Piano */}
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
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>mounted: {mounted ? '✅' : '❌'}</div>
                <div>audioFontLoaded: {audioFontLoaded ? '✅' : '❌'}</div>
                <div>pianoReady: {pianoReady ? '✅' : '❌'}</div>
                <div>currentInstrument: {currentInstrument ? '✅' : '❌'}</div>
                <div>Piano selecionado: {selectedPiano}</div>
                <div>Piano carregado: {actualLoadedPiano || 'nenhum'}</div>
                <div>WebAudioFontPlayer: {typeof window !== 'undefined' && typeof window.WebAudioFontPlayer !== 'undefined' ? '✅' : '❌'}</div>
                <div>QwertyHancock: {typeof window !== 'undefined' && typeof window.QwertyHancock !== 'undefined' ? '✅' : '❌'}</div>
                <div>Piano HTML: {useHtmlPiano ? '✅ Ativo' : '❌ Inativo'}</div>
              </div>
              <div className="mt-2">
                <div className="flex gap-2 flex-wrap">
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
                      if (typeof window !== 'undefined') {
                        console.log('Scripts carregados:', {
                          WebAudioFontPlayer: typeof window.WebAudioFontPlayer,
                          QwertyHancock: typeof window.QwertyHancock
                        });
                      }
                      console.log('Refs:', {
                        audioContext: !!audioContextRef.current,
                        player: !!playerRef.current,
                        keyboard: !!keyboardRef.current
                      });
                    }}
                    className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs hover:bg-blue-300"
                  >
                    Debug Console
                  </button>
                  
                  <button
                    onClick={async () => {
                      console.log('🔧 === FORÇA INICIALIZAÇÃO ===');
                      if (typeof window !== 'undefined' && window.WebAudioFontPlayer) {
                        try {
                          setError(null);
                          setPianoReady(false);
                          setCurrentInstrument(null);
                          await initWebAudioFont();
                        } catch (error) {
                          const errorMessage = error instanceof Error ? error.message : String(error);
                          console.error('❌ Erro na força inicialização:', errorMessage);
                        }
                      } else {
                        console.error('❌ WebAudioFontPlayer não disponível');
                      }
                    }}
                    className="px-2 py-1 bg-orange-200 text-orange-800 rounded text-xs hover:bg-orange-300"
                  >
                    Força Init
                  </button>
                  
                  <button
                    onClick={() => {
                      console.log('🔄 === RECARREGAR SCRIPTS ===');
                      if (typeof window !== 'undefined') {
                        // Remover scripts existentes
                        document.querySelectorAll('script[src*="webaudiofont"], script[src*="qwerty-hancock"]').forEach(script => {
                          script.remove();
                        });
                        
                        // Resetar states
                        setAudioFontLoaded(false);
                        setPianoReady(false);
                        setCurrentInstrument(null);
                        setActualLoadedPiano('');
                        setError(null);
                        
                        // Recarregar
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
                    onClick={async () => {
                      console.log('🧪 === TESTE PIANO SIMPLES ===');
                      if (typeof window !== 'undefined' && window.WebAudioFontPlayer) {
                        try {
                          setError(null);
                          setPianoReady(false);
                          setCurrentInstrument(null);
                          setActualLoadedPiano('');
                          console.log('🎹 Tentando carregar piano simples...');
                          await loadPiano('simple');
                          setActualLoadedPiano('simple');
                          setPianoReady(true);
                          console.log('✅ Piano simples carregado!');
                        } catch (error) {
                          const errorMessage = error instanceof Error ? error.message : String(error);
                          console.error('❌ Erro ao carregar piano simples:', errorMessage);
                          setError(`Piano simples falhou: ${errorMessage}`);
                        }
                      } else {
                        console.error('❌ WebAudioFontPlayer não disponível');
                      }
                    }}
                    className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs hover:bg-yellow-300"
                  >
                    Piano Simples
                  </button>
                  
                  <button
                    onClick={() => {
                      console.log('🔄 === ALTERNAR PIANO ===');
                      if (useHtmlPiano) {
                        console.log('Voltando para QwertyHancock...');
                        setUseHtmlPiano(false);
                      } else {
                        console.log('Mudando para Piano HTML...');
                        setUseHtmlPiano(true);
                      }
                    }}
                    className="px-2 py-1 bg-indigo-200 text-indigo-800 rounded text-xs hover:bg-indigo-300"
                  >
                    {useHtmlPiano ? '🎹 → QwertyHancock' : '🖥️ → Piano HTML'}
                  </button>
                  
                  <button
                    onClick={async () => {
                      console.log('🧪 === TESTE MANUAL DO PIANO ===');
                      if (playerRef.current && currentInstrument && audioContextRef.current) {
                        try {
                          // Tentar retomar contexto se suspenso
                          if (audioContextRef.current.state === 'suspended') {
                            await audioContextRef.current.resume();
                          }
                          
                          console.log('🎵 Tocando C4 (nota 60)...');
                          playerRef.current.queueWaveTable(
                            audioContextRef.current, 
                            audioContextRef.current.destination,
                            currentInstrument, 
                            0, // when
                            60, // C4
                            2, // duration
                            0.8 // volume
                          );
                          console.log('✅ Teste manual bem-sucedido!');
                        } catch (error) {
                          const errorMessage = error instanceof Error ? error.message : String(error);
                          console.error('❌ Erro no teste manual:', errorMessage);
                        }
                      } else {
                        console.error('❌ Piano não disponível para teste:');
                        console.error('  - player:', !!playerRef.current);
                        console.error('  - instrument:', !!currentInstrument);
                        console.error('  - audioContext:', !!audioContextRef.current);
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
        
        {/* Status MIDI separado se houver dispositivos conectados */}
        {midiInputs.length > 0 && (
          <div className="mt-2 space-y-2">
            <div className="text-xs p-2 rounded bg-blue-50 text-blue-800 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <span>🎹</span>
                <span className="ml-2">
                  <strong>MIDI conectado:</strong> {midiInputs.join(', ')}
                </span>
              </div>
              <div className="flex gap-2 ml-2 flex-shrink-0">
                <button
                  onClick={async () => {
                    if (playerRef.current && currentInstrument && audioContextRef.current) {
                      console.log('🧪 === TESTE DE PIANO ===');
                      try {
                        playerRef.current.queueWaveTable(
                          audioContextRef.current, 
                          audioContextRef.current.destination,
                          currentInstrument, 
                          0, // when (now)
                          60, // C4
                          1, // duration
                          0.8 // volume
                        );
                        console.log('✅ Teste de piano bem-sucedido!');
                      } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        console.error('❌ Erro no teste do piano:', errorMessage);
                      }
                    } else {
                      console.error('❌ Piano não está disponível!');
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
            
            {/* Indicador de atividade MIDI */}
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

      {/* Container do piano com scroll horizontal se necessário */}
      <div className="w-full bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
        {useHtmlPiano ? (
          <HtmlPiano />
        ) : (
          <div id="piano-container" className="min-w-fit mx-auto" style={{ minWidth: '800px' }}>
            {/* Placeholder enquanto carrega */}
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

      {/* Instruções de como tocar - layout responsivo */}
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
              {useHtmlPiano ? (
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
              ) : (
                <div>
                  <div className="flex flex-wrap gap-1 text-xs mb-2">
                    <span className="bg-gray-100 px-2 py-1 rounded">A</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">S</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">D</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">F</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">G</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">H</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">J</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">K</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">L</span>
                  </div>
                  <p className="text-xs text-gray-500">Teclas pretas: W, E, T, Y, U, O, P</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Linha adicional para MIDI se detectado */}
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

      {/* Informações técnicas compactas */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-600">
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
            <span>{useHtmlPiano ? 'Piano HTML Personalizado' : 'QwertyHancock Visual'}</span>
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

export default BeautifulPianoKeyboard;