import React from 'react';

interface MatchGaugeProps {
  percentage: number | null;
  size?: 'sm' | 'lg';
  onClick?: () => void;
  label?: string;
  loading?: boolean;
}

export function MatchGauge({ percentage, size = 'sm', onClick, label, loading = false }: MatchGaugeProps) {
  const isLarge = size === 'lg';
  const width = isLarge ? 240 : 200;
  const height = isLarge ? 160 : 130;
  
  // Calculate the angle for the needle based on the percentage
  const angle = percentage !== null && !isNaN(percentage) ? (percentage * 180) / 100 - 90 : -90;
  
  // Determine color based on percentage
  const getGradientId = () => 'gauge-gradient';
  
  return (
    <div 
      className={`relative inline-flex flex-col items-center ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      style={{ marginTop: '-12px' }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="transform"
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id={getGradientId()} x1="0%" y1="0%" x2="100%">
            <stop offset="0%" style={{ stopColor: '#ef4444' }} />
            <stop offset="50%" style={{ stopColor: '#eab308' }} />
            <stop offset="100%" style={{ stopColor: '#22c55e' }} />
          </linearGradient>
        </defs>
        
        {/* Background arc */}
        <path
          d={`M 20 ${height - 10} A ${width / 2 - 20} ${width / 2 - 20} 0 0 1 ${width - 20} ${height - 10}`}
          fill="none"
          stroke="#1f2937"
          strokeWidth="16"
          strokeLinecap="round"
        />
        
        {/* Percentage arc */}
        {percentage !== null && !isNaN(percentage) && !loading && (
          <path
            d={`M 20 ${height - 10} A ${width / 2 - 20} ${width / 2 - 20} 0 0 1 ${width - 20} ${height - 10}`}
            fill="none"
            stroke={`url(#${getGradientId()})`}
            strokeWidth="16"
            strokeLinecap="round"
            style={{
              strokeDasharray: `${(percentage * 5.6).toFixed(2)}, 560`,
            }}
            className="transition-all duration-500 ease-out"
          />
        )}
        
        {/* Loading animation */}
        {loading && (
          <path
            d={`M 20 ${height - 10} A ${width / 2 - 20} ${width / 2 - 20} 0 0 1 ${width - 20} ${height - 10}`}
            fill="none"
            stroke={`url(#${getGradientId()})`}
            strokeWidth="16"
            strokeLinecap="round"
            className="animate-gauge-loading"
            style={{
              strokeDasharray: '140, 560',
            }}
          />
        )}
        
        {/* Needle */}
        {percentage !== null && !isNaN(percentage) && !loading && (
          <g transform={`translate(${width / 2}, ${height - 10})`}>
            <line
              x1="0"
              y1="4"
              x2="0"
              y2={-width / 2 + 40}
              stroke="#ffffff"
              strokeWidth="3"
              transform={`rotate(${angle})`}
              style={{
                transformOrigin: 'center',
                transition: 'transform 0.5s ease-out',
              }}
            />
            <circle
              cx="0"
              cy="0"
              r="8"
              fill="#ffffff"
            />
          </g>
        )}
      </svg>
      
      {/* Percentage text */}
      <div className="mt-2">
        {loading ? (
          <span className={`text-blue-400 font-medium ${isLarge ? 'text-2xl' : 'text-xl'}`}>
            Processing
          </span>
        ) : percentage !== null && !isNaN(percentage) ? (
          <span className={`font-semibold ${isLarge ? 'text-3xl' : 'text-2xl'}`}>
            {Math.round(percentage)}%
          </span>
        ) : (
          <span className={`text-gray-500 font-medium ${isLarge ? 'text-2xl' : 'text-xl'}`}>
            N/A
          </span>
        )}
      </div>
      
      {/* Optional label */}
      {label && (
        <span className="text-sm text-gray-400 whitespace-nowrap mt-1">
          {label}
        </span>
      )}
    </div>
  );
}