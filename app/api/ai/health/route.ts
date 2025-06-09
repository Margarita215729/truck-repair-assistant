import { NextRequest, NextResponse } from 'next/server';
import { enhancedAIService } from '@/lib/ai/enhanced-ai-service';

export const dynamic = "force-static";

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Check health of all AI providers
    const healthChecks = await enhancedAIService.checkHealth();
    const latency = Date.now() - startTime;
    
    // Determine overall health
    const isHealthy = healthChecks.some(check => check.isHealthy);
    const primaryService = healthChecks.find(check => check.service === 'azure-openai');
    
    return NextResponse.json({
      service: 'Enhanced AI Service',
      status: isHealthy ? 'healthy' : 'unhealthy',
      latency,
      providers: healthChecks,
      primary: {
        service: 'azure-openai',
        isHealthy: primaryService?.isHealthy || false,
        error: primaryService?.error
      },
      timestamp: new Date().toISOString(),
      success: true
    });
    
  } catch (error) {
    console.error('Health check API error:', error);
    
    return NextResponse.json(
      { 
        service: 'Enhanced AI Service',
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Health check failed',
        timestamp: new Date().toISOString(),
        success: false
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  // Allow POST requests to health endpoint for testing
  return GET();
}
