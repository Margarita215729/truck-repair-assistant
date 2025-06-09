// Shared types for AI services
export interface TruckModel {
  id: string;
  make: string;
  model: string;
  year?: number;
  years?: number[];
  engine: string;
}

export interface DiagnosisRequest {
  truck: TruckModel;
  symptoms: string[];
  additionalInfo?: string;
  urgency?: 'low' | 'medium' | 'high';
}

export interface DiagnosisResult {
  diagnosis: string;
  confidence: number;
  repairSteps: string[];
  requiredTools: string[];
  estimatedTime: string;
  estimatedCost: string;
  safetyWarnings: string[];
  urgencyLevel: 'low' | 'medium' | 'high';
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface HealthStatus {
  isHealthy: boolean;
  service: 'github-models' | 'azure-openai' | 'azure-ai-foundry';
  latency?: number;
  error?: string;
}

export interface AIServiceConfig {
  primaryProvider: 'azure-openai' | 'github-models' | 'azure-ai-foundry';
  fallbackEnabled: boolean;
  timeout: number;
}

// Audio analysis types
export interface AudioAnalysisRequest {
  audioData: string | Blob;
  truck: TruckModel;
  context?: string;
}

export interface AudioAnalysisResult {
  transcript?: string;
  soundPatterns: string[];
  diagnosis: DiagnosisResult;
  confidence: number;
}

// Streaming types
export interface StreamingResponse {
  id: string;
  chunk: string;
  isComplete: boolean;
}

export type StreamCallback = (chunk: string) => void;

// Error types
export interface AIServiceError {
  provider: 'azure-openai' | 'github-models' | 'azure-ai-foundry';
  error: Error;
  context?: string;
}

export interface FallbackResult<T> {
  result: T;
  provider: 'azure-openai' | 'github-models' | 'azure-ai-foundry';
  fallbackUsed: boolean;
  errors?: AIServiceError[];
}
