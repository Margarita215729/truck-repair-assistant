'use client';

import { useState } from 'react';
import { TruckSelector } from '../components/truck/TruckSelector';
import { DiagnosisForm } from '../components/diagnosis/DiagnosisForm';
import { AudioRecorderWrapper } from '../components/audio/AudioRecorderWrapper';
import { AudioAnalysisDisplay } from '../components/audio/AudioAnalysisDisplay';
import { ServiceMapWrapper } from '../components/maps/ServiceMapWrapper';
import type { DiagnosisResult } from '@/lib/ai/types';

interface TruckModel {
  id: string;
  make: string;
  model: string;
  engines: string[];
  years: number[];
  commonIssues: string[];
}

interface DiagnosisRequest {
  truck: TruckModel & { year: number; engine: string };
  symptoms: string[];
  additionalInfo?: string;
  urgency: 'low' | 'medium' | 'high';
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
  const [selectedTruck, setSelectedTruck] = useState<TruckModel & { year: number; engine: string } | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [audioAnalysis, setAudioAnalysis] = useState<AudioAnalysis | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  // Submit diagnosis data to AI service
  const handleDiagnosisSubmit = async (data: DiagnosisRequest) => {
    setIsDiagnosing(true);
    setDiagnosisResult(null);
    
    try {
      const response = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          truckInfo: data.truck,
          symptoms: data.symptoms.join(', '),
          additionalInfo: data.additionalInfo,
          urgency: data.urgency
        }),
      });

      const result = await response.json();
      
      if (result.success && result.result) {
        setDiagnosisResult({
          possibleCauses: result.result.possibleCauses || ['Unable to determine specific causes'],
          recommendations: result.result.recommendations || ['Contact a professional mechanic for further inspection'],
          urgencyLevel: result.result.urgencyLevel || data.urgency,
          estimatedCost: result.result.estimatedCost || 'Contact service for estimate',
          aiProvider: result.provider || 'unknown',
          confidence: result.result.confidence || 0.7,
        });
      } else {
        // Fallback to mock data if AI service fails
        setDiagnosisResult({
          possibleCauses: ['AI service temporarily unavailable', 'Multiple possible causes detected'],
          recommendations: ['Contact a professional technician', 'Check basic maintenance items', 'Monitor symptoms closely'],
          urgencyLevel: data.urgency,
          estimatedCost: 'Contact service for estimate',
          aiProvider: 'fallback',
          confidence: 0.5,
        });
      }
    } catch (error) {
      console.error('Diagnosis error:', error);
      
      // Provide fallback diagnosis
      setDiagnosisResult({
        possibleCauses: ['Service temporarily unavailable', 'Diagnostic data collected for analysis'],
        recommendations: ['Contact your nearest service center', 'Document all symptoms for technician', 'Ensure vehicle safety before continuing operation'],
        urgencyLevel: data.urgency,
        estimatedCost: 'Contact service for estimate',
        aiProvider: 'offline',
        confidence: 0.3,
      });
    } finally {
      setIsDiagnosing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      {/* Professional Header */}
      <div className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Truck Repair Assistant
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Professional AI-Powered Fleet Maintenance & Diagnostics
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Version 2.1</div>
              <div className="text-xs text-slate-400 dark:text-slate-500">Enterprise Solution</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Primary Workflow Column */}
            <div className="xl:col-span-2 space-y-6">
              {/* Vehicle Selection */}
              <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Vehicle Selection
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Select your truck model for accurate diagnostics
                  </p>
                </div>
                <div className="p-6">
                  <TruckSelector onTruckSelect={setSelectedTruck} selectedTruck={selectedTruck} />
                </div>
              </div>

              {/* Diagnosis Panel */}
              <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Diagnostic Assessment
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Describe symptoms for AI-powered analysis
                  </p>
                </div>
                <div className="p-6">
                  <DiagnosisForm 
                    selectedTruck={selectedTruck} 
                    onDiagnosisSubmit={handleDiagnosisSubmit} 
                    isLoading={isDiagnosing} 
                  />
                </div>
              </div>

              {/* Results Panel */}
              {diagnosisResult && (
                <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                      Diagnostic Results
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      AI analysis and repair recommendations
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="grid gap-6">
                      {/* Confidence and Cost Overview */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {(diagnosisResult.confidence * 100).toFixed(0)}%
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Confidence</div>
                        </div>
                        <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {diagnosisResult.estimatedCost}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Est. Cost</div>
                        </div>
                        <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 capitalize">
                            {diagnosisResult.urgencyLevel}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Priority</div>
                        </div>
                        <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {diagnosisResult.aiProvider}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">AI Model</div>
                        </div>
                      </div>

                      {/* Possible Causes */}
                      {diagnosisResult.possibleCauses && (
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                            Identified Issues
                          </h3>
                          <div className="space-y-2">
                            {diagnosisResult.possibleCauses.map((cause, i) => (
                              <div key={i} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-red-800 dark:text-red-200">{cause}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {diagnosisResult.recommendations && (
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                            Recommended Actions
                          </h3>
                          <div className="space-y-2">
                            {diagnosisResult.recommendations.map((rec, i) => (
                              <div key={i} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-green-800 dark:text-green-200">{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Audio Analysis */}
              <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Audio Diagnostics
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Record engine sounds for advanced analysis
                  </p>
                </div>
                <div className="p-6">
                  <AudioRecorderWrapper onAnalysisResult={setAudioAnalysis} />
                  {audioAnalysis && (
                    <div className="mt-4">
                      <AudioAnalysisDisplay analysis={audioAnalysis} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
              {/* Service Locator */}
              <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Service Locations
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
                    Find nearby repair facilities
                  </p>
                </div>
                <div className="p-6">
                  <ServiceMapWrapper />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
