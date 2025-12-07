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
          bg: 'bg-gradient-to-r from-green-50 to-green-100',
          border: 'border-green-300',
          text: 'text-green-900',
          icon: 'text-green-600',
          iconBg: 'bg-green-100',
          shadow: 'shadow-green-200/50',
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-red-100',
          border: 'border-red-300',
          text: 'text-red-900',
          icon: 'text-red-600',
          iconBg: 'bg-red-100',
          shadow: 'shadow-red-200/50',
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-yellow-50 to-yellow-100',
          border: 'border-yellow-300',
          text: 'text-yellow-900',
          icon: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          shadow: 'shadow-yellow-200/50',
        };
      case 'info':
      default:
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
          border: 'border-blue-300',
          text: 'text-blue-900',
          icon: 'text-blue-600',
          iconBg: 'bg-blue-100',
          shadow: 'shadow-blue-200/50',
        };
    }
  };

  const colors = getColors();

  return (
    <div
      className={`
        ${colors.bg} ${colors.border} ${colors.text}
        border-l-4 rounded-lg p-4 shadow-xl min-w-[320px] max-w-md
        flex items-start gap-3 backdrop-blur-sm
        transform transition-all duration-300 ease-out
        translate-x-0 opacity-100 hover:shadow-2xl
        ${colors.shadow}
      `}
      role="alert"
    >
      <div className={`${colors.iconBg} rounded-full p-2 flex-shrink-0`}>
        <Icon icon={getIcon()} className={colors.icon} size="sm" />
      </div>
      <div className="flex-1 text-sm font-semibold leading-relaxed">{toast.message}</div>
      <button
        onClick={() => onDismiss(toast.id)}
        className={`${colors.icon} hover:opacity-70 transition-opacity flex-shrink-0 p-1 rounded hover:bg-white/50`}
        aria-label="Dismiss notification"
      >
        <Icon icon={faTimes} size="sm" />
      </button>
    </div>
  );
}

