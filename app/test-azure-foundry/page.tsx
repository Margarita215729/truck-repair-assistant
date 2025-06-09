'use client';

import { useState } from 'react';

export default function TestAzureFoundryPage() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testFoundryAgent = async () => {
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('/api/ai/foundry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response from Azure AI Foundry');
      }

      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Azure AI Foundry Test Page
      </h1>
      
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Azure AI Foundry Agent</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message to Agent:
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Enter a message to test the Azure AI Foundry agent..."
            />
          </div>
          
          <button
            onClick={testFoundryAgent}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Testing...' : 'Test Azure AI Foundry Agent'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error:</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {response && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Response:</h3>
          <pre className="bg-gray-100 p-3 rounded-md overflow-auto text-sm">
            {response}
          </pre>
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">About This Test:</h3>
        <p className="text-blue-700 mb-2">
          This page tests the Azure AI Foundry integration that uses Azure AI Projects agents.
        </p>
        <p className="text-blue-700 mb-2">
          <strong>Required Environment Variables:</strong>
        </p>
        <ul className="list-disc list-inside text-blue-700 ml-4">
          <li>AZURE_PROJECTS_ENDPOINT</li>
          <li>AZURE_AGENT_ID</li>
          <li>AZURE_THREAD_ID</li>
        </ul>
      </div>
    </div>
  );
}