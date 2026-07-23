import mongoose, { Schema, Document } from 'mongoose';

export interface IBudget extends Document {
  userId: string;
  category: string;
  amount: number;
  month: string;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudget>(
  {
    userId: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    month: { type: String, required: true },
  },
  { timestamps: true }
);

BudgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });

export default mongoose.models.Budget || mongoose.model<IBudget>('Budget', BudgetSchema);
