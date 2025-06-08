import { NextRequest, NextResponse } from 'next/server';
import { runAgentConversation } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    const result = await runAgentConversation(message);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
