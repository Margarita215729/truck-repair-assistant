// GitHub Models API service for AI-powered truck diagnostics
export interface DiagnosisRequest {
  symptoms: string;
  truckModel?: string;
  mileage?: number;
  lastServiceDate?: string;
  additionalInfo?: string;
}

export interface DiagnosisResponse {
  diagnosis: string;
  possibleCauses: string[];
  recommendedActions: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  estimatedCost?: {
    min: number;
    max: number;
  };
  confidence: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class GitHubModelsService {
  private readonly apiUrl = process.env.GITHUB_MODELS_ENDPOINT || 'https://models.inference.ai.azure.com';
  private readonly token = process.env.GITHUB_TOKEN;
  
  constructor() {
    if (!this.token) {
      console.warn('GitHub token not found. AI features will be limited.');
    }
  }

  async diagnoseIssue(request: DiagnosisRequest): Promise<DiagnosisResponse> {
    const prompt = this.buildDiagnosisPrompt(request);
    
    try {
      const response = await this.callGitHubModels(prompt, 'diagnosis');
      return this.parseDiagnosisResponse(response);
    } catch (error) {
      console.error('Error diagnosing issue:', error);
      return this.getFallbackDiagnosis();
    }
  }

  async chatWithAssistant(messages: ChatMessage[]): Promise<string> {
    const systemPrompt = `You are a professional truck repair assistant with expertise in heavy-duty vehicle maintenance and diagnostics. 
    Provide helpful, accurate, and safety-focused advice. Always recommend professional inspection for critical issues.`;
    
    const conversationPrompt = [
      { role: 'system', content: systemPrompt },
      ...messages.map(msg => ({ role: msg.role, content: msg.content }))
    ];

    try {
      return await this.callGitHubModels(conversationPrompt, 'chat');
    } catch (error) {
      console.error('Error in chat:', error);
      return 'I apologize, but I\'m having trouble connecting to the AI service. Please try again later or consult with a professional mechanic.';
    }
  }

  async generateMaintenanceSchedule(truckInfo: {
    model: string;
    year: number;
    mileage: number;
    usage: 'light' | 'medium' | 'heavy';
  }): Promise<string> {
    const prompt = `Generate a detailed maintenance schedule for a ${truckInfo.year} ${truckInfo.model} truck with ${truckInfo.mileage} miles and ${truckInfo.usage} usage. Include intervals for oil changes, filter replacements, brake inspections, and other critical maintenance items.`;
    
    try {
      return await this.callGitHubModels(prompt, 'maintenance');
    } catch (error) {
      console.error('Error generating maintenance schedule:', error);
      return 'Unable to generate maintenance schedule. Please consult your truck\'s manual or a professional mechanic.';
    }
  }

  private async callGitHubModels(prompt: any, context: string): Promise<string> {
    if (!this.token) {
      throw new Error('GitHub token not configured');
    }

    const requestBody = {
      messages: Array.isArray(prompt) ? prompt : [{ role: 'user', content: prompt }],
      model: 'gpt-4o',
      temperature: 0.7,
      max_tokens: 1000,
      stream: false
    };

    const response = await fetch(`${this.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`GitHub Models API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response received';
  }

  private buildDiagnosisPrompt(request: DiagnosisRequest): string {
    return `As a professional truck repair expert, diagnose the following issue:

Symptoms: ${request.symptoms}
${request.truckModel ? `Truck Model: ${request.truckModel}` : ''}
${request.mileage ? `Mileage: ${request.mileage}` : ''}
${request.lastServiceDate ? `Last Service: ${request.lastServiceDate}` : ''}
${request.additionalInfo ? `Additional Info: ${request.additionalInfo}` : ''}

Please provide:
1. Most likely diagnosis
2. Possible causes (ranked by probability)
3. Recommended actions
4. Urgency level (low/medium/high/critical)
5. Estimated repair cost range
6. Confidence level (0-100%)

Format your response as JSON with the following structure:
{
  "diagnosis": "detailed diagnosis",
  "possibleCauses": ["cause1", "cause2", "cause3"],
  "recommendedActions": ["action1", "action2", "action3"],
  "urgencyLevel": "medium",
  "estimatedCost": {"min": 100, "max": 500},
  "confidence": 85
}`;
  }

  private parseDiagnosisResponse(response: string): DiagnosisResponse {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          diagnosis: parsed.diagnosis || 'Unable to determine diagnosis',
          possibleCauses: parsed.possibleCauses || [],
          recommendedActions: parsed.recommendedActions || [],
          urgencyLevel: parsed.urgencyLevel || 'medium',
          estimatedCost: parsed.estimatedCost,
          confidence: parsed.confidence || 50
        };
      }
    } catch (error) {
      console.error('Error parsing diagnosis response:', error);
    }
    
    return this.getFallbackDiagnosis();
  }

  private getFallbackDiagnosis(): DiagnosisResponse {
    return {
      diagnosis: 'Unable to provide diagnosis at this time. Please consult with a professional mechanic.',
      possibleCauses: ['AI service unavailable'],
      recommendedActions: ['Consult with a professional mechanic', 'Check basic components manually'],
      urgencyLevel: 'medium',
      confidence: 0
    };
  }
}

// Singleton instance
export const githubModelsService = new GitHubModelsService();
