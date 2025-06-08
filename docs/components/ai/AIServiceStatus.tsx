'use client';

import React, { useState, useEffect } from 'react';
import { enhancedAIService } from '../../lib/ai';
import type { HealthStatus, AIServiceConfig } from '../../lib/ai';

interface AIServiceStatusProps {
  onProviderChange?: (provider: 'azure-openai' | 'github-models') => void;
  lastUsedProvider?: 'azure-openai' | 'github-models' | null;
  fallbackWasUsed?: boolean;
}

export function AIServiceStatus({ 
  onProviderChange, 
  lastUsedProvider, 
  fallbackWasUsed 
}: AIServiceStatusProps) {
  const [healthStatus, setHealthStatus] = useState<HealthStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<AIServiceConfig>();
  const [autoCheck, setAutoCheck] = useState(false);

  useEffect(() => {
    // Get current configuration
    setConfig(enhancedAIService.getConfig());
  }, []);

  const checkHealth = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Checking AI service health...');
      const health = await enhancedAIService.checkHealth();
      setHealthStatus(health);
      console.log('✅ Health check completed:', health);
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
  }, [autoCheck, checkHealth]);

  const togglePrimaryProvider = () => {
    if (!config) return;
    
    const newProvider = config.primaryProvider === 'azure-openai' ? 'github-models' : 'azure-openai';
    enhancedAIService.setPrimaryProvider(newProvider);
    setConfig(enhancedAIService.getConfig());
    onProviderChange?.(newProvider);
    console.log(`🔄 Switched primary provider to: ${newProvider}`);
  };

  const toggleFallback = () => {
    if (!config) return;
    
    const newFallbackEnabled = !config.fallbackEnabled;
    enhancedAIService.setFallbackEnabled(newFallbackEnabled);
    setConfig(enhancedAIService.getConfig());
    console.log(`🔄 Fallback ${newFallbackEnabled ? 'enabled' : 'disabled'}`);
  };

  const getServiceIcon = (service: string) => {
    return service === 'azure-openai' ? '🌐' : '🐙';
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

      {/* Configuration Controls */}
      {config && (
        <div className="mb-4 p-3 bg-white rounded-md border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Configuration</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Primary Provider:</span>
              <button
                onClick={togglePrimaryProvider}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded capitalize hover:bg-blue-200 transition-colors"
              >
                {config.primaryProvider === 'azure-openai' ? '🌐 Azure OpenAI' : '🐙 GitHub Models'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Fallback:</span>
              <button
                onClick={toggleFallback}
                className={`px-2 py-1 rounded transition-colors ${
                  config.fallbackEnabled 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {config.fallbackEnabled ? '✅ Enabled' : '❌ Disabled'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Timeout:</span>
              <span className="text-blue-800 font-medium">{config.timeout / 1000}s</span>
            </div>
          </div>
        </div>
      )}

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
                  {status.service === 'azure-openai' ? 'Azure OpenAI' : 'GitHub Models'}
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
                {lastUsedProvider === 'azure-openai' ? 'Azure OpenAI' : 'GitHub Models'}
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
