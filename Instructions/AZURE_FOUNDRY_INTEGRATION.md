# Azure AI Foundry Integration Guide - Truck Repair Assistant

## Overview
This guide covers the integration of Azure AI Foundry Agent as the primary AI service for the Truck Repair Assistant application.

## Azure AI Foundry Agent Architecture

### 1. Agent Configuration

```yaml
# Azure AI Foundry Agent Definition
name: truck-repair-assistant-agent
description: "AI-powered truck repair diagnostic assistant for US commercial vehicles"
model: gpt-4o
instructions: |
  You are a specialized truck repair assistant with expertise in:
  - Peterbilt, Kenworth, Freightliner, Volvo, Mack, and International trucks
  - Cummins, Caterpillar, Detroit Diesel, and PACCAR engines
  - Commercial vehicle electrical, hydraulic, and mechanical systems
  - DOT regulations and safety compliance
  - Emergency roadside assistance guidance
  
  Always provide:
  - Step-by-step diagnostic procedures
  - Safety warnings and PPE requirements
  - Estimated time and difficulty level (1-5 scale)
  - Required tools and parts with part numbers when possible
  - Temporary fixes for roadside emergencies
  - When to seek professional help

temperature: 0.3
top_p: 0.9
max_tokens: 2000

tools:
  - type: function
    function:
      name: search_truck_database
      description: Search for truck-specific information and common issues
      parameters:
        type: object
        properties:
          make:
            type: string
            description: Truck manufacturer
          model:
            type: string  
            description: Truck model
          year:
            type: integer
            description: Truck year
          engine:
            type: string
            description: Engine type
        required: ["make", "model"]
  
  - type: function
    function:
      name: find_nearby_services
      description: Find nearby truck repair services
      parameters:
        type: object
        properties:
          latitude:
            type: number
            description: User latitude
          longitude:
            type: number
            description: User longitude
          radius:
            type: number
            description: Search radius in miles
        required: ["latitude", "longitude"]
        
  - type: function
    function:
      name: get_parts_information
      description: Get parts information and pricing
      parameters:
        type: object
        properties:
          part_name:
            type: string
            description: Name or description of the part
          truck_make:
            type: string
            description: Truck manufacturer
          truck_model:
            type: string
            description: Truck model
        required: ["part_name"]
```

### 2. Environment Configuration

```bash
# Azure AI Foundry Required Variables
AZURE_PROJECTS_ENDPOINT=https://your-foundry-project.westus.models.ai
AZURE_AGENT_ID=agent_abc123def456
AZURE_THREAD_ID=thread_xyz789uvw012

# Azure OpenAI Fallback (when Foundry is unavailable)
AZURE_OPENAI_API_KEY=your_fallback_key
AZURE_OPENAI_ENDPOINT=https://your-backup.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o

# GitHub Models Fallback (secondary fallback)
NEXT_PUBLIC_GITHUB_TOKEN=github_pat_your_token
```

### 3. Integration Service

