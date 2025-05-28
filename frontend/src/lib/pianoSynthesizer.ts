// frontend/src/lib/pianoSynthesizer.ts - VERSÃO WEB AUDIO SIMPLES (SEM SOUNDFONT)
interface WindowWithAudioContext extends Window {
  webkitAudioContext?: typeof AudioContext;
}

export class SimpleWebAudioPiano {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;
  private activeNotes: Map<number, { oscillator: OscillatorNode; gainNode: GainNode; oscillator2?: OscillatorNode; gainNode2?: GainNode }> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeAudio();
    }
  }

  private async initializeAudio(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      const windowWithAudio = window as WindowWithAudioContext;
      const AudioContextClass = window.AudioContext || windowWithAudio.webkitAudioContext;
      
      if (!AudioContextClass) {
        throw new Error('AudioContext not supported');
      }
      
      this.audioContext = new AudioContextClass();
      this.isInitialized = true;
      console.log('🎹 Simple Web Audio Piano: AudioContext inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar AudioContext:', error);
      this.isInitialized = false;
    }
  }

  // Converter número MIDI para frequência
  private midiToFrequency(midiNote: number): number {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }

  // Converter número MIDI para nome da nota
  private midiToNoteName(midiNote: number): string {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    const noteName = noteNames[midiNote % 12];
    return `${noteName}${octave}`;
  }

  async playNote(midiNote: number, velocity: number = 80, duration: number = 1000): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeAudio();
    }

    if (!this.audioContext) {
      console.error('❌ AudioContext não disponível');
      return;
    }

    try {
      // Retomar contexto se suspenso
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Parar nota anterior se existir
      this.stopNote(midiNote);

      const frequency = this.midiToFrequency(midiNote);
      const noteName = this.midiToNoteName(midiNote);
      
      console.log(`🎵 Tocando nota: ${noteName} (${frequency.toFixed(2)}Hz)`);

      // Criar oscilador para a fundamental
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      // Configurar som mais realista de piano
      oscillator.type = 'triangle'; // Som mais suave que square
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

      // Adicionar harmônicos para som mais rico
      const oscillator2 = this.audioContext.createOscillator();
      const gainNode2 = this.audioContext.createGain();
      
      oscillator2.type = 'sine';
      oscillator2.frequency.setValueAtTime(frequency * 2, this.audioContext.currentTime); // Oitava
      
      // Volume baseado na velocity
      const volume = Math.max(0.1, Math.min(0.8, velocity / 127));
      
      // Envelope ADSR para som mais natural
      const attackTime = 0.01;
      const decayTime = 0.3;
      const sustainLevel = volume * 0.7;
      const releaseTime = duration > 0 ? Math.min(1.0, duration / 1000 * 0.3) : 1.0;
      
      const now = this.audioContext.currentTime;
      
      // Envelope para fundamental
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + attackTime);
      gainNode.gain.exponentialRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
      
      // Envelope para harmônico (mais suave)
      gainNode2.gain.setValueAtTime(0, now);
      gainNode2.gain.linearRampToValueAtTime(volume * 0.3, now + attackTime);
      gainNode2.gain.exponentialRampToValueAtTime(sustainLevel * 0.3, now + attackTime + decayTime);

      // Conectar osciladores
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator2.connect(gainNode2);
      gainNode2.connect(this.audioContext.destination);

      // Iniciar osciladores
      oscillator.start(now);
      oscillator2.start(now);

      // Armazenar para controle
      this.activeNotes.set(midiNote, { 
        oscillator, 
        gainNode,
        oscillator2,
        gainNode2
      });

      // Auto-parar após duração se especificada
      if (duration > 0) {
        // Release
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);
        gainNode2.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);
        
        setTimeout(() => {
          this.stopNote(midiNote);
        }, duration + releaseTime * 1000);
      }

    } catch (error) {
      console.error('❌ Erro ao tocar nota:', error);
    }
  }

  async playChord(midiNotes: number[], velocity: number = 80, duration: number = 1000): Promise<void> {
    console.log(`🎵 Tocando acorde: ${midiNotes.map(n => this.midiToNoteName(n)).join(', ')}`);
    
    try {
      const promises = midiNotes.map(note => this.playNote(note, velocity, duration));
      await Promise.all(promises);
    } catch (error) {
      console.error('❌ Erro ao tocar acorde:', error);
    }
  }

  stopNote(midiNote: number): void {
    const noteData = this.activeNotes.get(midiNote);
    if (noteData) {
      try {
        const { oscillator, gainNode, oscillator2, gainNode2 } = noteData;
        
        if (this.audioContext) {
          const now = this.audioContext.currentTime;
          
          // Release gradual
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          if (gainNode2) {
            gainNode2.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          }
          
          // Parar osciladores após release
          setTimeout(() => {
            try {
              oscillator.stop();
              if (oscillator2) oscillator2.stop();
            } catch {
              // Oscilador já parado
            }
          }, 150);
        }
        
        this.activeNotes.delete(midiNote);
        console.log(`🛑 Parou nota: ${this.midiToNoteName(midiNote)}`);
      } catch (error) {
        console.error('❌ Erro ao parar nota:', error);
      }
    }
  }

  stopAllNotes(): void {
    console.log('🛑 Parando todas as notas');
    const activeNotesCopy = new Map(this.activeNotes);
    activeNotesCopy.forEach((_, midiNote) => {
      this.stopNote(midiNote);
    });
    this.activeNotes.clear();
  }

  // Getters
  get loaded(): boolean {
    return this.isInitialized;
  }

  get loading(): boolean {
    return false; // Web Audio não precisa carregar
  }

  get initialized(): boolean {
    return this.isInitialized;
  }

  // Pré-carregar (não faz nada, mas mantém compatibilidade)
  async preload(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initializeAudio();
    }
    return this.isInitialized;
  }

  // Teste de áudio
  async testAudio(): Promise<boolean> {
    try {
      if (!this.audioContext) return false;
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      return this.audioContext.state === 'running';
    } catch (error) {
      console.error('❌ Erro no teste de áudio:', error);
      return false;
    }
  }

  // Limpar recursos
  cleanup(): void {
    this.stopAllNotes();
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    
    this.audioContext = null;
    this.isInitialized = false;
  }
}

// Instância singleton
let simplePianoInstance: SimpleWebAudioPiano | null = null;

export function getSimpleWebAudioPiano(): SimpleWebAudioPiano {
  if (!simplePianoInstance) {
    simplePianoInstance = new SimpleWebAudioPiano();
  }
  return simplePianoInstance;
}

// Export para compatibilidade com o código existente
export const realisticPiano = getSimpleWebAudioPiano();