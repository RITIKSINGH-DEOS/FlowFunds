import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { parseTransactionText } from '@/services/aiService';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { text, apiKey } = await req.json();
  if (!text) return NextResponse.json({ error: 'Text is required' }, { status: 400 });
  if (!apiKey) return NextResponse.json({ error: 'API key is required' }, { status: 400 });

  try {
    const result = await parseTransactionText(text, apiKey);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'AI parsing failed' }, { status: 500 });
  }
}
