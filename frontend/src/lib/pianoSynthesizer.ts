// frontend/src/lib/realisticPianoSynth.ts
import { instrument as soundfontInstrument } from 'soundfont-player';

interface WindowWithAudioContext extends Window {
  webkitAudioContext?: typeof AudioContext;
}

interface PianoInstrument {
  play: (noteName: string, time: number, options?: {
    duration?: number;
    gain?: number;
  }) => NoteInstance;
}

interface NoteInstance {
  stop: () => void;
}

export class RealisticPianoSynth {
  private audioContext: AudioContext | null = null;
  private piano: PianoInstrument | null = null;
  private isLoaded = false;
  private isLoading = false;
  private activeNotes: Map<number, NoteInstance> = new Map();

  constructor() {
    this.initializeAudio();
  }

  private async initializeAudio(): Promise<void> {
    try {
      // Interface para window com webkitAudioContext
      const windowWithAudio = window as WindowWithAudioContext;
      const AudioContextClass = window.AudioContext || windowWithAudio.webkitAudioContext;
      
      if (!AudioContextClass) {
        throw new Error('AudioContext not supported');
      }
      
      this.audioContext = new AudioContextClass();
      console.log('🎹 Realistic Piano: AudioContext inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar AudioContext:', error);
    }
  }

  async loadPiano(): Promise<boolean> {
    if (this.isLoaded) return true;
    if (this.isLoading) return false;
    if (!this.audioContext) return false;

    this.isLoading = true;

    try {
      console.log('🎹 Carregando piano realista...');
      
      // Carregar soundfont do piano
      this.piano = await soundfontInstrument(this.audioContext, 'acoustic_grand_piano', {
        soundfont: 'MusyngKite', // Soundfont de alta qualidade
        nameToUrl: (name: string, soundfont: string, format: string) => {
          return `https://gleitz.github.io/midi-js-soundfonts/${soundfont}/${name}-${format}.js`;
        },
        gain: 0.7 // Volume
      }) as PianoInstrument;

      this.isLoaded = true;
      this.isLoading = false;
      console.log('✅ Piano realista carregado com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao carregar piano realista:', error);
      this.isLoading = false;
      return false;
    }
  }

  // Converter número MIDI para nome da nota
  private midiToNoteName(midiNote: number): string {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    const noteName = noteNames[midiNote % 12];
    return `${noteName}${octave}`;
  }

  async playNote(midiNote: number, velocity: number = 80, duration: number = 1000): Promise<void> {
    // Verificar se o piano está carregado
    if (!this.isLoaded) {
      const loaded = await this.loadPiano();
      if (!loaded) {
        console.error('❌ Piano não pôde ser carregado');
        return;
      }
    }

    if (!this.piano || !this.audioContext) return;

    // Retomar contexto se suspenso
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    try {
      const noteName = this.midiToNoteName(midiNote);
      console.log(`🎵 Tocando nota: ${noteName} (MIDI: ${midiNote})`);

      // Tocar a nota com velocity e duração
      const noteInstance = this.piano.play(noteName, this.audioContext.currentTime, {
        duration: duration / 1000, // Converter para segundos
        gain: velocity / 127 // Normalizar velocity
      });

      // Armazenar para poder parar depois
      this.activeNotes.set(midiNote, noteInstance);

      // Auto-parar após a duração
      if (duration > 0) {
        setTimeout(() => {
          this.stopNote(midiNote);
        }, duration);
      }

    } catch (error) {
      console.error('❌ Erro ao tocar nota:', error);
    }
  }

  async playChord(midiNotes: number[], velocity: number = 80, duration: number = 1000): Promise<void> {
    console.log(`🎵 Tocando acorde: ${midiNotes.map(n => this.midiToNoteName(n)).join(', ')}`);
    
    // Tocar todas as notas simultaneamente
    const promises = midiNotes.map(note => this.playNote(note, velocity, duration));
    await Promise.all(promises);
  }

  stopNote(midiNote: number): void {
    const noteInstance = this.activeNotes.get(midiNote);
    if (noteInstance && noteInstance.stop) {
      try {
        noteInstance.stop();
        this.activeNotes.delete(midiNote);
        console.log(`🛑 Parou nota: ${this.midiToNoteName(midiNote)}`);
      } catch (error) {
        console.error('❌ Erro ao parar nota:', error);
      }
    }
  }

  stopAllNotes(): void {
    console.log('🛑 Parando todas as notas');
    this.activeNotes.forEach((noteInstance, midiNote) => {
      this.stopNote(midiNote);
    });
    this.activeNotes.clear();
  }

  // Getter para verificar se está carregado
  get loaded(): boolean {
    return this.isLoaded;
  }

  get loading(): boolean {
    return this.isLoading;
  }

  // Pré-carregar o piano (usar no início da aplicação)
  async preload(): Promise<boolean> {
    return await this.loadPiano();
  }
}

// Instância singleton
let realisticPianoInstance: RealisticPianoSynth | null = null;

export function getRealisticPiano(): RealisticPianoSynth {
  if (!realisticPianoInstance) {
    realisticPianoInstance = new RealisticPianoSynth();
  }
  return realisticPianoInstance;
}

// Export default para compatibilidade
export const realisticPiano = getRealisticPiano();