/**
 * Client-side AI service wrapper
 * 
 * Provides safe access to AI se  async streamChatResponse(_messages: ChatMessage[]): Promise<AsyncIterable<string>> {vices from the browser by calling server-side API endpoints.
 * This ensures that sensitive API keys are never exposed to the client.
 */

import type { DiagnosisRequest, DiagnosisResult, ChatMessage, HealthStatus, TruckModel } from './types';

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
        service: data.service || 'azure-openai',
        isHealthy: data.status === 'healthy' || data.status === 'ok' || data.available === true,
        latency: typeof data.latency === 'number' ? data.latency : undefined,
        error: data.error || undefined
      };
    } catch (error) {
      return {
        service: 'azure-openai',
        isHealthy: false,
        error: error instanceof Error ? error.message : 'Health check failed'
      };
    }
  }

  // Placeholder methods for future implementations
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async streamChatResponse(_messages?: ChatMessage[]): Promise<AsyncIterable<string>> {
    // This would need to be implemented with Server-Sent Events or WebSockets
    throw new Error('Streaming not yet implemented for client-side service');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async analyzeEngineSound(_audioBlob?: Blob, _truckInfo?: TruckModel): Promise<string> {
    // This would need to be implemented with file upload to server
    throw new Error('Audio analysis not yet implemented for client-side service');
  }

  /**
   * Chat using Azure AI Foundry agent (client-side wrapper)
   * @param message - User message to send to the agent
   * @returns Promise with agent conversation response
   */
  async chatWithFoundryAgent(message: string): Promise<Array<{ role: string; text: string }>> {
    const response = await fetch(`${this.baseUrl}/ai/foundry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to chat with Azure AI Foundry agent');
    }

    const data = await response.json();
    return data.conversation;
  }

  /**
   * Get Azure AI Foundry configuration status
   */
  async getFoundryStatus() {
    const response = await fetch(`${this.baseUrl}/ai/foundry`);
    const data = await response.json();
    return data;
  }
}

// Client-side singleton
export const clientAIService = new ClientAIService();
