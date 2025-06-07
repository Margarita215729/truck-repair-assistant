'use client';

import React, { useState } from 'react';
import { aiService } from '@/lib/ai/github-models';
import { azureOpenAIService } from '@/lib/ai/azure-openai';
import type { DiagnosisRequest, DiagnosisResult } from '@/lib/ai/github-models';

const AITestPage: React.FC = () => {
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<{ azure: boolean; github: boolean } | null>(null);

  const testTruck = {
    id: 'test-truck',
    make: 'Peterbilt',
    model: '379',
    year: 2020,
    engine: 'Caterpillar C15'
  };

  const handleTestDiagnosis = async () => {
    setLoading(true);
    setError(null);
    setDiagnosis(null);

    const request: DiagnosisRequest = {
      truck: testTruck,
      symptoms: ['Engine making unusual noise', 'Reduced power', 'Black smoke from exhaust'],
      additionalInfo: 'Truck has been driven for 500,000 miles. Last maintenance was 3 months ago.',
      urgency: 'medium'
    };

    try {
      const result = await aiService.diagnoseTruckIssue(request);
      setDiagnosis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleHealthCheck = async () => {
    setLoading(true);
    try {
      const health = await aiService.checkHealth();
      setHealthStatus({ azure: health.service === 'azure-openai', github: health.service === 'github-models' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Health check failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTestAzureDirectly = async () => {
    setLoading(true);
    setError(null);
    setDiagnosis(null);

    const request: DiagnosisRequest = {
      truck: testTruck,
      symptoms: ['Engine overheating', 'Coolant leak', 'Temperature gauge in red zone'],
      additionalInfo: 'Truck stopped on highway due to overheating warning.',
      urgency: 'high'
    };

    try {
      const result = await azureOpenAIService.diagnoseTruckIssue(request);
      setDiagnosis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Azure OpenAI test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">AI Integration Test Page</h1>
        
        {/* Test Controls */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleTestDiagnosis}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Diagnosis (Auto-fallback)'}
            </button>
            
            <button
              onClick={handleTestAzureDirectly}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Azure OpenAI Directly'}
            </button>
            
            <button
              onClick={handleHealthCheck}
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Health Check'}
            </button>
          </div>
        </div>

        {/* Health Status */}
        {healthStatus && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Service Health Status</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-md ${healthStatus.azure ? 'bg-green-100' : 'bg-red-100'}`}>
                <h3 className="font-medium">Azure OpenAI</h3>
                <p className={healthStatus.azure ? 'text-green-800' : 'text-red-800'}>
                  {healthStatus.azure ? '✅ Online' : '❌ Offline'}
                </p>
              </div>
              <div className={`p-4 rounded-md ${healthStatus.github ? 'bg-green-100' : 'bg-red-100'}`}>
                <h3 className="font-medium">GitHub Models</h3>
                <p className={healthStatus.github ? 'text-green-800' : 'text-red-800'}>
                  {healthStatus.github ? '✅ Online' : '❌ Offline'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6">
            <h3 className="font-bold">Error:</h3>
            <p>{error}</p>
          </div>
        )}

        {/* Diagnosis Results */}
        {diagnosis && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">AI Diagnosis Results</h2>
            
            <div className="grid gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Diagnosis</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{diagnosis.diagnosis}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Confidence Level</h3>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${diagnosis.confidence * 10}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{diagnosis.confidence}/10</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Urgency Level</h3>
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                    diagnosis.urgencyLevel === 'high' ? 'bg-red-100 text-red-800' :
                    diagnosis.urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {diagnosis.urgencyLevel.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Estimated Time</h3>
                  <p className="text-gray-700">{diagnosis.estimatedTime}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Estimated Cost</h3>
                  <p className="text-gray-700">{diagnosis.estimatedCost}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Repair Steps</h3>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  {diagnosis.repairSteps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Required Tools</h3>
                <div className="flex flex-wrap gap-2">
                  {diagnosis.requiredTools.map((tool, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Safety Warnings</h3>
                <ul className="list-disc list-inside space-y-1 text-red-700 bg-red-50 p-3 rounded-md">
                  {diagnosis.safetyWarnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITestPage;
