import { NextRequest, NextResponse } from 'next/server';
import { azureOpenAIService } from '@/lib/ai/azure-openai';
import type { ChatMessage } from '@/lib/ai/types';

export async function POST(request: NextRequest) {
  try {
    const { messages }: { messages: ChatMessage[] } = await request.json();
    
    // Validate request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: messages array is required' },
        { status: 400 }
      );
    }

    // Call Azure OpenAI service
    const response = await azureOpenAIService.chatWithAssistant(messages);
    
    return NextResponse.json({
      success: true,
      response,
      provider: 'azure-openai',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Chat API Error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process chat request',
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'AI Chat API',
    methods: ['POST'],
    description: 'Chat with AI assistant using Azure OpenAI',
    status: 'active'
  });
}
