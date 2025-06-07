/**
 * Client-side AI service wrapper
 * 
 * Provides safe access to AI services from the browser by calling server-side API endpoints.
 * This ensures that sensitive API keys are never exposed to the client.
 */

import type { DiagnosisRequest, DiagnosisResult, ChatMessage, HealthStatus } from './types';

export class ClientAIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000/api' 
      : '/api';
  }

  async diagnoseTruckIssue(request: DiagnosisRequest): Promise<DiagnosisResult> {
    const response = await fetch(`${this.baseUrl}/ai/diagnose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to diagnose truck issue');
    }

    const data = await response.json();
    return data.result;
  }

  async chatWithAssistant(messages: ChatMessage[]): Promise<string> {
    const response = await fetch(`${this.baseUrl}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to chat with assistant');
    }

    const data = await response.json();
    return data.response;
  }

  async checkHealth(): Promise<HealthStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/health`);
      const data = await response.json();
      
      return {
        service: data.service,
        status: data.status === 'healthy' ? 'healthy' : 'unhealthy',
        lastChecked: new Date(data.timestamp),
        details: {
          endpoint: data.endpoint,
          deployment: data.deployment,
          error: data.error
        }
      };
    } catch (error) {
      return {
        service: 'Azure OpenAI',
        status: 'error',
        lastChecked: new Date(),
        details: {
          error: error instanceof Error ? error.message : 'Health check failed'
        }
      };
    }
  }

  // Placeholder methods for future implementations
  async streamChatResponse(messages: ChatMessage[]): Promise<AsyncIterable<string>> {
    // This would need to be implemented with Server-Sent Events or WebSockets
    throw new Error('Streaming not yet implemented for client-side service');
  }

  async analyzeEngineSound(audioBlob: Blob, truckInfo: any): Promise<string> {
    // This would need to be implemented with file upload to server
    throw new Error('Audio analysis not yet implemented for client-side service');
  }
}

// Client-side singleton
export const clientAIService = new ClientAIService();
