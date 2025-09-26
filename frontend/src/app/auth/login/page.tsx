'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock } from 'lucide-react';

// BEAUTIFUL AURORA LOGO - EMBEDDED DIRECTLY  
const LuantraLogo = ({ className }: { className?: string }) => (
  <svg width="200" height="200" viewBox="0 0 200 200" className={className}>
    <defs>
      <linearGradient id="auroraCore" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ef4444">
          <animate attributeName="stop-color" values="#ef4444;#8b5cf6;#ef4444" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop offset="50%" stopColor="#3b82f6">
          <animate attributeName="stop-color" values="#3b82f6;#06b6d4;#3b82f6" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop offset="100%" stopColor="#06b6d4">
          <animate attributeName="stop-color" values="#06b6d4;#10b981;#06b6d4" dur="6s" repeatCount="indefinite" />
        </stop>
      </linearGradient>
      
      <linearGradient id="lGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ef4444">
          <animate attributeName="stop-color" values="#ef4444;#f59e0b;#ef4444" dur="3s" repeatCount="indefinite" />
        </stop>
        <stop offset="50%" stopColor="#3b82f6">
          <animate attributeName="stop-color" values="#3b82f6;#8b5cf6;#3b82f6" dur="3s" repeatCount="indefinite" />
        </stop>
        <stop offset="100%" stopColor="#06b6d4">
          <animate attributeName="stop-color" values="#06b6d4;#10b981;#06b6d4" dur="3s" repeatCount="indefinite" />
        </stop>
      </linearGradient>
      
      <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      
      <filter id="strongGlow" x="-150%" y="-150%" width="400%" height="400%">
        <feGaussianBlur stdDeviation="12" result="strongBlur"/>
        <feMerge> 
          <feMergeNode in="strongBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    {/* Outer aurora ring */}
    <circle cx="100" cy="100" r="98" fill="none" stroke="url(#auroraCore)" strokeWidth="4" opacity="0.3">
      <animate attributeName="opacity" values="0.1;0.5;0.1" dur="6s" repeatCount="indefinite" />
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        from="0 100 100"
        to="360 100 100"
        dur="25s"
        repeatCount="indefinite"
      />
    </circle>

    {/* Middle aurora ring */}
    <circle cx="100" cy="100" r="85" fill="none" stroke="url(#auroraCore)" strokeWidth="3" opacity="0.4">
      <animate attributeName="opacity" values="0.2;0.6;0.2" dur="5s" repeatCount="indefinite" />
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        from="360 100 100"
        to="0 100 100"
        dur="20s"
        repeatCount="indefinite"
      />
    </circle>

    {/* Main aurora background */}
    <circle cx="100" cy="100" r="75" fill="url(#auroraCore)" opacity="0.6">
      <animate attributeName="opacity" values="0.4;0.8;0.4" dur="4s" repeatCount="indefinite" />
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

    <g filter="url(#strongGlow)">
      {/* The big L shape filled with gradient */}
      <path
        d="M55 45 L55 155 L145 155 L145 130 L80 130 L80 45 Z"
        fill="url(#lGradient)"
        stroke="#ffffff"
        strokeWidth="4"
        opacity="0.95"
      >
        <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
      </path>
    </g>
    
    <g filter="url(#glow)">
      {/* Neural network dots - larger and more vibrant */}
      <circle cx="85" cy="70" r="6" fill="#10b981" opacity="1">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
        <animate attributeName="r" values="6;9;6" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="85" cy="70" r="12" fill="#10b981" opacity="0.3">
        <animate attributeName="opacity" values="0.1;0.4;0.1" dur="2s" repeatCount="indefinite" />
      </circle>
      
      <circle cx="110" cy="85" r="6" fill="#3b82f6" opacity="1">
        <animate attributeName="opacity" values="1;0.5;1" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="r" values="6;9;6" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="110" cy="85" r="12" fill="#3b82f6" opacity="0.3">
        <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2.5s" repeatCount="indefinite" />
      </circle>
      
      <circle cx="125" cy="110" r="6" fill="#8b5cf6" opacity="1">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
        <animate attributeName="r" values="6;9;6" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="125" cy="110" r="12" fill="#8b5cf6" opacity="0.3">
        <animate attributeName="opacity" values="0.1;0.4;0.1" dur="3s" repeatCount="indefinite" />
      </circle>

      {/* Additional neural dots */}
      <circle cx="95" cy="120" r="4" fill="#f59e0b" opacity="0.8">
        <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2.8s" repeatCount="indefinite" />
      </circle>
      
      <circle cx="115" cy="55" r="4" fill="#ef4444" opacity="0.8">
        <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.8s" repeatCount="indefinite" />
      </circle>

      {/* Connecting lines with animations */}
      <line x1="85" y1="70" x2="110" y2="85" stroke="url(#lGradient)" strokeWidth="3" opacity="0.7">
        <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2s" repeatCount="indefinite" />
        <animate attributeName="strokeWidth" values="3;5;3" dur="2s" repeatCount="indefinite" />
      </line>
      <line x1="110" y1="85" x2="125" y2="110" stroke="url(#lGradient)" strokeWidth="3" opacity="0.7">
        <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="strokeWidth" values="3;5;3" dur="2.5s" repeatCount="indefinite" />
      </line>
      <line x1="95" y1="120" x2="115" y2="55" stroke="url(#lGradient)" strokeWidth="2" opacity="0.5">
        <animate attributeName="opacity" values="0.2;0.7;0.2" dur="3.5s" repeatCount="indefinite" />
      </line>
    </g>
  </svg>
);

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('luantra_user', JSON.stringify(data.user));
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Connection failed. Please make sure the backend is running on port 3001.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Aurora background effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-black/20 backdrop-blur-sm rounded-3xl border border-purple-500/30 p-8 w-full max-w-md"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center mb-8"
          >
            <LuantraLogo className="w-20 h-20 mx-auto mb-4" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Luantra
            </h1>
            <p className="text-purple-300 mt-2">TALK • BUILD • DEPLOY</p>
          </motion.div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <label className="block text-purple-300 text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/30 border border-purple-500/30 rounded-lg pl-10 pr-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <label className="block text-purple-300 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/30 border border-purple-500/30 rounded-lg pl-10 pr-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 transition-colors"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white py-3 px-4 rounded-lg font-medium hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Access Your AI Platform</span>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p className="text-purple-300 text-sm">
              New to Luantra?{' '}
              <button
                onClick={() => router.push('/auth/register')}
                className="text-purple-400 hover:text-purple-300 underline font-medium"
              >
                Create Account
              </button>
            </p>
            <p className="text-purple-500 text-xs mt-3">
              TALK • BUILD • DEPLOY
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
