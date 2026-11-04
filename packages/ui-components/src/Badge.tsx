import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'primary', children, ...props }) => {
  const variantClasses = {
    primary: 'bg-[#F9E8ED] text-[#800D32] border border-[#F3D2DC]',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    error: 'bg-rose-50 text-rose-700 border border-rose-200',
    neutral: 'bg-gray-100 text-gray-700 border border-gray-200',
  };

  return (
    <span
      className={twMerge(
        clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide', variantClasses[variant], className)
      )}
      {...props}
    >
      {children}
    </span>
  );
};
