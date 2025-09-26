'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock, User, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

const LuantraLogo = ({ className }: { className?: string }) => (
  <svg width="100" height="100" viewBox="0 0 200 200" className={className}>
    <defs>
      <radialGradient id="auroraCore" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.9">
          <animate attributeName="stop-opacity" values="0.9;0.5;0.9" dur="3s" repeatCount="indefinite" />
        </stop>
        <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.7">
          <animate attributeName="stop-opacity" values="0.7;0.3;0.7" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.5">
          <animate attributeName="stop-opacity" values="0.5;0.2;0.5" dur="5s" repeatCount="indefinite" />
        </stop>
      </radialGradient>
      
      <linearGradient id="auroraWave" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b">
          <animate attributeName="stop-color" values="#f59e0b;#ef4444;#f59e0b" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop offset="25%" stopColor="#ef4444">
          <animate attributeName="stop-color" values="#ef4444;#8b5cf6;#ef4444" dur="3s" repeatCount="indefinite" />
        </stop>
        <stop offset="50%" stopColor="#8b5cf6">
          <animate attributeName="stop-color" values="#8b5cf6;#3b82f6;#8b5cf6" dur="5s" repeatCount="indefinite" />
        </stop>
        <stop offset="75%" stopColor="#3b82f6">
          <animate attributeName="stop-color" values="#3b82f6;#06b6d4;#3b82f6" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop offset="100%" stopColor="#06b6d4">
          <animate attributeName="stop-color" values="#06b6d4;#10b981;#06b6d4" dur="6s" repeatCount="indefinite" />
        </stop>
      </linearGradient>
      
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
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

    <g filter="url(#glow)">
      <path
        d="M60 40 L60 140 L140 140 L140 120 L80 120 L80 40 Z"
        fill="url(#auroraWave)"
        stroke="#ffffff"
        strokeWidth="2"
        opacity="0.9"
      />
      
      <circle cx="90" cy="60" r="4" fill="#4ade80" opacity="0.8">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="110" cy="80" r="4" fill="#3b82f6" opacity="0.8">
        <animate attributeName="opacity" values="1;0.5;1" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="120" cy="100" r="4" fill="#8b5cf6" opacity="0.8">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
      </circle>

      <line x1="90" y1="60" x2="110" y2="80" stroke="url(#auroraWave)" strokeWidth="2" opacity="0.6">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
      </line>
      <line x1="110" y1="80" x2="120" y2="100" stroke="url(#auroraWave)" strokeWidth="2" opacity="0.6">
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2.5s" repeatCount="indefinite" />
      </line>
    </g>
  </svg>
);

const RegisterPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('https://luantra-backend-fldu2pxc4a-uc.a.run.app/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        setErrors({ general: data.error || 'Registration failed' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-black/20 backdrop-blur-md rounded-3xl border border-green-500/30 p-8 text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
          <p className="text-green-300">Redirecting to login...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Aurora background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-black/20 backdrop-blur-md rounded-3xl border border-purple-500/30 p-10 w-full max-w-lg shadow-2xl shadow-purple-500/20"
        >
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-6"
            >
              <LuantraLogo className="mx-auto" />
            </motion.div>
            
            <motion.h1 
              className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Join Luantra
            </motion.h1>
            <motion.p 
              className="text-purple-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Create your personal AI platform
            </motion.p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center space-x-2 text-red-300"
              >
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{errors.general}</span>
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-white text-sm font-medium mb-2">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 bg-black/30 border rounded-xl text-white placeholder-purple-300 focus:outline-none transition-all duration-300 ${
                      errors.firstName ? 'border-red-500/50 focus:border-red-400' : 'border-purple-500/30 focus:border-purple-400'
                    }`}
                    placeholder="First name"
                    required
                  />
                </div>
                {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label className="block text-white text-sm font-medium mb-2">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 bg-black/30 border rounded-xl text-white placeholder-purple-300 focus:outline-none transition-all duration-300 ${
                      errors.lastName ? 'border-red-500/50 focus:border-red-400' : 'border-purple-500/30 focus:border-purple-400'
                    }`}
                    placeholder="Last name"
                    required
                  />
                </div>
                {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <label className="block text-white text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 bg-black/30 border rounded-xl text-white placeholder-purple-300 focus:outline-none transition-all duration-300 ${
                    errors.email ? 'border-red-500/50 focus:border-red-400' : 'border-purple-500/30 focus:border-purple-400'
                  }`}
                  placeholder="Enter your email"
                  required
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <label className="block text-white text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 bg-black/30 border rounded-xl text-white placeholder-purple-300 focus:outline-none transition-all duration-300 ${
                    errors.password ? 'border-red-500/50 focus:border-red-400' : 'border-purple-500/30 focus:border-purple-400'
                  }`}
                  placeholder="Create a password"
                  required
                />
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
            >
              <label className="block text-white text-sm font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 bg-black/30 border rounded-xl text-white placeholder-purple-300 focus:outline-none transition-all duration-300 ${
                    errors.confirmPassword ? 'border-red-500/50 focus:border-red-400' : 'border-purple-500/30 focus:border-purple-400'
                  }`}
                  placeholder="Confirm your password"
                  required
                />
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
            </motion.div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create AI Platform Account</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <p className="text-purple-300 text-sm">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/auth/login')}
                className="text-purple-400 hover:text-purple-300 underline font-medium"
              >
                Sign in
              </button>
            </p>
            <p className="text-purple-500 text-xs mt-3">TALK BUILD DEPLOY</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
