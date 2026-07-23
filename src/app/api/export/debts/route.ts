import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Debt from '@/models/Debt';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const debts = await Debt.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean();

  const headers = ['Person', 'Amount', 'Type', 'Due Date', 'Status', 'Notes'];
  const rows = debts.map((d: any) => [
    `"${(d.person || '').replace(/"/g, '""')}"`,
    d.amount,
    d.type,
    d.dueDate || '',
    d.status,
    `"${(d.notes || '').replace(/"/g, '""')}"`,
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="debts.csv"',
    },
  });
}
