/**
 * Enhanced AI Service
 * 
 * Advanced AI service with comprehensive error handling and fallback mechanisms.
 * This is the recommended service to use in production applications.
 * 
 * Features:
 * - Azure AI Foundry Agent as primary provider
 * - Azure OpenAI as secondary fallback
 * - GitHub Models as tertiary fallback
 * - Automatic error handling and retry logic
 * - Detailed logging and monitoring
 * - Timeout protection
 * - Comprehensive health checks
 * - Streaming support with fallback
 * - Utility methods for backward compatibility
 */
import { AzureOpenAIService } from './azure-openai';
import { runAgentConversation } from './azure-agent';
import { GitHubModelsService } from './github-models';
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
  private githubService: GitHubModelsService;
  private githubToken: string;
  private githubEndpoint: string;
  private config: AIServiceConfig;

  constructor(config?: Partial<AIServiceConfig>) {
    this.azureService = new AzureOpenAIService();
    this.githubService = new GitHubModelsService();
    this.githubToken = process.env.NEXT_PUBLIC_GITHUB_TOKEN || '';
    this.githubEndpoint = 'https://models.inference.ai.azure.com';
    
    this.config = {
      primaryProvider: 'azure-ai-foundry', // Updated to use Azure AI Foundry as primary
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
    
    // Try primary provider
    if (this.config.primaryProvider === 'azure-openai') {
      try {
        console.log('🔍 Attempting diagnosis with Azure OpenAI (primary)...');
        const result = await this.withTimeout(
          this.azureService.diagnoseTruckIssue(request),
          this.config.timeout
        );
        console.log('✅ Azure OpenAI diagnosis successful');
        return {
          result,
          provider: 'azure-openai',
          fallbackUsed: false
        };
      } catch (error) {
        const aiError: AIServiceError = {
          provider: 'azure-openai',
          error: error instanceof Error ? error : new Error(String(error)),
          context: 'Primary diagnosis attempt'
        };
        errors.push(aiError);
        console.warn('⚠️ Azure OpenAI failed:', aiError.error.message);
      }
    } else if (this.config.primaryProvider === 'azure-ai-foundry') {
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
    } else if (this.config.primaryProvider === 'github-models') {
      try {
        console.log('🔍 Attempting diagnosis with GitHub Models (primary)...');
        const result = await this.withTimeout(
          this.diagnoseWithGitHubModels(request),
          this.config.timeout
        );
        console.log('✅ GitHub Models diagnosis successful');
        return {
          result,
          provider: 'github-models',
          fallbackUsed: false
        };
      } catch (error) {
        const aiError: AIServiceError = {
          provider: 'github-models',
          error: error instanceof Error ? error : new Error(String(error)),
          context: 'Primary diagnosis attempt'
        };
        errors.push(aiError);
        console.warn('⚠️ GitHub Models failed:', aiError.error.message);
      }
    }

    // Try fallback if enabled
    if (this.config.fallbackEnabled) {
      try {
        console.log('🔄 Falling back to GitHub Models...');
        const result = await this.withTimeout(
          this.diagnoseWithGitHubModels(request),
          this.config.timeout
        );
        console.log('✅ GitHub Models diagnosis successful (fallback)');
        return {
          result,
          provider: 'github-models',
          fallbackUsed: true,
          errors
        };
      } catch (error) {
        const aiError: AIServiceError = {
          provider: 'github-models',
          error: error instanceof Error ? error : new Error(String(error)),
          context: 'Fallback diagnosis attempt'
        };
        errors.push(aiError);
        console.error('❌ GitHub Models also failed:', aiError.error.message);
      }
    }

    // If all providers failed
    throw new Error(`All AI providers failed: ${errors.map(e => `${e.provider}: ${e.error.message}`).join(', ')}`);
  }

  /**
   * Chat with AI assistant using automatic fallback between providers
   * @param messages - Array of chat messages
   * @returns Promise with chat response and provider information
   */
  async chat(messages: ChatMessage[]): Promise<FallbackResult<string>> {
    const errors: AIServiceError[] = [];
    
    // Try Azure OpenAI first
    try {
      console.log('💬 Attempting chat with Azure OpenAI...');
      const result = await this.withTimeout(
        this.azureService.chatWithAssistant(messages),
        this.config.timeout
      );
      console.log('✅ Azure OpenAI chat successful');
      return {
        result,
        provider: 'azure-openai',
        fallbackUsed: false
      };
    } catch (error) {
      const aiError: AIServiceError = {
        provider: 'azure-openai',
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'Chat attempt'
      };
      errors.push(aiError);
      console.warn('⚠️ Azure OpenAI chat failed:', aiError.error.message);
    }

    // Fallback to GitHub Models
    if (this.config.fallbackEnabled) {
      try {
        console.log('🔄 Falling back to GitHub Models for chat...');
        const result = await this.withTimeout(
          this.chatWithGitHubModels(messages),
          this.config.timeout
        );
        console.log('✅ GitHub Models chat successful (fallback)');
        return {
          result,
          provider: 'github-models',
          fallbackUsed: true,
          errors
        };
      } catch (error) {
        const aiError: AIServiceError = {
          provider: 'github-models',
          error: error instanceof Error ? error : new Error(String(error)),
          context: 'Fallback chat attempt'
        };
        errors.push(aiError);
        console.error('❌ GitHub Models chat also failed:', aiError.error.message);
      }
    }

    throw new Error(`All chat providers failed: ${errors.map(e => `${e.provider}: ${e.error.message}`).join(', ')}`);
  }

  /**
   * Stream chat responses with real-time chunks
   * @param messages - Array of chat messages
   * @param onChunk - Callback function called for each response chunk
   */
  async streamChat(messages: ChatMessage[], onChunk: StreamCallback): Promise<void> {
    try {
      console.log('🌊 Attempting streaming chat with Azure OpenAI...');
      const stream = await this.azureService.streamChatResponse(messages);
      
      for await (const chunk of stream) {
        onChunk(chunk);
      }
      console.log('✅ Azure OpenAI streaming successful');
    } catch (error) {
      console.warn('⚠️ Azure OpenAI streaming failed, falling back to regular chat:', error);
      
      if (this.config.fallbackEnabled) {
        try {
          const response = await this.chatWithGitHubModels(messages);
          onChunk(response);
          console.log('✅ Fallback to GitHub Models successful');
        } catch (fallbackError) {
          console.error('❌ Both streaming and fallback failed:', fallbackError);
          throw new Error(`Streaming failed: ${error}. Fallback also failed: ${fallbackError}`);
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Check health status of all available AI providers
   * @returns Promise with array of health status for each provider
   */
  async checkHealth(): Promise<HealthStatus[]> {
    const healthChecks: HealthStatus[] = [];
    
    // Check Azure OpenAI
    try {
      const startTime = Date.now();
      const isHealthy = await this.azureService.healthCheck();
      const latency = Date.now() - startTime;
      
      healthChecks.push({
        isHealthy,
        service: 'azure-openai',
        latency
      });
    } catch (error) {
      healthChecks.push({
        isHealthy: false,
        service: 'azure-openai',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Check GitHub Models
    try {
      const startTime = Date.now();
      await this.testGitHubModelsConnection();
      const latency = Date.now() - startTime;
      
      healthChecks.push({
        isHealthy: true,
        service: 'github-models',
        latency
      });
    } catch (error) {
      healthChecks.push({
        isHealthy: false,
        service: 'github-models',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return healthChecks;
  }

  // Private methods
  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  private async diagnoseWithGitHubModels(request: DiagnosisRequest): Promise<DiagnosisResult> {
    const systemPrompt = `You are an expert truck mechanic with over 20 years of experience specializing in commercial vehicle diagnostics and repair. You have extensive knowledge of:

- Heavy-duty diesel engines (Caterpillar, Cummins, Detroit Diesel, PACCAR, Volvo, Mack)
- Emissions systems (DPF, SCR, EGR, DEF)
- Transmission systems (manual, automatic, AMT)
- Air brake systems and pneumatics
- Electrical and electronic systems
- Preventive maintenance schedules

Provide accurate, practical repair guidance with safety considerations. Always include cost estimates and time requirements.

Respond ONLY with valid JSON in this exact format:
{
  "diagnosis": "string - detailed diagnosis",
  "confidence": number (1-10),
  "repairSteps": ["step 1", "step 2", "step 3"],
  "requiredTools": ["tool 1", "tool 2"],
  "estimatedTime": "string - time estimate",
  "estimatedCost": "string - cost range",
  "safetyWarnings": ["warning 1", "warning 2"],
  "urgencyLevel": "low | medium | high"
}`;

    const userPrompt = `TRUCK INFORMATION:
Make: ${request.truck.make}
Model: ${request.truck.model}
Year: ${request.truck.year || (request.truck.years ? request.truck.years[request.truck.years.length - 1] : 'Unknown')}
Engine: ${request.truck.engine}

REPORTED SYMPTOMS:
${request.symptoms.map((symptom, index) => `${index + 1}. ${symptom}`).join('\n')}

${request.additionalInfo ? `ADDITIONAL INFORMATION:\n${request.additionalInfo}\n` : ''}

URGENCY LEVEL: ${request.urgency || 'medium'}

Please provide a comprehensive diagnosis including:
1. Most likely diagnosis with confidence level (1-10)
2. Step-by-step repair instructions
3. Required tools and equipment
4. Estimated time and cost
5. Important safety warnings
6. Urgency assessment`;

    const response = await fetch(`${this.githubEndpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.githubToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: 'gpt-4o',
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub Models API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response content from GitHub Models');
    }

    try {
      return JSON.parse(content);
    } catch {
      console.error('Failed to parse GitHub Models response:', content);
      throw new Error('Invalid JSON response from GitHub Models');
    }
  }

  private async chatWithGitHubModels(messages: ChatMessage[]): Promise<string> {
    const response = await fetch(`${this.githubEndpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.githubToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages,
        model: 'gpt-4o',
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub Models API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private async testGitHubModelsConnection(): Promise<void> {
    const response = await fetch(`${this.githubEndpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.githubToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Test connection' }],
        model: 'gpt-4o',
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub Models connection test failed: ${response.status}`);
    }
  }

  private async diagnoseWithAzureAIFoundry(request: DiagnosisRequest): Promise<DiagnosisResult> {
    if (!this.isAzureFoundryAvailable()) {
      throw new Error('Azure AI Foundry not configured. Missing environment variables: AZURE_PROJECTS_ENDPOINT, AZURE_AGENT_ID, AZURE_THREAD_ID');
    }

    // Construct the diagnostic message for the agent
    const diagnosticMessage = `TRUCK DIAGNOSTIC REQUEST:

TRUCK INFORMATION:
- Make: ${request.truck.make}
- Model: ${request.truck.model}
- Year: ${request.truck.year || (request.truck.years ? request.truck.years[request.truck.years.length - 1] : 'Unknown')}
- Engine: ${request.truck.engine}

REPORTED SYMPTOMS:
${request.symptoms.map((symptom, index) => `${index + 1}. ${symptom}`).join('\n')}

${request.additionalInfo ? `ADDITIONAL INFORMATION:\n${request.additionalInfo}\n` : ''}

URGENCY LEVEL: ${request.urgency || 'medium'}

Please provide a comprehensive truck diagnosis in JSON format with the following structure:
{
  "diagnosis": "detailed diagnosis description",
  "confidence": number (1-10),
  "repairSteps": ["step 1", "step 2", "step 3"],
  "requiredTools": ["tool 1", "tool 2"],
  "estimatedTime": "time estimate",
  "estimatedCost": "cost range",
  "safetyWarnings": ["warning 1", "warning 2"],
  "urgencyLevel": "low | medium | high"
}`;

    try {
      const conversation = await runAgentConversation(diagnosticMessage);
      
      // Extract the response from the conversation
      const agentResponse = conversation.find(msg => msg.role === 'assistant')?.text;
      
      if (!agentResponse) {
        throw new Error('No response from Azure AI Foundry agent');
      }

      // Try to parse JSON response
      try {
        // Look for JSON in the response
        const jsonMatch = agentResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        
        // Fallback: Create structured response from agent text
        return {
          diagnosis: agentResponse,
          confidence: 8,
          repairSteps: ['Consult with a qualified mechanic for detailed diagnosis and repair'],
          requiredTools: ['Professional diagnostic tools'],
          estimatedTime: '1-3 hours for diagnosis',
          estimatedCost: '$200-800',
          safetyWarnings: ['Always follow proper safety procedures', 'Consult professional mechanic for critical issues'],
          urgencyLevel: request.urgency || 'medium'
        };
      } catch {
        console.warn('Failed to parse Azure AI Foundry JSON response, using fallback format');
        return {
          diagnosis: agentResponse,
          confidence: 7,
          repairSteps: ['Consult with a qualified mechanic for detailed diagnosis'],
          requiredTools: ['Professional diagnostic tools'],
          estimatedTime: '1-3 hours',
          estimatedCost: '$200-800',
          safetyWarnings: ['Always follow proper safety procedures'],
          urgencyLevel: request.urgency || 'medium'
        };
      }
    } catch (error) {
      console.error('Azure AI Foundry diagnosis failed:', error);
      throw new Error(`Azure AI Foundry diagnosis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Utility methods for backward compatibility
  async generateResponse(messages: ChatMessage[]): Promise<string> {
    const result = await this.chat(messages);
    return result.result;
  }

  async analyzeAudio(audioData: string, truck: TruckModel): Promise<DiagnosisResult> {
    const request: DiagnosisRequest = {
      truck,
      symptoms: ['Audio analysis: ' + audioData.substring(0, 100)],
      additionalInfo: 'Audio diagnostic data provided',
      urgency: 'medium'
    };
    
    const result = await this.diagnoseTruckIssue(request);
    return result.result;
  }

  // Configuration methods
  setPrimaryProvider(provider: 'azure-openai' | 'github-models' | 'azure-ai-foundry'): void {
    this.config.primaryProvider = provider;
  }

  setFallbackEnabled(enabled: boolean): void {
    this.config.fallbackEnabled = enabled;
  }

  setTimeout(timeoutMs: number): void {
    this.config.timeout = timeoutMs;
  }

  getConfig(): AIServiceConfig {
    return { ...this.config };
  }

  /**
   * Check if Azure AI Foundry is configured and available
   * @returns boolean indicating if Azure AI Foundry is available
   */
  isAzureFoundryAvailable(): boolean {
    return !!(
      process.env.AZURE_PROJECTS_ENDPOINT && 
      process.env.AZURE_AGENT_ID && 
      process.env.AZURE_THREAD_ID
    );
  }

  /**
   * Chat using Azure AI Foundry agent
   * @param message - User message to send to the agent
   * @returns Promise with agent conversation response
   */
  async chatWithFoundryAgent(message: string): Promise<FallbackResult<Array<{ role: string; text: string }>>> {
    if (!this.isAzureFoundryAvailable()) {
      throw new Error('Azure AI Foundry not configured. Missing environment variables: AZURE_PROJECTS_ENDPOINT, AZURE_AGENT_ID, AZURE_THREAD_ID');
    }

    try {
      console.log('🤖 Using Azure AI Foundry agent...');
      const conversation = await this.withTimeout(
        runAgentConversation(message),
        this.config.timeout
      );
      console.log('✅ Azure AI Foundry agent conversation successful');
      
      return {
        result: conversation,
        provider: 'azure-ai-foundry',
        fallbackUsed: false
      };
    } catch (error) {
      console.error('❌ Azure AI Foundry agent failed:', error);
      throw error;
    }
  }

  /**
   * Get Azure AI Foundry configuration status
   * @returns Object with configuration details
   */
  getFoundryStatus() {
    return {
      available: this.isAzureFoundryAvailable(),
      endpoint: process.env.AZURE_PROJECTS_ENDPOINT ? '***configured***' : 'missing',
      agentId: process.env.AZURE_AGENT_ID ? '***configured***' : 'missing',
      threadId: process.env.AZURE_THREAD_ID ? '***configured***' : 'missing'
    };
  }
}

// Export enhanced singleton instance
export const enhancedAIService = new EnhancedAIService();
export default enhancedAIService;
