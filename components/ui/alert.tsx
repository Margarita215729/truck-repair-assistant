import React from 'react';

export const Alert = ({ 
  children, 
  variant = 'default',
  className = '',
  ...props
}: { 
  children: React.ReactNode; 
  variant?: 'default' | 'error' | 'warning' | 'info' | 'success';
  className?: string;
}) => {
  const base = 'p-4 rounded border-l-4';
  const variants: Record<string, string> = {
    default: 'bg-gray-50 border-gray-200 text-gray-800',
    error: 'bg-red-50 border-red-500 text-red-700',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-700',
    info: 'bg-blue-50 border-blue-500 text-blue-700',
    success: 'bg-green-50 border-green-500 text-green-700',
  };
  return <div role="alert" className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</div>;
};

export const AlertTitle = ({ 
  children,
  className = '',
  ...props
}: { 
  children: React.ReactNode;
  className?: string;
}) => (
  <p className={`font-semibold ${className}`} {...props}>{children}</p>
);

export const AlertDescription = ({ 
  children,
  className = '',
  ...props
}: { 
  children: React.ReactNode;
  className?: string;
}) => (
  <p className={`mt-1 text-sm ${className}`} {...props}>{children}</p>
);
