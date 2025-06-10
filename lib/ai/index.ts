/**
 * AI Services Export Hub
 * 
 * Provides unified access to production-ready AI services.
 * This module exports the appropriate service based on the environment:
 * - Server-side: Full Azure AI Foundry and Azure OpenAI services
 * - Client-side: Safe wrapper that calls API endpoints
 */

// Type definitions
export type {
  TruckModel,
  DiagnosisRequest,
  DiagnosisResult,
  ChatMessage,
  HealthStatus,
  AIServiceConfig,
  AudioAnalysisRequest,
  AudioAnalysisResult,
  StreamingResponse,
  StreamCallback,
  AIServiceError,
  FallbackResult
} from './types';

// Server-side services (only available on server)
export { AzureOpenAIService, azureOpenAIService } from './azure-openai';
export { EnhancedAIService, enhancedAIService } from './enhanced-ai-service';

// Client-side safe wrapper
export { ClientAIService, clientAIService } from './client-ai-service';

// Environment-aware service selection
export const getAIService = async () => {
  if (typeof window === 'undefined') {
    return (await import('./enhanced-ai-service')).enhancedAIService;
  } else {
    return (await import('./client-ai-service')).clientAIService;
  }
};
