/**
 * GitHub Models Service
 * 
 * AI service with Azure OpenAI as primary provider and GitHub Models as fallback.
 * Features:
 * - Automatic fallback between providers
 * - Truck diagnostic capabilities
 * - Interactive chat support
 * - Health monitoring for both services
 * - Audio analysis support
 */
import { AzureOpenAIService } from './azure-openai';
import type { TruckModel, DiagnosisRequest, DiagnosisResult, ChatMessage, HealthStatus } from './types';

export class GitHubModelsService {
  private azureService: AzureOpenAIService;
  private githubToken: string;
  private githubEndpoint: string;

  constructor() {
    this.azureService = new AzureOpenAIService();
    this.githubToken = process.env.NEXT_PUBLIC_GITHUB_TOKEN || '';
    this.githubEndpoint = 'https://models.inference.ai.azure.com';
  }

  async diagnoseTruckIssue(request: DiagnosisRequest): Promise<DiagnosisResult> {
    // Try Azure OpenAI first (primary provider)
    try {
      console.log('Attempting diagnosis with Azure OpenAI...');
      const result = await this.azureService.diagnoseTruckIssue(request);
      console.log('Azure OpenAI diagnosis successful');
      return result;
    } catch (azureError) {
      console.warn('Azure OpenAI failed, falling back to GitHub Models:', azureError);
      
      // Fallback to GitHub Models
      try {
        return await this.diagnoseWithGitHubModels(request);
      } catch (githubError) {
        console.error('Both Azure OpenAI and GitHub Models failed:', { azureError, githubError });
        throw new Error(`AI diagnosis failed: Azure OpenAI (${azureError}) and GitHub Models (${githubError})`);
      }
    }
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    // Try Azure OpenAI first
    try {
      console.log('Attempting chat with Azure OpenAI...');
      const result = await this.azureService.chatWithAssistant(messages);
      console.log('Azure OpenAI chat successful');
      return result;
    } catch (azureError) {
      console.warn('Azure OpenAI chat failed, falling back to GitHub Models:', azureError);
      
      // Fallback to GitHub Models
      try {
        return await this.chatWithGitHubModels(messages);
      } catch (githubError) {
        console.error('Both Azure OpenAI and GitHub Models chat failed:', { azureError, githubError });
        throw new Error(`AI chat failed: Azure OpenAI (${azureError}) and GitHub Models (${githubError})`);
      }
    }
  }

  async streamChat(messages: ChatMessage[], onChunk: (chunk: string) => void): Promise<void> {
    // Try Azure OpenAI first for streaming
    try {
      console.log('Attempting streaming chat with Azure OpenAI...');
      const stream = await this.azureService.streamChatResponse(messages);
      for await (const chunk of stream) {
        onChunk(chunk);
      }
      console.log('Azure OpenAI streaming chat successful');
      return;
    } catch (azureError) {
      console.warn('Azure OpenAI streaming failed, falling back to GitHub Models:', azureError);
      
      // Fallback to regular chat (GitHub Models doesn't support streaming in this implementation)
      try {
        const response = await this.chatWithGitHubModels(messages);
        onChunk(response);
      } catch (githubError) {
        console.error('Both Azure OpenAI and GitHub Models streaming failed:', { azureError, githubError });
        throw new Error(`AI streaming failed: Azure OpenAI (${azureError}) and GitHub Models (${githubError})`);
      }
    }
  }

  async checkHealth(): Promise<HealthStatus> {
    // Check Azure OpenAI health first
    try {
      const isHealthy = await this.azureService.healthCheck();
      if (isHealthy) {
        return {
          isHealthy: true,
          service: 'azure-openai',
          latency: 0
        };
      }
    } catch (error) {
      console.warn('Azure OpenAI health check failed:', error);
    }

    // Fallback to GitHub Models health check
    try {
      const startTime = Date.now();
      await this.testGitHubModelsConnection();
      const latency = Date.now() - startTime;
      
      return {
        isHealthy: true,
        service: 'github-models',
        latency
      };
    } catch (error) {
      return {
        isHealthy: false,
        service: 'github-models',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
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

  // Utility methods for backward compatibility
  async generateResponse(messages: ChatMessage[]): Promise<string> {
    return this.chat(messages);
  }

  async analyzeAudio(audioData: string, truck: TruckModel): Promise<DiagnosisResult> {
    // This method could be enhanced to use Azure Speech Services
    // For now, we'll treat it as a symptom description
    const request: DiagnosisRequest = {
      truck,
      symptoms: ['Audio analysis: ' + audioData.substring(0, 100)],
      additionalInfo: 'Audio diagnostic data provided',
      urgency: 'medium'
    };
    
    return this.diagnoseTruckIssue(request);
  }
}

// Export a singleton instance
export const aiService = new GitHubModelsService();
export default aiService;