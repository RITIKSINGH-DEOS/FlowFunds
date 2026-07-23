import mongoose, { Schema, Document } from 'mongoose';

export interface IInvestment extends Document {
  userId: string;
  name: string;
  type: string;
  investedAmount: number;
  currentValue: number;
  dateAdded: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvestmentSchema = new Schema<IInvestment>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    investedAmount: { type: Number, required: true },
    currentValue: { type: Number, required: true },
    dateAdded: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Investment || mongoose.model<IInvestment>('Investment', InvestmentSchema);
