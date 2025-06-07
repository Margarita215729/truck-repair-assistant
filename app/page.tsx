'use client';

import Link from 'next/link';
import { SimpleServiceMap } from '../components/maps/SimpleServiceMap';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚛 Truck Repair Assistant v2.1
          </h1>
          <p className="text-xl text-gray-800 max-w-2xl mx-auto font-medium">
            AI-powered truck diagnostics
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* AI Testing Components */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🤖 AI Diagnostic Tools</h2>
            <p className="text-gray-700 mb-4">
              Test our AI-powered diagnostic tools for truck repair assistance.
            </p>
            <div className="flex flex-col space-y-3 mt-4">
              <Link 
                href="/test-ai" 
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-center"
              >
                Basic AI Test
              </Link>
              <Link 
                href="/test-ai-comprehensive" 
                className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 text-center"
              >
                Comprehensive AI Test
              </Link>
            </div>
          </div>

          {/* Service Map */}
          <div className="bg-white rounded-lg shadow-lg h-full">
            <SimpleServiceMap />
          </div>
        </div>
      </div>
    </div>
  );
}
