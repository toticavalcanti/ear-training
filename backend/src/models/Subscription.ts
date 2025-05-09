// src/models/Subscription.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  user: mongoose.Schema.Types.ObjectId;
  status: 'active' | 'past_due' | 'cancelled' | 'incomplete';
  plan: 'monthly' | 'annual';
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema: Schema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'past_due', 'cancelled', 'incomplete'],
    default: 'incomplete'
  },
  plan: {
    type: String,
    enum: ['monthly', 'annual'],
    default: 'monthly'
  },
  stripeCustomerId: {
    type: String,
    required: true
  },
  stripeSubscriptionId: {
    type: String,
    required: true
  },
  currentPeriodEnd: {
    type: Date,
    required: true
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);