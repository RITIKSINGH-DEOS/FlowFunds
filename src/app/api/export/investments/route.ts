import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Investment from '@/models/Investment';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const investments = await Investment.find({ userId: session.user.id }).sort({ dateAdded: -1 }).lean();

  const headers = ['Name', 'Type', 'Invested Amount', 'Current Value', 'Returns', 'Return %', 'Date Added'];
  const rows = investments.map((i: any) => {
    const ret = (i.currentValue || 0) - (i.investedAmount || 0);
    const pct = i.investedAmount > 0 ? ((ret / i.investedAmount) * 100).toFixed(1) : '0.0';
    return [
      `"${(i.name || '').replace(/"/g, '""')}"`,
      i.type || '',
      i.investedAmount,
      i.currentValue,
      ret,
      pct,
      i.dateAdded ? new Date(i.dateAdded).toISOString().split('T')[0] : '',
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="investments.csv"',
    },
  });
}
