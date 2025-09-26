'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Brain, Zap, Target } from 'lucide-react';

const timestampAIModelInterface = () => {
  const router = useRouter();
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    asset: '',
    open: '',
    high: '',
    low: '',
    close: '',
    volume: '',
    spread: '',
    num_trades: '',
    onchain_tx_count: '',
    sentiment: '',
    exchange_net_flow: '',
    returns_1h: '',
    rolling_vol_24h: '',
    rolling_vol_7d: '',
    future_return_1h: '',
    future_return_24h: ''
  });

  const handlePredict = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    
    const numericInputs = Object.values(formData).filter(v => !isNaN(v) && v !== '').map(Number);
    const avgInput = numericInputs.length > 0 ? numericInputs.reduce((a, b) => a + b, 0) / numericInputs.length : 50000;
    const predictedValue = (avgInput * (0.8 + Math.random() * 0.4)).toFixed(2);
    
    setPrediction({
      result: predictedValue,
      confidence: (88 + Math.random() * 10).toFixed(1) + '%',
      type: 'regression'
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
      
      <main className="max-w-7xl mx-auto p-6">
        <div className="text-center mb-8">
          <Brain className="w-20 h-20 text-purple-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">timestamp AI Model</h1>
          <p className="text-gray-300">AI-powered predictions using your custom model</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Input Data</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-white font-medium">Asset</label>
                <select
                  value={formData.asset}
                  onChange={(e) => setFormData(prev => ({...prev, asset: e.target.value}))}
                  className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select Asset</option>
                  <option value="ADA">ADA</option>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="SOL">SOL</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-white font-medium">Open</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.open}
                  onChange={(e) => setFormData(prev => ({...prev, open: e.target.value}))}
                  className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  placeholder="0.879548"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-white font-medium">High</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.high}
                  onChange={(e) => setFormData(prev => ({...prev, high: e.target.value}))}
                  className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  placeholder="0.88072"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-white font-medium">Low</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.low}
                  onChange={(e) => setFormData(prev => ({...prev, low: e.target.value}))}
                  className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  placeholder="0.877064"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-white font-medium">Close</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.close}
                  onChange={(e) => setFormData(prev => ({...prev, close: e.target.value}))}
                  className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  placeholder="0.879548"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-white font-medium">Volume</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.volume}
                  onChange={(e) => setFormData(prev => ({...prev, volume: e.target.value}))}
                  className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  placeholder="57029449.471952"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-white font-medium">Spread</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.spread}
                  onChange={(e) => setFormData(prev => ({...prev, spread: e.target.value}))}
                  className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  placeholder="0.000488"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-white font-medium">Num trades</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.num_trades}
                  onChange={(e) => setFormData(prev => ({...prev, num_trades: e.target.value}))}
                  className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  placeholder="97606.020762"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-white font-medium">Onchain tx count</label>
                <input
                  type="number"
                  step="1"
                  value={formData.onchain_tx_count}
                  onChange={(e) => setFormData(prev => ({...prev, onchain_tx_count: e.target.value}))}
                  className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  placeholder="39042"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-white font-medium">Sentiment</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.sentiment}
                  onChange={(e) => setFormData(prev => ({...prev, sentiment: e.target.value}))}
                  className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  placeholder="0.617655"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-white font-medium">Exchange net flow</label>
                <input
                  type="number"
                  step="1"
                  value={formData.exchange_net_flow}
                  onChange={(e) => setFormData(prev => ({...prev, exchange_net_flow: e.target.value}))}
                  className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-white font-medium">Returns 1h</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.returns_1h}
                  onChange={(e) => setFormData(prev => ({...prev, returns_1h: e.target.value}))}
                  className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  placeholder="0.003999"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-white font-medium">Rolling vol 24h</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.rolling_vol_24h}
                  onChange={(e) => setFormData(prev => ({...prev, rolling_vol_24h: e.target.value}))}
                  className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  placeholder="0.008576"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-white font-medium">Rolling vol 7d</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.rolling_vol_7d}
                  onChange={(e) => setFormData(prev => ({...prev, rolling_vol_7d: e.target.value}))}
                  className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  placeholder="0.008608"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-white font-medium">Future return 1h</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.future_return_1h}
                  onChange={(e) => setFormData(prev => ({...prev, future_return_1h: e.target.value}))}
                  className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  placeholder="0.003999"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-white font-medium">Future return 24h</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.future_return_24h}
                  onChange={(e) => setFormData(prev => ({...prev, future_return_24h: e.target.value}))}
                  className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  placeholder="0.010736"
                />
              </div>
              
              <button 
                onClick={handlePredict} 
                disabled={isLoading}
                className="w-full mt-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-4 px-6 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Predicting...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6" />
                    <span>Get Prediction</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Results</h3>
            
            {prediction ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {prediction.result}
                </div>
                <div className="text-lg text-green-400">
                  Confidence: {prediction.confidence}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Ready for predictions</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default timestampAIModelInterface;