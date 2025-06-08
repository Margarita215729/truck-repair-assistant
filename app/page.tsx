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
        diagnosis: 'AI diagnosis result will appear here.',
        confidence: 0.85,
        repairSteps: ['Check engine oil', 'Inspect turbocharger'],
        requiredTools: ['Wrench', 'Diagnostic scanner'],
        estimatedTime: '1-2 hours',
        estimatedCost: '$200-500',
        safetyWarnings: ['Allow engine to cool before inspection'],
        urgencyLevel: 'medium',
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
                <p className="mb-2 text-gray-800 dark:text-gray-100">{diagnosisResult.diagnosis}</p>
                {diagnosisResult.repairSteps && (
                  <ul className="list-disc ml-6 text-green-700 dark:text-green-300 mb-2">
                    {diagnosisResult.repairSteps.map((rec, i) => <li key={i}>{rec}</li>)}
                  </ul>
                )}
                {diagnosisResult.requiredTools && (
                  <ul className="list-disc ml-6 text-blue-700 dark:text-blue-300 mb-2">
                    {diagnosisResult.requiredTools.map((tool, i) => <li key={i}>{tool}</li>)}
                  </ul>
                )}
                {diagnosisResult.safetyWarnings && (
                  <ul className="list-disc ml-6 text-yellow-700 dark:text-yellow-300 mb-2">
                    {diagnosisResult.safetyWarnings.map((warn, i) => <li key={i}>{warn}</li>)}
                  </ul>
                )}
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Confidence: {(diagnosisResult.confidence * 100).toFixed(1)}%<br />
                  Estimated Time: {diagnosisResult.estimatedTime}<br />
                  Estimated Cost: {diagnosisResult.estimatedCost}<br />
                  Urgency: {diagnosisResult.urgencyLevel}
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
