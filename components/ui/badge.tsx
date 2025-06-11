import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  className = '',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  children: React.ReactNode;
  variant?: 'default' | 'warning' | 'success' | 'error' | 'destructive' | 'outline' | 'secondary';
}) => {
  const base = 'inline-block px-2 py-1 text-xs font-semibold rounded';
  const variants: Record<string, string> = {
    default: 'bg-gray-100 text-gray-800',
    warning: 'bg-yellow-100 text-yellow-800',
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    destructive: 'bg-red-100 text-red-800',
    outline: 'border border-gray-300 text-gray-700 bg-transparent',
    secondary: 'bg-blue-100 text-blue-800',
  };
  return (
    <span
      role="status"
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
