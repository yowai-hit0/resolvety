'use client';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className = '', width, height }: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`skeleton ${className}`}
      style={style}
    />
  );
}

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  showHeader?: boolean;
}

export function TableSkeleton({ rows = 5, cols = 4, showHeader = true }: TableSkeletonProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
      {showHeader && (
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
          <div className="flex gap-4">
            {Array.from({ length: cols }).map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
        </div>
      )}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-3">
            <div className="flex gap-4">
              {Array.from({ length: cols }).map((_, j) => (
                <Skeleton key={j} className="h-4 flex-1" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CardSkeletonProps {
  lines?: number;
  showAvatar?: boolean;
  showActions?: boolean;
}

export function CardSkeleton({ lines = 3, showAvatar = false, showActions = false }: CardSkeletonProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-sm p-4">
      <div className="flex items-start gap-3">
        {showAvatar && (
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
        )}
        <div className="flex-1 space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-4"
              width={i === lines - 1 ? '75%' : '100%'}
            />
          ))}
        </div>
        {showActions && (
          <Skeleton className="w-8 h-8 rounded-sm flex-shrink-0" />
        )}
      </div>
    </div>
  );
}

interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
}

export function ListSkeleton({ items = 5, showAvatar = false }: ListSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-sm">
          {showAvatar && (
            <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4" width="60%" />
            <Skeleton className="h-3" width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface StatCardSkeletonProps {
  showIcon?: boolean;
}

export function StatCardSkeleton({ showIcon = true }: StatCardSkeletonProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-sm p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
        {showIcon && (
          <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
        )}
      </div>
    </div>
  );
}

