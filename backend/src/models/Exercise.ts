// src/models/Exercise.ts
import mongoose, { Schema, Document } from 'mongoose';
import { MIDISequence } from '../types/midi';

export interface IExercise extends Document {
  type: 'interval' | 'progression' | 'melodic' | 'rhythmic';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: {
    notes?: number[];
    intervals?: string[];
    chords?: string[];
    rhythms?: number[];
    midiSequence?: MIDISequence; // Adicionando o novo campo para MIDI
  };
  answer: string | string[];
  requiresPremium: boolean;
  createdAt: Date;
}

const ExerciseSchema: Schema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['interval', 'progression', 'melodic', 'rhythmic']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  content: {
    notes: [Number],
    intervals: [String],
    chords: [String],
    rhythms: [Number],
    midiSequence: {
      type: Schema.Types.Mixed, // Usando Mixed type para o objeto complexo MIDISequence
      default: null
    }
  },
  answer: {
    type: Schema.Types.Mixed, // Pode ser string ou array de strings
    required: true
  },
  requiresPremium: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IExercise>('Exercise', ExerciseSchema);