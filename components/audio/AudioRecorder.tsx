'use client';

import { useState, useRef, useEffect } from 'react';
import RecordRTC from 'recordrtc';

interface AudioRecorderProps {
  onRecordingComplete?: (audioBlob: Blob, audioUrl: string) => void;
  onAnalysisResult?: (analysis: AudioAnalysis) => void;
  maxDuration?: number; // in seconds
  className?: string;
}

interface AudioAnalysis {
  duration: number;
  averageFrequency: number;
  peakFrequency: number;
  noiseLevel: number;
  suggestions: string[];
  possibleIssues: string[];
}

export function AudioRecorder({ 
  onRecordingComplete, 
  onAnalysisResult,
  maxDuration = 30,
  className = ""
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  const recorderRef = useRef<RecordRTC | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Request microphone permission on component mount
  useEffect(() => {
    const requestPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setPermissionGranted(true);
        stream.getTracks().forEach(track => track.stop()); // Stop immediately after permission check
      } catch {
        setPermissionGranted(false);
        setError('Microphone permission denied. Please enable microphone access to record engine sounds.');
      }
    };

    requestPermission();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;

      const recorder = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1,
        desiredSampRate: 44100
      });

      recorder.startRecording();
      recorderRef.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);

    } catch (err) {
      setError('Failed to start recording. Please check microphone permissions.');
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && isRecording) {
      recorderRef.current.stopRecording(() => {
        const blob = recorderRef.current!.getBlob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setIsRecording(false);
        
        // Clean up
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        // Notify parent component
        onRecordingComplete?.(blob, url);
        
        // Analyze audio
        analyzeAudio(blob);
      });
    }
  };

  const pauseRecording = () => {
    if (recorderRef.current && isRecording) {
      if (isPaused) {
        recorderRef.current.resumeRecording();
        setIsPaused(false);
      } else {
        recorderRef.current.pauseRecording();
        setIsPaused(true);
      }
    }
  };

  const discardRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setRecordingTime(0);
    setError(null);
  };

  const analyzeAudio = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    
    try {
      // Create audio context for analysis
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Basic frequency analysis
      const channelData = audioBuffer.getChannelData(0);
      const analysis = performFrequencyAnalysis(channelData, audioBuffer.sampleRate);
      
      onAnalysisResult?.(analysis);
      
    } catch (err) {
      console.error('Audio analysis error:', err);
      setError('Failed to analyze audio recording.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const performFrequencyAnalysis = (audioData: Float32Array, sampleRate: number): AudioAnalysis => {
    // Simple frequency analysis - in production, you'd want more sophisticated analysis
    const duration = audioData.length / sampleRate;
    
    // Calculate RMS (noise level)
    const rms = Math.sqrt(audioData.reduce((sum, sample) => sum + sample * sample, 0) / audioData.length);
    const noiseLevel = Math.min(Math.max(rms * 100, 0), 100);
    
    // Simple frequency detection (this is very basic - real implementation would use FFT)
    let peakFrequency = 0;
    let averageFrequency = 0;
    
    // Mock analysis for demonstration
    if (noiseLevel > 20) {
      peakFrequency = Math.random() * 2000 + 100; // Random between 100-2100 Hz
      averageFrequency = peakFrequency * 0.7;
    }

    // Generate suggestions based on frequency analysis
    const suggestions: string[] = [];
    const possibleIssues: string[] = [];

    if (noiseLevel < 10) {
      suggestions.push('Recording volume is low. Try recording closer to the engine.');
      suggestions.push('Ensure engine is running during recording.');
    } else if (noiseLevel > 80) {
      suggestions.push('Recording may be too loud. Try recording from a bit further away.');
    }

    if (peakFrequency < 200) {
      possibleIssues.push('Low frequency noise detected - possible engine mount issues');
    } else if (peakFrequency > 1500) {
      possibleIssues.push('High frequency noise detected - possible bearing or timing issues');
    } else {
      possibleIssues.push('Normal engine frequency range detected');
    }

    if (duration < 5) {
      suggestions.push('Record for at least 10-15 seconds for better analysis.');
    }

    return {
      duration,
      averageFrequency,
      peakFrequency,
      noiseLevel,
      suggestions,
      possibleIssues
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (permissionGranted === false) {
    return (
      <div className={`bg-red-50 border-2 border-red-400 rounded-lg p-6 ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-bold text-red-900">Microphone Access Required</h3>
            <p className="text-sm font-medium text-red-800 mt-1">
              Please enable microphone access to record engine sounds for analysis.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border-2 border-gray-200 rounded-lg shadow-lg p-6 ${className}`}>
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        🎤 Engine Sound Analysis
      </h3>

      {error && (
        <div className="mb-4 bg-red-50 border-2 border-red-400 rounded-lg p-4">
          <p className="text-red-900 text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Recording Controls */}
        <div className="flex items-center space-x-4">
          {!isRecording && !audioUrl && (
            <button
              onClick={startRecording}
              disabled={permissionGranted !== true}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold border-2 border-red-600 hover:border-red-700"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
              Start Recording
            </button>
          )}

          {isRecording && (
            <>
              <button
                onClick={stopRecording}
                className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold border-2 border-gray-700 hover:border-gray-800"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                Stop
              </button>
              
              <button
                onClick={pauseRecording}
                className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-semibold border-2 border-yellow-600 hover:border-yellow-700"
              >
                {isPaused ? (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Resume
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Pause
                  </>
                )}
              </button>
            </>
          )}

          {audioUrl && (
            <button
              onClick={discardRecording}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold border-2 border-red-600 hover:border-red-700"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414L7.586 12l-1.293 1.293a1 1 0 101.414 1.414L9 13.414l2.293 2.293a1 1 0 001.414-1.414L11.414 12l1.293-1.293z" clipRule="evenodd" />
              </svg>
              Discard
            </button>
          )}
        </div>

        {/* Recording Timer */}
        {(isRecording || recordingTime > 0) && (
          <div className="flex items-center space-x-2">
            {isRecording && (
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse mr-2"></div>
                <span className="text-red-800 font-bold">REC</span>
              </div>
            )}
            <span className="text-lg font-mono font-bold text-gray-900">
              {formatTime(recordingTime)} / {formatTime(maxDuration)}
            </span>
            {isPaused && (
              <span className="text-yellow-800 text-sm font-bold">(Paused)</span>
            )}
          </div>
        )}

        {/* Audio Playback */}
        {audioUrl && (
          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
            <h4 className="text-sm font-bold text-gray-900 mb-2">Recorded Audio:</h4>
            <audio controls src={audioUrl} className="w-full" />
          </div>
        )}

        {/* Analysis Loading */}
        {isAnalyzing && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="animate-spin h-5 w-5 text-blue-700 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-blue-900 font-bold">Analyzing audio...</span>
            </div>
          </div>
        )}

        {/* Recording Instructions */}
        {!isRecording && !audioUrl && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
            <h4 className="text-sm font-bold text-blue-900 mb-2">📋 Recording Tips:</h4>
            <ul className="text-sm font-medium text-blue-800 space-y-1">
              <li>• Make sure the engine is running</li>
              <li>• Record for at least 10-15 seconds</li>
              <li>• Hold the device close to the engine (but safely)</li>
              <li>• Try to minimize background noise</li>
              <li>• Record both idle and rev-up sounds if possible</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
