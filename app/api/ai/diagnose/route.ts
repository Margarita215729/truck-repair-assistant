import { NextRequest, NextResponse } from 'next/server';
import { enhancedAIService } from '@/lib/ai/enhanced-ai-service';
import type { DiagnosisRequest } from '@/lib/ai/types';

export const dynamic = "force-static";

export async function POST(request: NextRequest) {
  try {
    const body: DiagnosisRequest = await request.json();
    
    // Validate request
    if (!body.truck || !body.symptoms || body.symptoms.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: truck, symptoms' },
        { status: 400 }
      );
    }

    // Perform diagnosis using enhanced AI service
    const result = await enhancedAIService.diagnoseTruckIssue(body);
    
    return NextResponse.json({
      result: result.result,
      provider: result.provider,
      fallbackUsed: result.fallbackUsed,
      success: true
    });
    
  } catch (error) {
    console.error('Diagnosis API error:', error);
    
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
    service: 'AI Diagnosis API',
    status: 'available',
    endpoints: {
      POST: '/api/ai/diagnose - Diagnose truck issues'
    }
  });
}
