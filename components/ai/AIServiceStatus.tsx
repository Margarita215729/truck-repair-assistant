'use client';

import React, { useState, useEffect } from 'react';
import type { HealthStatus } from '../../lib/ai';

interface AIServiceStatusProps {
  lastUsedProvider?: 'azure-ai-foundry' | 'azure-openai' | 'github-models' | null;
  fallbackWasUsed?: boolean;
}

export function AIServiceStatus({ 
  lastUsedProvider, 
  fallbackWasUsed 
}: AIServiceStatusProps) {
  const [healthStatus, setHealthStatus] = useState<HealthStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoCheck, setAutoCheck] = useState(false);

  useEffect(() => {
    // Check configuration on component mount
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Checking AI service health...');
      const response = await fetch('/api/ai/health');
      const data = await response.json();
      
      if (data.success) {
        setHealthStatus(data.providers);
        console.log('✅ Health check completed:', data.providers);
      } else {
        console.error('❌ Health check failed:', data.error);
        setHealthStatus([]);
      }
    } catch (err) {
      console.error('❌ Health check failed:', err);
      setHealthStatus([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoCheck) {
      const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoCheck]);

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'azure-ai-foundry': return '🏗️';
      case 'azure-openai': return '🌐';
      case 'github-models': return '🐙';
      default: return '🤖';
    }
  };

  const getHealthColor = (isHealthy: boolean) => {
    return isHealthy 
      ? 'bg-green-100 border-green-300 text-green-800' 
      : 'bg-red-100 border-red-300 text-red-800';
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 via-indigo-100 to-indigo-200 dark:from-gray-900 dark:via-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-8 shadow-2xl backdrop-blur-md transition-all duration-500">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-extrabold text-blue-900 dark:text-blue-200 flex items-center gap-2 animate-fade-in">
          <span className="animate-bounce-slow">🤖</span> AI Service Dashboard
        </h3>
        <div className="flex items-center space-x-3">
          <label className="flex items-center text-sm text-blue-700 dark:text-blue-200">
            <input
              type="checkbox"
              checked={autoCheck}
              onChange={(e) => setAutoCheck(e.target.checked)}
              className="mr-2 rounded border-blue-300 dark:border-blue-700 focus:ring-blue-500"
            />
            Auto-check
          </label>
          <button
            onClick={checkHealth}
            disabled={isLoading}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow hover:from-blue-700 hover:to-indigo-700 transition-all text-sm disabled:opacity-50 flex items-center font-semibold"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Checking...
              </>
            ) : (
              '🔍 Check Health'
            )}
          </button>
        </div>
      </div>

      {/* Health Status */}
      {healthStatus.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {healthStatus.map((status) => (
            <div
              key={status.service}
              className={`p-3 rounded-md border ${getHealthColor(status.isHealthy)}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium flex items-center">
                  {getServiceIcon(status.service)} {' '}
                  {status.service === 'azure-ai-foundry' ? 'Azure AI Foundry' : 
                   status.service === 'azure-openai' ? 'Azure OpenAI' : 
                   status.service === 'github-models' ? 'GitHub Models' : status.service}
                </span>
                <span className="text-sm font-medium">
                  {status.isHealthy ? '✅ Online' : '❌ Offline'}
                </span>
              </div>
              {status.latency && (
                <div className="text-xs opacity-80">
                  Response time: {status.latency}ms
                </div>
              )}
              {status.error && (
                <div className="text-xs opacity-80 mt-1">
                  Error: {status.error}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-blue-700">
          <p className="text-sm">Click &quot;Check Health&quot; to test AI service availability</p>
        </div>
      )}

      {/* Last Usage Information */}
      {lastUsedProvider && (
        <div className="mt-3 p-3 bg-white rounded-md border border-blue-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Last diagnosis powered by:</span>
            <div className="flex items-center">
              <span className="font-medium text-blue-800 flex items-center">
                {getServiceIcon(lastUsedProvider)} {' '}
                {lastUsedProvider === 'azure-ai-foundry' ? 'Azure AI Foundry' :
                 lastUsedProvider === 'azure-openai' ? 'Azure OpenAI' : 
                 lastUsedProvider === 'github-models' ? 'GitHub Models' : lastUsedProvider}
              </span>
              {fallbackWasUsed && (
                <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                  Fallback
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
