'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

function Input({ label, error, id, className, ...props }: InputProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-300"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...props}
        className={`rounded-lg border bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 ${
          error ? 'border-red-500/50' : 'border-white/10'
        } ${className ?? ''}`}
      />
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}

export { Input };
