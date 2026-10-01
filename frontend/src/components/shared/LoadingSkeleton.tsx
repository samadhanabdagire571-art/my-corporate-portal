import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ rows = 5, columns = 6 }) => {
  return (
    <div className="w-full bg-white rounded-xl border border-navy-200 overflow-hidden animate-pulse">
      <div className="h-11 bg-navy-100/60 border-b border-navy-200" />
      <div className="divide-y divide-navy-100">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center gap-4 px-4 py-3.5">
            {Array.from({ length: columns }).map((_, cIdx) => (
              <div
                key={cIdx}
                className="h-4 bg-navy-200/70 rounded"
                style={{ width: `${Math.max(15, (cIdx + 1) * 14)}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-navy-200 p-5 shadow-card animate-pulse space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-3.5 w-24 bg-navy-200 rounded" />
        <div className="w-9 h-9 rounded-xl bg-navy-100" />
      </div>
      <div className="h-8 w-20 bg-navy-300 rounded" />
      <div className="h-3 w-32 bg-navy-200 rounded" />
    </div>
  );
};
