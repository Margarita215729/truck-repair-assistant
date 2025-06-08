'use client';

import { useState, useEffect } from 'react';
import { TruckModel, getAllMakes, getModelsByMake } from '../data/trucks/models';

interface TruckSelectorProps {
  onTruckSelect: (truck: TruckModel & { year: number; engine: string }) => void;
  selectedTruck?: TruckModel & { year: number; engine: string } | null;
}

export function TruckSelector({ onTruckSelect, selectedTruck }: TruckSelectorProps) {
  const [selectedMake, setSelectedMake] = useState<string>(selectedTruck?.make || '');
  const [selectedModel, setSelectedModel] = useState<string>(selectedTruck?.model || '');
  const [selectedYear, setSelectedYear] = useState<number>(selectedTruck?.year || 0);
  const [selectedEngine, setSelectedEngine] = useState<string>(selectedTruck?.engine || '');

  const makes = getAllMakes();
  const models = selectedMake ? getModelsByMake(selectedMake) : [];
  const selectedModelData = models.find(m => m.model === selectedModel);
  const availableYears = selectedModelData?.years || [];
  const availableEngines = selectedModelData?.engines || [];

  useEffect(() => {
    if (selectedMake && selectedModel && selectedYear && selectedEngine && selectedModelData) {
      onTruckSelect({
        ...selectedModelData,
        year: selectedYear,
        engine: selectedEngine
      });
    }
  }, [selectedMake, selectedModel, selectedYear, selectedEngine, selectedModelData, onTruckSelect]);

  const handleMakeChange = (make: string) => {
    setSelectedMake(make);
    setSelectedModel('');
    setSelectedYear(0);
    setSelectedEngine('');
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    setSelectedYear(0);
    setSelectedEngine('');
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setSelectedEngine('');
  };

  const isComplete = selectedMake && selectedModel && selectedYear && selectedEngine;

  return (
    <div className="bg-gradient-to-br from-green-50 via-blue-50 to-blue-100 dark:from-gray-900 dark:via-blue-950 dark:to-blue-900 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-blue-900 p-8 backdrop-blur-md transition-all duration-500">
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-blue-100 mb-8 flex items-center gap-2 animate-fade-in">
        <span className="animate-truck-bounce">🚛</span> Select Your Truck
      </h2>
      
      <div className="space-y-6">
        {/* Make Selection */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Make
          </label>
          <select
            value={selectedMake}
            onChange={(e) => handleMakeChange(e.target.value)}
            className="w-full p-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors text-gray-900 font-medium bg-white"
          >
            <option value="">Choose truck make...</option>
            {makes.map(make => (
              <option key={make} value={make}>{make}</option>
            ))}
          </select>
        </div>

        {/* Model Selection */}
        {selectedMake && (
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => handleModelChange(e.target.value)}
              className="w-full p-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors text-gray-900 font-medium bg-white"
            >
              <option value="">Choose model...</option>
              {models.map(model => (
                <option key={model.id} value={model.model}>{model.model}</option>
              ))}
            </select>
          </div>
        )}

        {/* Year Selection */}
        {selectedModel && availableYears.length > 0 && (
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(parseInt(e.target.value))}
              className="w-full p-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors text-gray-900 font-medium bg-white"
            >
              <option value={0}>Choose year...</option>
              {availableYears.sort((a, b) => b - a).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        )}

        {/* Engine Selection */}
        {selectedYear && availableEngines.length > 0 && (
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Engine
            </label>
            <select
              value={selectedEngine}
              onChange={(e) => setSelectedEngine(e.target.value)}
              className="w-full p-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors text-gray-900 font-medium bg-white"
            >
              <option value="">Choose engine...</option>
              {availableEngines.map(engine => (
                <option key={engine} value={engine}>{engine}</option>
              ))}
            </select>
          </div>
        )}

        {/* Selection Summary */}
        {isComplete && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border-2 border-green-400">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-700" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-bold text-green-900">
                  ✅ Truck Selected
                </p>
                <p className="text-sm text-green-800 font-medium">
                  {selectedYear} {selectedMake} {selectedModel} - {selectedEngine}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Common Issues for Selected Model */}
        {selectedModelData && selectedModelData.commonIssues.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              Common Issues for this Model:
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {selectedModelData.commonIssues.map((issue, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
