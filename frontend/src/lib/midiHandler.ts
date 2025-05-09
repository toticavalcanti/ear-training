// Defina uma interface apropriada para o AudioContext
interface AudioContextType {
    new (): AudioContext;
  }
  
  // Defina uma interface para a janela que inclui webkitAudioContext
  interface WindowWithWebAudio extends Window {
    AudioContext: AudioContextType;
    webkitAudioContext?: AudioContextType;
  }
  
  export interface MIDIHandler {
    initialize: () => Promise<boolean>;
    isSupported: () => boolean;
    playNote: (note: number, velocity?: number, duration?: number) => void;
    playChord: (notes: number[], velocity?: number, duration?: number) => void;
    stopNote: (note: number) => void;
    stopAllNotes: () => void;
  }
  
  class WebMIDIHandler implements MIDIHandler {
    private midiAccess: WebMidi.MIDIAccess | null = null;
    private midiOutput: WebMidi.MIDIOutput | null = null;
    private audioContext: AudioContext | null = null;
    private oscillators: Map<number, OscillatorNode> = new Map();
    private usingFallback = false;
    private audioContextInitialized = false;
  
    constructor() {
      // Não inicializar o AudioContext no construtor para evitar problemas de SSR
    }
  
    // Inicializar o AudioContext de forma segura quando necessário
    private initializeAudioContext = (): void => {
      if (typeof window !== 'undefined' && !this.audioContextInitialized) {
        const win = window as WindowWithWebAudio;
        const AudioContextClass = win.AudioContext || win.webkitAudioContext;
        
        if (AudioContextClass) {
          try {
            this.audioContext = new AudioContextClass();
            this.audioContextInitialized = true;
          } catch (e) {
            console.error('Failed to create AudioContext:', e);
          }
        }
      }
    };
  
    isSupported = (): boolean => {
      if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return false;
      }
      
      this.initializeAudioContext();
      
      return (
        (typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator) || 
        this.audioContext !== null
      );
    };
  
    initialize = async (): Promise<boolean> => {
      if (typeof navigator === 'undefined') return false;
      
      this.initializeAudioContext();
      
      try {
        if ('requestMIDIAccess' in navigator) {
          this.midiAccess = await navigator.requestMIDIAccess();
          const outputs = Array.from(this.midiAccess.outputs.values());
          if (outputs.length > 0) {
            this.midiOutput = outputs[0]; // Use the first available output
            console.log('MIDI initialized with device:', this.midiOutput.name);
            return true;
          }
        }
        
        // Fallback to Web Audio API
        this.usingFallback = true;
        console.log('No MIDI devices found, using Web Audio API fallback');
        return this.audioContext !== null;
      } catch (error) {
        console.error('Failed to initialize MIDI:', error);
        
        // Fallback to Web Audio API
        this.usingFallback = true;
        console.log('Failed to initialize MIDI, using Web Audio API fallback');
        return this.audioContext !== null;
      }
    };
  
    playNote = (note: number, velocity = 100, duration = 500): void => {
      // Garantir que o AudioContext esteja inicializado
      this.initializeAudioContext();
      
      if (this.midiOutput && !this.usingFallback) {
        // MIDI note on message: [0x90, note, velocity]
        this.midiOutput.send([0x90, note, velocity]);
        
        // Schedule note off after duration
        if (duration > 0) {
          setTimeout(() => {
            this.stopNote(note);
          }, duration);
        }
      } else if (this.audioContext) {
        // Web Audio API fallback
        this.stopNote(note); // Stop any previous instance of this note
        
        // Retomar o contexto se estiver suspenso (required by browsers)
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
        
        const freq = 440 * Math.pow(2, (note - 69) / 12); // A4 (MIDI note 69) = 440Hz
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(velocity / 127, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration / 1000);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        this.oscillators.set(note, oscillator);
        
        if (duration > 0) {
          setTimeout(() => {
            this.stopNote(note);
          }, duration);
        }
      }
    };
  
    playChord = (notes: number[], velocity = 100, duration = 500): void => {
      notes.forEach(note => this.playNote(note, velocity, duration));
    };
  
    stopNote = (note: number): void => {
      if (this.midiOutput && !this.usingFallback) {
        // MIDI note off message: [0x80, note, velocity]
        this.midiOutput.send([0x80, note, 0]);
      } else {
        // Web Audio API fallback
        const oscillator = this.oscillators.get(note);
        if (oscillator) {
          oscillator.stop();
          this.oscillators.delete(note);
        }
      }
    };
  
    stopAllNotes = (): void => {
      if (this.midiOutput && !this.usingFallback) {
        // Send note off messages for all 128 MIDI notes
        for (let i = 0; i < 128; i++) {
          this.midiOutput.send([0x80, i, 0]);
        }
      } else {
        // Stop all oscillators
        this.oscillators.forEach(oscillator => {
          oscillator.stop();
        });
        this.oscillators.clear();
      }
    };
  }
  
  // Singleton instance
  let midiHandlerInstance: MIDIHandler | null = null;
  
  export function getMIDIHandler(): MIDIHandler {
    if (!midiHandlerInstance) {
      midiHandlerInstance = new WebMIDIHandler();
    }
    return midiHandlerInstance;
  }