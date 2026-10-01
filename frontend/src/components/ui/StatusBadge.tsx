import React from 'react';
import { cn } from '../../lib/utils';

export interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm', className }) => {
  const normalized = status ? status.toUpperCase() : 'UNKNOWN';

  let colorClasses = 'bg-navy-100 text-navy-700 border-navy-200';
  let dotColor = 'bg-navy-400';

  switch (normalized) {
    case 'ACTIVE':
    case 'COMPLETED':
    case 'APPROVED':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      dotColor = 'bg-emerald-500';
      break;
    case 'UNASSIGNED':
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-300 font-semibold';
      dotColor = 'bg-amber-500';
      break;
    case 'ASSIGNED':
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
      dotColor = 'bg-blue-500';
      break;
    case 'IN_PROGRESS':
    case 'PLANNING':
      colorClasses = 'bg-corporate-50 text-corporate-700 border-corporate-200';
      dotColor = 'bg-corporate-500';
      break;
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
      colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      dotColor = 'bg-indigo-500';
      break;
    case 'REVISION_REQUIRED':
    case 'CANCELLED':
    case 'SUSPENDED':
    case 'CRITICAL':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
      dotColor = 'bg-rose-500';
      break;
    case 'HIGH':
      colorClasses = 'bg-orange-50 text-orange-700 border-orange-200';
      dotColor = 'bg-orange-500';
      break;
    case 'MEDIUM':
    case 'NORMAL':
      colorClasses = 'bg-sky-50 text-sky-700 border-sky-200';
      dotColor = 'bg-sky-500';
      break;
    case 'LOW':
    case 'NOT_STARTED':
    case 'INACTIVE':
    case 'ARCHIVED':
    case 'TERMINATED':
      colorClasses = 'bg-navy-100 text-navy-600 border-navy-200';
      dotColor = 'bg-navy-400';
      break;
    case 'ON_HOLD':
    case 'ON_LEAVE':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
      dotColor = 'bg-amber-500';
      break;
    case 'ADMIN':
      colorClasses = 'bg-purple-50 text-purple-700 border-purple-200';
      dotColor = 'bg-purple-500';
      break;
    case 'TEAM_LEADER':
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
      dotColor = 'bg-blue-500';
      break;
    case 'EMPLOYEE':
      colorClasses = 'bg-teal-50 text-teal-700 border-teal-200';
      dotColor = 'bg-teal-500';
      break;
    case 'INTERN':
      colorClasses = 'bg-cyan-50 text-cyan-700 border-cyan-200';
      dotColor = 'bg-cyan-500';
      break;
  }

  const formatText = (text: string) => {
    return text
      .split('_')
      .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        colorClasses,
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColor)} />
      <span>{formatText(status)}</span>
    </span>
  );
};
