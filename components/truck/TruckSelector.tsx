'use client';

import { useState, useEffect } from 'react';
import { truckDataService, type TruckData } from '../../lib/services/truck-data';

interface TruckModel {
  id: string;
  make: string;
  model: string;
  engines: string[];
  years: number[];
  commonIssues: string[];
}

interface TruckSelectorProps {
  onTruckSelect: (truck: TruckModel & { year: number; engine: string }) => void;
  selectedTruck?: TruckModel & { year: number; engine: string } | null;
}

export function TruckSelector({ onTruckSelect, selectedTruck }: TruckSelectorProps) {
  const [selectedMake, setSelectedMake] = useState<string>(selectedTruck?.make || '');
  const [selectedModel, setSelectedModel] = useState<string>(selectedTruck?.model || '');
  const [selectedYear, setSelectedYear] = useState<number>(selectedTruck?.year || 0);
  const [selectedEngine, setSelectedEngine] = useState<string>(selectedTruck?.engine || '');
  
  // Custom input mode toggles
  const [customMake, setCustomMake] = useState<string>('');
  const [customModel, setCustomModel] = useState<string>('');
  const [customEngine, setCustomEngine] = useState<string>('');
  const [useCustomMake, setUseCustomMake] = useState<boolean>(false);
  const [useCustomModel, setUseCustomModel] = useState<boolean>(false);
  const [useCustomEngine, setUseCustomEngine] = useState<boolean>(false);

  // Data from MongoDB
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [truckDetails, setTruckDetails] = useState<TruckData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const availableEngines = truckDetails.length > 0 ? truckDetails[0].engines : [];
  const availableYears = truckDetails.length > 0 ? 
    [...new Set(truckDetails.map(t => t.year))].sort((a, b) => b - a) : [];
  const commonIssues = truckDetails.length > 0 ? truckDetails[0].commonIssues : [];

  // Load makes on component mount
  useEffect(() => {
    loadMakes();
  }, []);

  // Load models when make changes
  useEffect(() => {
    if (selectedMake && !useCustomMake) {
      loadModels(selectedMake);
    }
  }, [selectedMake, useCustomMake]);

  // Load truck details when make and model are selected
  useEffect(() => {
    const finalMake = useCustomMake ? customMake : selectedMake;
    const finalModel = useCustomModel ? customModel : selectedModel;
    
    if (finalMake && finalModel) {
      loadTruckDetails(finalMake, finalModel);
    }
  }, [selectedMake, selectedModel, customMake, customModel, useCustomMake, useCustomModel]);

  // Trigger truck selection when all required data is available
  useEffect(() => {
    const finalMake = useCustomMake ? customMake : selectedMake;
    const finalModel = useCustomModel ? customModel : selectedModel;
    const finalEngine = useCustomEngine ? customEngine : selectedEngine;
    
    if (selectedYear && finalMake) {
      const currentCommonIssues = truckDetails.length > 0 ? truckDetails[0].commonIssues : [];
      
      const basicTruck = {
        id: `custom-${Date.now()}`,
        make: finalMake,
        model: finalModel || 'Unknown Model',
        engines: finalEngine ? [finalEngine] : ['Unknown Engine'],
        years: [selectedYear],
        commonIssues: currentCommonIssues || [],
        year: selectedYear,
        engine: finalEngine || 'Unknown Engine'
      };
      
      onTruckSelect(basicTruck);
    }
  }, [selectedMake, selectedModel, selectedYear, selectedEngine, customMake, customModel, customEngine, useCustomMake, useCustomModel, useCustomEngine, truckDetails, onTruckSelect]);

  const loadMakes = async () => {
    setIsLoading(true);
    try {
      const makesData = await truckDataService.getAllMakes();
      setMakes(makesData);
    } catch (error) {
      console.error('Error loading makes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadModels = async (make: string) => {
    setIsLoading(true);
    try {
      const modelsData = await truckDataService.getModelsByMake(make);
      setModels(modelsData);
    } catch (error) {
      console.error('Error loading models:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTruckDetails = async (make: string, model: string) => {
    setIsLoading(true);
    try {
      const details = await truckDataService.getTruckDetails(make, model);
      setTruckDetails(details);
    } catch (error) {
      console.error('Error loading truck details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMakeChange = (make: string) => {
    setSelectedMake(make);
    setSelectedModel('');
    setSelectedYear(0);
    setSelectedEngine('');
    if (make) setUseCustomMake(false);
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    setSelectedYear(0);
    setSelectedEngine('');
    if (model) setUseCustomModel(false);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setSelectedEngine('');
  };

  const toggleCustomMake = () => {
    setUseCustomMake(!useCustomMake);
    if (!useCustomMake) {
      setSelectedMake('');
      setSelectedModel('');
      setSelectedYear(0);
      setSelectedEngine('');
    } else {
      setCustomMake('');
    }
  };

  const toggleCustomModel = () => {
    setUseCustomModel(!useCustomModel);
    if (!useCustomModel) {
      setSelectedModel('');
      setSelectedYear(0);
      setSelectedEngine('');
    } else {
      setCustomModel('');
    }
  };

  const toggleCustomEngine = () => {
    setUseCustomEngine(!useCustomEngine);
    if (!useCustomEngine) {
      setSelectedEngine('');
    } else {
      setCustomEngine('');
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const finalMake = useCustomMake ? customMake : selectedMake;
  const finalModel = useCustomModel ? customModel : selectedModel;
  const finalEngine = useCustomEngine ? customEngine : selectedEngine;
  const hasMinimalInfo = finalMake && selectedYear;

  return (
    <div className="space-y-6">
      {/* Make Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
            Truck Make
          </label>
          <button
            type="button"
            onClick={toggleCustomMake}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            {useCustomMake ? 'Use dropdown' : 'Enter custom'}
          </button>
        </div>
        {useCustomMake ? (
          <input
            type="text"
            value={customMake}
            onChange={(e) => setCustomMake(e.target.value)}
            placeholder="Enter truck make (e.g., Peterbilt, Kenworth)"
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            disabled={isLoading}
          />
        ) : (
          <select
            value={selectedMake}
            onChange={(e) => handleMakeChange(e.target.value)}
            disabled={isLoading}
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:opacity-50"
          >
            <option value="">{isLoading ? 'Loading makes...' : 'Select truck make...'}</option>
            {makes.map(make => (
              <option key={make} value={make}>{make}</option>
            ))}
          </select>
        )}
      </div>

      {/* Model Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
            Model <span className="text-slate-500 font-normal">(optional)</span>
          </label>
          <button
            type="button"
            onClick={toggleCustomModel}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            {useCustomModel ? 'Use dropdown' : 'Enter custom'}
          </button>
        </div>
        {useCustomModel ? (
          <input
            type="text"
            value={customModel}
            onChange={(e) => setCustomModel(e.target.value)}
            placeholder="Enter model (e.g., 379, T680, Cascadia)"
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            disabled={isLoading}
          />
        ) : (
          <select
            value={selectedModel}
            onChange={(e) => handleModelChange(e.target.value)}
            disabled={(!selectedMake && !useCustomMake) || isLoading}
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">{isLoading ? 'Loading models...' : 'Select model (optional)...'}</option>
            {models.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        )}
      </div>

      {/* Year Selection */}
      <div>
        <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Year <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedYear}
          onChange={(e) => handleYearChange(parseInt(e.target.value))}
          className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        >
          <option value={0}>Select year...</option>
          {(availableYears.length > 0 ? availableYears : yearOptions).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Engine Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
            Engine <span className="text-slate-500 font-normal">(optional)</span>
          </label>
          <button
            type="button"
            onClick={toggleCustomEngine}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            {useCustomEngine ? 'Use dropdown' : 'Enter custom'}
          </button>
        </div>
        {useCustomEngine ? (
          <input
            type="text"
            value={customEngine}
            onChange={(e) => setCustomEngine(e.target.value)}
            placeholder="Enter engine (e.g., Caterpillar C15, Cummins ISX)"
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        ) : (
          <select
            value={selectedEngine}
            onChange={(e) => setSelectedEngine(e.target.value)}
            disabled={(!selectedModel && !useCustomModel) || (!availableEngines.length && !useCustomEngine)}
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select engine (optional)...</option>
            {availableEngines.map(engine => (
              <option key={engine} value={engine}>{engine}</option>
            ))}
          </select>
        )}
      </div>

      {/* Selection Summary */}
      {hasMinimalInfo && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                Vehicle Information Captured
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                {selectedYear} {finalMake} {finalModel && `${finalModel} `}{finalEngine && `- ${finalEngine}`}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Ready for diagnosis. Additional details help improve accuracy.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Common Issues for Selected Model */}
      {commonIssues.length > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Known Issues - {finalMake} {finalModel}
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            {commonIssues.slice(0, 3).map((issue, index) => (
              <li key={index} className="flex items-start">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                <span>{issue}</span>
              </li>
            ))}
            {commonIssues.length > 3 && (
              <li className="text-xs text-blue-600 dark:text-blue-400 ml-3.5">
                +{commonIssues.length - 3} more issues
              </li>
            )}
          </ul>
        </div>
      )}
      
      {/* Information for Custom Models */}
      {(useCustomModel || useCustomMake) && hasMinimalInfo && commonIssues.length === 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
            Custom Vehicle Information
          </h4>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Since you&apos;re using custom vehicle information, specific known issues are not available. 
            The AI will provide general diagnostic assistance based on your symptoms.
          </p>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-4">
        <p className="mb-1">
          <span className="text-red-500">*</span> Year is required for basic diagnostics
        </p>
        <p>
          Optional fields help improve diagnostic accuracy and recommendations
        </p>
      </div>
    </div>
  );
}
