import React from 'react';

export const Progress = ({
  value,
  max = 100,
  className = '',
  ...props
}: {
  value: number;
  max?: number;
  className?: string;
}) => {
  const percentage = (value / max) * 100;
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`} {...props}>
      <div
        className="bg-blue-600 h-2 rounded-full"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
