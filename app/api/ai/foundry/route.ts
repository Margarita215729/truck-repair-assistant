import { NextRequest, NextResponse } from 'next/server';
import { runAgentConversation } from '@/lib/ai/azure-agent';

// Remove static export for Vercel deployment
// export const dynamic = "force-static";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message }: { message: string } = body;
    
    // Validate request
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid message string' },
        { status: 400 }
      );
    }

    // Check if Azure AI Foundry is configured
    if (!process.env.AZURE_PROJECTS_ENDPOINT || 
        !process.env.AZURE_AGENT_ID || 
        !process.env.AZURE_THREAD_ID) {
      return NextResponse.json(
        { 
          error: 'Azure AI Foundry not configured. Missing environment variables: AZURE_PROJECTS_ENDPOINT, AZURE_AGENT_ID, AZURE_THREAD_ID',
          service: 'azure-ai-foundry',
          configured: false
        },
        { status: 503 }
      );
    }

    // Run Azure AI Foundry conversation
    const conversation = await runAgentConversation(message);
    
    return NextResponse.json({
      conversation,
      service: 'azure-ai-foundry',
      configured: true,
      success: true
    });
    
  } catch (error) {
    console.error('Azure AI Foundry API error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        service: 'azure-ai-foundry',
        success: false
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const isConfigured = !!(
    process.env.AZURE_PROJECTS_ENDPOINT && 
    process.env.AZURE_AGENT_ID && 
    process.env.AZURE_THREAD_ID
  );

  return NextResponse.json({
    service: 'Azure AI Foundry API',
    status: isConfigured ? 'configured' : 'not configured',
    configured: isConfigured,
    requiredEnvVars: [
      'AZURE_PROJECTS_ENDPOINT',
      'AZURE_AGENT_ID', 
      'AZURE_THREAD_ID'
    ],
    endpoints: {
      POST: '/api/ai/foundry - Run Azure AI Foundry agent conversation'
    }
  });
}
