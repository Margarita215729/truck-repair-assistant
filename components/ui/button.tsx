import React from 'react';

export const Button = ({
  children,
  onClick,
  variant = 'default',
  size = 'default',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}) => {
  const base = 'rounded-md font-medium focus:outline-none disabled:opacity-50';
  const variants: Record<string, string> = {
    default: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-green-600 text-white hover:bg-green-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50',
  };
  const sizes: Record<string, string> = {
    default: 'px-4 py-2',
    sm: 'px-2 py-1 text-sm',
    lg: 'px-6 py-3 text-lg',
  };
  const classes = `${base} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`;
  return (
    <button className={classes} onClick={onClick} {...props}>
      {children}
    </button>
  );
};
