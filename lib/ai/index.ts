// AI Services - Unified exports
export { AzureOpenAIService, azureOpenAIService } from './azure-openai';
export { GitHubModelsService, aiService } from './github-models';
export { EnhancedAIService, enhancedAIService } from './enhanced-ai-service';

// Export all types
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
