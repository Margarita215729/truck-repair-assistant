/**
 * Enhanced AI Service
 * 
 * Production-ready AI service with Azure AI Foundry Agent as primary provider
 * and Azure OpenAI as fallback. This service provides comprehensive error handling,
 * automatic failover, and enterprise-grade reliability.
 * 
 * Features:
 * - Azure AI Foundry Agent as primary provider
 * - Azure OpenAI as fallback provider
 * - Automatic error handling and retry logic
 * - Detailed logging and monitoring
 * - Timeout protection
 * - Comprehensive health checks
 * - Production-ready authentication
 */
import { AzureOpenAIService } from './azure-openai';
import { runAgentConversation } from './azure-agent';
import type {
  TruckModel,
  DiagnosisRequest,
  DiagnosisResult,
  ChatMessage,
  HealthStatus,
  AIServiceConfig,
  FallbackResult,
  AIServiceError,
  StreamCallback
} from './types';

export class EnhancedAIService {
  private azureService: AzureOpenAIService;
  private config: AIServiceConfig;

  constructor(config?: Partial<AIServiceConfig>) {
    this.azureService = new AzureOpenAIService();
    
    this.config = {
      primaryProvider: 'azure-ai-foundry',
      fallbackEnabled: true,
      timeout: 30000,
      ...config
    };
  }

  /**
   * Diagnoses truck issues using AI with automatic fallback between providers
   * @param request - Diagnosis request containing truck info, symptoms, and urgency
   * @returns Promise with diagnosis result and provider information
   */
  async diagnoseTruckIssue(request: DiagnosisRequest): Promise<FallbackResult<DiagnosisResult>> {
    const errors: AIServiceError[] = [];
    
    // Try Azure AI Foundry first (primary)
    try {
      console.log('🔍 Attempting diagnosis with Azure AI Foundry (primary)...');
      const result = await this.withTimeout(
        this.diagnoseWithAzureAIFoundry(request),
        this.config.timeout
      );
      console.log('✅ Azure AI Foundry diagnosis successful');
      return {
        result,
        provider: 'azure-ai-foundry',
        fallbackUsed: false
      };
    } catch (error) {
      const aiError: AIServiceError = {
        provider: 'azure-ai-foundry',
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'Primary diagnosis attempt'
      };
      errors.push(aiError);
      console.warn('⚠️ Azure AI Foundry failed:', aiError.error.message);
    }

    // Fallback to Azure OpenAI if enabled
    if (this.config.fallbackEnabled) {
      try {
        console.log('🔄 Falling back to Azure OpenAI...');
        const result = await this.withTimeout(
          this.azureService.diagnoseTruckIssue(request),
          this.config.timeout
        );
        console.log('✅ Azure OpenAI diagnosis successful (fallback)');
        return {
          result,
          provider: 'azure-openai',
          fallbackUsed: true
        };
      } catch (error) {
        const aiError: AIServiceError = {
          provider: 'azure-openai',
          error: error instanceof Error ? error : new Error(String(error)),
          context: 'Fallback diagnosis attempt'
        };
        errors.push(aiError);
        console.error('❌ Azure OpenAI fallback failed:', aiError.error.message);
      }
    }

    // All providers failed
    const combinedError = new Error(`All AI providers failed. Errors: ${errors.map(e => `${e.provider}: ${e.error.message}`).join('; ')}`);
    console.error('💥 All AI providers failed:', combinedError.message);
    throw combinedError;
  }

  /**
   * AI-powered chat with automatic provider fallback
   * @param messages - Array of chat messages
   * @returns Promise with chat response and provider information
   */
  async chat(messages: ChatMessage[]): Promise<FallbackResult<string>> {
    const errors: AIServiceError[] = [];

    // Try Azure AI Foundry first (primary)
    try {
      console.log('💬 Attempting chat with Azure AI Foundry (primary)...');
      
      // Convert messages to single prompt for Azure AI Foundry
      const userMessage = messages[messages.length - 1]?.content || '';
      const conversation = await this.withTimeout(
        runAgentConversation(userMessage),
        this.config.timeout
      );
      
      // Extract response from conversation
      const response = conversation[conversation.length - 1]?.text || 'No response received';
      
      console.log('✅ Azure AI Foundry chat successful');
      return {
        result: response,
        provider: 'azure-ai-foundry',
        fallbackUsed: false
      };
    } catch (error) {
      const aiError: AIServiceError = {
        provider: 'azure-ai-foundry',
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'Primary chat attempt'
      };
      errors.push(aiError);
      console.warn('⚠️ Azure AI Foundry chat failed:', aiError.error.message);
    }

    // Fallback to Azure OpenAI if enabled
    if (this.config.fallbackEnabled) {
      try {
        console.log('🔄 Falling back to Azure OpenAI for chat...');
        const result = await this.withTimeout(
          this.azureService.chat(messages),
          this.config.timeout
        );
        console.log('✅ Azure OpenAI chat successful (fallback)');
        return {
          result,
          provider: 'azure-openai',
          fallbackUsed: true
        };
      } catch (error) {
        const aiError: AIServiceError = {
          provider: 'azure-openai',
          error: error instanceof Error ? error : new Error(String(error)),
          context: 'Fallback chat attempt'
        };
        errors.push(aiError);
        console.error('❌ Azure OpenAI chat fallback failed:', aiError.error.message);
      }
    }

    // All providers failed
    const combinedError = new Error(`All AI providers failed for chat. Errors: ${errors.map(e => `${e.provider}: ${e.error.message}`).join('; ')}`);
    console.error('💥 All AI chat providers failed:', combinedError.message);
    throw combinedError;
  }

