export const LuantraLogo = ({ className }: { className?: string }) => (
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
