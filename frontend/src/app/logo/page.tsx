'use client';

import React from 'react';

const LuantraLogo = () => (
  <svg width="400" height="400" viewBox="0 0 200 200" className="mx-auto">
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

      <linearGradient id="secondaryWave" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="50%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
      
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>

      <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="8" result="strongBlur"/>
        <feMerge> 
          <feMergeNode in="strongBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    <circle cx="100" cy="100" r="95" fill="url(#auroraCore)" opacity="0.4">
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        from="0 100 100"
        to="360 100 100"
        dur="20s"
        repeatCount="indefinite"
      />
    </circle>
    
    <circle cx="100" cy="100" r="85" fill="url(#secondaryWave)" opacity="0.2">
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        from="360 100 100"
        to="0 100 100"
        dur="15s"
        repeatCount="indefinite"
      />
    </circle>

    <circle cx="100" cy="100" r="80" fill="none" stroke="url(#auroraWave)" strokeWidth="2" opacity="0.6">
      <animate attributeName="r" values="80;90;80" dur="4s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.6;0.2;0.6" dur="4s" repeatCount="indefinite" />
    </circle>

    <g filter="url(#strongGlow)">
      <path
        d="M60 40 L60 140 L140 140 L140 120 L80 120 L80 40 Z"
        fill="url(#auroraWave)"
        stroke="#ffffff"
        strokeWidth="3"
        opacity="0.95"
      >
        <animate attributeName="opacity" values="0.95;0.7;0.95" dur="6s" repeatCount="indefinite" />
      </path>
    </g>

    <path
      d="M62 42 L62 138 L138 138 L138 122 L82 122 L82 42 Z"
      fill="none"
      stroke="url(#secondaryWave)"
      strokeWidth="1"
      opacity="0.5"
    >
      <animate attributeName="opacity" values="0.5;0.8;0.5" dur="3s" repeatCount="indefinite" />
    </path>
      
    <g filter="url(#glow)">
      <circle cx="90" cy="60" r="5" fill="#4ade80" opacity="0.9">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
        <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="90" cy="60" r="8" fill="#4ade80" opacity="0.3">
        <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
      
      <circle cx="110" cy="80" r="5" fill="#3b82f6" opacity="0.9">
        <animate attributeName="opacity" values="1;0.4;1" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="r" values="5;7;5" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="110" cy="80" r="8" fill="#3b82f6" opacity="0.3">
        <animate attributeName="opacity" values="0.1;0.3;0.1" dur="2.5s" repeatCount="indefinite" />
      </circle>
      
      <circle cx="120" cy="100" r="5" fill="#8b5cf6" opacity="0.9">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
        <animate attributeName="r" values="5;7;5" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="120" cy="100" r="8" fill="#8b5cf6" opacity="0.3">
        <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite" />
      </circle>
    </g>

    <g filter="url(#glow)">
      <line x1="90" y1="60" x2="110" y2="80" stroke="url(#auroraWave)" strokeWidth="3" opacity="0.7">
        <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2s" repeatCount="indefinite" />
        <animate attributeName="stroke-width" values="3;5;3" dur="2s" repeatCount="indefinite" />
      </line>
      <line x1="110" y1="80" x2="120" y2="100" stroke="url(#auroraWave)" strokeWidth="3" opacity="0.7">
        <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="stroke-width" values="3;5;3" dur="2.5s" repeatCount="indefinite" />
      </line>
    </g>

    <circle cx="70" cy="50" r="2" fill="#f59e0b" opacity="0.8">
      <animateMotion dur="8s" repeatCount="indefinite">
        <path d="M70,50 Q100,30 130,50 Q150,80 120,110 Q90,130 60,110 Q40,80 70,50" />
      </animateMotion>
      <animate attributeName="opacity" values="0;1;0" dur="8s" repeatCount="indefinite" />
    </circle>
    
    <circle cx="130" cy="70" r="2" fill="#06b6d4" opacity="0.8">
      <animateMotion dur="10s" repeatCount="indefinite">
        <path d="M130,70 Q110,40 80,60 Q50,90 80,120 Q110,140 130,110 Q150,80 130,70" />
      </animateMotion>
      <animate attributeName="opacity" values="0;1;0" dur="10s" repeatCount="indefinite" />
    </circle>

    <circle cx="85" cy="125" r="2" fill="#10b981" opacity="0.8">
      <animateMotion dur="12s" repeatCount="indefinite">
        <path d="M85,125 Q60,100 90,75 Q120,50 140,75 Q160,100 130,125 Q100,150 85,125" />
      </animateMotion>
      <animate attributeName="opacity" values="0;1;0" dur="12s" repeatCount="indefinite" />
    </circle>
  </svg>
);

const LogoPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <LuantraLogo />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mt-8">
          Luantra Logo
        </h1>
        <p className="text-purple-300 mt-4">Right-click and save image, or take a screenshot</p>
      </div>
    </div>
  );
};

export default LogoPage;
