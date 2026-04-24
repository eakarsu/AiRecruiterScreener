import React from 'react';

const Skeleton = ({ className = '', variant = 'text', count = 1 }) => {
  const baseClass = 'animate-pulse bg-gray-200 rounded';

  const variants = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    avatar: 'h-10 w-10 rounded-full',
    button: 'h-9 w-24',
    badge: 'h-6 w-16 rounded-full',
    card: 'h-48 w-full',
    image: 'h-32 w-full',
  };

  const items = Array.from({ length: count }, (_, i) => (
    <div key={i} className={`${baseClass} ${variants[variant] || ''} ${className}`} />
  ));

  return count === 1 ? items[0] : <>{items}</>;
};

// Pre-built skeleton layouts
export const TableSkeleton = ({ rows = 5, cols = 6 }) => (
  <div className="overflow-hidden">
    {/* Header */}
    <div className="flex gap-4 p-4 bg-gray-50 border-b">
      {Array.from({ length: cols }, (_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }, (_, row) => (
      <div key={row} className="flex gap-4 p-4 border-b border-gray-100">
        {Array.from({ length: cols }, (_, col) => (
          <Skeleton key={col} className={`h-4 flex-1 ${col === 0 ? 'w-1/4' : ''}`} />
        ))}
      </div>
    ))}
  </div>
);

export const CardSkeleton = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="avatar" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="title" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton />
          <Skeleton className="w-5/6" />
          <Skeleton className="w-4/6" />
        </div>
        <div className="flex gap-2">
          <Skeleton variant="badge" />
          <Skeleton variant="badge" />
        </div>
      </div>
    ))}
  </div>
);

export const StatsSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="card p-6 space-y-3">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    ))}
  </div>
);

export const DetailSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <Skeleton variant="avatar" className="w-16 h-16" />
      <div className="space-y-2 flex-1">
        <Skeleton variant="title" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <Skeleton />
        <Skeleton className="w-5/6" />
        <Skeleton className="w-4/6" />
      </div>
      <div className="space-y-3">
        <Skeleton />
        <Skeleton className="w-5/6" />
        <Skeleton className="w-4/6" />
      </div>
    </div>
  </div>
);

export default Skeleton;
