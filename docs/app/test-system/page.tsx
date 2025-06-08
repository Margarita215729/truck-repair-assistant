'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: any;
  duration?: number;
}

export default function SystemTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [aiTestMessage, setAiTestMessage] = useState('Test Azure AI with diagnostic question');

  const updateTestResult = (name: string, result: Partial<TestResult>) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.name === name);
      if (existing) {
        return prev.map(r => r.name === name ? { ...r, ...result } : r);
      }
      return [...prev, { name, status: 'pending', message: '', ...result }];
    });
  };

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    const startTime = Date.now();
    updateTestResult(testName, { status: 'pending', message: 'Running...' });
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      updateTestResult(testName, {
        status: 'success',
        message: 'Test passed',
        details: result,
        duration
      });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(testName, {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration
      });
      throw error;
    }
  };

  const testHealthEndpoint = async () => {
    const response = await fetch('/api/health');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  };

  const testDataFiles = async () => {
    const response = await fetch('/api/data/status');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  };

  const testDatabaseConnection = async () => {
    const response = await fetch('/api/database/status');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  };

  const testAIService = async () => {
    const response = await fetch('/api/ai/test');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  };

  const testAIGeneration = async () => {
    const response = await fetch('/api/ai/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: aiTestMessage })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const tests = [
      { name: 'Health Endpoint', fn: testHealthEndpoint },
      { name: 'Data Files Status', fn: testDataFiles },
      { name: 'Database Connection', fn: testDatabaseConnection },
      { name: 'AI Service Status', fn: testAIService },
      { name: 'AI Response Generation', fn: testAIGeneration }
    ];

    for (const test of tests) {
      try {
        await runTest(test.name, test.fn);
        // Небольшая задержка между тестами
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Test failed: ${test.name}`, error);
      }
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Система тестирования маршрутов и данных
        </h1>
        <p className="text-gray-600">
          Комплексная проверка всех API маршрутов, файлов данных и сервисов Azure AI
        </p>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Настройки тестирования AI</h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Тестовое сообщение для AI
            </label>
            <input
              type="text"
              value={aiTestMessage}
              onChange={(e) => setAiTestMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите сообщение для тестирования AI..."
            />
          </div>
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isRunning && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {isRunning ? 'Выполняется...' : 'Запустить все тесты'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {testResults.map((result, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {getStatusIcon(result.status)}
                <h3 className="font-semibold text-gray-900">{result.name}</h3>
              </div>
              {result.duration && (
                <span className="text-sm text-gray-500">
                  {result.duration}ms
                </span>
              )}
            </div>
            
            <p className="text-gray-700 mb-2">{result.message}</p>
            
            {result.details && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                  Подробности
                </summary>
                <pre className="mt-2 p-3 bg-white rounded border text-xs overflow-auto max-h-64">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      {testResults.length === 0 && !isRunning && (
        <div className="text-center py-12 text-gray-500">
          <p>Нажмите "Запустить все тесты" для начала проверки системы</p>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Что тестируется:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Health Endpoint:</strong> Базовый статус приложения</li>
          <li>• <strong>Data Files Status:</strong> Доступность и структура файлов данных</li>
          <li>• <strong>Database Connection:</strong> Подключение к PostgreSQL</li>
          <li>• <strong>AI Service Status:</strong> Доступность Azure OpenAI</li>
          <li>• <strong>AI Response Generation:</strong> Генерация ответов через AI</li>
        </ul>
      </div>
    </div>
  );
}