```typescript
// lib/ai/azure-foundry.ts
import { 
  AIProjectsClient, 
  AgentsOperations,
  ThreadRun,
  ThreadMessage
} from '@azure/ai-projects';
import { DefaultAzureCredential } from '@azure/identity';

export interface TruckDiagnosisRequest {
  symptoms: string[];
  truckInfo: {
    make: string;
    model: string;
    year: number;
    engine?: string;
  };
  urgency: 'low' | 'medium' | 'high';
  location?: {
    lat: number;
    lng: number;
  };
  audioTranscription?: string;
}

export interface TruckDiagnosisResponse {
  diagnosis: string;
  confidence: number;
  steps: Array<{
    step: number;
    instruction: string;
    warning?: string;
    estimatedTime: number;
  }>;
  requiredTools: string[];
  requiredParts: Array<{
    name: string;
    partNumber?: string;
    estimatedCost?: number;
  }>;
  temporaryFix?: string;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  estimatedTime: number;
  seekProfessionalHelp: boolean;
  nearbyServices?: Array<{
    name: string;
    address: string;
    phone?: string;
    distance: number;
  }>;
}

class AzureFoundryService {
  private client: AIProjectsClient;
  private agentId: string;
  private threadId: string;

  constructor() {
    const endpoint = process.env.AZURE_PROJECTS_ENDPOINT!;
    const credential = new DefaultAzureCredential();
    
    this.client = new AIProjectsClient(endpoint, credential);
    this.agentId = process.env.AZURE_AGENT_ID!;
    this.threadId = process.env.AZURE_THREAD_ID!;
  }

  async diagnoseTruck(request: TruckDiagnosisRequest): Promise<TruckDiagnosisResponse> {
    try {
      // Create a new thread for this conversation
      const thread = await this.client.agents.createThread();
      
      // Prepare the diagnostic message
      const diagnosticPrompt = this.buildDiagnosticPrompt(request);
      
      // Add message to thread
      await this.client.agents.createMessage(thread.id, {
        role: 'user',
        content: diagnosticPrompt
      });

      // Run the agent
      const run = await this.client.agents.createRun(thread.id, {
        assistantId: this.agentId,
        instructions: this.getContextualInstructions(request)
      });

      // Wait for completion
      const completedRun = await this.waitForRunCompletion(thread.id, run.id);
      
      // Get the response
      const messages = await this.client.agents.listMessages(thread.id);
      const response = messages.data[0].content[0];
      
      if (response.type === 'text') {
        return this.parseAgentResponse(response.text.value);
      }
      
      throw new Error('Unexpected response format from agent');
      
    } catch (error) {
      console.error('Azure Foundry diagnosis error:', error);
      throw new Error('Failed to complete truck diagnosis');
    }
  }

  private buildDiagnosticPrompt(request: TruckDiagnosisRequest): string {
    let prompt = `TRUCK DIAGNOSTIC REQUEST\n\n`;
    prompt += `Vehicle Information:\n`;
    prompt += `- Make: ${request.truckInfo.make}\n`;
    prompt += `- Model: ${request.truckInfo.model}\n`;
    prompt += `- Year: ${request.truckInfo.year}\n`;
    
    if (request.truckInfo.engine) {
      prompt += `- Engine: ${request.truckInfo.engine}\n`;
    }
    
    prompt += `\nReported Symptoms:\n`;
    request.symptoms.forEach((symptom, index) => {
      prompt += `${index + 1}. ${symptom}\n`;
    });
    
    prompt += `\nUrgency Level: ${request.urgency}\n`;
    
    if (request.audioTranscription) {
      prompt += `\nAudio Description: ${request.audioTranscription}\n`;
    }
    
    if (request.location) {
      prompt += `\nLocation: ${request.location.lat}, ${request.location.lng}\n`;
    }
    
    prompt += `\nPlease provide a comprehensive diagnostic response following the structured format.`;
    
    return prompt;
  }

  private getContextualInstructions(request: TruckDiagnosisRequest): string {
    let instructions = `Focus on ${request.truckInfo.make} ${request.truckInfo.model} specific issues. `;
    
    if (request.urgency === 'high') {
      instructions += `This is an urgent situation - prioritize immediate safety and temporary fixes. `;
    }
    
    if (request.location) {
      instructions += `User location provided - include nearby service recommendations if professional help is needed. `;
    }
    
    return instructions;
  }

  private async waitForRunCompletion(threadId: string, runId: string): Promise<ThreadRun> {
    let run = await this.client.agents.getRun(threadId, runId);
    
    while (run.status === 'queued' || run.status === 'in_progress') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      run = await this.client.agents.getRun(threadId, runId);
    }
    
    if (run.status === 'failed') {
      throw new Error(`Agent run failed: ${run.lastError?.message}`);
    }
    
    return run;
  }

  private parseAgentResponse(responseText: string): TruckDiagnosisResponse {
    // Parse the structured response from the agent
    // This would be implemented based on the agent's response format
    try {
      // Attempt to parse JSON if agent returns structured data
      if (responseText.includes('{') && responseText.includes('}')) {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
      
      // Fallback: parse text response
      return this.parseTextResponse(responseText);
      
    } catch (error) {
      console.error('Error parsing agent response:', error);
      throw new Error('Failed to parse diagnosis response');
    }
  }

  private parseTextResponse(text: string): TruckDiagnosisResponse {
    // Simple text parsing for demo purposes
    // In production, train the agent to return structured JSON
    return {
      diagnosis: text.substring(0, 500),
      confidence: 0.8,
      steps: [
        {
          step: 1,
          instruction: "Follow the detailed instructions provided by the AI agent",
          estimatedTime: 30
        }
      ],
      requiredTools: ["Basic tools"],
      requiredParts: [],
      difficultyLevel: 3,
      estimatedTime: 60,
      seekProfessionalHelp: false
    };
  }

  async getConversationHistory(threadId: string): Promise<ThreadMessage[]> {
    const messages = await this.client.agents.listMessages(threadId);
    return messages.data;
  }

  async continueConversation(threadId: string, message: string): Promise<string> {
    await this.client.agents.createMessage(threadId, {
      role: 'user',
      content: message
    });

    const run = await this.client.agents.createRun(threadId, {
      assistantId: this.agentId
    });

    const completedRun = await this.waitForRunCompletion(threadId, run.id);
    
    const messages = await this.client.agents.listMessages(threadId);
    const response = messages.data[0].content[0];
    
    if (response.type === 'text') {
      return response.text.value;
    }
    
    throw new Error('Unexpected response format');
  }
}

export const azureFoundryService = new AzureFoundryService();
```

### 4. API Route Integration

