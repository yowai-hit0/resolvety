'use client';

import { useEffect } from 'react';
import Icon, { faCheckCircle, faExclamationCircle, faCircle, faTimes, faTimesCircle } from './Icon';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

export default function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(toast.id);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return faCheckCircle;
      case 'error':
        return faTimesCircle;
      case 'warning':
        return faExclamationCircle;
      case 'info':
      default:
        return faCircle;
    }
  };

  const getColors = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: 'text-green-600',
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: 'text-red-600',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: 'text-yellow-600',
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: 'text-blue-600',
        };
    }
  };

  const colors = getColors();

  return (
    <div
      className={`
        ${colors.bg} ${colors.border} ${colors.text}
        border rounded-sm p-4 shadow-lg min-w-[300px] max-w-md
        flex items-start gap-3
        transform transition-all duration-300 ease-out
        translate-x-0 opacity-100
      `}
      role="alert"
    >
      <Icon icon={getIcon()} className={`${colors.icon} flex-shrink-0 mt-0.5`} size="sm" />
      <div className="flex-1 text-sm font-medium">{toast.message}</div>
      <button
        onClick={() => onDismiss(toast.id)}
        className={`${colors.icon} hover:opacity-70 transition-opacity flex-shrink-0`}
        aria-label="Dismiss notification"
      >
        <Icon icon={faTimes} size="sm" />
      </button>
    </div>
  );
}

