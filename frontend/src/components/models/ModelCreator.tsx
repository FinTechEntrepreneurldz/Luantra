'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Loader2, CheckCircle, AlertCircle, Zap, Settings, User } from 'lucide-react';
import modelService from '../../services/modelService';

interface ModelCreatorProps {
  datasets: any[];
  onModelCreated?: (response: any) => void;
  datasetAnalysis?: {
    analysis: any;
    datasetPath: string;
  };
}

export const ModelCreator: React.FC<ModelCreatorProps> = ({ 
  datasets, 
  onModelCreated, 
  datasetAnalysis 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [modelName, setModelName] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [modelType, setModelType] = useState<'classification' | 'regression'>('classification');
  const [targetVariable, setTargetVariable] = useState('');
  const [useAutoConfig, setUseAutoConfig] = useState(true);
  const [creationStatus, setCreationStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [trainingJobId, setTrainingJobId] = useState('');

  // Auto-fill when analysis is available
  useEffect(() => {
    if (datasetAnalysis) {
      setSelectedDataset(datasetAnalysis.datasetPath);
      if (datasetAnalysis.analysis.suggested_target) {
        setTargetVariable(datasetAnalysis.analysis.suggested_target);
      }
      if (datasetAnalysis.analysis.model_recommendations[0]) {
        setModelType(datasetAnalysis.analysis.model_recommendations[0]);
      }
    }
  }, [datasetAnalysis]);

  const handleCreateModel = async () => {
    if (!modelName || !selectedDataset || !targetVariable) {
      setCreationStatus('error');
      setStatusMessage('Please provide model name, dataset, and target variable');
      return;
    }

    setIsCreating(true);
    setCreationStatus('creating');
    setStatusMessage('Submitting model training job to Vertex AI...');

    try {
      const response = await modelService.createModel({
        datasetPath: selectedDataset,
        modelName: modelName.trim(),
        modelType,
        targetVariable,
        useAutoConfig
      });

      setCreationStatus('success');
      setStatusMessage(`✅ Model training started! Job ID: ${response.model.jobId}`);
      setTrainingJobId(response.model.jobId);

      if (onModelCreated) {
        onModelCreated(response);
      }

      setTimeout(() => {
        setModelName('');
        setSelectedDataset('');
        setTargetVariable('');
        setCreationStatus('idle');
        setStatusMessage('');
      }, 5000);

    } catch (error) {
      setCreationStatus('error');
      setStatusMessage(`❌ Model creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const checkTrainingStatus = async () => {
    if (!trainingJobId) return;

    try {
      const status = await modelService.getTrainingStatus(trainingJobId);
      setStatusMessage(`🔄 Training Status: ${status.status} (Job: ${status.jobId})`);
    } catch (error) {
      setStatusMessage(`❌ Failed to check status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const availableColumns = datasetAnalysis?.analysis?.columns || [];
  const targetColumns = availableColumns.filter(col => col.could_be_target);
  const allColumns = availableColumns.map(col => col.name);

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6">
      <div className="flex items-center mb-4">
        <Brain className="w-6 h-6 text-purple-400 mr-2" />
        <h3 className="text-xl font-semibold text-white">Create Vertex AI Model</h3>
      </div>

      {/* Configuration Mode Toggle */}
      <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-medium">Configuration Mode</h4>
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 text-sm">Human-in-the-Loop</span>
          </div>
        </div>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              checked={useAutoConfig}
              onChange={() => setUseAutoConfig(true)}
              className="mr-2"
            />
            <span className="text-white">🤖 Use AI Suggestions</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={!useAutoConfig}
              onChange={() => setUseAutoConfig(false)}
              className="mr-2"
            />
            <span className="text-white">👤 Manual Configuration</span>
          </label>
        </div>
      </div>

      {/* Model Name Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-purple-300 mb-2">
          Model Name
        </label>
        <input
          type="text"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          placeholder="Enter model name (e.g., housing-price-predictor-v1)"
          className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
        />
      </div>

      {/* Dataset Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-purple-300 mb-2">
          Training Dataset
        </label>
        <select
          value={selectedDataset}
          onChange={(e) => setSelectedDataset(e.target.value)}
          className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400"
          disabled={useAutoConfig && datasetAnalysis}
        >
          <option value="">Select a dataset...</option>
          {datasets.map((dataset, index) => (
            <option key={index} value={dataset.file?.path || dataset.path}>
              {dataset.metadata?.originalName || dataset.name || `Dataset ${index + 1}`}
            </option>
          ))}
        </select>
      </div>

      {/* Target Variable Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-purple-300 mb-2">
          Target Variable (What you want to predict)
        </label>
        
        {useAutoConfig && datasetAnalysis?.analysis?.suggested_target ? (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mb-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-green-300 text-sm">🤖 AI Suggestion:</span>
                <span className="text-white ml-2 font-medium">{datasetAnalysis.analysis.suggested_target}</span>
              </div>
              <button
                onClick={() => setUseAutoConfig(false)}
                className="text-blue-300 hover:text-blue-200 text-sm underline"
              >
                Override
              </button>
            </div>
          </div>
        ) : null}

        <select
          value={targetVariable}
          onChange={(e) => setTargetVariable(e.target.value)}
          className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400"
          disabled={useAutoConfig && datasetAnalysis?.analysis?.suggested_target}
        >
          <option value="">Select target variable...</option>
          
          {!useAutoConfig && (
            <>
              <optgroup label="🎯 Suggested Targets">
                {targetColumns.map((col, index) => (
                  <option key={`target-${index}`} value={col.name}>
                    {col.name} ({col.unique_count} unique values)
                  </option>
                ))}
              </optgroup>
              <optgroup label="📊 All Columns">
                {allColumns.map((colName, index) => (
                  <option key={`all-${index}`} value={colName}>
                    {colName}
                  </option>
                ))}
              </optgroup>
            </>
          )}
          
          {useAutoConfig && datasetAnalysis?.analysis?.suggested_target && (
            <option value={datasetAnalysis.analysis.suggested_target}>
              {datasetAnalysis.analysis.suggested_target} (AI Suggested)
            </option>
          )}
        </select>
      </div>

      {/* Model Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-purple-300 mb-2">
          Model Type
        </label>
        
        {useAutoConfig && datasetAnalysis?.analysis?.model_recommendations?.[0] ? (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mb-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-green-300 text-sm">🤖 AI Recommendation:</span>
                <span className="text-white ml-2 font-medium capitalize">
                  {datasetAnalysis.analysis.model_recommendations[0]}
                </span>
              </div>
              <button
                onClick={() => setUseAutoConfig(false)}
                className="text-blue-300 hover:text-blue-200 text-sm underline"
              >
                Override
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="classification"
              checked={modelType === 'classification'}
              onChange={(e) => setModelType(e.target.value as 'classification')}
              disabled={useAutoConfig && datasetAnalysis?.analysis?.model_recommendations?.[0]}
              className="mr-2"
            />
            <span className="text-white">🏷️ Classification (Categories)</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="regression"
              checked={modelType === 'regression'}
              onChange={(e) => setModelType(e.target.value as 'regression')}
              disabled={useAutoConfig && datasetAnalysis?.analysis?.model_recommendations?.[0]}
              className="mr-2"
            />
            <span className="text-white">📈 Regression (Numbers)</span>
          </label>
        </div>
      </div>

      {/* Human Override Summary */}
      {!useAutoConfig && (
        <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
          <div className="flex items-center mb-2">
            <Settings className="w-4 h-4 text-blue-400 mr-2" />
            <span className="text-blue-300 text-sm font-medium">Manual Configuration Active</span>
          </div>
          <div className="text-sm text-blue-200">
            You've taken control! The model will use your selections instead of AI suggestions.
          </div>
        </div>
      )}

      {/* Create Model Button */}
      <button
        onClick={handleCreateModel}
        disabled={!modelName || !selectedDataset || !targetVariable || isCreating}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 mb-4 ${
          !modelName || !selectedDataset || !targetVariable || isCreating
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/25'
        }`}
      >
        {isCreating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Creating Model in Vertex AI...</span>
          </>
        ) : (
          <>
            <Brain className="w-5 h-5" />
            <span>Create Model in Vertex AI</span>
          </>
        )}
      </button>

      {/* Status Check Button */}
      {trainingJobId && (
        <button
          onClick={checkTrainingStatus}
          className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 text-blue-300"
        >
          <Zap className="w-4 h-4" />
          <span>Check Training Status</span>
        </button>
      )}

      {/* Status Message */}
      {statusMessage && (
        <div className={`mt-4 p-3 rounded-lg flex items-center space-x-2 ${
          creationStatus === 'success' 
            ? 'bg-green-500/20 border border-green-500/30 text-green-300'
            : creationStatus === 'error'
            ? 'bg-red-500/20 border border-red-500/30 text-red-300'
            : 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
        }`}>
          {creationStatus === 'success' && <CheckCircle className="w-5 h-5" />}
          {creationStatus === 'error' && <AlertCircle className="w-5 h-5" />}
          {creationStatus === 'creating' && <Loader2 className="w-5 h-5 animate-spin" />}
          <span className="text-sm">{statusMessage}</span>
        </div>
      )}
    </div>
  );
};

export default ModelCreator;
