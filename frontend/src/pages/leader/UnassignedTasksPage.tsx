import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  UserCheck,
  Search,
  Filter,
  CheckSquare,
  Clock,
  Layers,
  FolderGit2,
  Users,
  ArrowRight,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Pagination } from '../../components/ui/Pagination';
import { TaskAssignModal } from '../../components/tasks/TaskAssignModal';
import { BulkAssignModal } from '../../components/tasks/BulkAssignModal';
import { useToast } from '../../hooks/useToast';
import { Task, Employee, Project } from '../../types';

export const UnassignedTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamEmployees, setTeamEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Multi-selection
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // Modals
  const [assignModalTask, setAssignModalTask] = useState<Task | null>(null);
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);

  const fetchUnassignedTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('corporate_token') || localStorage.getItem('nexus_token');
      const params = new URLSearchParams({
        unassignedOnly: 'true',
        page: String(page),
        limit: String(limit),
        search: searchTerm,
        projectId: projectFilter,
        priority: priorityFilter,
      });

      const res = await fetch(`/api/tasks?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTasks(data.data || []);
      setTotal(data.meta?.total || 0);
      setTotalPages(data.meta?.totalPages || 1);
    } catch {
      showToast('error', 'Failed to fetch unassigned tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const token = localStorage.getItem('corporate_token') || localStorage.getItem('nexus_token');
      // Fetch projects
      fetch('/api/projects?limit=100', { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((d) => setProjects(d.data || []))
        .catch(() => {});

      // Fetch employees
      fetch('/api/employees?limit=100', { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((d) => setTeamEmployees(d.data || []))
        .catch(() => {});
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchUnassignedTasks();
  }, [page, limit, projectFilter, priorityFilter]);

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchUnassignedTasks();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTaskIds(tasks.map((t) => t.id));
    } else {
      setSelectedTaskIds([]);
    }
  };

  const handleSelectRow = (taskId: string) => {
    if (selectedTaskIds.includes(taskId)) {
      setSelectedTaskIds(selectedTaskIds.filter((id) => id !== taskId));
    } else {
      setSelectedTaskIds([...selectedTaskIds, taskId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner KPI */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-amber-800/40 text-amber-100 text-xs px-2.5 py-0.5 rounded-full font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Action Required</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Unassigned Tasks Queue</h1>
          <p className="text-xs text-amber-100 max-w-xl">
            Tasks created in task plans that have not yet been assigned to staff members. Allocate them individually or in bulk to maintain project velocity.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xs px-6 py-3.5 rounded-2xl border border-white/20 text-center shrink-0">
          <span className="text-[11px] font-semibold text-amber-200 uppercase tracking-wider block">
            Awaiting Staff Assignment
          </span>
          <span className="text-3xl font-extrabold text-white">{total}</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search task title, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-navy-400" />}
          />

          <Select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Projects' },
              ...projects.map((p) => ({ value: p.id, label: `${p.name} (${p.code})` })),
            ]}
          />

          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Priorities' },
              { value: 'CRITICAL', label: 'Critical' },
              { value: 'HIGH', label: 'High' },
              { value: 'NORMAL', label: 'Normal' },
              { value: 'LOW', label: 'Low' },
            ]}
          />
        </div>

        {/* Bulk Action Strip */}
        {selectedTaskIds.length > 0 && (
          <div className="bg-corporate-50 border border-corporate-200 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-corporate-900">
              <CheckSquare className="w-4 h-4 text-corporate-600" />
              <span>{selectedTaskIds.length} tasks selected</span>
            </div>

            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsBulkAssignModalOpen(true)}
              leftIcon={<UserCheck className="w-3.5 h-3.5" />}
            >
              Assign Selected ({selectedTaskIds.length})
            </Button>
          </div>
        )}
      </Card>

      {/* Unassigned Tasks Table */}
      <Card className="overflow-hidden border-navy-200 shadow-xs bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-navy-50/80 text-navy-600 uppercase text-[10px] tracking-wider font-semibold border-b border-navy-200">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={tasks.length > 0 && selectedTaskIds.length === tasks.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-corporate-600 rounded border-navy-300 focus:ring-corporate-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4 min-w-[240px]">Task Details</th>
                <th className="py-3 px-4 min-w-[180px]">Project</th>
                <th className="py-3 px-3 w-28">Priority</th>
                <th className="py-3 px-3 w-32">Target Due Date</th>
                <th className="py-3 px-3 w-28 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="py-4 px-4">
                      <div className="h-4 bg-navy-100 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center">
                    <CheckSquare className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-navy-800">No Unassigned Tasks</h4>
                    <p className="text-xs text-navy-500 mt-1 max-w-sm mx-auto">
                      All tasks across active projects are assigned to staff members.
                    </p>
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
                  const isSelected = selectedTaskIds.includes(task.id);
                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-corporate-50/30 transition-colors ${
                        isSelected ? 'bg-corporate-50/50' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(task.id)}
                          className="w-4 h-4 text-corporate-600 rounded border-navy-300 focus:ring-corporate-500 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-navy-900 block leading-tight">{task.title}</span>
                        {task.description && (
                          <p className="text-[11px] text-navy-500 line-clamp-1 mt-0.5">{task.description}</p>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div
                          onClick={() => navigate(`/admin/projects/${task.projectId}`)}
                          className="flex items-center gap-1.5 text-corporate-700 hover:text-corporate-900 font-semibold cursor-pointer group"
                        >
                          <FolderGit2 className="w-3.5 h-3.5 text-corporate-600 shrink-0" />
                          <span className="truncate group-hover:underline">{task.projectName}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <StatusBadge status={task.priority} size="sm" />
                      </td>

                      <td className="py-3 px-3 text-navy-700">
                        {task.dueDate ? (
                          <span className="inline-flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 text-navy-400" />
                            <span>{task.dueDate}</span>
                          </span>
                        ) : (
                          <span className="text-navy-400 italic">No date</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => setAssignModalTask(task)}
                          leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                          className="text-xs"
                        >
                          Assign
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && total > limit && (
          <div className="p-4 border-t border-navy-100">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              limit={limit}
              onLimitChange={setLimit}
              total={total}
            />
          </div>
        )}

      </Card>

      {/* Assign Modal */}
      <TaskAssignModal
        isOpen={!!assignModalTask}
        onClose={() => setAssignModalTask(null)}
        task={assignModalTask}
        teamEmployees={teamEmployees}
        onSuccess={fetchUnassignedTasks}
      />

      {/* Bulk Assign Modal */}
      <BulkAssignModal
        isOpen={isBulkAssignModalOpen}
        onClose={() => setIsBulkAssignModalOpen(false)}
        selectedTaskIds={selectedTaskIds}
        teamEmployees={teamEmployees}
        onSuccess={() => {
          setSelectedTaskIds([]);
          fetchUnassignedTasks();
        }}
      />
    </div>
  );
};
