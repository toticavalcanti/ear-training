//src\models\ExerciseHistory.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IExerciseHistory extends Document {
  user: mongoose.Types.ObjectId;
  exercise: mongoose.Types.ObjectId;
  userAnswer: string | string[];
  isCorrect: boolean;
  timeSpent: number; // em segundos
}

const ExerciseHistorySchema = new Schema<IExerciseHistory>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  exercise: {
    type: Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true,
  },
  userAnswer: {
    type: Schema.Types.Mixed,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  timeSpent: {
    type: Number,
    required: true,
    min: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.model<IExerciseHistory>('ExerciseHistory', ExerciseHistorySchema);