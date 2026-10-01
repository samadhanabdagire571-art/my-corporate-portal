import React from 'react';
import { Card } from './Card';
import { cn } from '../../lib/utils';

export interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  colorScheme?: 'blue' | 'indigo' | 'cyan' | 'purple' | 'emerald' | 'amber';
  onClick?: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  trend,
  colorScheme = 'blue',
  onClick,
}) => {
  const iconColors = {
    blue: 'bg-corporate-50 text-corporate-600 border-corporate-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
  };

  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      className={cn('p-5', onClick && 'cursor-pointer')}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-navy-900 tracking-tight">{value}</span>
            {trend && (
              <span
                className={cn(
                  'text-xs font-medium px-1.5 py-0.5 rounded',
                  trend.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-navy-500 mt-1">{subtitle}</p>}
        </div>

        <div className={cn('p-3 rounded-xl border shrink-0', iconColors[colorScheme])}>
          {icon}
        </div>
      </div>
    </Card>
  );
};
