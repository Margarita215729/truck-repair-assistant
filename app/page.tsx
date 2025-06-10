'use client';

import { useState } from 'react';
import { TruckSelector } from '../components/truck/TruckSelector';
import { DiagnosisForm } from '../components/diagnosis/DiagnosisForm';
import { AudioRecorderWrapper } from '../components/audio/AudioRecorderWrapper';
import { AudioAnalysisDisplay } from '../components/audio/AudioAnalysisDisplay';
import { ServiceMapWrapper } from '../components/maps/ServiceMapWrapper';
import { AIServiceStatus } from '../components/ai/AIServiceStatus';
import type { DiagnosisResult } from '@/lib/ai/types';
import type { TruckModel } from '../components/data/trucks/models';

interface AudioAnalysis {
  duration: number;
  averageFrequency: number;
  peakFrequency: number;
  noiseLevel: number;
  suggestions: string[];
  possibleIssues: string[];
}

export default function Home() {
  const [selectedTruck, setSelectedTruck] = useState<TruckModel & { year: number; engine: string } | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [audioAnalysis, setAudioAnalysis] = useState<AudioAnalysis | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  // Функция отправки данных на AI-диагностику (заглушка, интеграция через clientAIService)
  const handleDiagnosisSubmit = async () => {
    setIsDiagnosing(true);
    setDiagnosisResult(null);
    try {
      setDiagnosisResult({
        possibleCauses: ['Engine oil level low', 'Turbocharger malfunction'],
        recommendations: ['Check engine oil', 'Inspect turbocharger', 'Contact professional technician'],
        urgencyLevel: 'medium',
        estimatedCost: '$200-500',
        aiProvider: 'demo',
        confidence: 0.85,
      });
    } catch {
      setDiagnosisResult(null);
    } finally {
      setIsDiagnosing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-blue-950">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-blue-100 mb-4 animate-fade-in">
            🚛 Truck Repair Assistant v2.1
          </h1>
          <p className="text-xl text-gray-800 dark:text-blue-200 max-w-2xl mx-auto font-medium animate-fade-in">
            AI-powered truck diagnostics for real-world repair
          </p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="space-y-8">
            <TruckSelector onTruckSelect={setSelectedTruck} selectedTruck={selectedTruck} />
            <DiagnosisForm selectedTruck={selectedTruck} onDiagnosisSubmit={handleDiagnosisSubmit} isLoading={isDiagnosing} />
            {diagnosisResult && (
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 border-2 border-blue-200 dark:border-blue-800 mt-4 animate-fade-in">
                <h3 className="text-xl font-bold mb-2 text-blue-900 dark:text-blue-200">🩺 Diagnosis Result</h3>
                
                {diagnosisResult.possibleCauses && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Possible Causes:</h4>
                    <ul className="list-disc ml-6 text-red-700 dark:text-red-300">
                      {diagnosisResult.possibleCauses.map((cause, i) => <li key={i}>{cause}</li>)}
                    </ul>
                  </div>
                )}
                
                {diagnosisResult.recommendations && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Recommendations:</h4>
                    <ul className="list-disc ml-6 text-green-700 dark:text-green-300">
                      {diagnosisResult.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                    </ul>
                  </div>
                )}
                
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="grid grid-cols-2 gap-4">
                    <div>Confidence: {(diagnosisResult.confidence * 100).toFixed(1)}%</div>
                    <div>Estimated Cost: {diagnosisResult.estimatedCost}</div>
                    <div>Urgency: {diagnosisResult.urgencyLevel}</div>
                    <div>AI Provider: {diagnosisResult.aiProvider}</div>
                  </div>
                </div>
              </div>
            )}
            <div className="mt-8">
              <AudioRecorderWrapper onAnalysisResult={setAudioAnalysis} />
              {audioAnalysis && <AudioAnalysisDisplay analysis={audioAnalysis} className="mt-4" />}
            </div>
          </div>
          <div className="space-y-8">
            <AIServiceStatus />
            <ServiceMapWrapper />
          </div>
        </div>
      </div>
    </div>
  );
}
