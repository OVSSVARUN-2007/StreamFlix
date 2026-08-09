import React from 'react';

export function HeroSkeleton() {
  return (
    <div className="w-full h-[70vh] sm:h-[80vh] animate-shimmer relative overflow-hidden">
      <div className="absolute bottom-16 left-8 space-y-4 max-w-xl">
        <div className="w-48 h-6 bg-white/10 rounded"></div>
        <div className="w-96 h-12 bg-white/10 rounded"></div>
        <div className="w-full h-16 bg-white/10 rounded"></div>
        <div className="flex space-x-4">
          <div className="w-32 h-10 bg-white/10 rounded"></div>
          <div className="w-32 h-10 bg-white/10 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="py-4 px-4 sm:px-8 space-y-3">
      <div className="w-48 h-6 bg-white/10 rounded animate-shimmer"></div>
      <div className="flex space-x-4 overflow-hidden py-2">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="w-44 h-64 bg-white/10 rounded-xl animate-shimmer flex-shrink-0"></div>
        ))}
      </div>
    </div>
  );
}
