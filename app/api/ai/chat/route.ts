import { NextRequest, NextResponse } from 'next/server';
import { enhancedAIService } from '@/lib/ai/enhanced-ai-service';
import type { ChatMessage } from '@/lib/ai/types';

export const dynamic = "force-static";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages }: { messages: ChatMessage[] } = body;
    
    // Validate request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid messages array' },
        { status: 400 }
      );
    }

    // Validate message structure
    for (const message of messages) {
      if (!message.role || !message.content) {
        return NextResponse.json(
          { error: 'Invalid message structure. Each message must have role and content' },
          { status: 400 }
        );
      }
    }

    // Perform chat using enhanced AI service
    const result = await enhancedAIService.chat(messages);
    
    return NextResponse.json({
      response: result.result,
      provider: result.provider,
      fallbackUsed: result.fallbackUsed,
      success: true
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'AI Chat API',
    status: 'available',
    endpoints: {
      POST: '/api/ai/chat - Chat with AI assistant'
    }
  });
}
