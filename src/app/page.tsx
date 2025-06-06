'use client';

import { useState } from 'react';
import { TruckSelector } from '../../components/truck/TruckSelector';
import { DiagnosisForm } from '../../components/diagnosis/DiagnosisForm';
import { AudioRecorderWrapper } from '../../components/audio/AudioRecorderWrapper';
import { AudioAnalysisDisplay } from '../../components/audio/AudioAnalysisDisplay';
import { GitHubModelsService } from '../../lib/ai/github-models';
import { localStorageService } from '../../lib/storage/local-storage';
import { TruckModel } from '../data/trucks/models';

import dynamic from 'next/dynamic';

// Временно используем упрощенную карту до решения проблем с Leaflet
const ServiceMap = dynamic(
  () => import('../../components/maps/SimpleServiceMap').then(mod => ({ default: mod.SimpleServiceMap })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }
);

interface DiagnosisRequest {
  truck: TruckModel & { year: number; engine: string };
  symptoms: string[];
  additionalInfo?: string;
  urgency: 'low' | 'medium' | 'high';
  audioAnalysis?: AudioAnalysis;
}

interface DiagnosisResult {
  diagnosis: string;
  confidence: number;
  repairSteps: string[];
  requiredTools: string[];
  estimatedTime: string;
  estimatedCost: string;
  safetyWarnings: string[];
  urgencyLevel: 'low' | 'medium' | 'high';
}

interface AudioAnalysis {
  duration: number;
  averageFrequency: number;
  peakFrequency: number;
  noiseLevel: number;
  suggestions: string[];
  possibleIssues: string[];
}

export default function Home() {
  const [selectedTruck, setSelectedTruck] = useState<(TruckModel & { year: number; engine: string }) | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'audio' | 'map'>('diagnosis');
  const [audioAnalysis, setAudioAnalysis] = useState<AudioAnalysis | null>(null);

  const githubModels = new GitHubModelsService();

  const handleTruckSelect = (truck: TruckModel & { year: number; engine: string }) => {
    setSelectedTruck(truck);
    localStorageService.saveSelectedTruck(truck);
    setDiagnosisResult(null);
    setError(null);
  };

  const handleAudioAnalysis = (analysis: AudioAnalysis) => {
    setAudioAnalysis(analysis);
    setActiveTab('diagnosis');
  };

  const handleDiagnosisSubmit = async (request: DiagnosisRequest) => {
    setIsLoading(true);
    setError(null);
    setDiagnosisResult(null);

    try {
      const enhancedRequest = {
        ...request,
        audioAnalysis: audioAnalysis
      };

      const result = await githubModels.diagnoseTruckIssue(enhancedRequest);
      setDiagnosisResult(result);

      localStorageService.saveDiagnosisHistory({
        id: Date.now().toString(),
        truck: request.truck,
        symptoms: request.symptoms,
        diagnosis: result.diagnosis,
        timestamp: Date.now(),
        urgency: request.urgency
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get diagnosis');
    } finally {
      setIsLoading(false);
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-50 text-green-900 border-green-300 border-2';
      case 'medium': return 'bg-yellow-50 text-yellow-900 border-yellow-400 border-2';
      case 'high': return 'bg-red-50 text-red-900 border-red-400 border-2';
      default: return 'bg-gray-50 text-gray-900 border-gray-400 border-2';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚛 Truck Repair Assistant
          </h1>
          <p className="text-xl text-gray-800 max-w-2xl mx-auto font-medium">
            AI-powered truck diagnostics with GitHub Models, audio analysis, and service locator
          </p>
        </header>

        {/* Truck Selection */}
        <div className="max-w-4xl mx-auto mb-8">
          <TruckSelector 
            onTruckSelect={handleTruckSelect}
            selectedTruck={selectedTruck}
          />
        </div>

        {/* Tab Navigation */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <button
              onClick={() => setActiveTab('diagnosis')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all border-2 ${
                activeTab === 'diagnosis'
                  ? 'bg-blue-700 text-white shadow-lg border-blue-700'
                  : 'bg-white text-gray-900 hover:bg-gray-50 border-gray-400 hover:border-gray-600'
              }`}
            >
              🔧 Diagnosis & Repair
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all border-2 ${
                activeTab === 'audio'
                  ? 'bg-blue-700 text-white shadow-lg border-blue-700'
                  : 'bg-white text-gray-900 hover:bg-gray-50 border-gray-400 hover:border-gray-600'
              }`}
            >
              🎵 Engine Sound Analysis
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all border-2 ${
                activeTab === 'map'
                  ? 'bg-blue-700 text-white shadow-lg border-blue-700'
                  : 'bg-white text-gray-900 hover:bg-gray-50 border-gray-400 hover:border-gray-600'
              }`}
            >
              🗺️ Service Locator
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {activeTab === 'diagnosis' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Diagnosis & Repair Assistant
                </h2>
                
                {/* Audio Analysis Preview */}
                {audioAnalysis && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      🎵 Audio Analysis Available
                    </h3>
                    <p className="text-green-700">
                      Engine sound analysis completed. Duration: {audioAnalysis.duration}s
                    </p>
                    <button
                      onClick={() => setActiveTab('audio')}
                      className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      View Full Analysis
                    </button>
                  </div>
                )}

                <DiagnosisForm
                  selectedTruck={selectedTruck}
                  onDiagnosisSubmit={handleDiagnosisSubmit}
                  isLoading={isLoading}
                />

                {/* Error Display */}
                {error && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">Error: {error}</p>
                  </div>
                )}

                {/* Diagnosis Results */}
                {diagnosisResult && (
                  <div className="mt-8">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">Diagnosis Results</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(diagnosisResult.urgencyLevel)}`}>
                          {diagnosisResult.urgencyLevel.toUpperCase()} PRIORITY
                        </span>
                      </div>

                      <div className="grid lg:grid-cols-2 gap-6">
                        {/* Diagnosis */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">🔍 Diagnosis</h4>
                          <p className="text-gray-700 mb-4">{diagnosisResult.diagnosis}</p>
                          
                          <div className="mb-4">
                            <span className="text-sm text-gray-600">Confidence Level:</span>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${diagnosisResult.confidence}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{diagnosisResult.confidence}%</span>
                          </div>
                        </div>

                        {/* Estimates */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">💰 Estimates</h4>
                          <div className="space-y-2">
                            <p><span className="font-medium">Time:</span> {diagnosisResult.estimatedTime}</p>
                            <p><span className="font-medium">Cost:</span> {diagnosisResult.estimatedCost}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-6 flex flex-wrap gap-3">
                        <button
                          onClick={() => setActiveTab('map')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          🗺️ Find Repair Services
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Engine Sound Analysis
                </h2>
                <p className="text-gray-600 mb-6">
                  Record your engine sound to get advanced diagnostics based on audio patterns and frequencies.
                </p>
                
                <div className="space-y-6">
                  <AudioRecorderWrapper onAnalysisResult={handleAudioAnalysis} />
                  
                  {audioAnalysis && (
                    <AudioAnalysisDisplay analysis={audioAnalysis} />
                  )}
                </div>
              </div>
            )}

            {activeTab === 'map' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Service Locator
                </h2>
                <p className="text-gray-600 mb-6">
                  Find nearby repair shops, parts stores, truck stops, and towing services.
                </p>
                
                <div className="h-96 rounded-lg overflow-hidden">
                  <ServiceMap />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
