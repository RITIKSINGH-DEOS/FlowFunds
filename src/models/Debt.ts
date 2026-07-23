import mongoose, { Schema, Document } from 'mongoose';

export interface IDebt extends Document {
  userId: string;
  person: string;
  amount: number;
  type: 'Lent' | 'Borrowed';
  dueDate: string;
  status: 'Pending' | 'Settled';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const DebtSchema = new Schema<IDebt>(
  {
    userId: { type: String, required: true, index: true },
    person: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['Lent', 'Borrowed'], required: true },
    dueDate: { type: String, default: '' },
    status: { type: String, enum: ['Pending', 'Settled'], default: 'Pending' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

DebtSchema.index({ userId: 1, status: 1 });

export default mongoose.models.Debt || mongoose.model<IDebt>('Debt', DebtSchema);
