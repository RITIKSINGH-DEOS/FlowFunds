import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Investment from '@/models/Investment';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const investments = await Investment.find({ userId: session.user.id }).sort({ dateAdded: -1 }).lean();
  return NextResponse.json(investments);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const investment = await Investment.create({ ...body, userId: session.user.id });
  return NextResponse.json(investment, { status: 201 });
}
