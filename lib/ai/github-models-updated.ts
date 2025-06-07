// GitHub Models and Azure OpenAI AI integration for truck repair assistant
import { azureOpenAIService, type DiagnosisRequest as AzureRequest, type DiagnosisResult as AzureResult } from './azure-openai';

interface GitHubModelsConfig {
  endpoint: string;
  token: string;
  model: string;
}

interface TruckModel {
  id: string;
  make: string;
  model: string;
  year?: number;
  years?: number[];
  engine: string;
}

interface DiagnosisRequest {
  truck: TruckModel;
  symptoms: string[];
  additionalInfo?: string;
  urgency?: 'low' | 'medium' | 'high';
}

interface DiagnosisResult {
  diagnosis: string;
  confidence: number;
  repairSteps: string[];
  requiredTools: string[];
  estimatedTime: string;
  estimatedCost: string;
  safetyWarnings: string[];
  urgencyLevel: 'low' | 'medium' | 'high';
}

export class GitHubModelsService {
  private config: GitHubModelsConfig;
  private useAzureOpenAI: boolean = true; // Prioritize Azure OpenAI

  constructor() {
    this.config = {
      endpoint: process.env.NEXT_PUBLIC_GITHUB_MODELS_ENDPOINT || 'https://models.github.ai/inference',
      token: process.env.NEXT_PUBLIC_GITHUB_TOKEN!,
      model: 'openai/gpt-4o-mini'
    };
  }

  async diagnoseTruckIssue(request: DiagnosisRequest): Promise<DiagnosisResult> {
    // Try Azure OpenAI first
    if (this.useAzureOpenAI) {
      try {
        const azureRequest: AzureRequest = {
          truck: request.truck,
          symptoms: request.symptoms,
          additionalInfo: request.additionalInfo,
          urgency: request.urgency
        };
        
        const result = await azureOpenAIService.diagnoseTruckIssue(azureRequest);
        console.log('Azure OpenAI diagnosis successful');
        return result;
      } catch (error) {
        console.warn('Azure OpenAI failed, falling back to GitHub Models:', error);
        // Fallback to GitHub Models
      }
    }

    // GitHub Models fallback implementation
    return this.diagnoseWithGitHubModels(request);
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
3. Required tools and parts
4. Estimated repair time
5. Estimated cost range
6. Critical safety warnings
7. Urgency assessment

Format your response as structured JSON with the following fields:
- diagnosis: string
- confidence: number (1-10)
- repairSteps: array of strings
- requiredTools: array of strings
- estimatedTime: string
- estimatedCost: string
- safetyWarnings: array of strings
- urgencyLevel: 'low' | 'medium' | 'high'`;

    try {
      const response = await fetch(`${this.config.endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 4000,
          temperature: 0.3,
          response_format: { type: 'json_object' }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const content = result.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response content received');
      }

      try {
        return JSON.parse(content) as DiagnosisResult;
      } catch {
        // Fallback if JSON parsing fails
        return {
          diagnosis: content,
          confidence: 7,
          repairSteps: ['Contact a qualified mechanic for detailed diagnosis'],
          requiredTools: ['Professional diagnostic tools'],
          estimatedTime: '1-3 hours',
          estimatedCost: '$200-800',
          safetyWarnings: ['Always follow proper safety procedures'],
          urgencyLevel: request.urgency || 'medium'
        };
      }
    } catch (error) {
      console.error('Error calling GitHub Models API:', error);
      throw new Error('Failed to get AI diagnosis. Please try again.');
    }
  }

  async chatWithAssistant(messages: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<string> {
    // Try Azure OpenAI first
    if (this.useAzureOpenAI) {
      try {
        return await azureOpenAIService.chatWithAssistant(messages);
      } catch (error) {
        console.warn('Azure OpenAI chat failed, falling back to GitHub Models:', error);
      }
    }

    // GitHub Models fallback
    const systemPrompt = `You are a professional truck repair assistant with expertise in heavy-duty vehicle maintenance and diagnostics. 
    Provide helpful, accurate, and safety-focused advice. Always recommend professional inspection for critical issues.`;

    try {
      const response = await fetch(`${this.config.endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          max_tokens: 2000,
          temperature: 0.1
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.choices[0]?.message?.content || 'Sorry, I could not process your request.';
    } catch (error) {
      console.error('Error in GitHub Models chat:', error);
      return 'I apologize, but I\'m having trouble connecting to the AI service. Please try again later or consult with a professional mechanic.';
    }
  }

  // Health check method
  async healthCheck(): Promise<{ azure: boolean; github: boolean }> {
    const results = { azure: false, github: false };

    // Check Azure OpenAI
    try {
      results.azure = await azureOpenAIService.healthCheck();
    } catch (error) {
      console.error('Azure OpenAI health check failed:', error);
    }

    // Check GitHub Models
    try {
      const response = await fetch(`${this.config.endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: 'user', content: 'Health check' }],
          max_tokens: 10
        }),
      });
      results.github = response.ok;
    } catch (error) {
      console.error('GitHub Models health check failed:', error);
    }

    return results;
  }

  // Toggle between Azure OpenAI and GitHub Models
  setProvider(useAzure: boolean): void {
    this.useAzureOpenAI = useAzure;
  }
}

// Singleton instance
export const githubModelsService = new GitHubModelsService();

// Export types
export type { DiagnosisRequest, DiagnosisResult, TruckModel };
