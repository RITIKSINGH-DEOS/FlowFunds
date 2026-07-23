import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Transaction from '@/models/Transaction';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const transactions = await Transaction.find({ userId: session.user.id }).sort({ date: -1 }).lean();

  const headers = ['Date', 'Amount', 'Currency', 'Type', 'Category', 'Description', 'Notes', 'Tags', 'Receipt URL'];
  const rows = transactions.map((t: any) => [
    new Date(t.date).toISOString().split('T')[0],
    t.amount,
    t.currency || 'INR',
    t.type,
    t.category,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
    t.tags || '',
    t.receiptUrl || '',
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="transactions.csv"',
    },
  });
}
