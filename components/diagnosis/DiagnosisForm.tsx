'use client';

import { useState } from 'react';
import { TruckModel } from '../../data/trucks/models';

interface DiagnosisFormProps {
  selectedTruck: (TruckModel & { year: number; engine: string }) | null;
  onDiagnosisSubmit: (data: DiagnosisRequest) => void;
  isLoading?: boolean;
}

interface DiagnosisRequest {
  truck: TruckModel & { year: number; engine: string };
  symptoms: string[];
  additionalInfo?: string;
  urgency: 'low' | 'medium' | 'high';
}

const COMMON_SYMPTOMS = [
  'Engine making unusual noise',
  'Reduced power/acceleration',
  'Black or white smoke from exhaust',
  'Engine overheating',
  'Hard starting or won\'t start',
  'Transmission shifting problems',
  'Warning lights on dashboard',
  'Air brake issues',
  'Steering problems',
  'Electrical issues',
  'Vibration while driving',
  'Unusual smells (burning, fuel, etc.)',
  'DEF system warnings',
  'DPF regeneration problems',
  'Coolant leaks',
  'Oil leaks',
  'Fuel consumption increase',
  'Turbocharger issues'
];

export function DiagnosisForm({ selectedTruck, onDiagnosisSubmit, isLoading = false }: DiagnosisFormProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleAddCustomSymptom = () => {
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms(prev => [...prev, customSymptom.trim()]);
      setCustomSymptom('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTruck || selectedSymptoms.length === 0) {
      return;
    }

    const diagnosisRequest: DiagnosisRequest = {
      truck: selectedTruck,
      symptoms: selectedSymptoms,
      additionalInfo: additionalInfo.trim() || undefined,
      urgency
    };

    onDiagnosisSubmit(diagnosisRequest);
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-50 text-green-900 border-green-400 border-2';
      case 'medium': return 'bg-yellow-50 text-yellow-900 border-yellow-400 border-2';
      case 'high': return 'bg-red-50 text-red-900 border-red-400 border-2';
      default: return 'bg-gray-50 text-gray-900 border-gray-400 border-2';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        🩺 AI Diagnosis
      </h2>

      {!selectedTruck ? (
        <div className="text-center py-8">
          <div className="text-gray-500 text-6xl mb-4">🚛</div>
          <p className="text-gray-800 font-medium">Please select your truck first to continue with diagnosis</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Symptoms Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              What problems are you experiencing? (Select all that apply)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto border-2 border-gray-300 rounded-lg p-3">
              {COMMON_SYMPTOMS.map((symptom) => (
                <label key={symptom} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-100 border border-transparent hover:border-gray-300">
                  <input
                    type="checkbox"
                    checked={selectedSymptoms.includes(symptom)}
                    onChange={() => handleSymptomToggle(symptom)}
                    className="rounded border-2 border-gray-400 text-blue-700 focus:ring-blue-600 w-4 h-4"
                  />
                  <span className="text-sm text-gray-900 font-medium">{symptom}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Symptom Input */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Add custom symptom
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={customSymptom}
                onChange={(e) => setCustomSymptom(e.target.value)}
                placeholder="Describe any other issues..."
                className="flex-1 p-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 font-medium"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSymptom();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomSymptom}
                disabled={!customSymptom.trim()}
                className="px-4 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                Add
              </button>
            </div>
          </div>

          {/* Selected Symptoms Display */}
          {selectedSymptoms.length > 0 && (
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Selected symptoms ({selectedSymptoms.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedSymptoms.map((symptom) => (
                  <span
                    key={symptom}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-900 border border-blue-300 font-medium"
                  >
                    {symptom}
                    <button
                      type="button"
                      onClick={() => handleSymptomToggle(symptom)}
                      className="ml-2 text-blue-800 hover:text-blue-900 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Urgency Level */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              How urgent is this issue?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <label key={level} className="cursor-pointer">
                  <input
                    type="radio"
                    name="urgency"
                    value={level}
                    checked={urgency === level}
                    onChange={(e) => setUrgency(e.target.value as 'low' | 'medium' | 'high')}
                    className="sr-only"
                  />
                  <div className={`p-3 rounded-lg border-2 text-center transition-colors ${
                    urgency === level 
                      ? getUrgencyColor(level) 
                      : 'bg-white border-gray-400 hover:bg-gray-100'
                  }`}>
                    <div className="font-bold capitalize">{level}</div>
                    <div className="text-xs mt-1 font-medium">
                      {level === 'low' && 'Can wait for scheduled maintenance'}
                      {level === 'medium' && 'Should be addressed soon'}
                      {level === 'high' && 'Needs immediate attention'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional information (optional)
            </label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Any additional details about the problem, when it started, driving conditions, etc..."
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!selectedTruck || selectedSymptoms.length === 0 || isLoading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Getting AI Diagnosis...
              </>
            ) : (
              <>
                🤖 Get AI Diagnosis
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
