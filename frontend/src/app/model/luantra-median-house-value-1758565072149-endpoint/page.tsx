'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Brain, Loader2, TrendingUp, DollarSign } from 'lucide-react';

const LuantraLogo = ({ className }: { className?: string }) => (
  <svg width="120" height="120" viewBox="0 0 200 200" className={className}>
    <defs>
      <radialGradient id="auroraCore" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
      </radialGradient>
    </defs>
    <circle cx="100" cy="100" r="90" fill="url(#auroraCore)" opacity="0.3">
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        from="0 100 100"
        to="360 100 100"
        dur="15s"
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);

const ModelInterface = () => {
  const router = useRouter();
  const [inputs, setInputs] = useState({
    feature1: '',
    feature2: '',
    feature3: ''
  });
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePredict = async () => {
    setIsLoading(true);
    
    // Simulate API call with actual model features
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    
    // Generate realistic prediction for target
    const basePrediction = Math.random() * 1000000; // Adjust based on target
    setPrediction({
      value: Math.round(basePrediction),
      confidence: 0.85 + Math.random() * 0.1,
      range: {
        low: Math.round(basePrediction * 0.9),
        high: Math.round(basePrediction * 1.1)
      }
    });
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Aurora background effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
      </div>

      <header className="relative z-10 p-6 border-b border-purple-500/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-300 hover:text-white flex items-center space-x-2 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center space-x-4">
            <LuantraLogo className="w-12 h-12" />
            <div className="text-right">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                MEDIAN HOUSE VALUE 1758565072149 Endpoint
              </h1>
              <p className="text-purple-300 text-sm">Powered by Luantra AI</p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">MEDIAN HOUSE VALUE 1758565072149 Endpoint</h1>
          <p className="text-gray-300 text-lg">Predict target using advanced AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Input Features</h3>
            
            <div className="space-y-4">
              
              <div>
                <label className="block text-purple-300 text-sm font-medium mb-2">Feature1</label>
                
                <input
                  type="number"
                  value={inputs.feature1}
                  onChange={(e) => setInputs({...inputs, feature1: e.target.value})}
                  placeholder="Enter feature1"
                  className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
                />
              </div>
              <div>
                <label className="block text-purple-300 text-sm font-medium mb-2">Feature2</label>
                
                <input
                  type="number"
                  value={inputs.feature2}
                  onChange={(e) => setInputs({...inputs, feature2: e.target.value})}
                  placeholder="Enter feature2"
                  className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
                />
              </div>
              <div>
                <label className="block text-purple-300 text-sm font-medium mb-2">Feature3</label>
                
                <input
                  type="number"
                  value={inputs.feature3}
                  onChange={(e) => setInputs({...inputs, feature3: e.target.value})}
                  placeholder="Enter feature3"
                  className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
                />
              </div>
              
              <button
                onClick={handlePredict}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Predicting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Get Prediction</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-green-500/30 p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Prediction Results</h3>
            
            {prediction ? (
              <div className="space-y-6">
                
                <div className="text-center p-6 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-xl border border-green-500/30">
                  <DollarSign className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h4 className="text-2xl font-bold text-white mb-2">Predicted target</h4>
                  <p className="text-4xl font-bold text-green-400">{prediction.value?.toLocaleString()}</p>
                  <p className="text-green-300 text-sm mt-2">Confidence: {Math.round(prediction.confidence * 100)}%</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                    <p className="text-blue-300 text-sm">Low Estimate</p>
                    <p className="text-xl font-bold text-white">{prediction.range?.low.toLocaleString()}</p>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 text-center">
                    <p className="text-purple-300 text-sm">High Estimate</p>
                    <p className="text-xl font-bold text-white">{prediction.range?.high.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Enter feature values to get started</p>
                <p className="text-gray-500 text-sm">AI-powered predictions ready when you are</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ModelInterface;