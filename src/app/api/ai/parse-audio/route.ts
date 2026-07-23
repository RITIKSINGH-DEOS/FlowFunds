import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { parseTransactionAudio } from '@/services/aiService';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { audio, mimeType, apiKey } = await req.json();
  if (!audio) return NextResponse.json({ error: 'Audio data is required' }, { status: 400 });
  if (!apiKey) return NextResponse.json({ error: 'API key is required' }, { status: 400 });

  try {
    const result = await parseTransactionAudio(audio, mimeType || 'audio/webm', apiKey);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Audio parsing failed' }, { status: 500 });
  }
}
