import { OpenAI } from 'openai';
import { AzureOpenAI } from 'openai';
import { azureOpenAIService } from './azure-openai';
import { performanceMonitoring } from '../services/performance';

/**
 * Enhanced AI service integrating Azure AI Foundry capabilities
 * with GitHub Models fallback for truck repair diagnostics
 * 
 * Features:
 * - Azure OpenAI with Azure AI Foundry integration
 * - GitHub Models fallback for reliability
 * - Performance monitoring and caching
 * - Mobile-optimized response times
 * - Comprehensive error handling
 */

export interface TruckDiagnosticRequest {
  symptoms: string;
  truckModel?: string;
  year?: string;
  mileage?: string;
  previousRepairs?: string;
  urgency?: 'low' | 'medium' | 'high' | 'emergency';
  location?: string;
}

export interface TruckDiagnosticResponse {
  diagnosis: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  estimatedCost: {
    min: number;
    max: number;
    currency: string;
  };
  repairSteps: Array<{
    step: number;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'professional';
    estimatedTime: string;
    tools: string[];
    safetyWarnings?: string[];
  }>;
  partsSuggestions: Array<{
    name: string;
    partNumber?: string;
    estimatedCost: number;
    priority: 'essential' | 'recommended' | 'optional';
    suppliers?: string[];
  }>;
  preventiveMaintenance: string[];
  emergencyProcedures?: string[];
  confidence: number;
  responseTime: number;
  aiProvider: 'azure-openai' | 'github-models';
}

export interface AIServiceHealth {
  azureOpenAI: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency: number;
    errorRate: number;
    lastCheck: Date;
  };
  githubModels: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency: number;
    errorRate: number;
    lastCheck: Date;
  };
  overall: 'healthy' | 'degraded' | 'unhealthy';
}

class AIFoundryService {
  private githubClient: OpenAI | null = null;
  private responseCache = new Map<string, { data: TruckDiagnosticResponse; timestamp: number }>();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_CACHE_SIZE = 100;
  private healthStatus: AIServiceHealth;

  constructor() {
    this.initializeGitHubClient();
    this.healthStatus = {
      azureOpenAI: { status: 'unhealthy', latency: 0, errorRate: 0, lastCheck: new Date() },
      githubModels: { status: 'unhealthy', latency: 0, errorRate: 0, lastCheck: new Date() },
      overall: 'unhealthy'
    };
    this.startHealthMonitoring();
  }

  private initializeGitHubClient(): void {
    try {
      if (process.env.GITHUB_TOKEN) {
        this.githubClient = new OpenAI({
          baseURL: 'https://models.inference.ai.azure.com',
          apiKey: process.env.GITHUB_TOKEN,
          timeout: parseInt(process.env.GITHUB_TIMEOUT || '15000'),
        });
        console.log('GitHub Models client initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize GitHub Models client:', error);
    }
  }

  private startHealthMonitoring(): void {
    setInterval(async () => {
      await this.checkServiceHealth();
    }, parseInt(process.env.AI_HEALTH_CHECK_INTERVAL || '60000'));

    // Initial health check
    setTimeout(() => this.checkServiceHealth(), 1000);
  }

  private async checkServiceHealth(): Promise<void> {
    const startTime = Date.now();

    // Check Azure OpenAI health
    try {
      const azureHealth = await azureOpenAIService.getHealthStatus();
      this.healthStatus.azureOpenAI = {
        status: azureHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
        latency: azureHealth.averageLatency,
        errorRate: azureHealth.errorRate,
        lastCheck: new Date()
      };
    } catch (error) {
      this.healthStatus.azureOpenAI = {
        status: 'unhealthy',
        latency: Date.now() - startTime,
        errorRate: 1,
        lastCheck: new Date()
      };
    }

    // Check GitHub Models health
    if (this.githubClient) {
      try {
        const testStart = Date.now();
        await this.githubClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Test' }],
          max_tokens: 1,
        });
        
        this.healthStatus.githubModels = {
          status: 'healthy',
          latency: Date.now() - testStart,
          errorRate: 0,
          lastCheck: new Date()
        };
      } catch (error) {
        this.healthStatus.githubModels = {
          status: 'unhealthy',
          latency: Date.now() - startTime,
          errorRate: 1,
          lastCheck: new Date()
        };
      }
    }

