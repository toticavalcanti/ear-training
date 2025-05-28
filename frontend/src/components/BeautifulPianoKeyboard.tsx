import React, { useState, useEffect, useRef, useCallback } from 'react';

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

const BeautifulPianoKeyboard: React.FC<BeautifulPianoKeyboardProps> = ({
  width,
  height,
  octaves = 4,
  startNote = 'C2',
  onNotePlay,
  onNoteStop,
}) => {
  const [mounted, setMounted] = useState(false);
  const [audioFontLoaded, setAudioFontLoaded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pianoReady, setPianoReady] = useState(false);
  const [midiInputs, setMidiInputs] = useState<string[]>([]);
  const [lastMidiActivity, setLastMidiActivity] = useState<string>('');
  
  // Piano selection state
  const [selectedPiano, setSelectedPiano] = useState('grand');
  const [currentInstrument, setCurrentInstrument] = useState<any>(null);
  
  const pianoRef = useRef<any>(null);
  const audioContextRef = useRef<any>(null);
  const playerRef = useRef<any>(null);
  const keyboardRef = useRef<any>(null);

  // Piano soundfont options with real samples
  const pianoOptions = {
    grand: {
      name: '🎹 Grand Piano Clássico',
      url: 'https://surikov.github.io/webaudiofontdata/sound/0001_JCLive_sf2_file.js',
      variable: '_tone_0001_JCLive_sf2_file',
      description: 'Som rico e profundo de piano de cauda'
    },
    bright: {
      name: '✨ Grand Piano Brilhante', 
      url: 'https://surikov.github.io/webaudiofontdata/sound/0020_Aspirin_sf2_file.js',
      variable: '_tone_0020_Aspirin_sf2_file',
      description: 'Som cristalino e definido'
    },
    warm: {
      name: '🔥 Grand Piano Caloroso',
      url: 'https://surikov.github.io/webaudiofontdata/sound/0000_JCLive_sf2_file.js', 
      variable: '_tone_0000_JCLive_sf2_file',
      description: 'Som encorpado e envolvente'
    },
    vintage: {
      name: '📻 Piano Vintage',
      url: 'https://surikov.github.io/webaudiofontdata/sound/0002_JCLive_sf2_file.js',
      variable: '_tone_0002_JCLive_sf2_file', 
      description: 'Som clássico dos anos 70-80'
    },
    studio: {
      name: '🎙️ Piano de Estúdio',
      url: 'https://surikov.github.io/webaudiofontdata/sound/0003_JCLive_sf2_file.js',
      variable: '_tone_0003_JCLive_sf2_file',
      description: 'Som profissional de gravação'
    }
  };

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

  // Status do piano
  const status = {
    text: error 
      ? `❌ ${error}`
      : !audioFontLoaded 
        ? '🔄 Carregando soundfonts de piano real...'
        : !pianoReady
          ? '🔄 Inicializando piano...'
          : '✅ Piano com samples reais pronto!',
    color: error 
      ? 'bg-red-100 text-red-800 border border-red-200'
      : !audioFontLoaded || !pianoReady
        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
        : 'bg-green-100 text-green-800 border border-green-200',
    icon: error ? '❌' : !audioFontLoaded || !pianoReady ? '⏳' : '🎹'
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
    const isNoteOff = (command & 0xf0) === 0x80 || ((command & 0xf0) === 0x90 && velocity === 0);
    
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
      } catch (error) {
        console.error('❌ Erro ao tocar nota MIDI:', error);
      }
    }
    
    console.log('🎹 === END MIDI MESSAGE ===\n');
  }, [onNotePlay, getNoteNameFromMidi, currentInstrument]);

  // Inicializar WebAudioFont
  const initWebAudioFont = async () => {
    try {
      console.log('🎹 Inicializando WebAudioFont...');
      
      // Create audio context
      const AudioContextFunc = (window as any).AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextFunc();
      audioContextRef.current = audioContext;
      
      // Create player
      const player = new (window as any).WebAudioFontPlayer();
      playerRef.current = player;
      
      // Load default piano
      await loadPiano('grand');
      
      console.log('✅ WebAudioFont inicializado com sucesso!');
      setPianoReady(true);
      
    } catch (error) {
      console.error('❌ Erro ao inicializar WebAudioFont:', error);
      setError('Erro ao carregar engine de áudio');
      setPianoReady(false);
    }
  };

  // Carregar piano específico
  const loadPiano = async (pianoType: keyof typeof pianoOptions) => {
    if (!playerRef.current || !audioContextRef.current) return;
    
    const piano = pianoOptions[pianoType];
    console.log(`🎹 Carregando piano: ${piano.name}`);
    
    try {
      // Load the soundfont
      playerRef.current.loader.startLoad(audioContextRef.current, piano.url, piano.variable);
      
      await new Promise((resolve) => {
        playerRef.current.loader.waitLoad(() => {
          const instrument = (window as any)[piano.variable];
          setCurrentInstrument(instrument);
          console.log(`✅ Piano ${piano.name} carregado!`);
          resolve(true);
        });
      });
      
    } catch (error) {
      console.error(`❌ Erro ao carregar piano ${piano.name}:`, error);
      throw error;
    }
  };

  // Inicializar MIDI
  const initMIDI = async () => {
    try {
      if (navigator.requestMIDIAccess) {
        console.log('🎹 === INICIALIZANDO MIDI ===');
        const midiAccess = await navigator.requestMIDIAccess();
        
        const inputs = Array.from(midiAccess.inputs.values());
        const inputNames = inputs.map(input => input.name || 'Unknown Device');
        setMidiInputs(inputNames);
        
        console.log(`🎹 MIDI inicializado! ${inputs.length} dispositivos encontrados:`);
        inputs.forEach((input, index) => {
          console.log(`🎹   [${index}] ${input.name || 'Unknown'}`);
        });
        
        // Configurar listeners para cada input MIDI
        inputs.forEach((input) => {
          input.onmidimessage = (event) => {
            handleMIDIMessage(event);
          };
        });
        
        // Evento para detectar mudanças nos dispositivos MIDI
        midiAccess.onstatechange = (event: MIDIConnectionEvent) => {
          console.log('🎹 MIDI State change:', event);
          if (event.port) {
            console.log('🎹 Port:', event.port.name, 'State:', event.port.state);
          }
        };
        
        console.log('🎹 === MIDI SETUP COMPLETE ===');
        
      } else {
        console.log('❌ Web MIDI API não suportada neste navegador');
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar MIDI:', error);
    }
  };

  // Effect para carregar scripts
  useEffect(() => {
    const loadScripts = async () => {
      try {
        console.log('📦 Carregando WebAudioFont...');
        
        // Load WebAudioFont Player
        if (!(window as any).WebAudioFontPlayer) {
          const playerScript = document.createElement('script');
          playerScript.src = 'https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js';
          playerScript.onload = () => {
            console.log('✅ WebAudioFontPlayer carregado');
            setAudioFontLoaded(true);
          };
          playerScript.onerror = () => {
            setError('Erro ao carregar WebAudioFont');
          };
          document.head.appendChild(playerScript);
        } else {
          setAudioFontLoaded(true);
        }
        
        // Load QwertyHancock for visual keyboard
        if (!(window as any).QwertyHancock) {
          const keyboardScript = document.createElement('script');
          keyboardScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/qwerty-hancock/0.6.2/qwerty-hancock.min.js';
          keyboardScript.onload = () => {
            console.log('✅ QwertyHancock carregado');
          };
          document.head.appendChild(keyboardScript);
        }
        
      } catch (error) {
        console.error('❌ Erro ao carregar scripts:', error);
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
    if (audioFontLoaded && mounted) {
      console.log('🎹 Scripts prontos, inicializando sistema...');
      initWebAudioFont();
      initMIDI();
    }
  }, [audioFontLoaded, mounted, handleMIDIMessage]);

  // Effect para inicializar teclado visual quando piano estiver pronto
  useEffect(() => {
    if (!pianoReady || !mounted || !(window as any).QwertyHancock) return;

    const initKeyboard = async () => {
      try {
        console.log('🎹 Inicializando teclado visual...');
        
        // Clear existing keyboard
        const container = document.getElementById('piano-container');
        if (container) {
          container.innerHTML = '';
        }
        
        // Configurações do piano ajustadas para responsividade
        const pianoWidth = Math.min(width || 1000, window.innerWidth - 100);
        const pianoHeight = height || 200;

        // Criar o teclado visual responsivo
        const keyboard = new (window as any).QwertyHancock({
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

        // Configurar eventos
        keyboard.keyDown = async (note: string, frequency: number) => {
          console.log(`🎵 Tecla pressionada: ${note}`);
          
          try {
            if (!playerRef.current || !currentInstrument || !audioContextRef.current) {
              console.error('❌ Piano não está disponível');
              return;
            }
            
            const midiNote = noteNameToMidi(note);
            
            // Tocar nota usando WebAudioFont
            playerRef.current.queueWaveTable(
              audioContextRef.current, 
              audioContextRef.current.destination,
              currentInstrument, 
              0, // when (now)
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
        };

        keyboard.keyUp = (note: string, frequency: number) => {
          console.log(`🎵 Tecla solta: ${note}`);
          
          if (onNoteStop) {
            onNoteStop(note, frequency);
          }
        };

        console.log('✅ Teclado visual inicializado!');
        setIsLoaded(true);
        
      } catch (error) {
        console.error('❌ Erro ao inicializar teclado visual:', error);
        setError('Erro ao inicializar teclado visual');
      }
    };

    initKeyboard();
  }, [pianoReady, mounted, width, height, octaves, startNote, noteNameToMidi, onNotePlay, onNoteStop, currentInstrument]);

  // Função para trocar piano
  const changePiano = async (pianoType: keyof typeof pianoOptions) => {
    if (pianoType === selectedPiano) return;
    
    console.log(`🎹 Trocando para piano: ${pianoOptions[pianoType].name}`);
    setSelectedPiano(pianoType);
    
    try {
      await loadPiano(pianoType);
      console.log('✅ Piano trocado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao trocar piano:', error);
    }
  };

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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(pianoOptions).map(([key, piano]) => (
            <button
              key={key}
              onClick={() => changePiano(key as keyof typeof pianoOptions)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                selectedPiano === key
                  ? 'border-purple-500 bg-purple-100 text-purple-800'
                  : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              <div className="font-semibold text-sm">{piano.name}</div>
              <div className="text-xs text-gray-600 mt-1">{piano.description}</div>
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
                        console.error('❌ Erro no teste do piano:', error);
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
        <div id="piano-container" className="min-w-fit mx-auto" style={{ minWidth: '800px' }}></div>
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
              <div className="flex flex-wrap gap-1 text-xs">
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
              <p className="text-xs text-gray-500 mt-2">Teclas pretas: W, E, T, Y, U, O, P</p>
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
            <span className="font-semibold text-gray-700">🎨</span>
            <span>{pianoOptions[selectedPiano as keyof typeof pianoOptions]?.name || 'Carregando...'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeautifulPianoKeyboard;