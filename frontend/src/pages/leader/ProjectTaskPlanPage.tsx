import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Layers,
  Plus,
  Upload,
  UserCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  Users,
  Search,
  Filter,
  Trash2,
  ArrowLeft,
  Sun,
  Flame,
  CheckSquare,
  Clock,
  AlertCircle,
  GitFork,
  MoreVertical,
  History,
  FileSpreadsheet,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Pagination } from '../../components/ui/Pagination';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { BulkTaskPlanModal } from '../../components/tasks/BulkTaskPlanModal';
import { BulkUploadModal } from '../../components/tasks/BulkUploadModal';
import { TaskAssignModal } from '../../components/tasks/TaskAssignModal';
import { BulkAssignModal } from '../../components/tasks/BulkAssignModal';
import { TaskPlanVersionModal } from '../../components/tasks/TaskPlanVersionModal';
import { Project, Task, Employee, TaskStatus } from '../../types';

export const ProjectTaskPlanPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, isTeamLeader } = useAuth();
  const { showToast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamEmployees, setTeamEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [todayWorkOnly, setTodayWorkOnly] = useState(false);

  // Selection for bulk actions
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // Modals
  const [isBulkPlanModalOpen, setIsBulkPlanModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [assignModalTask, setAssignModalTask] = useState<Task | null>(null);
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  // Fetch Project Details
  const fetchProjectDetails = async () => {
    if (!id) return;
    try {
      const token = localStorage.getItem('corporate_token') || localStorage.getItem('nexus_token');
      const res = await fetch(`/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Project not found');
      const data = await res.json();
      setProject(data);
    } catch (err: any) {
      showToast('error', 'Failed to load project details');
    }
  };

  // Fetch Team Staff for Assignment
  const fetchTeamEmployees = async () => {
    try {
      const token = localStorage.getItem('corporate_token') || localStorage.getItem('nexus_token');
      const res = await fetch('/api/employees?limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTeamEmployees(data.data || []);
    } catch {
      // ignore
    }
  };

  // Fetch Tasks
  const fetchTasks = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('corporate_token') || localStorage.getItem('nexus_token');
      const params = new URLSearchParams({
        projectId: id,
        page: String(page),
        limit: String(limit),
        search: searchTerm,
        status: statusFilter,
        priority: priorityFilter,
      });

      if (unassignedOnly) params.set('unassignedOnly', 'true');
      if (todayWorkOnly) params.set('todayWorkOnly', 'true');

      const res = await fetch(`/api/tasks?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTasks(data.data || []);
      setTotal(data.meta?.total || 0);
      setTotalPages(data.meta?.totalPages || 1);
    } catch (err: any) {
      showToast('error', 'Failed to load task plan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
    fetchTeamEmployees();
  }, [id]);

  useEffect(() => {
    fetchTasks();
  }, [id, page, limit, statusFilter, priorityFilter, unassignedOnly, todayWorkOnly]);

  // Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchTasks();
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
      setSelectedTaskIds(selectedTaskIds.filter((tid) => tid !== taskId));
    } else {
      setSelectedTaskIds([...selectedTaskIds, taskId]);
    }
  };

  // Toggle Today's Work for Single Task
  const handleToggleTodayWork = async (task: Task) => {
    try {
      const token = localStorage.getItem('corporate_token') || localStorage.getItem('nexus_token');
      const newStatus = !task.isTodayWork;
      const res = await fetch(`/api/tasks/${task.id}/daily-work`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isTodayWork: newStatus }),
      });
      if (res.ok) {
        showToast(
          'info',
          newStatus
            ? `Task marked for Today's Work!`
            : `Task removed from Today's Work.`
        );
        fetchTasks();
        fetchProjectDetails();
      }
    } catch {
      showToast('error', 'Failed to update daily work dispatch');
    }
  };

  // Bulk Dispatch to Today's Work
  const handleBulkDailyWork = async (isToday: boolean) => {
    if (selectedTaskIds.length === 0) return;
    try {
      const token = localStorage.getItem('corporate_token') || localStorage.getItem('nexus_token');
      const res = await fetch('/api/tasks/daily-work/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ taskIds: selectedTaskIds, isTodayWork: isToday }),
      });
      if (res.ok) {
        showToast('success', `Updated Today's Work for ${selectedTaskIds.length} tasks!`);
        setSelectedTaskIds([]);
        fetchTasks();
        fetchProjectDetails();
      }
    } catch {
      showToast('error', 'Bulk daily work dispatch failed');
    }
  };

  // Status Change Inline
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const token = localStorage.getItem('corporate_token') || localStorage.getItem('nexus_token');
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast('success', 'Task status updated');
        fetchTasks();
        fetchProjectDetails();
      }
    } catch {
      showToast('error', 'Failed to update status');
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedTaskIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedTaskIds.length} selected tasks?`)) return;

    try {
      const token = localStorage.getItem('corporate_token') || localStorage.getItem('nexus_token');
      const res = await fetch('/api/tasks/bulk-delete/batch', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ taskIds: selectedTaskIds }),
      });
      if (res.ok) {
        showToast('success', `Deleted ${selectedTaskIds.length} tasks`);
        setSelectedTaskIds([]);
        fetchTasks();
        fetchProjectDetails();
      }
    } catch {
      showToast('error', 'Failed to delete selected tasks');
    }
  };

  const progress = project?.progress || 0;
  const totalTasksCount = project?.totalTasks || 0;
  const completedCount = project?.completedTasks || 0;
  const unassignedCount = project?.unassignedTasks || 0;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/projects')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-navy-600 hover:text-navy-900 transition-colors cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-navy-200 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Projects</span>
        </button>

        <div className="flex items-center gap-2">
          {(isAdmin || isTeamLeader) && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVersionModalOpen(true)}
                leftIcon={<History className="w-4 h-4 text-indigo-600" />}
                className="bg-white border-navy-200"
              >
                Version History
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBulkUploadModalOpen(true)}
                leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
                className="bg-white border-navy-200"
              >
                Upload Task Plan (CSV / Excel)
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsBulkPlanModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                + Create Task Plan
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Project Overview Banner Card */}
      {project && (
        <Card className="p-6 bg-gradient-to-br from-white via-navy-50/40 to-corporate-50/30 border-navy-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-corporate-700 bg-corporate-100 px-2 py-0.5 rounded border border-corporate-200">
                  {project.code}
                </span>
                <StatusBadge status={project.priority} size="sm" />
                <StatusBadge status={project.status} size="sm" />
              </div>
              <h1 className="text-xl font-bold text-navy-900">{project.name}</h1>
              <p className="text-xs text-navy-600 mt-1 max-w-2xl">
                {project.description || 'Enterprise project work plan and delivery roadmap.'}
              </p>
            </div>

            {/* Quick Metadata Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-white px-3 py-2 rounded-xl border border-navy-200 shadow-xs text-xs">
                <span className="text-navy-500 block text-[10px] font-semibold uppercase">Department</span>
                <span className="font-bold text-navy-900">{project.department || 'Engineering'}</span>
              </div>
              <div className="bg-white px-3 py-2 rounded-xl border border-navy-200 shadow-xs text-xs">
                <span className="text-navy-500 block text-[10px] font-semibold uppercase">Team</span>
                <span className="font-bold text-navy-900">{project.teamName || 'Unassigned'}</span>
              </div>
              <div className="bg-white px-3 py-2 rounded-xl border border-navy-200 shadow-xs text-xs">
                <span className="text-navy-500 block text-[10px] font-semibold uppercase">Team Leader</span>
                <span className="font-bold text-navy-900">{project.leaderName || 'Unassigned'}</span>
              </div>
            </div>
          </div>

          {/* Project Progress Statistics Strip */}
          <div className="bg-white rounded-xl p-4 border border-navy-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-corporate-100 text-corporate-700 flex items-center justify-center font-bold">
                  {progress}%
                </div>
                <div>
                  <h3 className="text-xs font-bold text-navy-900">Project Execution Progress</h3>
                  <p className="text-[11px] text-navy-500">
                    Total Tasks: <span className="font-bold text-navy-800">{totalTasksCount}</span> &bull; Completed: <span className="font-bold text-emerald-700">{completedCount}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                {unassignedCount > 0 && (
                  <button
                    onClick={() => setUnassignedOnly(!unassignedOnly)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                      unassignedOnly
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Unassigned Tasks: {unassignedCount}</span>
                  </button>
                )}

                <button
                  onClick={() => setTodayWorkOnly(!todayWorkOnly)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                    todayWorkOnly
                      ? 'bg-corporate-600 text-white border-corporate-600 shadow-xs'
                      : 'bg-corporate-50 text-corporate-800 border-corporate-200 hover:bg-corporate-100'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Today's Work Filter</span>
                </button>
              </div>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="w-full h-2.5 bg-navy-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progress === 100
                    ? 'bg-emerald-500'
                    : progress > 50
                    ? 'bg-corporate-600'
                    : 'bg-corporate-400'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Task Filter & Search Strip */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Search task title, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-navy-400" />}
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Task Statuses' },
              { value: 'UNASSIGNED', label: 'Unassigned' },
              { value: 'ASSIGNED', label: 'Assigned' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'SUBMITTED', label: 'Submitted' },
              { value: 'UNDER_REVIEW', label: 'Under Review' },
              { value: 'APPROVED', label: 'Approved' },
              { value: 'REVISION_REQUIRED', label: 'Revision Required' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'CANCELLED', label: 'Cancelled' },
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
                setUnassignedOnly(false);
                setTodayWorkOnly(false);
              }}
              className="w-full text-xs font-semibold text-navy-600 hover:text-navy-900 bg-navy-50 hover:bg-navy-100 border border-navy-200 rounded-lg py-2 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Multi-Selection Bulk Action Bar */}
        {selectedTaskIds.length > 0 && (
          <div className="bg-corporate-50 border border-corporate-200 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-bold text-corporate-900">
              <CheckSquare className="w-4 h-4 text-corporate-600" />
              <span>{selectedTaskIds.length} tasks selected</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => setIsBulkAssignModalOpen(true)}
                leftIcon={<UserCheck className="w-3.5 h-3.5" />}
              >
                Assign Selected ({selectedTaskIds.length})
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkDailyWork(true)}
                leftIcon={<Sun className="w-3.5 h-3.5 text-amber-500" />}
                className="bg-white border-navy-200 text-navy-800"
              >
                Dispatch to Today's Work
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkDelete}
                leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                className="bg-white border-rose-200 text-rose-700 hover:bg-rose-50"
              >
                Delete Selected
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Task Plan Data Table */}
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
                <th className="py-3 px-3 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[240px]">Task Details</th>
                <th className="py-3 px-3 w-28">Priority</th>
                <th className="py-3 px-3 w-32">Due Date</th>
                <th className="py-3 px-4 min-w-[200px]">Assigned Employee</th>
                <th className="py-3 px-3 w-36">Status</th>
                <th className="py-3 px-3 w-24 text-center">Today's Work</th>
                <th className="py-3 px-3 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={9} className="py-4 px-4">
                      <div className="h-4 bg-navy-100 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 px-4 text-center">
                    <Layers className="w-10 h-10 text-navy-300 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-navy-800">No Tasks in Project Task Plan</h4>
                    <p className="text-xs text-navy-500 mt-1 max-w-sm mx-auto">
                      Click '+ Create Task Plan' to build the complete plan at once or upload via CSV/Excel.
                    </p>
                    <div className="flex justify-center gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setIsBulkPlanModalOpen(true)}
                        leftIcon={<Plus className="w-4 h-4" />}
                      >
                        + Create Task Plan
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsBulkUploadModalOpen(true)}
                        leftIcon={<FileSpreadsheet className="w-4 h-4" />}
                      >
                        Upload Plan
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                tasks.map((task, index) => {
                  const isSelected = selectedTaskIds.includes(task.id);
                  const assignedEmp = task.assignedEmployee;

                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-corporate-50/30 transition-colors group ${
                        isSelected ? 'bg-corporate-50/50' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(task.id)}
                          className="w-4 h-4 text-corporate-600 rounded border-navy-300 focus:ring-corporate-500 cursor-pointer"
                        />
                      </td>

                      {/* Order Index */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-navy-400">
                        {task.orderIndex || index + 1}
                      </td>

                      {/* Task Details */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-navy-900 block leading-tight">
                            {task.title}
                          </span>
                          {task.description && (
                            <p className="text-[11px] text-navy-500 line-clamp-1">
                              {task.description}
                            </p>
                          )}
                          {task.dependsOnTask && (
                            <div className="flex items-center gap-1 text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 inline-flex mt-1">
                              <GitFork className="w-3 h-3" />
                              <span>Depends on: {task.dependsOnTask.title}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3">
                        <StatusBadge status={task.priority} size="sm" />
                      </td>

                      {/* Due Date */}
                      <td className="py-3 px-3 text-navy-700 font-medium">
                        {task.dueDate ? (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-navy-400" />
                            <span>{task.dueDate}</span>
                          </span>
                        ) : (
                          <span className="text-navy-400 italic">No date</span>
                        )}
                      </td>

                      {/* Assigned Employee */}
                      <td className="py-3 px-4">
                        {assignedEmp ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-corporate-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 overflow-hidden">
                              {assignedEmp.profilePhotoUrl ? (
                                <img src={assignedEmp.profilePhotoUrl} alt={assignedEmp.fullName} className="w-full h-full object-cover" />
                              ) : (
                                assignedEmp.fullName.charAt(0)
                              )}
                            </div>
                            <div className="truncate">
                              <span className="font-bold text-navy-900 block truncate">{assignedEmp.fullName}</span>
                              <span className="text-[10px] text-navy-500 block truncate">
                                {assignedEmp.employeeType === 'INTERN' ? 'Intern' : assignedEmp.designation || 'Staff'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAssignModalTask(task)}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
                          >
                            <AlertCircle className="w-3 h-3" />
                            <span>+ Assign Staff</span>
                          </button>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3 px-3">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                          className="w-full bg-white border border-navy-200 rounded px-2 py-1 text-xs font-semibold text-navy-800 focus:outline-none focus:ring-1 focus:ring-corporate-500 cursor-pointer"
                        >
                          <option value="UNASSIGNED">Unassigned</option>
                          <option value="ASSIGNED">Assigned</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="SUBMITTED">Submitted</option>
                          <option value="UNDER_REVIEW">Under Review</option>
                          <option value="APPROVED">Approved</option>
                          <option value="REVISION_REQUIRED">Revision Required</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>

                      {/* Today's Work Toggle */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleToggleTodayWork(task)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            task.isTodayWork
                              ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                              : 'bg-navy-50 text-navy-400 border-navy-200 hover:text-amber-500 hover:bg-amber-50'
                          }`}
                          title={task.isTodayWork ? "Active in Today's Work" : "Mark for Today's Work"}
                        >
                          <Sun className="w-4 h-4" />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setAssignModalTask(task)}
                            className="p-1.5 text-navy-400 hover:text-corporate-600 hover:bg-corporate-50 rounded transition-colors"
                            title={task.assignedTo ? 'Reassign task' : 'Assign task'}
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
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

      {/* Bulk Task Plan Modal */}
      {project && (
        <BulkTaskPlanModal
          isOpen={isBulkPlanModalOpen}
          onClose={() => setIsBulkPlanModalOpen(false)}
          projectId={project.id}
          projectName={project.name}
          projectStartDate={project.startDate}
          projectTargetDate={project.targetDate}
          teamEmployees={teamEmployees}
          onSuccess={() => {
            fetchTasks();
            fetchProjectDetails();
          }}
        />
      )}

      {/* Bulk Upload Modal */}
      {project && (
        <BulkUploadModal
          isOpen={isBulkUploadModalOpen}
          onClose={() => setIsBulkUploadModalOpen(false)}
          projectId={project.id}
          projectName={project.name}
          onSuccess={() => {
            fetchTasks();
            fetchProjectDetails();
          }}
        />
      )}

      {/* Single Assign / Reassign Modal */}
      <TaskAssignModal
        isOpen={!!assignModalTask}
        onClose={() => setAssignModalTask(null)}
        task={assignModalTask}
        teamEmployees={teamEmployees}
        onSuccess={() => {
          fetchTasks();
          fetchProjectDetails();
        }}
      />

      {/* Bulk Assign Modal */}
      <BulkAssignModal
        isOpen={isBulkAssignModalOpen}
        onClose={() => setIsBulkAssignModalOpen(false)}
        selectedTaskIds={selectedTaskIds}
        teamEmployees={teamEmployees}
        onSuccess={() => {
          setSelectedTaskIds([]);
          fetchTasks();
          fetchProjectDetails();
        }}
      />

      {/* Task Plan Version History Modal */}
      {project && (
        <TaskPlanVersionModal
          isOpen={isVersionModalOpen}
          onClose={() => setIsVersionModalOpen(false)}
          projectId={project.id}
          projectName={project.name}
        />
      )}
    </div>
  );
};
