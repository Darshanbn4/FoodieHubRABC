import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    helperText,
    className = '',
    id,
    ...props 
  }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    const baseClasses = 'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors';
    const normalClasses = 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500';
    const errorClasses = 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500';
    const bgClasses = 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white';
    const disabledClasses = 'disabled:opacity-50 disabled:cursor-not-allowed';
    
    const inputClasses = `${baseClasses} ${error ? errorClasses : normalClasses} ${bgClasses} ${disabledClasses} ${className}`.trim();
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
