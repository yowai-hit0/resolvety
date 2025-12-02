'use client';

import { ReactNode } from 'react';

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  icon?: ReactNode;
  rows?: number;
  options?: { value: string | number; label: string }[];
}

export default function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  icon,
  rows,
  options,
}: FormInputProps) {
  const inputClasses = `
    w-full px-4 py-3 bg-gray-50 border rounded-sm
    text-gray-900 placeholder-gray-500
    focus:outline-none focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary
    ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200'}
    ${icon ? 'pl-10' : ''}
  `;

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-3 text-gray-400">
              {icon}
            </div>
          )}
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            rows={rows || 4}
            className={inputClasses}
            placeholder={placeholder}
            required={required}
          />
        </div>
      ) : type === 'select' ? (
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
              {icon}
            </div>
          )}
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className={inputClasses}
            required={required}
          >
            <option value="">Select {label}</option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            className={inputClasses}
            placeholder={placeholder}
            required={required}
          />
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

