'use client';

import Icon from './Icon';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface EmptyStateProps {
  icon?: IconDefinition;
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function EmptyState({
  icon,
  title = 'No data available',
  message = 'There are no items to display at this time.',
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Icon icon={icon} className="text-gray-400" size="2x" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {message && (
        <p className="text-sm text-gray-600 max-w-md mb-6">{message}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-primary-500 text-white rounded-sm hover:bg-primary-600 transition-colors text-sm font-medium"
          style={{ backgroundColor: '#0f36a5' }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

