// Production configuration for Vercel deployment
export const config = {
  // Database configuration
  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production',
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
  },

  // Azure OpenAI configuration
  azureOpenAI: {
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-11-20',
    deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o',
  },

  // Azure AI Foundry configuration (optional)
  azureFoundry: {
    endpoint: process.env.AZURE_PROJECTS_ENDPOINT,
    agentId: process.env.AZURE_AGENT_ID,
    threadId: process.env.AZURE_THREAD_ID,
  },

  // GitHub Models fallback
  github: {
    token: process.env.NEXT_PUBLIC_GITHUB_TOKEN,
    modelsEndpoint: 'https://models.inference.ai.azure.com',
  },

  // Application settings
  app: {
    environment: process.env.NODE_ENV || 'development',
    apiUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
    version: process.env.npm_package_version || '1.0.0',
  },

  // Feature flags
  features: {
    enableAzureFoundry: Boolean(process.env.AZURE_PROJECTS_ENDPOINT),
    enableGitHubModels: Boolean(process.env.NEXT_PUBLIC_GITHUB_TOKEN),
    enableAnalytics: process.env.NODE_ENV === 'production',
    enableErrorTracking: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  },

  // Performance settings
  performance: {
    apiTimeout: 30000, // 30 seconds
    maxRetries: 3,
    cacheEnabled: process.env.NODE_ENV === 'production',
    cacheTTL: 300, // 5 minutes
  },

  // Security settings
  security: {
    enableCORS: true,
    allowedOrigins: process.env.NODE_ENV === 'production' 
      ? ['https://your-domain.vercel.app'] 
      : ['http://localhost:3000'],
    enableRateLimit: process.env.NODE_ENV === 'production',
    rateLimitMax: 100, // requests per window
    rateLimitWindow: 900000, // 15 minutes
  },
};

// Validation function
export function validateConfig() {
  const required = [
    'AZURE_OPENAI_API_KEY',
    'AZURE_OPENAI_ENDPOINT',
    'DATABASE_URL',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return true;
}

export default config;
