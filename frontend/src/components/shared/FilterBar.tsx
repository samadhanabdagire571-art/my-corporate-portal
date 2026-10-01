import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterField {
  id: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (val: string) => void;
}

export interface FilterBarProps {
  filters: FilterField[];
  onReset?: () => void;
  activeCount?: number;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onReset,
  activeCount = 0,
  className,
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className || ''}`}>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-navy-600 mr-1">
        <Filter className="w-3.5 h-3.5 text-navy-500" />
        <span>Filters:</span>
        {activeCount > 0 && (
          <span className="bg-corporate-100 text-corporate-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {activeCount}
          </span>
        )}
      </div>

      {filters.map((filter) => (
        <div key={filter.id} className="relative">
          <select
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="text-xs font-medium bg-white text-navy-800 border border-navy-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-corporate-500/20 focus:border-corporate-600 transition-all cursor-pointer shadow-subtle"
          >
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      {onReset && activeCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-xs text-navy-600 hover:text-navy-900 py-1.5 px-2"
          leftIcon={<RotateCcw className="w-3 h-3" />}
        >
          Reset
        </Button>
      )}
    </div>
  );
};
