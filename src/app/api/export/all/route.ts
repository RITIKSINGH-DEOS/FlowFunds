import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Transaction from '@/models/Transaction';
import Debt from '@/models/Debt';
import Investment from '@/models/Investment';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const [transactions, debts, investments] = await Promise.all([
    Transaction.find({ userId: session.user.id }).sort({ date: -1 }).lean(),
    Debt.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean(),
    Investment.find({ userId: session.user.id }).sort({ dateAdded: -1 }).lean(),
  ]);

  const sections: string[] = [];

  // Transactions
  sections.push('--- TRANSACTIONS ---');
  sections.push('Date,Amount,Currency,Type,Category,Description,Notes,Tags,Receipt URL');
  (transactions as any[]).forEach(t => {
    sections.push([
      new Date(t.date).toISOString().split('T')[0],
      t.amount, t.currency || 'INR', t.type, t.category,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      t.tags || '', t.receiptUrl || '',
    ].join(','));
  });

  // Debts
  sections.push('');
  sections.push('--- DEBTS ---');
  sections.push('Person,Amount,Type,Due Date,Status,Notes');
  (debts as any[]).forEach(d => {
    sections.push([
      `"${(d.person || '').replace(/"/g, '""')}"`,
      d.amount, d.type, d.dueDate || '', d.status,
      `"${(d.notes || '').replace(/"/g, '""')}"`,
    ].join(','));
  });

  // Investments
  sections.push('');
  sections.push('--- INVESTMENTS ---');
  sections.push('Name,Type,Invested Amount,Current Value,Returns,Return %,Date Added');
  (investments as any[]).forEach(i => {
    const ret = (i.currentValue || 0) - (i.investedAmount || 0);
    const pct = i.investedAmount > 0 ? ((ret / i.investedAmount) * 100).toFixed(1) : '0.0';
    sections.push([
      `"${(i.name || '').replace(/"/g, '""')}"`,
      i.type || '', i.investedAmount, i.currentValue, ret, pct,
      i.dateAdded ? new Date(i.dateAdded).toISOString().split('T')[0] : '',
    ].join(','));
  });

  const csv = sections.join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="all-finance-data.csv"',
    },
  });
}
