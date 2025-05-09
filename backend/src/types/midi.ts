// src/types/midi.ts
export interface MIDIEvent {
    type: 'note' | 'control' | 'program' | 'tempo' | 'timesig' | 'keysig' | 'pitchbend';
    channel: number;
    position: number; // Position in MIDI ticks
    data1: number;    // For notes: pitch, for controls: controller number
    data2: number;    // For notes: velocity, for controls: value
    duration?: number; // Duration in ticks (only for notes)
  }
  
  export interface MIDISequence {
    events: MIDIEvent[];
    ppq: number;      // Pulses per quarter note (typically 480 or 960)
    tempo: number;    // BPM
    timeSignature: {
      numerator: number;
      denominator: number;
    };
    description: string; // Text description of the sequence for display/teaching
    correctAnswer: string | string[]; // What the user should answer
  }