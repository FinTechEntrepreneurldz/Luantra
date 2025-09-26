'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Brain, ArrowLeft, Loader2, TrendingUp, Database, Target } from 'lucide-react';

interface ModelPageProps {
  params: {
    modelId: string;
  };
}

const ModelPage: React.FC<ModelPageProps> = ({ params }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [modelData, setModelData] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('luantra_user');
    if (!userData) {
      router.push('/auth/login');
      return;
    }

    // Simulate loading model data
    setTimeout(() => {
      setModelData({
        id: params.modelId,
        name: params.modelId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        status: 'deployed',
        accuracy: '94.2%',
        created: '2024-01-15'
      });
      setIsLoading(false);
    }, 1000);
  }, [params.modelId, router]);

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-purple-300">Loading model...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header with Back Button */}
      <header className="p-6 border-b border-purple-500/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToDashboard}
              className="flex items-center space-x-2 text-purple-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <Brain className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-semibold text-white">{modelData?.name}</h1>
          </div>
        </div>
      </header>

      {/* Model Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Model Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Model Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <span className="text-purple-300">Status</span>
                <span className="text-green-400 font-medium">{modelData?.status}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <span className="text-purple-300">Accuracy</span>
                <span className="text-white font-medium">{modelData?.accuracy}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <span className="text-purple-300">Created</span>
                <span className="text-white font-medium">{modelData?.created}</span>
              </div>
            </div>
          </motion.div>

          {/* Prediction Interface */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Make Predictions</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-purple-300 text-sm mb-2">Input Data</label>
                <textarea
                  placeholder="Enter your data here..."
                  className="w-full bg-black/30 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 h-32"
                />
              </div>
              
              <button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Get Prediction</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 flex justify-center space-x-4"
        >
          <button
            onClick={handleBackToDashboard}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300"
          >
            <Database className="w-4 h-4" />
            <span>View All Models</span>
          </button>
          
          <button className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300">
            <TrendingUp className="w-4 h-4" />
            <span>Model Analytics</span>
          </button>
        </motion.div>
      </main>
    </div>
  );
};

export default ModelPage;
