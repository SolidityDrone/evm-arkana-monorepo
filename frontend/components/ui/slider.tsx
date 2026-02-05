'use client';

import * as React from 'react';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  className = '',
}: SliderProps) {
  const percentage = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <div className={`relative w-full h-8 ${className}`}>
      {/* Background track */}
      <div 
        className="absolute top-1/2 -translate-y-1/2 w-full h-2 rounded-full"
        style={{ backgroundColor: '#374151' }}
      />
      
      {/* Filled track */}
      <div 
        className="absolute top-1/2 -translate-y-1/2 h-2 rounded-full"
        style={{ 
          width: `${percentage}%`,
          backgroundColor: '#8b5cf6',
          boxShadow: '0 0 12px rgba(139, 92, 246, 0.6)'
        }}
      />
      
      {/* Visual thumb */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full pointer-events-none"
        style={{ 
          left: `calc(${percentage}% - 10px)`,
          backgroundColor: '#7c3aed',
          border: '2px solid #8b5cf6',
          boxShadow: '0 0 15px rgba(139, 92, 246, 0.8)'
        }}
      />
      
      {/* Native range input - full size, transparent but functional */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          margin: 0,
          padding: 0,
          opacity: 0,
          cursor: disabled ? 'not-allowed' : 'pointer',
          zIndex: 10,
        }}
      />
    </div>
  );
}
