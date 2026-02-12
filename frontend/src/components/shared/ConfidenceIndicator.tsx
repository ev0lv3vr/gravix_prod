'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface ConfidenceIndicatorProps {
  confidence?: number; // 0-1 or 0-100
  score?: number; // Alias for confidence
  size?: 'default' | 'small' | 'large';
  className?: string;
}

export function ConfidenceIndicator({ confidence, score, size = 'default', className }: ConfidenceIndicatorProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Use either confidence or score prop
  const value = confidence ?? score ?? 0;
  
  // Normalize to 0-100
  const percentage = value > 1 ? value : value * 100;
  
  // Detect mobile for responsive sizing
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Get color and label based on confidence
  const getConfidenceData = (value: number) => {
    if (value >= 90) return { color: '#10B981', label: 'High Confidence', textColor: 'text-success' };
    if (value >= 70) return { color: '#3B82F6', label: 'Good Confidence', textColor: 'text-accent-500' };
    if (value >= 50) return { color: '#F59E0B', label: 'Moderate — Verify', textColor: 'text-warning' };
    return { color: '#EF4444', label: 'Low — Requires Testing', textColor: 'text-danger' };
  };

  const { color, label, textColor } = getConfidenceData(percentage);
  
  // Animate the circle fill
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const diameter = size === 'small' ? 36 : size === 'large' ? 64 : (isMobile ? 36 : 48);
  const strokeWidth = size === 'small' ? 3 : size === 'large' ? 5 : (isMobile ? 3 : 4);
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedValue / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      {/* SVG Ring */}
      <div className="relative" style={{ width: diameter, height: diameter }}>
        <svg width={diameter} height={diameter} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            fill="none"
            stroke="#374151"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-deliberate ease-out-crisp"
          />
        </svg>
        
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-mono font-bold', size === 'small' ? 'text-sm' : 'text-base', textColor)}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      
      {/* Label */}
      <span className={cn('font-medium text-center', size === 'small' ? 'text-xs' : 'text-sm', textColor)}>
        {label}
      </span>
    </div>
  );
}