    // Update overall health
    this.healthStatus.overall = this.calculateOverallHealth();
  }

  private calculateOverallHealth(): 'healthy' | 'degraded' | 'unhealthy' {
    const azureHealthy = this.healthStatus.azureOpenAI.status === 'healthy';
    const githubHealthy = this.healthStatus.githubModels.status === 'healthy';

    if (azureHealthy && githubHealthy) return 'healthy';
    if (azureHealthy || githubHealthy) return 'degraded';
    return 'unhealthy';
  }

  public getHealthStatus(): AIServiceHealth {
    return { ...this.healthStatus };
  }

  private generateCacheKey(request: TruckDiagnosticRequest): string {
    const normalized = {
      symptoms: request.symptoms.toLowerCase().trim(),
      truckModel: request.truckModel?.toLowerCase().trim() || '',
      year: request.year || '',
      urgency: request.urgency || 'medium'
    };
    return Buffer.from(JSON.stringify(normalized)).toString('base64');
  }

  private getCachedResponse(cacheKey: string): TruckDiagnosticResponse | null {
    const cached = this.responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    if (cached) {
      this.responseCache.delete(cacheKey);
    }
    return null;
  }

  private setCachedResponse(cacheKey: string, response: TruckDiagnosticResponse): void {
    // Implement LRU eviction
    if (this.responseCache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.responseCache.keys().next().value;
      if (oldestKey) {
        this.responseCache.delete(oldestKey);
      }
    }
    
    this.responseCache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });
  }

  private createTruckDiagnosticPrompt(request: TruckDiagnosticRequest): string {
    return `As an expert truck mechanic and diagnostic specialist, analyze the following truck issue and provide comprehensive repair guidance for a professional truck driver.

TRUCK INFORMATION:
- Symptoms: ${request.symptoms}
${request.truckModel ? `- Model: ${request.truckModel}` : ''}
${request.year ? `- Year: ${request.year}` : ''}
${request.mileage ? `- Mileage: ${request.mileage}` : ''}
${request.previousRepairs ? `- Previous Repairs: ${request.previousRepairs}` : ''}
- Urgency Level: ${request.urgency || 'medium'}
${request.location ? `- Current Location: ${request.location}` : ''}

RESPONSE REQUIREMENTS:
Provide a detailed diagnostic response in JSON format with the following structure:
{
  "diagnosis": "Detailed explanation of the likely issue(s)",
  "severity": "low|medium|high|critical",
  "estimatedCost": {
    "min": number,
    "max": number,
    "currency": "USD"
  },
  "repairSteps": [
    {
      "step": number,
      "description": "Clear step description",
      "difficulty": "easy|medium|hard|professional",
      "estimatedTime": "time estimate",
      "tools": ["required tools"],
      "safetyWarnings": ["safety warnings if applicable"]
    }
  ],
  "partsSuggestions": [
    {
      "name": "Part name",
      "partNumber": "OEM or compatible part number if known",
      "estimatedCost": number,
      "priority": "essential|recommended|optional",
      "suppliers": ["suggested suppliers or part stores"]
    }
  ],
  "preventiveMaintenance": ["maintenance recommendations"],
  "emergencyProcedures": ["immediate safety steps if critical"],
  "confidence": number (0-100, confidence in diagnosis)
}

IMPORTANT GUIDELINES:
- Focus on safety first, especially for critical issues
- Provide realistic cost estimates for US market
- Include both DIY and professional repair options
- Consider road-side emergency scenarios for urgent issues
- Prioritize getting the truck back on the road safely
- Include preventive measures to avoid future issues
- Use truck-specific terminology and procedures
- Account for commercial vehicle regulations and requirements

Analyze the symptoms thoroughly and provide actionable, professional guidance.`;
  }

  private async callAzureOpenAI(prompt: string): Promise<TruckDiagnosticResponse> {
    const startTime = Date.now();
    
    try {
      const completion = await azureOpenAIService.createChatCompletion([
        { role: 'system', content: 'You are an expert truck diagnostic AI assistant.' },
        { role: 'user', content: prompt }
      ], {
        model: process.env.AZURE_OPENAI_MODEL || 'gpt-4',
        maxTokens: 2000,
        temperature: 0.3,
      });

      const responseTime = Date.now() - startTime;
      const content = completion.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('Empty response from Azure OpenAI');
      }

      // Parse the JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      return {
        ...parsedResponse,
        responseTime,
        aiProvider: 'azure-openai' as const
      };

    } catch (error) {
      console.error('Azure OpenAI error:', error);
      throw error;
    }
  }

  private async callGitHubModels(prompt: string): Promise<TruckDiagnosticResponse> {
    if (!this.githubClient) {
      throw new Error('GitHub Models client not available');
    }

    const startTime = Date.now();
    
    try {
      const completion = await this.githubClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert truck diagnostic AI assistant.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      });

      const responseTime = Date.now() - startTime;
      const content = completion.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('Empty response from GitHub Models');
      }

      // Parse the JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      return {
        ...parsedResponse,
        responseTime,
        aiProvider: 'github-models' as const
      };

    } catch (error) {
      console.error('GitHub Models error:', error);
      throw error;
    }
  }

  public async diagnoseTruckIssue(request: TruckDiagnosticRequest): Promise<TruckDiagnosticResponse> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(request);

    // Check cache first
    const cachedResponse = this.getCachedResponse(cacheKey);
    if (cachedResponse) {
      console.log('Returning cached diagnostic response');
      performanceMonitoring.recordMetric('ai-diagnostic-cached', Date.now() - startTime, 'api');
      return cachedResponse;
    }

    const prompt = this.createTruckDiagnosticPrompt(request);
    let response: TruckDiagnosticResponse;
    let errors: Error[] = [];

    // Try Azure OpenAI first (primary)
    if (this.healthStatus.azureOpenAI.status !== 'unhealthy') {
      try {
        response = await this.callAzureOpenAI(prompt);
        performanceMonitoring.recordMetric('azure-openai-diagnostic', response.responseTime, 'api');
        this.setCachedResponse(cacheKey, response);
        return response;
      } catch (error) {
        errors.push(error as Error);
        console.warn('Azure OpenAI failed, trying GitHub Models fallback:', error);
      }
    }

    // Fallback to GitHub Models
    if (this.githubClient && this.healthStatus.githubModels.status !== 'unhealthy') {
      try {
        response = await this.callGitHubModels(prompt);
        performanceMonitoring.recordMetric('github-models-diagnostic', response.responseTime, 'api');
        this.setCachedResponse(cacheKey, response);
        return response;
      } catch (error) {
        errors.push(error as Error);
        console.error('GitHub Models also failed:', error);
      }
    }

    // If both services fail, throw comprehensive error
    const totalTime = Date.now() - startTime;
    performanceMonitoring.recordMetric('ai-diagnostic-failed', totalTime, 'api');
    
    throw new Error(`All AI services failed. Errors: ${errors.map(e => e.message).join('; ')}`);
  }

  public async getQuickTip(symptom: string): Promise<{ tip: string; severity: string; provider: string }> {
    const quickPrompt = `Provide a brief, essential tip for this truck symptom: "${symptom}". 
    Response format: {"tip": "brief helpful tip", "severity": "low|medium|high|critical"}`;

    try {
      if (this.healthStatus.azureOpenAI.status === 'healthy') {
        const completion = await azureOpenAIService.createChatCompletion([
          { role: 'user', content: quickPrompt }
        ], { maxTokens: 150, temperature: 0.2 });

        const content = completion.choices[0]?.message?.content;
        const parsed = JSON.parse(content || '{}');
        return { ...parsed, provider: 'azure-openai' };
      }

      if (this.githubClient && this.healthStatus.githubModels.status === 'healthy') {
        const completion = await this.githubClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: quickPrompt }],
          max_tokens: 150,
          temperature: 0.2,
        });

        const content = completion.choices[0]?.message?.content;
        const parsed = JSON.parse(content || '{}');
        return { ...parsed, provider: 'github-models' };
      }

      throw new Error('No AI services available');
    } catch (error) {
      console.error('Quick tip generation failed:', error);
      return {
        tip: 'AI services temporarily unavailable. Please consult a professional mechanic.',
        severity: 'medium',
        provider: 'fallback'
      };
    }
  }

  public clearCache(): void {
    this.responseCache.clear();
    console.log('AI response cache cleared');
  }

  public getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    // This would need to be implemented with hit/miss tracking
    return {
      size: this.responseCache.size,
      maxSize: this.MAX_CACHE_SIZE,
      hitRate: 0 // Placeholder - implement hit rate tracking
    };
  }
}

export const aiFoundryService = new AIFoundryService();
export default aiFoundryService;
