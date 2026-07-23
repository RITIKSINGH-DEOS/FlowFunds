import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  userId: string;
  date: Date;
  amount: number;
  currency: string;
  type: 'Income' | 'Expense' | 'Transfer';
  category: string;
  description: string;
  notes: string;
  tags: string;
  receiptUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    type: { type: String, enum: ['Income', 'Expense', 'Transfer'], required: true },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    notes: { type: String, default: '' },
    tags: { type: String, default: '' },
    receiptUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

TransactionSchema.index({ userId: 1, date: -1 });

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
