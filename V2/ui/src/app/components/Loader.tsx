'use client';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

export default function Loader({ size = 'md', message, fullScreen = true }: LoaderProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const borderClasses = {
    sm: 'border-2',
    md: 'border-[3px]',
    lg: 'border-4',
  };

  const spinnerSize = sizeClasses[size];
  const borderSize = borderClasses[size];

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Google-style smooth spinner */}
      <div className={`${spinnerSize} relative`}>
        {/* Outer ring - subtle background */}
        <div
          className={`absolute inset-0 ${spinnerSize} ${borderSize} border-gray-200 rounded-full`}
        />
        {/* Animated arc - Google style with smooth easing */}
        <div
          className={`absolute inset-0 ${spinnerSize} ${borderSize} border-transparent border-t-primary-600 rounded-full`}
          style={{
            animation: 'google-spin 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite',
          }}
        />
        {/* Secondary arc for depth */}
        <div
          className={`absolute inset-0 ${spinnerSize} ${borderSize} border-transparent border-r-primary-400 rounded-full opacity-50`}
          style={{
            animation: 'google-spin 0.7s cubic-bezier(0.4, 0, 0.2, 1) infinite reverse',
          }}
        />
      </div>
      {message && (
        <p className="text-gray-600 text-sm font-medium">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        {content}
      </div>
    );
  }

  return content;
}

