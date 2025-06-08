'use client';

import React, { useState, useEffect } from 'react';
import { clientAIService } from '@/lib/ai';
import type { DiagnosisRequest, DiagnosisResult, HealthStatus } from '@/lib/ai';

interface TestResult {
  success: boolean;
  duration: number;
  error?: string;
  data?: any;
}

const ClientAITestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);

  const testTruck = {
    id: 'test-truck',
    make: 'Peterbilt',
    model: '379',
    year: 2020,
    engine: 'Caterpillar C15'
  };

  useEffect(() => {
    checkHealth();
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
          data: result
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

  const checkHealth = async () => {
    setLoading('health-check');
    try {
      const health = await clientAIService.checkHealth();
      setHealthStatus(health);
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthStatus({
        service: 'azure-openai',
        isHealthy: false,
        error: error instanceof Error ? error.message : 'Health check failed'
      });
    } finally {
      setLoading(null);
    }
  };

  const testBasicDiagnosis = async () => {
    await runTest('basic-diagnosis', async () => {
      const request: DiagnosisRequest = {
        truck: testTruck,
        symptoms: ['Engine making unusual noise', 'Loss of power'],
        urgency: 'medium'
      };
      
      return await clientAIService.diagnoseTruckIssue(request);
    });
  };

  const testComplexDiagnosis = async () => {
    await runTest('complex-diagnosis', async () => {
      const request: DiagnosisRequest = {
        truck: testTruck,
        symptoms: [
          'Engine overheating',
          'Coolant leak visible',
          'Temperature gauge in red zone',
          'White smoke from exhaust',
          'Reduced engine power'
        ],
        additionalInfo: 'Truck has 500,000 miles. Last coolant change was 6 months ago. Started overheating during uphill drive.',
        urgency: 'high'
      };
      
      return await clientAIService.diagnoseTruckIssue(request);
    });
  };

  const testChatFunctionality = async () => {
    await runTest('chat-functionality', async () => {
      const messages = [
        { role: 'user' as const, content: 'What are the most common maintenance issues with Peterbilt 379 trucks?' }
      ];
      
      return await clientAIService.chatWithAssistant(messages);
    });
  };

  const testMultiTurnChat = async () => {
    await runTest('multi-turn-chat', async () => {
      const messages = [
        { role: 'user' as const, content: 'My Caterpillar C15 engine is smoking black.' },
        { role: 'assistant' as const, content: 'Black smoke from a diesel engine typically indicates incomplete combustion. This could be due to several issues like fuel injection problems, air filter blockage, or turbocharger issues. Can you tell me more about when this happens?' },
        { role: 'user' as const, content: 'It happens mainly when accelerating uphill under load.' }
      ];
      
      return await clientAIService.chatWithAssistant(messages);
    });
  };

  const renderTestResult = (testName: string, result?: TestResult) => {
    if (!result) return null;

    return (
      <div className={`p-4 rounded-lg border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold capitalize">{testName.replace('-', ' ')}</h4>
          <span className={`px-2 py-1 rounded text-sm ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {result.success ? 'PASS' : 'FAIL'}
          </span>
        </div>
        
        <div className="text-sm text-gray-600 space-y-1">
          <div>Duration: {result.duration}ms</div>
          {result.error && (
            <div className="text-red-600 bg-red-50 p-2 rounded mt-2">
              Error: {result.error}
            </div>
          )}
          {result.success && result.data && (
            <div className="mt-2">
              <details className="cursor-pointer">
                <summary className="font-medium">View Result</summary>
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                  <pre className="whitespace-pre-wrap">
                    {typeof result.data === 'string' 
                      ? result.data 
                      : JSON.stringify(result.data, null, 2)
                    }
                  </pre>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">🔧 Client AI Service Test Suite</h1>
        
        {/* Health Status Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            🏥 AI Service Health Status
            <button
              onClick={checkHealth}
              disabled={loading === 'health-check'}
              className="ml-4 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading === 'health-check' ? 'Checking...' : 'Refresh'}
            </button>
          </h2>
          
          {healthStatus ? (
            <div className={`p-4 rounded-lg border ${healthStatus.isHealthy ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className="font-semibold">{healthStatus.service}</h3>
              <div className="text-sm text-gray-600">
                <div>Status: {healthStatus.isHealthy ? '✅ Healthy' : '❌ Unhealthy'}</div>
                {typeof healthStatus.latency === 'number' && (
                  <div>Latency: {healthStatus.latency}ms</div>
                )}
                {healthStatus.error && (
                  <div className="text-red-600">Error: {healthStatus.error}</div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No health data available</div>
          )}
        </div>

        {/* Test Controls */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4">🧪 Test Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={testBasicDiagnosis}
              disabled={loading === 'basic-diagnosis'}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading === 'basic-diagnosis' ? 'Testing...' : 'Basic Diagnosis Test'}
            </button>
            
            <button
              onClick={testComplexDiagnosis}
              disabled={loading === 'complex-diagnosis'}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading === 'complex-diagnosis' ? 'Testing...' : 'Complex Diagnosis Test'}
            </button>
            
            <button
              onClick={testChatFunctionality}
              disabled={loading === 'chat-functionality'}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {loading === 'chat-functionality' ? 'Testing...' : 'Chat Functionality Test'}
            </button>
            
            <button
              onClick={testMultiTurnChat}
              disabled={loading === 'multi-turn-chat'}
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              {loading === 'multi-turn-chat' ? 'Testing...' : 'Multi-turn Chat Test'}
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">📊 Test Results</h2>
          {Object.keys(testResults).length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No tests have been run yet. Click the test buttons above to start testing.
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(testResults).map(([testName, result]) => (
                <div key={testName}>
                  {renderTestResult(testName, result)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* API Status */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-2xl font-semibold mb-4">🔗 API Information</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="text-sm space-y-2">
              <div><strong>Diagnosis API:</strong> /api/ai/diagnose</div>
              <div><strong>Chat API:</strong> /api/ai/chat</div>
              <div><strong>Health API:</strong> /api/ai/health</div>
              <div><strong>Environment:</strong> {process.env.NODE_ENV}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientAITestPage;
