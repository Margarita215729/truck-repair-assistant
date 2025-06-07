// Azure OpenAI integration for truck repair assistant
import { AzureOpenAI } from 'openai';

interface AzureOpenAIConfig {
  endpoint: string;
  apiKey: string;
  apiVersion: string;
  deploymentName: string;
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

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class AzureOpenAIService {
  private client: AzureOpenAI;
  private config: AzureOpenAIConfig;

  constructor() {
    this.config = {
      endpoint: process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT || 'https://makee-mbmcw6g5-swedencentral.cognitiveservices.azure.com/',
      apiKey: process.env.NEXT_PUBLIC_AZURE_OPENAI_KEY!,
      apiVersion: process.env.NEXT_PUBLIC_AZURE_OPENAI_API_VERSION || '2024-12-01-preview',
      deploymentName: process.env.NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT || 'gpt-4o'
    };

    this.client = new AzureOpenAI({
      apiVersion: this.config.apiVersion,
      endpoint: this.config.endpoint,
      apiKey: this.config.apiKey
    });
  }

  async diagnoseTruckIssue(request: DiagnosisRequest): Promise<DiagnosisResult> {
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
7. Urgency assessment`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.deploymentName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response content received');
      }

      try {
        return JSON.parse(content) as DiagnosisResult;
      } catch (parseError) {
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
      console.error('Error calling Azure OpenAI API:', error);
      throw new Error('Failed to get AI diagnosis. Please try again.');
    }
  }

  async chatWithAssistant(messages: ChatMessage[]): Promise<string> {
    const systemPrompt = `You are a professional truck repair assistant with expertise in heavy-duty vehicle maintenance and diagnostics. 
    Provide helpful, accurate, and safety-focused advice. Always recommend professional inspection for critical issues.`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.deploymentName,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 2000,
        temperature: 0.1,
        stream: false
      });

      return response.choices[0]?.message?.content || 'Sorry, I could not process your request.';
    } catch (error) {
      console.error('Error in chat:', error);
      return 'I apologize, but I\'m having trouble connecting to the AI service. Please try again later or consult with a professional mechanic.';
    }
  }

  async streamChatResponse(messages: ChatMessage[]): Promise<AsyncIterable<string>> {
    const systemPrompt = `You are a professional truck repair assistant with expertise in heavy-duty vehicle maintenance and diagnostics. 
    Provide helpful, accurate, and safety-focused advice. Always recommend professional inspection for critical issues.`;

    try {
      const stream = await this.client.chat.completions.create({
        model: this.config.deploymentName,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 2000,
        temperature: 0.1,
        stream: true
      });

      return this.processStream(stream);
    } catch (error) {
      console.error('Error in streaming chat:', error);
      throw error;
    }
  }

  private async* processStream(stream: any): AsyncIterable<string> {
    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  async analyzeEngineSound(audioBlob: Blob, truckInfo: TruckModel): Promise<string> {
    // For now, we'll convert audio to text using Azure Speech Services
    // This is a placeholder for future Azure Speech integration
    const description = await this.describeAudioIssue(audioBlob);
    
    const prompt = `Based on this audio description from a ${truckInfo.make} ${truckInfo.model} truck engine: "${description}"
    
    Please analyze what mechanical issues this might indicate and provide diagnostic guidance.`;

    const response = await this.client.chat.completions.create({
      model: this.config.deploymentName,
      messages: [
        { role: 'system', content: 'You are an expert truck mechanic specializing in engine diagnostics through sound analysis.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.2
    });

    return response.choices[0]?.message?.content || 'Unable to analyze audio at this time.';
  }

  private async describeAudioIssue(audioBlob: Blob): Promise<string> {
    // Placeholder for audio analysis
    // In a real implementation, this would use Azure Speech Services
    // or convert the audio to a format suitable for analysis
    return "Engine sound with unusual noise patterns detected";
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.deploymentName,
        messages: [{ role: 'user', content: 'Health check' }],
        max_tokens: 10
      });
      return true;
    } catch (error) {
      console.error('Azure OpenAI health check failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const azureOpenAIService = new AzureOpenAIService();

// Export types
export type { DiagnosisRequest, DiagnosisResult, ChatMessage, TruckModel };
