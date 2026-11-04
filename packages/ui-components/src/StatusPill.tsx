import React from 'react';

export interface StatusPillProps {
  status: string;
  variant?: 'success' | 'warning' | 'error' | 'neutral' | 'info';
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, variant = 'neutral' }) => {
  const dotColor = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-rose-500',
    info: 'bg-blue-500',
    neutral: 'bg-gray-400',
  }[variant];

  const bgColor = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-100',
    warning: 'bg-amber-50 text-amber-800 border-amber-100',
    error: 'bg-rose-50 text-rose-800 border-rose-100',
    info: 'bg-blue-50 text-blue-800 border-blue-100',
    neutral: 'bg-gray-50 text-gray-700 border-gray-100',
  }[variant];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${bgColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span className="capitalize">{status.replace(/_/g, ' ')}</span>
    </span>
  );
};

