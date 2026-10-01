import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { api } from '../../lib/api-client';
import { Project } from '../../types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../lib/utils';

export const ProjectsPage: React.FC = () => {
  const { data, isLoading } = useQuery<Project[]>({
    queryKey: ['projects-list'],
    queryFn: () => api.get<Project[]>('/api/projects'),
  });

  const columns: Column<Project>[] = [
    {
      key: 'name',
      header: 'Project Name & Description',
      render: (p) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-navy-900 leading-tight">{p.name}</span>
            <span className="font-mono text-[10px] text-navy-500 bg-navy-100 px-1.5 py-0.5 rounded">
              {p.code}
            </span>
          </div>
          <span className="text-xs text-navy-500 block truncate max-w-sm mt-0.5">{p.description}</span>
        </div>
      ),
    },
    {
      key: 'teamName',
      header: 'Assigned Team',
      render: (p) => <span className="text-xs font-semibold text-navy-800">{p.teamName || 'Unassigned'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => <StatusBadge status={p.status} size="sm" />,
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (p) => <StatusBadge status={p.priority} size="sm" />,
    },
    {
      key: 'startDate',
      header: 'Start Date',
      render: (p) => <span className="text-xs text-navy-600">{formatDate(p.startDate)}</span>,
    },
    {
      key: 'targetDate',
      header: 'Target Date',
      render: (p) => <span className="text-xs text-navy-600">{formatDate(p.targetDate)}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900 tracking-tight">Enterprise Projects Portfolio</h2>
          <p className="text-xs text-navy-500 mt-0.5">
            Active organizational initiatives, deliverables, and team assignments
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => alert('Project creation will be fully expanded in Part 2!')}
        >
          New Project
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data || []}
        isLoading={isLoading}
        emptyTitle="No projects registered"
        emptyDescription="Projects created by management will be cataloged here."
      />
    </div>
  );
};
