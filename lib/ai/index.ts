/**
 * AI Services Export Hub
 * 
 * Provides unified access to all AI-related services and components.
 * This module automatically exports the appropriate service based on the environment:
 * - Server-side: Full Azure OpenAI and Enhanced AI services
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
export { GitHubModelsService, githubModelsService } from './github-models';

// Client-side safe wrapper
export { ClientAIService, clientAIService } from './client-ai-service';

// Environment-aware service selection
export const aiService = typeof window === 'undefined' 
  ? require('./enhanced-ai-service').enhancedAIService 
  : require('./client-ai-service').clientAIService;
