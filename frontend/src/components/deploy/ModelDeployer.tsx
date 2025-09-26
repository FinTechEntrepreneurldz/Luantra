'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Loader2, CheckCircle, AlertCircle, Globe, Play, Target, ExternalLink, Link } from 'lucide-react';
import modelService from '../../services/modelService';

interface ModelDeployerProps {
  trainedModels: any[];
  onDeploymentComplete?: (response: any) => void;
}

export const ModelDeployer: React.FC<ModelDeployerProps> = ({ 
  trainedModels, 
  onDeploymentComplete 
}) => {
  const [selectedModel, setSelectedModel] = useState('');
  const [endpointName, setEndpointName] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [endpoints, setEndpoints] = useState<any[]>([]);

  const handleDeploy = async () => {
    if (!selectedModel || !endpointName) {
      setDeploymentStatus('error');
      setStatusMessage('Please select a model and provide endpoint name');
      return;
    }

    setIsDeploying(true);
    setDeploymentStatus('deploying');
    setStatusMessage('Deploying model to Vertex AI endpoint...');

    try {
      const response = await modelService.deployModel(selectedModel, endpointName.trim());

      setDeploymentStatus('success');
      setStatusMessage(`✅ Model deployment started! Endpoint: ${endpointName}`);

      if (onDeploymentComplete) {
        onDeploymentComplete({
          ...response,
          modelName: selectedModel,
          endpointDisplayName: endpointName.trim()
        });
      }

      loadEndpoints();

      setTimeout(() => {
        setSelectedModel('');
        setEndpointName('');
        setDeploymentStatus('idle');
        setStatusMessage('');
      }, 5000);

    } catch (error) {
      setDeploymentStatus('error');
      setStatusMessage(`❌ Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeploying(false);
    }
  };

  const loadEndpoints = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/endpoints');
      if (response.ok) {
        const data = await response.json();
        setEndpoints(data.endpoints || []);
      }
    } catch (error) {
      console.error('Failed to load endpoints:', error);
    }
  };

  const getModelPageUrl = (modelName: string) => {
    const modelId = encodeURIComponent(modelName);
    return `/model/${modelId}`;
  };

  const openModelPage = (modelName: string) => {
    const url = getModelPageUrl(modelName);
    window.open(url, '_blank');
  };

  useEffect(() => {
    loadEndpoints();
    const interval = setInterval(loadEndpoints, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Deploy New Model */}
      <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6">
        <div className="flex items-center mb-4">
          <Zap className="w-6 h-6 text-green-400 mr-2" />
          <h3 className="text-xl font-semibold text-white">Deploy Model to Production</h3>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-purple-300 mb-2">
            Select Trained Model
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400"
          >
            <option value="">Choose a trained model...</option>
            {trainedModels.map((model, index) => (
              <option key={index} value={model.model?.modelName || model.modelName}>
                {model.model?.modelName || model.modelName} (Status: Trained ✅)
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-purple-300 mb-2">
            Endpoint Name
          </label>
          <input
            type="text"
            value={endpointName}
            onChange={(e) => setEndpointName(e.target.value)}
            placeholder="Enter endpoint name (e.g., housing-price-api-v1)"
            className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
          />
        </div>

        <button
          onClick={handleDeploy}
          disabled={!selectedModel || !endpointName || isDeploying}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 mb-4 ${
            !selectedModel || !endpointName || isDeploying
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/25'
          }`}
        >
          {isDeploying ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Deploying to Production...</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              <span>Deploy to Production</span>
            </>
          )}
        </button>

        {statusMessage && (
          <div className={`mt-4 p-3 rounded-lg flex items-center space-x-2 ${
            deploymentStatus === 'success' 
              ? 'bg-green-500/20 border border-green-500/30 text-green-300'
              : deploymentStatus === 'error'
              ? 'bg-red-500/20 border border-red-500/30 text-red-300'
              : 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
          }`}>
            {deploymentStatus === 'success' && <CheckCircle className="w-5 h-5" />}
            {deploymentStatus === 'error' && <AlertCircle className="w-5 h-5" />}
            {deploymentStatus === 'deploying' && <Loader2 className="w-5 h-5 animate-spin" />}
            <span className="text-sm">{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Active Endpoints with Custom Pages */}
      <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Globe className="w-6 h-6 text-blue-400 mr-2" />
            <h3 className="text-xl font-semibold text-white">Live Model Pages</h3>
          </div>
          <button
            onClick={loadEndpoints}
            className="text-blue-300 hover:text-blue-200 text-sm underline"
          >
            Refresh
          </button>
        </div>

        {endpoints.length === 0 ? (
          <p className="text-purple-300 text-center py-4">No models deployed yet. Deploy a model above to create custom AI pages!</p>
        ) : (
          <div className="space-y-4">
            {endpoints.map((endpoint, index) => (
              <div key={index} className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-white font-medium text-lg">{endpoint.displayName}</h4>
                    <p className="text-blue-200 text-sm">{endpoint.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-300 text-sm">Live</span>
                  </div>
                </div>

                {/* Custom Page URL */}
                <div className="bg-black/30 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-purple-300 mb-1">Custom AI Page URL:</p>
                      <code className="text-blue-300 text-sm">
                        {window.location.origin}{getModelPageUrl(endpoint.displayName)}
                      </code>
                    </div>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}${getModelPageUrl(endpoint.displayName)}`;
                        navigator.clipboard.writeText(url);
                        alert('URL copied to clipboard!');
                      }}
                      className="text-purple-300 hover:text-purple-200"
                    >
                      <Link className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => openModelPage(endpoint.displayName)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg text-sm hover:shadow-lg transition-all duration-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Custom Page</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      const url = `${window.location.origin}${getModelPageUrl(endpoint.displayName)}`;
                      navigator.clipboard.writeText(url);
                      alert('Shareable URL copied! Anyone can use this link to access your AI model.');
                    }}
                    className="flex items-center space-x-2 bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-2 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
                  >
                    <Link className="w-4 h-4" />
                    <span>Share Link</span>
                  </button>
                </div>

                <div className="mt-2 text-xs text-gray-400">
                  Created: {endpoint.createTime ? new Date(endpoint.createTime.seconds * 1000).toLocaleDateString() : 'Recently'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4">
        <h4 className="text-green-300 font-medium mb-2">🎉 Each Model Gets Its Own Page!</h4>
        <p className="text-green-200 text-sm">
          Every deployed model automatically gets a custom AI page with a unique URL. Share these links with clients, 
          embed them in websites, or use them as APIs. Each page is dynamically generated based on your model's training data!
        </p>
      </div>
    </div>
  );
};

export default ModelDeployer;
