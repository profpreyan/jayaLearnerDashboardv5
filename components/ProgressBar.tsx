import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  subLabel?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, label, subLabel, size = 'md' }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const heightClass = size === 'sm' ? 'h-1.5' : size === 'md' ? 'h-2' : 'h-3';

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-end text-xs uppercase tracking-wider text-gray-400">
        <span className="font-semibold text-white/80">{label}</span>
        <span>{subLabel || `${Math.round(percentage)}%`}</span>
      </div>
      <div className={`w-full bg-white/5 rounded-full overflow-hidden ${heightClass} border border-white/5`}>
        <div 
          className={`bg-accent shadow-[0_0_15px_rgba(220,38,38,0.5)] h-full rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};