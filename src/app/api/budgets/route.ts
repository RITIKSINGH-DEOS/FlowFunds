import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Budget from '@/models/Budget';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const budgets = await Budget.find({ userId: session.user.id }).lean();
  return NextResponse.json(budgets);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const body = await req.json();

  // Upsert: if same category+month exists, update amount
  const budget = await Budget.findOneAndUpdate(
    { userId: session.user.id, category: body.category, month: body.month },
    { ...body, userId: session.user.id },
    { new: true, upsert: true }
  ).lean();

  return NextResponse.json(budget, { status: 201 });
}
