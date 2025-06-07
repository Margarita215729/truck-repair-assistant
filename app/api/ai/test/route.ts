import { NextRequest, NextResponse } from 'next/server';
import { enhancedAIService } from '@/lib/ai';

export async function GET() {
  try {
    // Проверка доступности AI сервиса
    const isAvailable = await enhancedAIService.isServiceAvailable();
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      ai: {
        available: isAvailable,
        provider: 'azure-openai',
        model: 'gpt-4o'
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      ai: {
        available: false,
        provider: 'azure-openai',
        model: 'gpt-4o'
      }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json({
        error: 'Message is required'
      }, { status: 400 });
    }

    const response = await enhancedAIService.generateResponse(message, {
      temperature: 0.7,
      maxTokens: 150
    });

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      response: response,
      provider: 'azure-openai'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
