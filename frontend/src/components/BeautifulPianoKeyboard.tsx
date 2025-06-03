import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Extend Window interface to include webkitAudioContext
declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

interface BeautifulPianoKeyboardProps {
  octaves?: number;
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

// Piano samples - usando Salamander samples
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
  octaves = 4,
  onNotePlay,
}) => {
  // Estados principais
  const [mounted, setMounted] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pianoReady, setPianoReady] = useState(false);
  const [midiInputs, setMidiInputs] = useState<string[]>([]);
  const [lastMidiActivity, setLastMidiActivity] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentInstrument, setCurrentInstrument] = useState<Map<number, AudioBuffer> | null>(null);
  
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

  // Encontrar sample mais próximo
  const findClosestSample = useCallback((targetMidi: number) => {
    if (!currentInstrument) return null;
    
    let closestMidi = 60;
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
    
    const detune = (targetMidi - closestMidi) * 100;
    return { buffer, detune };
  }, [currentInstrument]);

  // Tocar nota
  const playPianoNote = useCallback(async (note: string, frequency: number) => {
    if (!audioContextRef.current || !currentInstrument) {
      console.error('❌ Piano não disponível');
      return;
    }

    try {
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

      const sampleData = findClosestSample(midiNote);
      if (!sampleData) return;

      const source = audioContextRef.current.createBufferSource();
      const gainNode = audioContextRef.current.createGain();
      
      source.buffer = sampleData.buffer;
      source.detune.value = sampleData.detune;

      const now = audioContextRef.current.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.8, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.3, now + 0.3);

      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      source.start(now);

      activeSources.current.set(midiNote, source);

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
  }, [noteNameToMidi, findClosestSample, onNotePlay, currentInstrument]);

  // Handler para MIDI
  const handleMIDIMessage = useCallback((message: WebMidi.MIDIMessageEvent) => {
    const [command, note, velocity] = message.data;
    
    const timestamp = new Date().toLocaleTimeString();
    const activityText = `${timestamp} - Note ${note}, Vel ${velocity}`;
    setLastMidiActivity(activityText);
    
    const isNoteOn = (command & 0xf0) === 0x90 && velocity > 0;
    
    if (isNoteOn && currentInstrument && audioContextRef.current) {
      try {
        const frequency = 440 * Math.pow(2, (note - 69) / 12);
        const noteName = getNoteNameFromMidi(note);
        playPianoNote(noteName, frequency);
      } catch (midiPlayError) {
        console.error('❌ Erro ao tocar nota MIDI:', midiPlayError);
      }
    }
  }, [getNoteNameFromMidi, playPianoNote, currentInstrument]);

  // Carregar samples
  const loadPiano = useCallback(async (): Promise<void> => {
    if (!audioContextRef.current) {
      throw new Error('AudioContext não disponível');
    }
    
    try {
      const sampleMap = new Map<number, AudioBuffer>();
      let loadedCount = 0;
      
      for (const [midi, url] of PIANO_SAMPLES) {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
          
          sampleMap.set(midi, audioBuffer);
          loadedCount++;
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
      if (typeof window === 'undefined') {
        throw new Error('Window não disponível (SSR)');
      }
      
      const AudioContextFunc = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextFunc) {
        throw new Error('AudioContext não suportado');
      }
      
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        const audioContext = new AudioContextFunc();
        audioContextRef.current = audioContext;
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      await loadPiano();
      setPianoReady(true);
      setAudioReady(true);
      
    } catch (initError) {
      console.error('❌ Erro ao inicializar:', initError);
      setError(`Erro: ${initError instanceof Error ? initError.message : String(initError)}`);
      setPianoReady(false);
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
      console.error('❌ Erro ao inicializar MIDI:', midiError);
    }
  }, [handleMIDIMessage]);

  // Componente Piano HTML
  const HtmlPiano = React.memo(() => {
    const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());

    const playNote = useCallback(async (noteData: { note: string, octave: number, midi: number }) => {
      if (!currentInstrument || !audioContextRef.current) {
        console.error('❌ Piano não disponível para tocar');
        return;
      }

      try {
        const frequency = 440 * Math.pow(2, (noteData.midi - 69) / 12);
        playPianoNote(`${noteData.note}${noteData.octave}`, frequency);
      } catch (playError) {
        console.error('❌ Erro ao tocar nota:', playError);
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
            🎹 Piano Virtual
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Clique nas teclas ou use o teclado do PC
          </div>
        </div>
        
        <div className="relative bg-gray-900 p-4" style={{ minHeight: '180px', height: '200px' }}>
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
                    height: '160px',
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
                      height: '100px',
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

  // Effect principal
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
    }
  }, [mounted]);

  // Effect para inicializar
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (mounted && !audioReady) {
      setIsLoading(true);
      
      const initTimer = setTimeout(() => {
        initWebAudioFont().finally(() => {
          setIsLoading(false);
        });
        
        initMIDI().catch((midiError) => {
          console.error('❌ Erro MIDI:', midiError);
        });
      }, 100);
      
      return () => clearTimeout(initTimer);
    }
  }, [mounted, audioReady, initWebAudioFont, initMIDI]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800">
          🎹 Piano Virtual com Samples Reais
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Piano de alta qualidade com soundfonts reais de pianos profissionais
        </p>
      </div>

      {/* Status */}
      <div className="mb-4">
        <div className={`text-sm p-3 rounded-lg ${status.color}`}>
          <div className="flex items-center gap-2">
            <span>{status.icon}</span>
            <span className="flex-1 min-w-0">{status.text}</span>
          </div>
        </div>
        
        {/* Status MIDI */}
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
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          {pianoReady && currentInstrument ? (
            <HtmlPiano />
          ) : (
            <div className="flex items-center justify-center w-full h-48 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <div className="text-4xl mb-2">🎹</div>
                <div className="text-gray-600">
                  {isLoading ? 'Carregando piano...' : 'Preparando piano...'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instruções */}
      <div className="mb-6">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
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
            </div>
          </div>
          
          {midiInputs.length > 0 && (
            <div className="mt-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
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

      {/* Informações técnicas */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <div className="text-center">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700">📊</span>
              <span>{octaves} oitavas</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700">🔊</span>
              <span>{pianoReady ? '🟢 Salamander Piano' : '🟡 Carregando...'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700">⚡</span>
              <span>Samples reais de piano</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700">🎹</span>
              <span>Piano HTML Personalizado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(BeautifulPianoKeyboard);