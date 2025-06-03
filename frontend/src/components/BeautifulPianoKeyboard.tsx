// src/components/BeautifulPianoKeyboard.tsx
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

// Tipos para Soundfont Player
interface SoundfontPlayer {
  play: (note: string | number, when?: number, options?: { duration?: number, gain?: number }) => void;
  stop: () => void;
  name: string;
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

// Extensão do Window para Soundfont e QwertyHancock
declare global {
  interface Window {
    AudioContext: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
    Soundfont: {
      instrument: (audioContext: AudioContext, instrumentName: string, options?: {
        soundfont?: 'MusyngKite' | 'FluidR3_GM';
        format?: 'mp3' | 'ogg';
        gain?: number;
      }) => Promise<SoundfontPlayer>;
    };
    QwertyHancock: {
      new (config: QwertyHancockConfig): QwertyHancockKeyboard;
    };
    qwertyHancockFailed?: boolean;
    [key: string]: unknown;
  }
}

// Opções de piano com soundfonts reais
const pianoOptions = {
  grand_piano: {
    name: '🎹 Grand Piano Clássico',
    instrument: 'acoustic_grand_piano',
    soundfont: 'MusyngKite' as const,
    description: 'Piano de cauda premium com samples de alta qualidade'
  },
  upright_piano: {
    name: '🎼 Piano Vertical',
    instrument: 'acoustic_piano_1',
    soundfont: 'MusyngKite' as const,
    description: 'Piano vertical com som caloroso'
  },
  electric_piano: {
    name: '⚡ Piano Elétrico',
    instrument: 'electric_piano_1',
    soundfont: 'MusyngKite' as const,
    description: 'Piano elétrico clássico dos anos 70'
  },
  bright_piano: {
    name: '✨ Piano Brilhante',
    instrument: 'bright_acoustic_piano',
    soundfont: 'MusyngKite' as const,
    description: 'Piano com som cristalino e definido'
  },
  honky_tonk: {
    name: '🤠 Honky Tonk',
    instrument: 'honky_tonk_piano',
    soundfont: 'MusyngKite' as const,
    description: 'Piano desafinado estilo western'
  },
  // Versões mais leves para conexões lentas
  grand_light: {
    name: '🎹 Grand Piano (Leve)',
    instrument: 'acoustic_grand_piano',
    soundfont: 'FluidR3_GM' as const,
    description: 'Piano de cauda - versão mais leve'
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
  const [soundfontLoaded, setSoundfontLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pianoReady, setPianoReady] = useState(false);
  const [midiInputs, setMidiInputs] = useState<string[]>([]);
  const [lastMidiActivity, setLastMidiActivity] = useState<string>('');
  
  // Piano selection state
  const [selectedPiano, setSelectedPiano] = useState('grand_piano');
  const [currentInstrument, setCurrentInstrument] = useState<SoundfontPlayer | null>(null);
  const [actualLoadedPiano, setActualLoadedPiano] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para piano HTML personalizado
  const [useHtmlPiano, setUseHtmlPiano] = useState(false);
  
  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
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

  // Converter número MIDI para nome da nota
  const getNoteNameFromMidi = useCallback((midiNote: number): string => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    const note = noteNames[midiNote % 12];
    return `${note}${octave}`;
  }, []);

  // Função para tocar nota usando Soundfont Player
  const playPianoNote = useCallback(async (note: string, frequency: number) => {
    if (!currentInstrument) {
      console.error('❌ Instrumento não carregado');
      return;
    }

    try {
      console.log(`🎵 Tocando nota: ${note} (${frequency}Hz)`);
      
      // Retomar contexto se suspenso
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Tocar nota usando soundfont-player
      currentInstrument.play(note, audioContextRef.current?.currentTime, {
        duration: 2,
        gain: 0.8
      });

      if (onNotePlay) {
        onNotePlay(note, frequency);
      }
    } catch (pianoError) {
      const errorMessage = pianoError instanceof Error ? pianoError.message : String(pianoError);
      console.error('❌ Erro ao tocar nota:', errorMessage);
    }
  }, [onNotePlay, currentInstrument]);

  // Handler para mensagens MIDI
  const handleMIDIMessage = useCallback((message: WebMidi.MIDIMessageEvent) => {
    console.log('🎹 === MIDI MESSAGE RECEIVED ===');
    const [command, note, velocity] = message.data;
    
    const timestamp = new Date().toLocaleTimeString();
    const activityText = `${timestamp} - Note ${note}, Vel ${velocity}`;
    setLastMidiActivity(activityText);
    
    const isNoteOn = (command & 0xf0) === 0x90 && velocity > 0;
    
    if (isNoteOn && currentInstrument) {
      console.log(`🎹 Playing MIDI note: ${note} (velocity: ${velocity})`);
      
      try {
        // Tocar nota usando soundfont-player
        currentInstrument.play(note, audioContextRef.current?.currentTime, {
          duration: (60 / 120) * velocity / 127,
          gain: velocity / 127
        });
        
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

  // Carregar piano usando soundfont-player
  const loadPiano = useCallback(async (pianoType: keyof typeof pianoOptions): Promise<void> => {
    console.log(`🎹 === CARREGANDO PIANO ${pianoType.toUpperCase()} ===`);
    
    if (!audioContextRef.current) {
      throw new Error('AudioContext não disponível');
    }

    if (!window.Soundfont) {
      throw new Error('Soundfont Player não carregado');
    }
    
    const piano = pianoOptions[pianoType];
    console.log(`🎹 Carregando: ${piano.name}`);
    console.log(`🎹 Instrumento: ${piano.instrument}`);
    console.log(`🎹 Soundfont: ${piano.soundfont}`);
    
    setIsLoading(true);
    
    try {
      console.log('📥 Carregando soundfont...');
      
      const instrument = await window.Soundfont.instrument(
        audioContextRef.current,
        piano.instrument,
        {
          soundfont: piano.soundfont,
          format: 'mp3',
          gain: 1.0
        }
      );
      
      console.log('✅ Soundfont carregado:', instrument.name);
      setCurrentInstrument(instrument);
      setActualLoadedPiano(pianoType);
      
      console.log(`✅ === PIANO ${pianoType.toUpperCase()} CARREGADO ===`);
      
    } catch (loadError) {
      const errorMessage = loadError instanceof Error ? loadError.message : String(loadError);
      console.error(`❌ Erro ao carregar piano:`, errorMessage);
      
      // Tentar versão mais leve
      if (pianoType !== 'grand_light') {
        console.log('🔄 Tentando versão mais leve...');
        await loadPiano('grand_light');
      } else {
        throw new Error(`Falha ao carregar piano: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Inicializar AudioContext e Soundfont
  const initSoundfont = useCallback(async (): Promise<void> => {
    try {
      console.log('🎹 === INICIALIZANDO SOUNDFONT ===');
      
      // Verificar se está no cliente
      if (typeof window === 'undefined') {
        throw new Error('Window não disponível (SSR)');
      }
      
      // Verificar se Soundfont está disponível
      if (!window.Soundfont) {
        throw new Error('Soundfont Player não está disponível');
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
      
      console.log('🎹 Carregando piano padrão...');
      // Tentar carregar piano padrão com fallback para piano leve
      try {
        await loadPiano('grand_piano');
      } catch (loadError) {
        console.log('⚠️ Piano padrão falhou:', loadError instanceof Error ? loadError.message : 'erro desconhecido');
        await loadPiano('grand_light');
      }
      
      console.log('✅ === SOUNDFONT INICIALIZADO ===');
      setPianoReady(true);
      
    } catch (webAudioError) {
      const errorMessage = webAudioError instanceof Error ? webAudioError.message : String(webAudioError);
      console.error('❌ === ERRO SOUNDFONT ===');
      console.error('Erro:', errorMessage);
      console.error('Stack:', webAudioError instanceof Error ? webAudioError.stack : 'N/A');
      setError(`Erro ao carregar soundfont: ${errorMessage}`);
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
    } catch (midiError) {
      const errorMessage = midiError instanceof Error ? midiError.message : String(midiError);
      console.error('❌ Erro ao inicializar MIDI:', errorMessage);
    }
  }, [handleMIDIMessage]);

  // Status do piano com informações detalhadas
  const status = {
    text: error 
      ? `❌ ${error}`
      : !mounted
        ? '🔄 Inicializando componente...'
        : !soundfontLoaded 
          ? '🔄 Carregando Soundfont Player...'
          : isLoading
            ? '🔄 Carregando samples de piano...'
            : !pianoReady
              ? '🔄 Inicializando engine de áudio...'
              : !currentInstrument
                ? '🔄 Configurando instrumento...'
                : actualLoadedPiano === 'grand_light' && selectedPiano !== 'grand_light'
                  ? `⚠️ Piano backup ativo (${pianoOptions.grand_light.name}) - conexão lenta detectada`
                  : useHtmlPiano
                    ? `✅ Piano HTML com ${pianoOptions[actualLoadedPiano as keyof typeof pianoOptions]?.name || 'soundfont real'} pronto!`
                    : `✅ Piano QwertyHancock com ${pianoOptions[actualLoadedPiano as keyof typeof pianoOptions]?.name || 'soundfont real'} pronto!`,
    color: error 
      ? 'bg-red-100 text-red-800 border border-red-200'
      : !mounted || !soundfontLoaded || isLoading || !pianoReady || !currentInstrument
        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
        : actualLoadedPiano === 'grand_light' && selectedPiano !== 'grand_light'
          ? 'bg-orange-100 text-orange-800 border border-orange-200'
          : useHtmlPiano
            ? 'bg-blue-100 text-blue-800 border border-blue-200'
            : 'bg-green-100 text-green-800 border border-green-200',
    icon: error 
      ? '❌' 
      : !mounted || !soundfontLoaded || isLoading || !pianoReady || !currentInstrument 
        ? '⏳' 
        : actualLoadedPiano === 'grand_light' && selectedPiano !== 'grand_light'
          ? '⚠️'
          : useHtmlPiano 
            ? '🖥️' 
            : '🎹'
  };

  // Componente de Piano HTML personalizado
  const HtmlPiano = React.memo(() => {
    const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());

    const playNote = useCallback(async (noteData: { note: string, octave: number, midi: number }) => {
      if (!currentInstrument) {
        console.error('❌ Piano não disponível para tocar');
        return;
      }

      try {
        console.log(`🎵 Tocando ${noteData.note}${noteData.octave} (MIDI: ${noteData.midi})`);
        
        // Retomar contexto se suspenso
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }

        // Tocar usando soundfont-player
        currentInstrument.play(`${noteData.note}${noteData.octave}`, audioContextRef.current?.currentTime, {
          duration: 2,
          gain: 0.8
        });

        if (onNotePlay) {
          const frequency = 440 * Math.pow(2, (noteData.midi - 69) / 12);
          onNotePlay(`${noteData.note}${noteData.octave}`, frequency);
        }
      } catch (playError) {
        console.error('❌ Erro ao tocar nota:', playError);
      }
    }, []);

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
    }, [activeNotes, playNote]);

    const whiteKeys = pianoNotes.filter(n => n.white);
    const blackKeys = pianoNotes.filter(n => !n.white);

    return (
      <div className="relative bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '200px' }}>
        <div className="text-center py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-sm text-gray-600 border-b">
          🎹 Piano HTML com Soundfonts Reais • Clique nas teclas ou use o teclado do PC
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
      // Manter o piano anterior se a troca falhar
      setSelectedPiano(actualLoadedPiano);
    }
  }, [selectedPiano, loadPiano, actualLoadedPiano, isLoading]);

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
        
        // Load Soundfont Player
        if (!window.Soundfont) {
          console.log('📦 Carregando Soundfont Player...');
          const soundfontScript = document.createElement('script');
          soundfontScript.src = 'https://cdn.jsdelivr.net/npm/soundfont-player@0.12.0/dist/soundfont-player.min.js';
          soundfontScript.onload = () => {
            console.log('✅ Soundfont Player carregado com sucesso!');
            console.log('🔍 Verificando Soundfont:', typeof window.Soundfont);
            setSoundfontLoaded(true);
          };
          soundfontScript.onerror = () => {
            console.error('❌ Erro ao carregar Soundfont Player');
            setError('Erro ao carregar Soundfont Player');
          };
          document.head.appendChild(soundfontScript);
        } else {
          console.log('✅ Soundfont Player já estava carregado');
          setSoundfontLoaded(true);
        }
        
        // Load QwertyHancock for visual keyboard
        if (!window.QwertyHancock) {
          console.log('📦 Carregando QwertyHancock...');
          const keyboardScript = document.createElement('script');
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

    if (soundfontLoaded && mounted) {
      console.log('🎹 === INICIALIZANDO SISTEMA ===');
      console.log('🔍 Estado atual:');
      console.log('  - soundfontLoaded:', soundfontLoaded);
      console.log('  - mounted:', mounted);
      console.log('  - Soundfont:', typeof window.Soundfont);
      console.log('  - QwertyHancock:', typeof window.QwertyHancock);
      
      // Verificar se Soundfont realmente existe
      if (!window.Soundfont) {
        console.error('❌ Soundfont não encontrado mesmo com soundfontLoaded=true!');
        setError('Soundfont não carregado corretamente');
        return;
      }
      
      // Pequeno delay para garantir que os scripts estão totalmente carregados
      const initTimer = setTimeout(() => {
        console.log('🎹 Iniciando Soundfont...');
        initSoundfont().catch((initError) => {
          const errorMessage = initError instanceof Error ? initError.message : String(initError);
          console.error('❌ Erro na inicialização do Soundfont:', errorMessage);
          setError(`Erro na inicialização: ${errorMessage}`);
        });
        
        console.log('🎹 Iniciando MIDI...');
        initMIDI().catch((midiError) => {
          const errorMessage = midiError instanceof Error ? midiError.message : String(midiError);
          console.error('❌ Erro na inicialização do MIDI:', errorMessage);
          // MIDI não é crítico, então não setamos erro
        });
      }, 100);
      
      return () => clearTimeout(initTimer);
    } else {
      console.log('⏳ Aguardando scripts... soundfontLoaded:', soundfontLoaded, 'mounted:', mounted);
    }
  }, [soundfontLoaded, mounted, initSoundfont, initMIDI]);

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

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-center mb-4 text-gray-800 flex items-center justify-center gap-2">
        🎹 Piano Virtual com Soundfonts Reais
      </h2>
      
      <p className="text-center text-gray-600 mb-6">
        Piano de alta qualidade com soundfonts profissionais pré-renderados
      </p>

      {/* Seletor de Piano */}
      <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          🎨 Escolha seu Piano
          <span className="text-xs text-gray-500 font-normal">Soundfonts reais pré-renderados</span>
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
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${key === 'grand_light' ? 'border-blue-300 bg-blue-50' : ''}`}
            >
              <div className="font-semibold text-sm">{piano.name}</div>
              <div className="text-xs text-gray-600 mt-1">{piano.description}</div>
              {key === 'grand_light' && (
                <div className="text-xs text-blue-600 mt-1 font-semibold">⚡ Carregamento rápido</div>
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
                    if (currentInstrument && audioContextRef.current) {
                      console.log('🧪 === TESTE DE PIANO ===');
                      try {
                        currentInstrument.play('C4', audioContextRef.current.currentTime, {
                          duration: 1,
                          gain: 0.8
                        });
                        console.log('✅ Teste de piano bem-sucedido!');
                      } catch (pianoTestError) {
                        const errorMessage = pianoTestError instanceof Error ? pianoTestError.message : String(pianoTestError);
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
                    console.log('🎹 Current instrument:', currentInstrument ? currentInstrument.name : null);
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
                  <div className="text-gray-600">Carregando piano com soundfonts reais...</div>
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
            <span>{pianoReady ? '🟢 Soundfont Player' : '🟡 Carregando...'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-700">⚡</span>
            <span>Soundfonts pré-renderados</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-700">🎹</span>
            <span>{useHtmlPiano ? 'Piano HTML Personalizado' : 'QwertyHancock Visual'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-700">🎨</span>
            <span>{pianoOptions[actualLoadedPiano as keyof typeof pianoOptions]?.name || 'Carregando...'}</span>
            {actualLoadedPiano === 'grand_light' && selectedPiano !== 'grand_light' && (
              <span className="text-xs bg-orange-100 text-orange-600 px-1 rounded">(backup)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeautifulPianoKeyboard;