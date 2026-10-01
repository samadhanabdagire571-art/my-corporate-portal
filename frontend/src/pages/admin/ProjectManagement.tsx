import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Plus,
  Search,
  Filter,
  Layers,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Archive,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Edit2,
  Trash2,
  Clock,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Project, Team, TeamLeaderSummary, TaskTemplate } from '../../types';

export const ProjectManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isTeamLeader } = useAuth();
  const { showToast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Modal State for Project Creation / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    description: string;
    department: string;
    teamId: string;
    leaderId: string;
    startDate: string;
    targetDate: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'NOT_STARTED' | 'ACTIVE' | 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
    templateId: string;
  }>({
    name: '',
    code: '',
    description: '',
    department: 'Engineering',
    teamId: '',
    leaderId: '',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: '',
    priority: 'MEDIUM',
    status: 'ACTIVE',
    templateId: '',
  });


  const [teams, setTeams] = useState<Team[]>([]);
  const [teamLeaders, setTeamLeaders] = useState<TeamLeaderSummary[]>([]);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('corporate_token') || localStorage.getItem('nexus_token');
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search: searchTerm,
        status: statusFilter,
        priority: priorityFilter,
        department: deptFilter,
      });

      const res = await fetch(`/api/projects?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProjects(data.data || []);
      setTotal(data.meta?.total || 0);
      setTotalPages(data.meta?.totalPages || 1);
    } catch (err: any) {
      showToast('error', 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [page, limit, statusFilter, priorityFilter, deptFilter]);

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchProjects();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch dropdown data on modal open
  useEffect(() => {
    if (isModalOpen) {
      const token = localStorage.getItem('corporate_token') || localStorage.getItem('nexus_token');
      // Fetch teams
      fetch('/api/teams?limit=100', { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((d) => setTeams(d.data || []))
        .catch(() => {});

      // Fetch team leaders
      fetch('/api/team-leaders?limit=100', { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((d) => setTeamLeaders(d.data || []))
        .catch(() => {});

      // Fetch templates
      fetch('/api/task-templates', { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((d) => setTemplates(Array.isArray(d) ? d : []))
        .catch(() => {});
    }
  }, [isModalOpen]);

  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      department: 'Engineering',
      teamId: '',
      leaderId: '',
      startDate: new Date().toISOString().split('T')[0],
      targetDate: '',
      priority: 'MEDIUM',
      status: 'ACTIVE',
      templateId: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(project);
    setFormData({
      name: project.name,
      code: project.code,
      description: project.description || '',
      department: project.department || 'Engineering',
      teamId: project.teamId || '',
      leaderId: project.leaderId || '',
      startDate: project.startDate || '',
      targetDate: project.targetDate || '',
      priority: project.priority,
      status: (project.status as any) || 'ACTIVE',
      templateId: '',
    });
    setIsModalOpen(true);
  };

  const handleArchive = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to archive this project?')) return;

    try {
      const token = localStorage.getItem('corporate_token') || localStorage.getItem('nexus_token');
      const res = await fetch(`/api/projects/${projectId}/archive`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast('success', 'Project archived successfully');
        fetchProjects();
      }
    } catch {
      showToast('error', 'Failed to archive project');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('error', 'Project name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('corporate_token') || localStorage.getItem('nexus_token');
      const method = editingProject ? 'PUT' : 'POST';
      const endpoint = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Operation failed');
      }

      showToast(
        'success',
        editingProject ? 'Project updated successfully' : 'Project created successfully with task plan!'
      );
      setIsModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy-900 tracking-tight flex items-center gap-2.5">
            <FolderGit2 className="w-6 h-6 text-corporate-600" />
            <span>Corporate Project Management</span>
          </h1>
          <p className="text-xs text-navy-500 mt-0.5">
            Manage enterprise projects, task plan lifecycles, and staff workload allocations.
          </p>
        </div>

        {(isAdmin || isTeamLeader) && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Project
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Search project name, code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-navy-400" />}
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'PLANNING', label: 'Planning' },
              { value: 'ON_HOLD', label: 'On Hold' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'ARCHIVED', label: 'Archived' },
            ]}
          />

          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Priorities' },
              { value: 'CRITICAL', label: 'Critical' },
              { value: 'HIGH', label: 'High' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'LOW', label: 'Low' },
            ]}
          />

          <Select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Departments' },
              { value: 'Engineering', label: 'Engineering' },
              { value: 'Product Design', label: 'Product Design' },
              { value: 'Quality Assurance', label: 'Quality Assurance' },
              { value: 'Executive Leadership', label: 'Executive' },
            ]}
          />
        </div>
      </Card>

      {/* Projects Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5 animate-pulse space-y-3">
              <div className="h-4 bg-navy-200 rounded w-3/4" />
              <div className="h-3 bg-navy-100 rounded w-1/2" />
              <div className="h-2 bg-navy-100 rounded-full w-full" />
              <div className="h-4 bg-navy-100 rounded w-1/4" />
            </Card>
          ))
        ) : projects.length === 0 ? (
          <div className="col-span-full">
            <Card className="p-12 text-center">
              <FolderGit2 className="w-12 h-12 text-navy-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-navy-800">No Projects Found</h3>
              <p className="text-xs text-navy-500 mt-1 max-w-sm mx-auto">
                No projects match your current filters. Create a new project or reset your search query.
              </p>
              {(isAdmin || isTeamLeader) && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleOpenCreate}
                  className="mt-4"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Create Project
                </Button>
              )}
            </Card>
          </div>
        ) : (
          projects.map((project) => {
            const progress = project.progress || 0;
            const totalTasks = project.totalTasks || 0;
            const completedTasks = project.completedTasks || 0;
            const unassignedTasks = project.unassignedTasks || 0;

            return (
              <Card
                key={project.id}
                className="p-5 hover:border-corporate-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden bg-white"
                onClick={() => navigate(`/admin/projects/${project.id}`)}
              >
                <div className="space-y-3.5">
                  {/* Top Bar: Code & Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-corporate-700 bg-corporate-50 px-2 py-0.5 rounded border border-corporate-200">
                        {project.code}
                      </span>
                      <h3 className="text-sm font-bold text-navy-900 group-hover:text-corporate-700 transition-colors mt-1.5 line-clamp-1">
                        {project.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <StatusBadge status={project.priority} size="sm" />
                      <StatusBadge status={project.status} size="sm" />
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-navy-600 line-clamp-2 leading-relaxed">
                    {project.description || 'No description provided.'}
                  </p>

                  {/* Team & Department Meta */}
                  <div className="pt-2 border-t border-navy-100 grid grid-cols-2 gap-2 text-[11px] text-navy-600">
                    <div className="flex items-center gap-1.5 truncate">
                      <Users className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                      <span className="truncate">{project.teamName || 'Unassigned Team'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Calendar className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                      <span>{project.targetDate ? `Due: ${project.targetDate}` : 'No target date'}</span>
                    </div>
                  </div>

                  {/* Auto-Calculated Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-navy-700 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-corporate-600" />
                        <span>Project Progress</span>
                      </span>
                      <span className="font-bold text-corporate-700">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-navy-100 rounded-full overflow-hidden">
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
                    <div className="flex items-center justify-between text-[10px] text-navy-500 pt-0.5">
                      <span>{completedTasks} / {totalTasks} Tasks Completed</span>
                      {unassignedTasks > 0 ? (
                        <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          {unassignedTasks} Unassigned
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">All Assigned</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 mt-3 border-t border-navy-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleOpenEdit(project, e)}
                      className="p-1.5 text-navy-400 hover:text-navy-700 hover:bg-navy-50 rounded transition-colors"
                      title="Edit project"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {isAdmin && project.status !== 'ARCHIVED' && (
                      <button
                        onClick={(e) => handleArchive(project.id, e)}
                        className="p-1.5 text-navy-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Archive project"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-corporate-600 group-hover:translate-x-0.5 transition-transform">
                    <span>Task Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {!loading && total > limit && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          limit={limit}
          onLimitChange={setLimit}
          total={total}
        />
      )}


      {/* Create / Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-corporate-100 text-corporate-700 flex items-center justify-center">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-900">
                {editingProject ? 'Edit Corporate Project' : 'Create New Project'}
              </h2>
              <p className="text-xs text-navy-500 font-normal">
                {editingProject ? 'Update metadata & assignment' : 'Initialize project & optional task plan template'}
              </p>
            </div>
          </div>
        }
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingProject && (
            <div className="bg-corporate-50/70 border border-corporate-200 rounded-xl p-3 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-corporate-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <label className="block text-xs font-bold text-corporate-900 mb-1">
                  Use Pre-Built Task Template (Optional)
                </label>
                <select
                  value={formData.templateId}
                  onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                  className="w-full bg-white border border-corporate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-corporate-500/20 text-navy-900 font-medium"
                >
                  <option value="">-- Start with Blank Project (No Template) --</option>
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} ({tpl.tasks?.length || 0} automated tasks)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Project Name *"
              placeholder="e.g. Enterprise Workforce Portal 2.0"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Input
              label="Project Code (Optional, auto-generated)"
              placeholder="e.g. PRJ-PORTAL-01"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-800 mb-1">
              Project Description
            </label>
            <textarea
              rows={2}
              placeholder="Key project objectives and scope..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white border border-navy-200 rounded-lg p-2.5 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-corporate-500/20 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-navy-800 mb-1">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-white border border-navy-200 rounded-lg px-2.5 py-1.5 text-xs text-navy-900 focus:outline-none"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product Design">Product Design</option>
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-800 mb-1">
                Assign Team
              </label>
              <select
                value={formData.teamId}
                onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                className="w-full bg-white border border-navy-200 rounded-lg px-2.5 py-1.5 text-xs text-navy-900 focus:outline-none"
              >
                <option value="">-- Unassigned Team --</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-800 mb-1">
                Assign Team Leader
              </label>
              <select
                value={formData.leaderId}
                onChange={(e) => setFormData({ ...formData, leaderId: e.target.value })}
                className="w-full bg-white border border-navy-200 rounded-lg px-2.5 py-1.5 text-xs text-navy-900 focus:outline-none"
              >
                <option value="">-- Select Team Leader --</option>
                {teamLeaders.map((tl) => (
                  <option key={tl.id} value={tl.id}>
                    {tl.fullName} ({tl.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />

            <Input
              label="Target End Date"
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
            />

            <div>
              <label className="block text-xs font-semibold text-navy-800 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full bg-white border border-navy-200 rounded-lg px-2.5 py-1.5 text-xs text-navy-900 focus:outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-800 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-white border border-navy-200 rounded-lg px-2.5 py-1.5 text-xs text-navy-900 focus:outline-none"
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="ACTIVE">Active</option>
                <option value="PLANNING">Planning</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-navy-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              {editingProject ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
