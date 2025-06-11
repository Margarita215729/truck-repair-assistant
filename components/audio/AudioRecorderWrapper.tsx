'use client';

import { useState, useEffect } from 'react';

interface AudioRecorderWrapperProps {
  onAnalysisResult?: (analysis: AudioAnalysis) => void;
}

interface AudioAnalysis {
  duration: number;
  averageFrequency: number;
  peakFrequency: number;
  noiseLevel: number;
  suggestions: string[];
  possibleIssues: string[];
}

interface AudioRecorderProps {
  onAnalysisResult?: (analysis: AudioAnalysis) => void;
}

export function AudioRecorderWrapper({ onAnalysisResult }: AudioRecorderWrapperProps) {
  const [AudioRecorderComponent, setAudioRecorderComponent] = useState<React.ComponentType<AudioRecorderProps> | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Динамически импортируем компонент только на клиенте
    import('./AudioRecorder').then((mod) => {
      setAudioRecorderComponent(() => mod.AudioRecorder);
    }).catch((error) => {
      console.warn('AudioRecorder component could not be loaded:', error);
    });
  }, []);

  if (!isClient) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading audio recorder...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!AudioRecorderComponent) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🎵 Engine Sound Analysis</h3>
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
            <p className="text-yellow-900 font-medium mb-4">
              📱 Audio recording functionality requires browser support for MediaRecorder API
            </p>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 border border-yellow-300">
                <h4 className="font-semibold text-yellow-800 mb-2">Alternative Methods:</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Use your phone to record engine sounds</li>
                  <li>• Upload audio files directly</li>
                  <li>• Describe symptoms in the diagnosis form</li>
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">🔍 Manual Diagnosis Available</h4>
                <p className="text-sm text-blue-800">
                  Switch to the &quot;Diagnosis &amp; Repair&quot; tab for comprehensive truck diagnostics without audio analysis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <AudioRecorderComponent onAnalysisResult={onAnalysisResult} />;
}
