import { NextRequest, NextResponse } from 'next/server';
import { azureOpenAIService } from '@/lib/ai/azure-openai';
import type { DiagnosisRequest } from '@/lib/ai/types';

export async function POST(request: NextRequest) {
  try {
    const diagnosisRequest: DiagnosisRequest = await request.json();
    
    // Validate request
    if (!diagnosisRequest.truck || !diagnosisRequest.symptoms || diagnosisRequest.symptoms.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: truck information and symptoms are required' },
        { status: 400 }
      );
    }

    // Call Azure OpenAI service
    const result = await azureOpenAIService.diagnoseTruckIssue(diagnosisRequest);
    
    return NextResponse.json({
      success: true,
      result,
      provider: 'azure-openai',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Diagnosis API Error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process diagnosis request',
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'AI Diagnosis API',
    methods: ['POST'],
    description: 'Diagnose truck issues using Azure OpenAI',
    status: 'active'
  });
}
