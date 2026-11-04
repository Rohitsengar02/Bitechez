import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={twMerge(
            clsx(
              'w-full px-3.5 py-2 bg-white border rounded-lg text-sm text-[#191923] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#800D32] focus:border-transparent transition-colors',
              error ? 'border-red-500' : 'border-gray-200',
              className
            )
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