```typescript
// app/api/ai/foundry/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { azureFoundryService, TruckDiagnosisRequest } from '@/lib/ai/azure-foundry';
import { azureOpenAIService } from '@/lib/ai/azure-openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as TruckDiagnosisRequest;
    
    // Validate request
    if (!body.symptoms || body.symptoms.length === 0) {
      return NextResponse.json(
        { error: 'Symptoms are required' },
        { status: 400 }
      );
    }
    
    if (!body.truckInfo || !body.truckInfo.make || !body.truckInfo.model) {
      return NextResponse.json(
        { error: 'Truck information (make, model) is required' },
        { status: 400 }
      );
    }

    // Try Azure AI Foundry first
    try {
      const diagnosis = await azureFoundryService.diagnoseTruck(body);
      
      return NextResponse.json({
        success: true,
        data: diagnosis,
        source: 'azure-foundry'
      });
      
    } catch (foundryError) {
      console.error('Azure Foundry failed, falling back to Azure OpenAI:', foundryError);
      
      // Fallback to Azure OpenAI
      try {
        const fallbackDiagnosis = await azureOpenAIService.diagnoseTruck(body);
        
        return NextResponse.json({
          success: true,
          data: fallbackDiagnosis,
          source: 'azure-openai-fallback',
          warning: 'Primary AI service unavailable, using fallback'
        });
        
      } catch (openaiError) {
        console.error('Azure OpenAI fallback also failed:', openaiError);
        
        return NextResponse.json(
          { 
            error: 'All AI services are currently unavailable',
            details: 'Please try again later'
          },
          { status: 503 }
        );
      }
    }
    
  } catch (error) {
    console.error('Foundry API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'azure-foundry',
    status: 'active',
    version: '1.0.0',
    capabilities: [
      'truck-diagnosis',
      'multi-turn-conversation', 
      'parts-lookup',
      'service-location'
    ]
  });
}
```

### 5. Frontend Integration

```typescript
// lib/ai/client-foundry-service.ts
export class ClientFoundryService {
  async diagnoseTruck(request: TruckDiagnosisRequest): Promise<TruckDiagnosisResponse> {
    const response = await fetch('/api/ai/foundry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Diagnosis failed');
    }

    const result = await response.json();
    return result.data;
  }

  async continueConversation(threadId: string, message: string): Promise<string> {
    const response = await fetch('/api/ai/foundry/continue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ threadId, message }),
    });

    if (!response.ok) {
      throw new Error('Failed to continue conversation');
    }

    const result = await response.json();
    return result.response;
  }
}

export const clientFoundryService = new ClientFoundryService();
```

## Testing and Monitoring

### Health Checks
```typescript
// app/api/ai/health/route.ts
import { azureFoundryService } from '@/lib/ai/azure-foundry';

export async function GET() {
  const healthChecks = {
    foundry: false,
    openai: false,
    timestamp: new Date().toISOString()
  };

  try {
    // Test Azure Foundry
    await azureFoundryService.diagnoseTruck({
      symptoms: ['test'],
      truckInfo: { make: 'Test', model: 'Test', year: 2023 },
      urgency: 'low'
    });
    healthChecks.foundry = true;
  } catch (error) {
    console.log('Azure Foundry health check failed:', error);
  }

  // Test other services...

  return NextResponse.json(healthChecks);
}
```

### Error Handling
```typescript
// lib/ai/error-handler.ts
export class AIServiceError extends Error {
  constructor(
    message: string,
    public service: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

export function handleAIError(error: unknown, service: string): AIServiceError {
  if (error instanceof AIServiceError) {
    return error;
  }
  
  const message = error instanceof Error ? error.message : 'Unknown error';
  return new AIServiceError(message, service, error as Error);
}
```

## Performance Optimization

### Caching Strategy
```typescript
// lib/ai/cache.ts
import { LRUCache } from 'lru-cache';

interface CacheEntry {
  response: TruckDiagnosisResponse;
  timestamp: number;
}

const responseCache = new LRUCache<string, CacheEntry>({
  max: 100,
  ttl: 1000 * 60 * 15 // 15 minutes
});

export function getCachedResponse(request: TruckDiagnosisRequest): TruckDiagnosisResponse | null {
  const key = generateCacheKey(request);
  const entry = responseCache.get(key);
  
  if (entry && Date.now() - entry.timestamp < 15 * 60 * 1000) {
    return entry.response;
  }
  
  return null;
}

export function setCachedResponse(request: TruckDiagnosisRequest, response: TruckDiagnosisResponse): void {
  const key = generateCacheKey(request);
  responseCache.set(key, {
    response,
    timestamp: Date.now()
  });
}

function generateCacheKey(request: TruckDiagnosisRequest): string {
  return `${request.truckInfo.make}-${request.truckInfo.model}-${request.symptoms.join(',').toLowerCase()}`;
}
```