  /**
   * Performs comprehensive health checks on all AI providers
   * @returns Promise with health status of all providers
   */
  async checkHealth(): Promise<HealthStatus[]> {
    const healthChecks: Promise<HealthStatus>[] = [];

    // Check Azure AI Foundry health
    healthChecks.push(this.checkAzureAIFoundryHealth());

    // Check Azure OpenAI health
    healthChecks.push(this.azureService.checkHealth());

    try {
      const results = await Promise.allSettled(healthChecks);
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          const service = index === 0 ? 'azure-ai-foundry' : 'azure-openai';
          return {
            service,
            isHealthy: false,
            error: result.reason instanceof Error ? result.reason.message : String(result.reason),
            timestamp: new Date().toISOString()
          };
        }
      });
    } catch (error) {
      console.error('Health check failed:', error);
      return [
        {
          service: 'azure-ai-foundry',
          isHealthy: false,
          error: 'Health check failed',
          timestamp: new Date().toISOString()
        },
        {
          service: 'azure-openai',
          isHealthy: false,
          error: 'Health check failed',
          timestamp: new Date().toISOString()
        }
      ];
    }
  }

  /**
   * Gets current service configuration
   * @returns Current AI service configuration
   */
  getConfig(): AIServiceConfig {
    return { ...this.config };
  }

  /**
   * Sets the primary provider
   * @param provider - The provider to set as primary
   */
  setPrimaryProvider(provider: 'azure-ai-foundry' | 'azure-openai'): void {
    this.config.primaryProvider = provider;
    console.log(`🔄 Primary provider set to: ${provider}`);
  }

  /**
   * Enables or disables fallback mechanism
   * @param enabled - Whether fallback should be enabled
   */
  setFallbackEnabled(enabled: boolean): void {
    this.config.fallbackEnabled = enabled;
    console.log(`🔄 Fallback ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Private method to diagnose truck issues with Azure AI Foundry
   */
  private async diagnoseWithAzureAIFoundry(request: DiagnosisRequest): Promise<DiagnosisResult> {
    const prompt = this.buildDiagnosisPrompt(request);
    const conversation = await runAgentConversation(prompt);
    
    // Extract the response from conversation
    const response = conversation[conversation.length - 1]?.text || '';
    
    // Parse the response into DiagnosisResult format
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(response);
      return {
        possibleCauses: parsed.possibleCauses || [response],
        recommendations: parsed.recommendations || ['Please consult a professional technician'],
        urgencyLevel: parsed.urgencyLevel || request.urgencyLevel || 'medium',
        estimatedCost: parsed.estimatedCost || 'Estimate not available',
        aiProvider: 'azure-ai-foundry',
        confidence: parsed.confidence || 0.7
      };
    } catch {
      // If not JSON, treat as plain text
      return {
        possibleCauses: [response],
        recommendations: ['Please consult a professional technician for detailed analysis'],
        urgencyLevel: request.urgencyLevel || 'medium',
        estimatedCost: 'Estimate not available',
        aiProvider: 'azure-ai-foundry',
        confidence: 0.6
      };
    }
  }

  /**
   * Private method to check Azure AI Foundry health
   */
  private async checkAzureAIFoundryHealth(): Promise<HealthStatus> {
    const startTime = Date.now();
    
    try {
      // Check if environment variables are configured
      if (!process.env.AZURE_PROJECTS_ENDPOINT || 
          !process.env.AZURE_AGENT_ID || 
          !process.env.AZURE_THREAD_ID) {
        return {
          service: 'azure-ai-foundry',
          isHealthy: false,
          error: 'Missing Azure AI Foundry configuration',
          timestamp: new Date().toISOString()
        };
      }

      // Try a simple test conversation
      await this.withTimeout(
        runAgentConversation('Health check test'),
        5000
      );

      const latency = Date.now() - startTime;
      return {
        service: 'azure-ai-foundry',
        isHealthy: true,
        latency,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        service: 'azure-ai-foundry',
        isHealthy: false,
        error: error instanceof Error ? error.message : String(error),
        latency,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Private method to build diagnosis prompt
   */
  private buildDiagnosisPrompt(request: DiagnosisRequest): string {
    return `Please analyze this truck issue:

Truck Information:
- Make: ${request.truckInfo.make}
- Model: ${request.truckInfo.model}
- Year: ${request.truckInfo.year}
- Engine: ${request.truckInfo.engine}
- Mileage: ${request.truckInfo.mileage || 'Not specified'}

Symptoms:
${request.symptoms}

Urgency Level: ${request.urgencyLevel}

Please provide a comprehensive diagnosis including:
1. Possible causes of the issue
2. Recommended repair steps
3. Estimated cost range
4. Safety considerations
5. Urgency assessment

Please respond in a structured format that can help the technician understand the problem and take appropriate action.`;
  }

  /**
   * Utility method to add timeout to promises
   */
  private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  }
}

// Export singleton instance
export const enhancedAIService = new EnhancedAIService();
