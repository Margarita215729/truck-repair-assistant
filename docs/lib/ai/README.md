# AI Services Documentation

This directory contains the AI services for the Truck Repair Assistant application. The services provide AI-powered truck diagnostics, chat assistance, and health monitoring with automatic fallback capabilities.

## Architecture Overview

```
lib/ai/
├── index.ts                 # Unified exports for all AI services
├── types.ts                # Shared TypeScript interfaces and types
├── azure-openai.ts         # Azure OpenAI service implementation
├── github-models.ts        # GitHub Models service with Azure fallback
├── enhanced-ai-service.ts  # Advanced service with comprehensive error handling
└── README.md              # This documentation file
```

## Services

### EnhancedAIService (Recommended for Production)

The `EnhancedAIService` is the most robust option with comprehensive error handling, automatic fallback, and detailed monitoring.

```typescript
import { enhancedAIService } from '@/lib/ai';

// Diagnosis with automatic fallback
const result = await enhancedAIService.diagnoseTruckIssue({
  truck: { id: '1', make: 'Peterbilt', model: '379', year: 2020, engine: 'Caterpillar C15' },
  symptoms: ['Engine noise', 'Reduced power'],
  urgency: 'medium'
});

// Chat with fallback
const chatResult = await enhancedAIService.chat([
  { role: 'user', content: 'How do I check engine oil?' }
]);

// Health monitoring
const healthStatus = await enhancedAIService.checkHealth();
```

**Features:**
- ✅ Configurable primary/fallback providers
- ✅ Automatic error handling and retry logic
- ✅ Timeout protection (30s default)
- ✅ Comprehensive logging and monitoring
- ✅ Streaming support with fallback
- ✅ Health checks for all providers

### GitHubModelsService

Direct service with Azure OpenAI as primary and GitHub Models as fallback.

```typescript
import { aiService } from '@/lib/ai';

const diagnosis = await aiService.diagnoseTruckIssue(request);
const chatResponse = await aiService.chat(messages);
const health = await aiService.checkHealth();
```

**Features:**
- ✅ Azure OpenAI primary, GitHub Models fallback
- ✅ Basic error handling
- ✅ Health monitoring
- ✅ Audio analysis support

### AzureOpenAIService

Direct Azure OpenAI integration without fallback.

```typescript
import { azureOpenAIService } from '@/lib/ai';

const diagnosis = await azureOpenAIService.diagnoseTruckIssue(request);
const chat = await azureOpenAIService.chatWithAssistant(messages);
const stream = await azureOpenAIService.streamChatResponse(messages);
```

**Features:**
- ✅ Direct Azure OpenAI integration
- ✅ Streaming support
- ✅ Audio analysis capabilities
- ✅ Health monitoring

## Configuration

Set the following environment variables:

```bash
# Azure OpenAI (Primary)
NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT=your-azure-endpoint
NEXT_PUBLIC_AZURE_OPENAI_KEY=your-azure-key
NEXT_PUBLIC_AZURE_OPENAI_API_VERSION=2024-12-01-preview
NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT=gpt-4o

# GitHub Models (Fallback)
NEXT_PUBLIC_GITHUB_TOKEN=your-github-token
```

## Service Configuration

The `EnhancedAIService` can be configured:

```typescript
import { EnhancedAIService } from '@/lib/ai';

const customService = new EnhancedAIService({
  primaryProvider: 'github-models',  // or 'azure-openai'
  fallbackEnabled: true,
  timeout: 45000  // 45 seconds
});
```

## Error Handling

All services provide comprehensive error handling:

```typescript
try {
  const result = await enhancedAIService.diagnoseTruckIssue(request);
  
  if (result.fallbackUsed) {
    console.log(`Fallback was used. Primary provider: ${result.errors?.[0]?.provider}`);
  }
  
  console.log(`Powered by: ${result.provider}`);
  return result.result;
} catch (error) {
  console.error('All AI providers failed:', error.message);
  // Handle complete failure
}
```

## Health Monitoring

Monitor AI service health:

```typescript
const healthStatus = await enhancedAIService.checkHealth();

healthStatus.forEach(status => {
  console.log(`${status.service}: ${status.isHealthy ? 'Healthy' : 'Unhealthy'}`);
  if (status.latency) {
    console.log(`Response time: ${status.latency}ms`);
  }
  if (status.error) {
    console.log(`Error: ${status.error}`);
  }
});
```

## Types

All TypeScript interfaces are available from the main export:

```typescript
import type {
  DiagnosisRequest,
  DiagnosisResult,
  ChatMessage,
  HealthStatus,
  FallbackResult,
  AIServiceConfig
} from '@/lib/ai';
```

## Best Practices

1. **Use EnhancedAIService in production** for maximum reliability
2. **Always handle fallback scenarios** gracefully in your UI
3. **Monitor health status** and alert users of service issues
4. **Implement timeout handling** for better user experience
5. **Log provider usage** for analytics and debugging
6. **Test both providers** during development

## Troubleshooting

### Common Issues

1. **"All AI providers failed"**
   - Check environment variables
   - Verify API keys and endpoints
   - Check network connectivity

2. **Slow responses**
   - Adjust timeout configuration
   - Monitor provider health
   - Consider switching primary provider

3. **Fallback not working**
   - Ensure `fallbackEnabled: true`
   - Verify GitHub token is set
   - Check GitHub Models endpoint

### Debug Mode

Enable debug logging:

```typescript
// Enable detailed console logging
console.log('🔍 AI Service Debug Mode Enabled');
```

The services automatically log operations with emojis for easy debugging:
- 🔍 Starting operations
- ✅ Successful operations  
- ⚠️ Warnings and fallbacks
- ❌ Errors and failures
- 🔄 Fallback operations
