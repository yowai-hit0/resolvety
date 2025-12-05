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

interface ChartSkeletonProps {
  height?: number;
  showTitle?: boolean;
}

export function ChartSkeleton({ height = 300, showTitle = true }: ChartSkeletonProps) {
  return (
    <div className="bg-white rounded-sm border border-gray-200 p-6">
      {showTitle && (
        <div className="mb-4">
          <Skeleton className="h-5 w-48" />
        </div>
      )}
      <div className="flex items-end justify-between gap-2" style={{ height: `${height}px` }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            height={Math.random() * 60 + 40 + '%'}
          />
        ))}
      </div>
    </div>
  );
}

interface DetailPageSkeletonProps {
  showHeader?: boolean;
  showStats?: boolean;
  showTabs?: boolean;
}

export function DetailPageSkeleton({ 
  showHeader = true, 
  showStats = false, 
  showTabs = false 
}: DetailPageSkeletonProps) {
  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
      )}
      
      {showStats && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      )}
      
      {showTabs && (
        <div className="border-b border-gray-200">
          <div className="flex gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-white border border-gray-200 rounded-sm p-6 space-y-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface TicketCardSkeletonProps {
  count?: number;
}

export function TicketCardSkeleton({ count = 5 }: TicketCardSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-sm p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-3" />
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface TicketDetailSkeletonProps {}

export function TicketDetailSkeleton({}: TicketDetailSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Card */}
          <div className="bg-white border border-gray-200 rounded-sm p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Comments Section */}
          <div className="bg-white border border-gray-200 rounded-sm p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Details Card */}
          <div className="bg-white border border-gray-200 rounded-sm p-6 space-y-4">
            <Skeleton className="h-6 w-24" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>

          {/* Tags Card */}
          <div className="bg-white border border-gray-200 rounded-sm p-6 space-y-4">
            <Skeleton className="h-6 w-16" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-20 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

