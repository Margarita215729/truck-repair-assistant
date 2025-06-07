import { NextRequest, NextResponse } from 'next/server';
import { azureOpenAIService } from '@/lib/ai/azure-openai';

export async function GET() {
  try {
    const isHealthy = await azureOpenAIService.healthCheck();
    
    return NextResponse.json({
      service: 'Azure OpenAI',
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      endpoint: process.env.AZURE_OPENAI_ENDPOINT ? 'configured' : 'not configured',
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT || 'not configured'
    });

  } catch (error) {
    console.error('Azure OpenAI Health Check Error:', error);
    
    return NextResponse.json(
      { 
        service: 'Azure OpenAI',
        status: 'error',
        error: error instanceof Error ? error.message : 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
