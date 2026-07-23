import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateInsights } from '@/services/aiService';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { summary, apiKey } = await req.json();
  if (!summary) return NextResponse.json({ error: 'Summary is required' }, { status: 400 });

  try {
    const insights = await generateInsights(summary, apiKey || '');
    return NextResponse.json(insights);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
