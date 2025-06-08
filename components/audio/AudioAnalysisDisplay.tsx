'use client';

interface AudioAnalysis {
  duration: number;
  averageFrequency: number;
  peakFrequency: number;
  noiseLevel: number;
  suggestions: string[];
  possibleIssues: string[];
}

interface AudioAnalysisDisplayProps {
  analysis: AudioAnalysis;
  className?: string;
}

export function AudioAnalysisDisplay({ analysis, className = "" }: AudioAnalysisDisplayProps) {
  const getNoiseLevel = () => {
    if (analysis.noiseLevel < 20) return { label: 'Low', color: 'text-yellow-800', bg: 'bg-yellow-50', border: 'border-yellow-400' };
    if (analysis.noiseLevel < 60) return { label: 'Normal', color: 'text-green-800', bg: 'bg-green-50', border: 'border-green-400' };
    return { label: 'High', color: 'text-red-800', bg: 'bg-red-50', border: 'border-red-400' };
  };

  const getFrequencyAnalysis = () => {
    const freq = analysis.peakFrequency;
    if (freq < 200) {
      return {
        range: 'Low Frequency (< 200 Hz)',
        description: 'Typically indicates engine mount issues, low-end vibrations, or exhaust problems',
        color: 'text-blue-800'
      };
    } else if (freq < 800) {
      return {
        range: 'Mid-Low Frequency (200-800 Hz)',
        description: 'Normal engine combustion frequencies, may indicate timing or fuel system issues if irregular',
        color: 'text-green-800'
      };
    } else if (freq < 1500) {
      return {
        range: 'Mid-High Frequency (800-1500 Hz)',
        description: 'Normal operational range, possible valve or injection system noises',
        color: 'text-yellow-800'
      };
    } else {
      return {
        range: 'High Frequency (> 1500 Hz)',
        description: 'May indicate bearing issues, timing problems, or accessory drive noises',
        color: 'text-red-800'
      };
    }
  };

  const noiseLevel = getNoiseLevel();
  const frequencyAnalysis = getFrequencyAnalysis();

  return (
    <div className={`bg-gradient-to-br from-white via-blue-50 to-green-100 dark:from-gray-900 dark:via-blue-950 dark:to-green-900 rounded-2xl shadow-2xl p-8 backdrop-blur-md transition-all duration-500 ${className}`}>
      <h3 className="text-2xl font-extrabold text-gray-800 dark:text-blue-100 mb-8 flex items-center gap-2 animate-fade-in">
        <span className="animate-wave">📊</span> Audio Analysis Results
      </h3>

      <div className="space-y-6">
        {/* Basic Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
            <div className="text-sm font-bold text-gray-800">Duration</div>
            <div className="text-2xl font-bold text-gray-900">
              {analysis.duration.toFixed(1)}s
            </div>
          </div>
          
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
            <div className="text-sm font-bold text-gray-800">Peak Frequency</div>
            <div className="text-2xl font-bold text-gray-900">
              {analysis.peakFrequency.toFixed(0)} Hz
            </div>
          </div>
          
          <div className={`${noiseLevel.bg} border-2 ${noiseLevel.border} rounded-lg p-4`}>
            <div className="text-sm font-bold text-gray-800">Noise Level</div>
            <div className={`text-2xl font-bold ${noiseLevel.color}`}>
              {analysis.noiseLevel.toFixed(0)}% ({noiseLevel.label})
            </div>
          </div>
        </div>

        {/* Frequency Analysis */}
        <div className="border-2 border-gray-300 rounded-lg p-4">
          <h4 className="text-lg font-bold text-gray-900 mb-3">
            🔍 Frequency Analysis
          </h4>
          <div className="space-y-2">
            <div className={`font-bold ${frequencyAnalysis.color}`}>
              {frequencyAnalysis.range}
            </div>
            <p className="text-gray-800 text-sm font-medium">
              {frequencyAnalysis.description}
            </p>
            <div className="mt-3">
              <div className="text-sm font-bold text-gray-800 mb-1">Frequency Distribution</div>
              <div className="w-full bg-gray-300 border border-gray-400 rounded-full h-3">
                <div 
                  className="bg-blue-700 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((analysis.peakFrequency / 2000) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs font-medium text-gray-700 mt-1">
                <span>0 Hz</span>
                <span>1000 Hz</span>
                <span>2000+ Hz</span>
              </div>
            </div>
          </div>
        </div>

        {/* Possible Issues */}
        {analysis.possibleIssues.length > 0 && (
          <div className="border-2 border-orange-400 rounded-lg p-4 bg-orange-50">
            <h4 className="text-lg font-bold text-orange-900 mb-3 flex items-center">
              ⚠️ Possible Issues Detected
            </h4>
            <ul className="space-y-2">
              {analysis.possibleIssues.map((issue, index) => (
                <li key={index} className="flex items-start text-orange-900">
                  <span className="mr-2 mt-1 font-bold">•</span>
                  <span className="text-sm font-medium">{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {analysis.suggestions.length > 0 && (
          <div className="border-2 border-blue-400 rounded-lg p-4 bg-blue-50">
            <h4 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
              💡 Suggestions for Better Analysis
            </h4>
            <ul className="space-y-2">
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start text-blue-900">
                  <span className="mr-2 mt-1 font-bold">•</span>
                  <span className="text-sm font-medium">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sound Pattern Visualization */}
        <div className="border-2 border-gray-300 rounded-lg p-4">
          <h4 className="text-lg font-bold text-gray-900 mb-3">
            🌊 Sound Pattern Visualization
          </h4>
          <div className="space-y-3">
            <div>
              <div className="text-sm font-bold text-gray-800 mb-1">Average Frequency</div>
              <div className="w-full bg-gray-300 border border-gray-400 rounded-full h-2">
                <div 
                  className="bg-green-700 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((analysis.averageFrequency / 2000) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs font-medium text-gray-700 mt-1">
                {analysis.averageFrequency.toFixed(0)} Hz
              </div>
            </div>
            
            <div>
              <div className="text-sm font-bold text-gray-800 mb-1">Peak Frequency</div>
              <div className="w-full bg-gray-300 border border-gray-400 rounded-full h-2">
                <div 
                  className="bg-red-700 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((analysis.peakFrequency / 2000) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs font-medium text-gray-700 mt-1">
                {analysis.peakFrequency.toFixed(0)} Hz
              </div>
            </div>

            <div>
              <div className="text-sm font-bold text-gray-800 mb-1">Noise Level</div>
              <div className="w-full bg-gray-300 border border-gray-400 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    analysis.noiseLevel < 30 ? 'bg-yellow-700' : 
                    analysis.noiseLevel < 70 ? 'bg-green-700' : 'bg-red-700'
                  }`}
                  style={{ width: `${Math.min(analysis.noiseLevel, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs font-medium text-gray-700 mt-1">
                {analysis.noiseLevel.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="border-2 border-green-400 rounded-lg p-4 bg-green-50">
          <h4 className="text-lg font-bold text-green-900 mb-3 flex items-center">
            ✅ Recommended Next Steps
          </h4>
          <div className="space-y-2 text-green-900">
            <p className="text-sm font-medium">
              1. <strong>Include this analysis</strong> when describing symptoms to the AI diagnosis system
            </p>
            <p className="text-sm font-medium">
              2. <strong>Record additional samples</strong> at different RPM levels if possible
            </p>
            <p className="text-sm font-medium">
              3. <strong>Compare with normal engine sounds</strong> for your truck model
            </p>
            <p className="text-sm font-medium">
              4. <strong>Contact a mechanic</strong> if unusual patterns are detected
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
