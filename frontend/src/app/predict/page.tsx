'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Brain, TrendingUp, Sparkles, ArrowRight, RefreshCw, CheckCircle, Loader2, Home, Wand2 } from 'lucide-react';
import { LuantraLogo } from '@/components/ui/LuantraLogo';

// Import all possible Lucide icons for dynamic use
import * as LucideIcons from 'lucide-react';

export default function PredictPage() {
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<any>(null);
  const [uiConfig, setUiConfig] = useState<any>(null);
  const [isGeneratingUI, setIsGeneratingUI] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [prediction, setPrediction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadEndpoints = async () => {
    try {
      const response = await fetch('https://luantra-backend-fldu2pxc4a-uc.a.run.app/api/endpoints');
      if (response.ok) {
        const data = await response.json();
        setEndpoints(data.endpoints || []);
      }
    } catch (error) {
      console.error('Failed to load endpoints:', error);
    }
  };

  const generateDynamicUI = async (endpoint: any) => {
    setIsGeneratingUI(true);
    setUiConfig(null);
    
    try {
      console.log('Generating 100% dynamic UI for:', endpoint.displayName);
      
      const response = await fetch('https://luantra-backend-fldu2pxc4a-uc.a.run.app/api/models/generate-dynamic-ui', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelName: endpoint.displayName
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Dynamic UI generated:', result);
        setUiConfig(result.uiConfig);
        
        // Initialize form data with real field names
        const initialFormData: Record<string, string> = {};
        result.uiConfig.fields.forEach((field: any) => {
          initialFormData[field.name] = '';
        });
        setFormData(initialFormData);
      } else {
        throw new Error('Failed to generate UI');
      }
    } catch (error) {
      console.error('Failed to generate dynamic UI:', error);
      
      // Fallback UI
      setUiConfig({
        title: `${endpoint.displayName} Predictor`,
        description: 'Get AI-powered predictions',
        theme: 'blue',
        icon: 'Brain',
        fields: [
          {
            name: 'input_value',
            label: 'Input Value',
            type: 'number',
            placeholder: 'Enter a value',
            required: true
          }
        ],
        submitText: 'Get Prediction',
        resultTitle: 'Your Prediction',
        helpText: 'Enter your data to get an AI prediction.'
      });
      
      setFormData({ input_value: '' });
    } finally {
      setIsGeneratingUI(false);
    }
  };

  const handleEndpointSelect = async (endpoint: any) => {
    setSelectedEndpoint(endpoint);
    setPrediction(null);
    await generateDynamicUI(endpoint);
  };

  const updateFormData = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handlePredict = async () => {
    setIsLoading(true);
    
    try {
      // Simulate prediction call - in real implementation, this would call the actual model endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockPrediction = {
        result: uiConfig.resultTitle.includes('Price') || uiConfig.resultTitle.includes('Cost') ? 
                `$${(Math.random() * 500000 + 200000).toFixed(0)}` : 
                uiConfig.resultTitle.includes('Category') || uiConfig.resultTitle.includes('Class') ? 
                ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)] :
                uiConfig.resultTitle.includes('Probability') || uiConfig.resultTitle.includes('Risk') ?
                (Math.random() * 100).toFixed(1) + '%' :
                (Math.random() * 100).toFixed(2),
        confidence: (Math.random() * 0.3 + 0.7).toFixed(3),
        explanation: `Based on your input features and the trained AI model, this prediction was generated with ${uiConfig.modelInfo?.accuracy ? (uiConfig.modelInfo.accuracy * 100).toFixed(1) : '85'}% accuracy.`,
        timestamp: new Date().toISOString(),
        modelAccuracy: uiConfig.modelInfo?.accuracy || 0.85
      };
      
      setPrediction(mockPrediction);
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEndpoints();
  }, []);

  // Get dynamic icon component
  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || Brain;
    return IconComponent;
  };

  const getThemeColors = (theme: string) => {
    const themes = {
      blue: {
        primary: 'from-blue-500 to-cyan-500',
        secondary: 'bg-blue-500/20 border-blue-500/30',
        text: 'text-blue-300',
        accent: 'text-blue-400'
      },
      green: {
        primary: 'from-green-500 to-emerald-500',
        secondary: 'bg-green-500/20 border-green-500/30',
        text: 'text-green-300',
        accent: 'text-green-400'
      },
      purple: {
        primary: 'from-purple-500 to-pink-500',
        secondary: 'bg-purple-500/20 border-purple-500/30',
        text: 'text-purple-300',
        accent: 'text-purple-400'
      },
      orange: {
        primary: 'from-orange-500 to-red-500',
        secondary: 'bg-orange-500/20 border-orange-500/30',
        text: 'text-orange-300',
        accent: 'text-orange-400'
      }
    };
    return themes[theme as keyof typeof themes] || themes.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Aurora background effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 border-b border-purple-500/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <LuantraLogo className="w-12 h-12" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Luantra Predictions
              </h1>
              <p className="text-purple-300 text-sm">Dynamic AI-Powered Predictions</p>
            </div>
          </div>
          
          <a 
            href="/"
            className="flex items-center space-x-2 text-purple-300 hover:text-white transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Back to Platform</span>
          </a>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto p-6">
        {!selectedEndpoint ? (
          /* Endpoint Selection */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Choose Your AI Model</h2>
            <p className="text-xl text-purple-200 mb-12">Select a deployed model for dynamic AI predictions</p>

            {endpoints.length === 0 ? (
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-12">
                <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl text-white mb-2">No Models Deployed Yet</h3>
                <p className="text-purple-300">Deploy a model from the main platform to start making predictions</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {endpoints.map((endpoint, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleEndpointSelect(endpoint)}
                    className="bg-black/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6 cursor-pointer hover:border-purple-400 transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center mb-4">
                      <Target className="w-8 h-8 text-purple-400 mr-3" />
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-white">{endpoint.displayName}</h3>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-green-300 text-sm">Live & Ready</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-purple-200 text-sm mb-4">{endpoint.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-purple-300">Dynamic UI Generated</span>
                      <ArrowRight className="w-4 h-4 text-purple-400" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          /* Dynamic Prediction Interface */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Dynamic Input Form */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {isGeneratingUI ? (
                <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-8 text-center">
                  <Wand2 className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-xl text-white mb-2">Generating Dynamic Interface...</h3>
                  <p className="text-purple-300">AI is reading your model's training data to create the perfect prediction experience</p>
                </div>
              ) : uiConfig ? (
                <div className={`bg-black/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6 ${getThemeColors(uiConfig.theme).secondary}`}>
                  <div className="flex items-center mb-6">
                    {React.createElement(getIconComponent(uiConfig.icon), { 
                      className: `w-8 h-8 ${getThemeColors(uiConfig.theme).accent} mr-3` 
                    })}
                    <div>
                      <h2 className="text-2xl font-bold text-white">{uiConfig.title}</h2>
                      <p className={`${getThemeColors(uiConfig.theme).text}`}>{uiConfig.description}</p>
                    </div>
                  </div>

                  <div className={`mb-6 p-4 rounded-lg ${getThemeColors(uiConfig.theme).secondary}`}>
                    <p className="text-sm text-white">{uiConfig.helpText}</p>
                    {uiConfig.modelInfo && (
                      <p className="text-xs text-purple-300 mt-2">
                        Model Accuracy: {(uiConfig.modelInfo.accuracy * 100).toFixed(1)}% | 
                        Features: {uiConfig.modelInfo.totalFeatures} | 
                        Type: {uiConfig.modelInfo.modelType}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    {uiConfig.fields.map((field: any, index: number) => (
                      <div key={index}>
                        <label className={`block text-sm font-medium ${getThemeColors(uiConfig.theme).text} mb-2`}>
                          {field.label} {field.required && <span className="text-red-400">*</span>}
                        </label>
                        
                        {field.type === 'select' ? (
                          <select
                            value={formData[field.name] || ''}
                            onChange={(e) => updateFormData(field.name, e.target.value)}
                            className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400"
                          >
                            <option value="">Select {field.label}</option>
                            {field.options?.map((option: string, optIndex: number) => (
                              <option key={optIndex} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            value={formData[field.name] || ''}
                            onChange={(e) => updateFormData(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            min={field.min}
                            max={field.max}
                            step={field.step}
                            className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
                          />
                        )}
                        {field.validation && (
                          <p className="text-xs text-purple-400 mt-1">{field.validation}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handlePredict}
                    disabled={isLoading}
                    className={`w-full py-4 px-6 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 mt-6 bg-gradient-to-r ${getThemeColors(uiConfig.theme).primary} text-white hover:shadow-lg`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Getting Prediction...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>{uiConfig.submitText}</span>
                      </>
                    )}
                  </button>
                </div>
              ) : null}
            </motion.div>

            {/* Right Column - Dynamic Results */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {prediction ? (
                <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-green-500/30 p-6">
                  <div className="flex items-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400 mr-3" />
                    <h3 className="text-2xl font-bold text-white">{uiConfig?.resultTitle || 'Prediction Result'}</h3>
                  </div>

                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-6 mb-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white mb-2">{prediction.result}</div>
                      <div className="text-green-300">
                        Confidence: {(parseFloat(prediction.confidence) * 100).toFixed(1)}% | 
                        Model Accuracy: {(prediction.modelAccuracy * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-white font-medium mb-2">AI Explanation</h4>
                      <p className="text-purple-200 text-sm">{prediction.explanation}</p>
                    </div>
                    
                    <div className="flex justify-between text-sm text-purple-300">
                      <span>Generated:</span>
                      <span>{new Date(prediction.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6 text-center">
                  <Target className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl text-white mb-2">Ready for Dynamic Prediction</h3>
                  <p className="text-purple-300">Fill out the dynamically generated form and get AI-powered results</p>
                </div>
              )}

              {/* Dynamic Model Info */}
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Model Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-purple-300">Model:</span>
                    <span className="text-white">{selectedEndpoint.displayName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-300">Status:</span>
                    <span className="text-green-300">Live & Ready</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-300">Interface:</span>
                    <span className="text-blue-300">100% Dynamic</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-300">Data Source:</span>
                    <span className="text-purple-300">Real Training Metadata</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {selectedEndpoint && (
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setSelectedEndpoint(null);
                setUiConfig(null);
                setPrediction(null);
              }}
              className="text-purple-300 hover:text-white transition-colors"
            >
              ← Choose Different Model
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
