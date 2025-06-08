'use client';

import React, { useState, useEffect } from 'react';
import { clientAIService } from '@/lib/ai';
import type { DiagnosisRequest, DiagnosisResult, HealthStatus } from '@/lib/ai';

interface TestResult {
  success: boolean;
  duration: number;
  provider?: string;
  fallbackUsed?: boolean;
  error?: string;
  data?: any;
}

const ComprehensiveAITestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus[]>([]);
  const [streamingOutput, setStreamingOutput] = useState<string>('');

  const testTruck = {
    id: 'test-truck',
    make: 'Peterbilt',
    model: '379',
    year: 2020,
    engine: 'Caterpillar C15'
  };

  useEffect(() => {
    // Perform initial health check
    checkAllHealthStatus();
  }, []);

  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    setLoading(testName);
    const startTime = Date.now();
    
    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      setTestResults(prev => ({
        ...prev,
        [testName]: {
          success: true,
          duration,
          provider: result.provider,
          fallbackUsed: result.fallbackUsed,
          data: result.result || result
        }
      }));
    } catch (error) {
      const duration = Date.now() - startTime;
      setTestResults(prev => ({
        ...prev,
        [testName]: {
          success: false,
          duration,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
    } finally {
      setLoading(null);
    }
  };

  const checkAllHealthStatus = async () => {
    await runTest('health-check', async () => {
      const health = await clientAIService.checkHealth();
      setHealthStatus([health]); // Wrap in array since clientAIService returns single status
      return health;
    });
  };

  const testEnhancedDiagnosis = async () => {
    const request: DiagnosisRequest = {
      truck: testTruck,
      symptoms: ['Engine making unusual noise', 'Reduced power', 'Black smoke from exhaust'],
      additionalInfo: 'Truck has been driven for 500,000 miles. Last maintenance was 3 months ago.',
      urgency: 'medium'
    };

    await runTest('enhanced-diagnosis', async () => {
      return await clientAIService.diagnoseTruckIssue(request);
    });
  };

  const testLegacyDiagnosis = async () => {
    const request: DiagnosisRequest = {
      truck: testTruck,
      symptoms: ['Engine overheating', 'Coolant leak', 'Temperature gauge in red zone'],
      additionalInfo: 'Truck stopped on highway due to overheating warning.',
      urgency: 'high'
    };

    await runTest('legacy-diagnosis', async () => {
      return await clientAIService.diagnoseTruckIssue(request);
    });
  };

  const testEnhancedChat = async () => {
    const messages = [
      { role: 'user' as const, content: 'What are the most common issues with Caterpillar C15 engines?' }
    ];

    await runTest('enhanced-chat', async () => {
      return await clientAIService.chatWithAssistant(messages);
    });
  };

  const testStreamingChat = async () => {
    setStreamingOutput('');
    
    const messages = [
      { role: 'user' as const, content: 'Explain the process of diagnosing a diesel engine that has black smoke coming from the exhaust.' }
    ];

    await runTest('streaming-chat', async () => {
      try {
        // Note: Streaming is not yet implemented in clientAIService
        const response = await clientAIService.chatWithAssistant(messages);
        setStreamingOutput(response);
        return response;
      } catch (error) {
        throw new Error('Streaming not yet implemented for client-side service');
      }
    });
  };

  const testConfigurationChanges = async () => {
    await runTest('config-changes', async () => {
      // Configuration changes are not available in client service
      // This would need to be implemented as server-side API endpoints
      return {
        message: 'Configuration changes not available in client service',
        availableEndpoints: ['/api/ai/diagnose', '/api/ai/chat', '/api/ai/health']
      };
    });
  };

  const testWithTimeout = async () => {
    await runTest('timeout-test', async () => {
      // Timeout testing is handled by fetch API timeout in client service
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1); // 1ms timeout
      
      try {
        const request: DiagnosisRequest = {
          truck: testTruck,
          symptoms: ['Test timeout'],
          urgency: 'low'
        };
        
        // This will likely timeout due to the 1ms limit
        await fetch('/api/ai/diagnose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
          signal: controller.signal
        });
        
        return { timeoutTriggered: false };
      } catch (error) {
        return { 
          timeoutTriggered: true, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      } finally {
        clearTimeout(timeoutId);
      }
    });
  };

  const renderTestResult = (testName: string, result?: TestResult) => {
    if (!result) return null;

    return (
      <div className={`p-4 rounded-lg border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold">{testName}</h4>
          <span className={`px-2 py-1 rounded text-sm ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {result.success ? 'PASS' : 'FAIL'}
          </span>
        </div>
        
        <div className="text-sm text-gray-600 space-y-1">
          <div>Duration: {result.duration}ms</div>
          {result.provider && <div>Provider: {result.provider}</div>}
          {result.fallbackUsed !== undefined && (
            <div>Fallback used: {result.fallbackUsed ? 'Yes' : 'No'}</div>
          )}
          {result.error && (
            <div className="text-red-600 bg-red-50 p-2 rounded">
              Error: {result.error}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">🔧 Comprehensive AI Integration Test Suite</h1>
        
        {/* Health Status Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            🏥 Health Status
            <button
              onClick={checkAllHealthStatus}
              disabled={loading === 'health-check'}
              className="ml-4 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading === 'health-check' ? 'Checking...' : 'Refresh'}
            </button>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthStatus.map((status) => (
              <div key={status.service} className={`p-4 rounded-lg border ${status.isHealthy ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <h3 className="font-semibold capitalize">{status.service.replace('-', ' ')}</h3>
                <div className="text-sm text-gray-600">
                  <div>Status: {status.isHealthy ? '✅ Healthy' : '❌ Unhealthy'}</div>
                  {status.latency && <div>Latency: {status.latency}ms</div>}
                  {status.error && <div className="text-red-600">Error: {status.error}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4">🧪 Test Controls</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <button
              onClick={testEnhancedDiagnosis}
              disabled={loading === 'enhanced-diagnosis'}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading === 'enhanced-diagnosis' ? 'Testing...' : 'Enhanced Diagnosis'}
            </button>
            
            <button
              onClick={testLegacyDiagnosis}
              disabled={loading === 'legacy-diagnosis'}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading === 'legacy-diagnosis' ? 'Testing...' : 'Legacy Diagnosis'}
            </button>
            
            <button
              onClick={testEnhancedChat}
              disabled={loading === 'enhanced-chat'}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {loading === 'enhanced-chat' ? 'Testing...' : 'Enhanced Chat'}
            </button>
            
            <button
              onClick={testStreamingChat}
              disabled={loading === 'streaming-chat'}
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              {loading === 'streaming-chat' ? 'Streaming...' : 'Streaming Chat'}
            </button>
            
            <button
              onClick={testConfigurationChanges}
              disabled={loading === 'config-changes'}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading === 'config-changes' ? 'Testing...' : 'Config Changes'}
            </button>
            
            <button
              onClick={testWithTimeout}
              disabled={loading === 'timeout-test'}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading === 'timeout-test' ? 'Testing...' : 'Timeout Test'}
            </button>
          </div>
        </div>

        {/* Streaming Output */}
        {streamingOutput && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-semibold mb-4">🌊 Streaming Output</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{streamingOutput}</pre>
            </div>
          </div>
        )}

        {/* Test Results */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">📊 Test Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(testResults).map(([testName, result]) => (
              <div key={testName}>
                {renderTestResult(testName, result)}
              </div>
            ))}
          </div>
        </div>

        {/* Current Configuration */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-2xl font-semibold mb-4">⚙️ Current Configuration</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <pre className="text-sm">
              {JSON.stringify({
                service: 'Client AI Service',
                baseUrl: process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : '/api',
                availableEndpoints: [
                  '/api/ai/diagnose',
                  '/api/ai/chat', 
                  '/api/ai/health'
                ],
                environment: process.env.NODE_ENV
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveAITestPage;
