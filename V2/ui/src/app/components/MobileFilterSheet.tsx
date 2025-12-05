'use client';

import { ReactNode } from 'react';
import Icon, { faTimes, faSearch } from './Icon';

interface FilterField {
  type: 'text' | 'select' | 'number' | 'date';
  label: string;
  name: string;
  value: any;
  placeholder?: string;
  options?: Array<{ value: any; label: string }>;
  onChange: (value: any) => void;
}

interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  fields: FilterField[];
  onApply?: () => void;
  onReset?: () => void;
  showApplyButton?: boolean;
  showResetButton?: boolean;
}

export default function MobileFilterSheet({
  isOpen,
  onClose,
  title = 'Filters',
  fields,
  onApply,
  onReset,
  showApplyButton = false,
  showResetButton = false,
}: MobileFilterSheetProps) {
  if (!isOpen) return null;

  const handleFieldChange = (field: FilterField, value: any) => {
    field.onChange(value);
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-sm transition-colors"
            aria-label="Close filters"
          >
            <Icon icon={faTimes} className="text-gray-500" size="sm" />
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
              </label>
              
              {field.type === 'text' && (
                <div className="relative">
                  <Icon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size="sm" />
                  <input
                    type="text"
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                    value={field.value || ''}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                  />
                </div>
              )}
              
              {field.type === 'select' && (
                <select
                  value={field.value || ''}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                >
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
              
              {field.type === 'number' && (
                <input
                  type="number"
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                  value={field.value || ''}
                  onChange={(e) => handleFieldChange(field, e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                />
              )}
              
              {field.type === 'date' && (
                <input
                  type="date"
                  value={field.value || ''}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                />
              )}
            </div>
          ))}
        </div>

        {(showApplyButton || showResetButton) && (
          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
            {showResetButton && onReset && (
              <button
                onClick={() => {
                  onReset();
                  onClose();
                }}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            )}
            {showApplyButton && onApply && (
              <button
                onClick={() => {
                  onApply();
                  onClose();
                }}
                className="flex-1 px-4 py-2 text-sm bg-primary-500 text-white rounded-sm hover:bg-primary-600 transition-colors"
                style={{ backgroundColor: '#0f36a5' }}
              >
                Apply Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

