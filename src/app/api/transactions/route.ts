import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Transaction from '@/models/Transaction';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const transactions = await Transaction.find({ userId: session.user.id }).sort({ date: -1 }).lean();
  return NextResponse.json(transactions);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const transaction = await Transaction.create({ ...body, userId: session.user.id });
  return NextResponse.json(transaction, { status: 201 });
}
