'use client';

import React, { useState } from 'react';
import { BarChart3, Brain, CheckCircle, AlertCircle, Loader2, Database } from 'lucide-react';
import uploadService, { DatasetAnalysis } from '../../services/uploadService';

interface DatasetAnalyzerProps {
  datasets: any[];
  onAnalysisComplete?: (analysis: DatasetAnalysis, datasetPath: string) => void;
}

export const DatasetAnalyzer: React.FC<DatasetAnalyzerProps> = ({ datasets, onAnalysisComplete }) => {
  const [selectedDataset, setSelectedDataset] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DatasetAnalysis | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!selectedDataset) return;

    setIsAnalyzing(true);
    setError('');
    setAnalysis(null);

    try {
      const result = await uploadService.analyzeDataset(selectedDataset);
      setAnalysis(result.analysis);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result.analysis, selectedDataset);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6">
      <div className="flex items-center mb-4">
        <Database className="w-6 h-6 text-blue-400 mr-2" />
        <h3 className="text-xl font-semibold text-white">Analyze Dataset</h3>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-purple-300 mb-2">
          Select Dataset to Analyze
        </label>
        <select
          value={selectedDataset}
          onChange={(e) => setSelectedDataset(e.target.value)}
          className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400"
        >
          <option value="">Choose a dataset...</option>
          {datasets.map((dataset, index) => (
            <option key={index} value={dataset.file?.path || dataset.path}>
              {dataset.metadata?.originalName || dataset.name || `Dataset ${index + 1}`}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={!selectedDataset || isAnalyzing}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 mb-4 ${
          !selectedDataset || isAnalyzing
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/25'
        }`}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Analyzing Dataset Structure...</span>
          </>
        ) : (
          <>
            <BarChart3 className="w-5 h-5" />
            <span>Analyze Dataset</span>
          </>
        )}
      </button>

      {error && (
        <div className="mb-4 p-3 rounded-lg flex items-center space-x-2 bg-red-500/20 border border-red-500/30 text-red-300">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {analysis && analysis.success && (
        <div className="space-y-4">
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <h4 className="text-white font-semibold">Dataset Overview</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-purple-300">Rows:</span>
                <span className="text-white ml-2">{analysis.shape.rows.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-purple-300">Columns:</span>
                <span className="text-white ml-2">{analysis.shape.columns}</span>
              </div>
              <div>
                <span className="text-purple-300">Suggested Target:</span>
                <span className="text-white ml-2">{analysis.suggested_target || 'None detected'}</span>
              </div>
              <div>
                <span className="text-purple-300">Recommended Model:</span>
                <span className="text-white ml-2">{analysis.model_recommendations.join(', ')}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">Column Analysis</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {analysis.columns.map((col, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-black/20 rounded">
                  <div className="flex items-center space-x-3">
                    <span className="text-white font-medium">{col.name}</span>
                    <span className="text-xs bg-purple-500/30 px-2 py-1 rounded text-purple-200">
                      {col.type}
                    </span>
                    {col.could_be_target && (
                      <span className="text-xs bg-green-500/30 px-2 py-1 rounded text-green-200">
                        Target?
                      </span>
                    )}
                  </div>
                  <div className="text-right text-sm text-purple-300">
                    <div>{col.unique_count} unique</div>
                    <div>{col.null_count} nulls</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center">
              <Brain className="w-5 h-5 text-purple-400 mr-2" />
              <span className="text-white">Dataset is ready for model training!</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatasetAnalyzer;
