'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Brain, Zap } from 'lucide-react';

const ModelInterface = () => {
  const router = useRouter();
  const [prediction, setPrediction] = useState(null);
  const [inputData, setInputData] = useState('');

  const handlePredict = async () => {
    // Simulate prediction
    setPrediction({
      value: (Math.random() * 1000).toFixed(2),
      confidence: (85 + Math.random() * 13).toFixed(1)
    });
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
          <h1 className="text-4xl font-bold text-white mb-4">timestamp AI Model-endpoint</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6">
            <textarea
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Enter your data here..."
              className="w-full h-32 bg-black/40 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            />
            <button 
              onClick={handlePredict} 
              className="w-full mt-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <Zap className="w-5 h-5" />
              <span>Get Prediction</span>
            </button>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6">
            {prediction ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-400">{prediction.value}</div>
                <div className="text-white">Confidence: {prediction.confidence}%</div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>Enter data to see predictions</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ModelInterface;