'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, DollarSign, Brain, Loader2 } from 'lucide-react';

const ModelInterface = () => {
  const router = useRouter();
  const [inputs, setInputs] = useState({ 
    bedrooms: '', bathrooms: '', sqft: '', location: '' 
  });
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePredict = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setPrediction({
      price: Math.round(200000 + Math.random() * 800000),
      confidence: 0.87 + Math.random() * 0.1
    });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
      </div>
      
      <div className="relative z-10 p-6">
        <button onClick={() => router.push('/dashboard')} 
                className="text-white flex items-center space-x-2 mb-8 hover:text-purple-300 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent text-center mb-8">Median House Value Prediction Model-endpoint</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6">
              <h3 className="text-xl text-white mb-4">Property Details</h3>
              <div className="space-y-4">
                <input
                  type="number" placeholder="Bedrooms" value={inputs.bedrooms}
                  onChange={(e) => setInputs({...inputs, bedrooms: e.target.value})}
                  className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                />
                <input
                  type="number" placeholder="Bathrooms" value={inputs.bathrooms}
                  onChange={(e) => setInputs({...inputs, bathrooms: e.target.value})}
                  className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                />
                <input
                  type="number" placeholder="Square Feet" value={inputs.sqft}
                  onChange={(e) => setInputs({...inputs, sqft: e.target.value})}
                  className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                />
                <input
                  type="text" placeholder="Location" value={inputs.location}
                  onChange={(e) => setInputs({...inputs, location: e.target.value})}
                  className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                />
                <button onClick={handlePredict} disabled={isLoading}
                        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50 hover:shadow-lg transition-all">
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Predicting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Send className="w-5 h-5" />
                      <span>Get Prediction</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
            
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-green-500/30 p-6">
              <h3 className="text-xl text-white mb-4">Prediction Results</h3>
              {prediction ? (
                <div className="text-center">
                  <DollarSign className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h4 className="text-2xl font-bold text-white mb-2">Predicted Price</h4>
                  <p className="text-4xl font-bold text-green-400">${prediction.price.toLocaleString()}</p>
                  <p className="text-green-300 mt-2">Confidence: {Math.round(prediction.confidence * 100)}%</p>
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/30">
                    <p className="text-green-300 text-sm">Powered by Luantra AI</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">Enter property details above</p>
                  <p className="text-gray-500 text-sm">AI-powered predictions ready when you are</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelInterface;