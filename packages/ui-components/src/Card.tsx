import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, hoverable = false, children, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white rounded-xl border border-gray-100 shadow-sm p-4 transition-all duration-150',
          hoverable && 'hover:shadow-md hover:border-[#F3D2DC] cursor-pointer',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
