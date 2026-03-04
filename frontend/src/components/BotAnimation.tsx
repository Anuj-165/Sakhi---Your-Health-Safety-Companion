import React from 'react';
import { motion } from 'framer-motion';

interface BotAnimationProps {
  size?: 'sm' | 'md' | 'lg';
  isAnimating?: boolean;
}

const BotAnimation: React.FC<BotAnimationProps> = ({ size = 'md', isAnimating = true }) => {
  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-40 h-40',
    lg: 'w-64 h-64',
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer Glow/Halo */}
      {isAnimating && (
        <motion.div
          className={`absolute ${sizeClasses[size]} rounded-full bg-primary/20 blur-xl`}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      )}

      <motion.div
        className={`${sizeClasses[size]} relative z-10`}
        animate={isAnimating ? { y: [0, -8, 0] } : {}}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full filter drop-shadow-lg"
        >
          {/* Hair / Background Shape */}
          <path
            d="M40 100C40 44.7715 84.7715 0 140 0C195.228 0 220 60 180 120C160 150 140 180 100 180C60 180 40 155.228 40 100Z"
            fill="url(#sakhi_gradient)"
          />

          {/* Face Base */}
          <path
            d="M60 100C60 77.9086 77.9086 60 100 60C122.091 60 140 77.9086 140 100C140 122.091 122.091 145 100 145C77.9086 145 60 122.091 60 100Z"
            fill="white"
            fillOpacity="0.9"
          />

          {/* Realistic Eyes */}
          <g className="eyes">
            {/* Left Eye */}
            <circle cx="85" cy="95" r="4" fill="#4F46E5" />
            <motion.rect
              x="80" y="90" width="10" height="10" fill="white"
              animate={{ height: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, times: [0, 0.95, 1] }}
            />
            
            {/* Right Eye */}
            <circle cx="115" cy="95" r="4" fill="#4F46E5" />
            <motion.rect
              x="110" y="90" width="10" height="10" fill="white"
              animate={{ height: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, times: [0, 0.95, 1] }}
            />
          </g>

          {/* Mouth / Smile */}
          <motion.path
            d="M90 115C90 115 95 120 100 120C105 120 110 115 110 115"
            stroke="#4F46E5"
            strokeWidth="2"
            strokeLinecap="round"
            animate={isAnimating ? { d: ["M90 115C90 115 95 120 100 120C105 120 110 115 110 115", "M85 115C85 115 92 125 100 125C108 125 115 115 115 115", "M90 115C90 115 95 120 100 120C105 120 110 115 110 115"] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Decorative Blush */}
          <circle cx="75" cy="110" r="3" fill="#FDA4AF" fillOpacity="0.5" />
          <circle cx="125" cy="110" r="3" fill="#FDA4AF" fillOpacity="0.5" />

          <defs>
            <linearGradient id="sakhi_gradient" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366F1" />
              <stop offset="1" stopColor="#EC4899" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Modern Voice Visualization (Circular) */}
      {isAnimating && (
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute border-2 border-indigo-400 rounded-full"
              style={{ width: '100%', height: '100%' }}
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.6,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BotAnimation;