# Vercel Deployment Guide for Truck Repair Assistant

## Overview
This guide explains how to deploy the Truck Repair Assistant to Vercel with full API routes support and database connectivity.

## Prerequisites
1. Vercel account
2. Neon PostgreSQL database (free tier)
3. Azure OpenAI API access
4. GitHub repository

## Deployment Steps

### 1. Install Vercel CLI
```bash
npm install -g vercel
# or use npx vercel for one-time deployment
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Configure Environment Variables
In your Vercel dashboard or via CLI, set these environment variables:

```bash
# Azure OpenAI (Required)
AZURE_OPENAI_API_KEY=your_azure_openai_api_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_VERSION=2024-11-20
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o

# Database (Required)
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# GitHub Models (Optional fallback)
NEXT_PUBLIC_GITHUB_TOKEN=github_pat_your_token

# Application
NODE_ENV=production
```

### 4. Deploy to Vercel
```bash
# Preview deployment
npm run preview:vercel

# Production deployment
npm run deploy:vercel
```

## Configuration Files

### vercel.json
- Configures API routes runtime
- Sets environment variables
- Specifies deployment region

### next.config.js
- Optimized for Vercel deployment
- Image optimization enabled
- No static export (for API routes support)

## Database Setup

### Neon PostgreSQL
1. Create account at https://neon.tech
2. Create new project
3. Copy connection string to `DATABASE_URL`
4. Run migrations:
```bash
npm run db:generate
npm run db:migrate
```

## API Routes
All API routes are configured to work with Vercel's serverless functions:
- `/api/ai/chat` - AI chat functionality
- `/api/ai/diagnose` - Truck diagnostics
- `/api/ai/foundry` - Azure AI Foundry integration
- `/api/ai/health` - Health check endpoint

## Monitoring
- Vercel Analytics (built-in)
- Function logs in Vercel dashboard
- Performance monitoring via Next.js

## Troubleshooting

### Common Issues
1. **API Routes not working**: Check vercel.json configuration
2. **Database connection fails**: Verify DATABASE_URL format
3. **AI features not working**: Confirm Azure OpenAI credentials
4. **Build failures**: Check environment variables

### Debug Commands
```bash
# Check build locally
npm run build

# Test API routes locally
npm run dev

# View Vercel logs
vercel logs your-deployment-url
```

## Performance Optimization
- API routes are automatically optimized by Vercel
- Edge caching for static assets
- Image optimization enabled
- Serverless function cold start minimization

## Security
- Environment variables encrypted at rest
- HTTPS by default
- No sensitive data in client bundle
- Database connections over SSL

## Cost Estimation
- Vercel Pro: $20/month (recommended for production)
- Neon PostgreSQL: Free tier (0.5GB storage)
- Azure OpenAI: Pay-per-use (estimated $50-200/month)
- Total: ~$70-220/month depending on usage
