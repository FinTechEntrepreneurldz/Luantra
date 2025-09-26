'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Loader2, Brain, Zap, TrendingUp } from 'lucide-react';

const UniversalModelInterface = () => {
  const router = useRouter();
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputData, setInputData] = useState('');

  const handlePredict = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const predictionTypes = ['Classification', 'Regression', 'Text Analysis', 'Time Series'];
    const selectedType = predictionTypes[Math.floor(Math.random() * predictionTypes.length)];
    
    setPrediction({
      type: selectedType,
      value: selectedType === 'Classification' ? 
        ['Positive', 'Negative', 'Neutral'][Math.floor(Math.random() * 3)] :
        Math.round(Math.random() * 100000),
      confidence: 0.85 + Math.random() * 0.14,
      processing_time: '120ms',
      model_version: 'Universal-AI-v1.0'
    });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="p-6 border-b border-purple-500/20">
        <button onClick={() => router.push('/dashboard')} className="text-gray-300 hover:text-white flex items-center space-x-2">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
      </header>
      
      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">cardio AI Model-endpoint</h1>
          <p className="text-gray-300">Universal AI Model - Powered by Luantra</p>
          <div className="flex justify-center space-x-4 mt-4 text-sm">
            <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">Universal</span>
            <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">Multi-Modal</span>
            <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full">Auto-Optimized</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-400" />
              Input Data
            </h3>
            <textarea
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Enter your data here (text, numbers, JSON, etc.)..."
              className="w-full h-32 bg-black/40 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            />
            <button 
              onClick={handlePredict} 
              disabled={isLoading || !inputData.trim()}
              className="w-full mt-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Get Universal Prediction</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              Prediction Result
            </h3>
            
            {prediction ? (
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-300 font-medium">Prediction Type:</span>
                    <span className="text-white">{prediction.type}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-300 font-medium">Result:</span>
                    <span className="text-2xl font-bold text-green-400">{prediction.value}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-300 font-medium">Confidence:</span>
                    <span className="text-white">{Math.round(prediction.confidence * 100)}%</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-300 font-medium">Processing Time:</span>
                    <span className="text-white">{prediction.processing_time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-300 font-medium">Model Version:</span>
                    <span className="text-white">{prediction.model_version}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Enter data above and click "Get Universal Prediction" to see results</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UniversalModelInterface;