'use client';

import { useState } from 'react';
import { TruckModel } from '../data/trucks/models';

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
  // Removed urgency selector - broken trucks are inherently urgent
  const urgency = 'high' as const;

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

  return (
    <div className="space-y-6">
      {!selectedTruck ? (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="text-slate-400 text-6xl mb-4">🚛</div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Please select your truck information above to begin diagnosis
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Symptoms Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
              What problems are you experiencing? <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Select all symptoms that apply to your truck
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
              {COMMON_SYMPTOMS.map((symptom) => (
                <label key={symptom} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedSymptoms.includes(symptom)}
                    onChange={() => handleSymptomToggle(symptom)}
                    className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="text-sm text-slate-900 dark:text-slate-100 font-medium">{symptom}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Symptom Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Add custom symptom
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={customSymptom}
                onChange={(e) => setCustomSymptom(e.target.value)}
                placeholder="Describe any other issues..."
                className="flex-1 p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
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
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                Add
              </button>
            </div>
          </div>

          {/* Selected Symptoms Display */}
          {selectedSymptoms.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Selected symptoms ({selectedSymptoms.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedSymptoms.map((symptom) => (
                  <span
                    key={symptom}
                    className="inline-flex items-center px-3 py-2 rounded-lg text-sm bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-800 font-medium"
                  >
                    {symptom}
                    <button
                      type="button"
                      onClick={() => handleSymptomToggle(symptom)}
                      className="ml-2 text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Additional information <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Any additional details about the problem, when it started, driving conditions, etc..."
              rows={4}
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!selectedTruck || selectedSymptoms.length === 0 || isLoading}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center text-lg"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Issue...
                </>
              ) : (
                'Get AI Diagnosis'
              )}
            </button>
            {selectedSymptoms.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center">
                Please select at least one symptom to continue
              </p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
