import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  TrendingUp,
  AlertCircle,
  Sun,
  Clock,
  CheckCircle2,
  Users,
  Plus,
  ArrowRight,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LeaderDashboardMetrics } from '../../types';

export const LeaderDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: leaderData, isLoading } = useQuery<LeaderDashboardMetrics>({
    queryKey: ['leader-dashboard-overview'],
    queryFn: async () => {
      const token = localStorage.getItem('corporate_token') || localStorage.getItem('nexus_token');
      const res = await fetch('/api/dashboard/leader', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load leader metrics');
      return res.json();
    },
  });

  const cards = leaderData?.cards || {
    myProjectsCount: 0,
    overallProgress: 0,
    unassignedTasksCount: 0,
    todayWorkCount: 0,
    overdueWorkCount: 0,
    pendingReviewsCount: 0,
  };

  const myProjects = leaderData?.myProjects || [];
  const todayWork = leaderData?.todayWork || [];
  const teamMembers = leaderData?.teamMembers || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-navy-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-corporate-700 bg-corporate-50 px-2.5 py-0.5 rounded-full border border-corporate-200">
                Team Leadership Console
              </span>
              <span className="text-xs text-navy-500 font-mono">{user?.employeeId}</span>
            </div>
            <h1 className="text-2xl font-bold text-navy-900 tracking-tight mt-1">
              Welcome back, {user?.name}
            </h1>
            <p className="text-xs text-navy-500 mt-1 max-w-xl">
              Track project milestones, complete task plans, assign workloads, and oversee daily delivery sprints.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/leader/unassigned-tasks')}
              leftIcon={<AlertCircle className="w-4 h-4 text-amber-600" />}
              className="bg-white border-navy-200 text-navy-800"
            >
              Unassigned Queue ({cards.unassignedTasksCount})
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/admin/projects')}
              leftIcon={<FolderGit2 className="w-4 h-4" />}
            >
              My Projects
            </Button>
          </div>
        </div>
      </div>

      {/* 6 Core KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. My Projects */}
        <Card
          onClick={() => navigate('/admin/projects')}
          className="p-4 hover:border-corporate-400 transition-all cursor-pointer bg-white"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-navy-500 uppercase tracking-wider">My Projects</span>
            <div className="w-8 h-8 rounded-lg bg-corporate-50 text-corporate-600 flex items-center justify-center">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-navy-900">{cards.myProjectsCount}</span>
            <span className="text-[10px] text-emerald-600 font-bold">Active</span>
          </div>
        </Card>

        {/* 2. Project Progress */}
        <Card
          onClick={() => navigate('/admin/projects')}
          className="p-4 hover:border-corporate-400 transition-all cursor-pointer bg-white"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-navy-500 uppercase tracking-wider">Project Progress</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-corporate-700">{cards.overallProgress}%</span>
            <span className="text-[10px] text-navy-400 font-medium">Avg Completion</span>
          </div>
        </Card>

        {/* 3. Unassigned Tasks */}
        <Card
          onClick={() => navigate('/leader/unassigned-tasks')}
          className="p-4 hover:border-amber-400 transition-all cursor-pointer bg-white"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-navy-500 uppercase tracking-wider">Unassigned Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-700">{cards.unassignedTasksCount}</span>
            <span className="text-[10px] text-amber-600 font-bold">Needs Staff</span>
          </div>
        </Card>

        {/* 4. Today's Work */}
        <Card
          onClick={() => navigate('/leader/daily-work')}
          className="p-4 hover:border-amber-400 transition-all cursor-pointer bg-white"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-navy-500 uppercase tracking-wider">Today's Work</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
              <Sun className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-orange-600">{cards.todayWorkCount}</span>
            <span className="text-[10px] text-orange-600 font-bold">Dispatched</span>
          </div>
        </Card>

        {/* 5. Overdue Work */}
        <Card
          onClick={() => navigate('/admin/projects')}
          className="p-4 hover:border-rose-400 transition-all cursor-pointer bg-white"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-navy-500 uppercase tracking-wider">Overdue Work</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-rose-600">{cards.overdueWorkCount}</span>
            <span className="text-[10px] text-rose-500 font-medium">Pending</span>
          </div>
        </Card>

        {/* 6. Pending Reviews */}
        <Card
          onClick={() => navigate('/admin/submissions')}
          className="p-4 hover:border-indigo-400 transition-all cursor-pointer bg-white"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-navy-500 uppercase tracking-wider">Pending Reviews</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-indigo-700">{cards.pendingReviewsCount}</span>
            <span className="text-[10px] text-indigo-600 font-bold">Submissions</span>
          </div>
        </Card>
      </div>

      {/* Main Content Sections: Projects Progress & Today's Work */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Projects with Auto-Calculated Progress */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-corporate-600" />
              <span>Supervised Projects & Task Plans</span>
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/projects')}
              className="text-xs text-corporate-600"
            >
              View All Projects
            </Button>
          </div>

          <div className="space-y-3">
            {myProjects.length === 0 ? (
              <Card className="p-8 text-center bg-white">
                <FolderGit2 className="w-10 h-10 text-navy-300 mx-auto mb-2" />
                <h3 className="text-xs font-bold text-navy-800">No Projects Assigned Yet</h3>
                <p className="text-[11px] text-navy-500 mt-1">
                  Projects assigned to your leadership will appear here with automated progress tracking.
                </p>
              </Card>
            ) : (
              myProjects.map((p) => (
                <Card
                  key={p.id}
                  className="p-4 hover:border-corporate-300 transition-all bg-white cursor-pointer group"
                  onClick={() => navigate(`/admin/projects/${p.id}`)}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-corporate-700 bg-corporate-50 px-1.5 py-0.5 rounded border border-corporate-200">
                          {p.code}
                        </span>
                        <h3 className="text-xs font-bold text-navy-900 group-hover:text-corporate-700 transition-colors truncate">
                          {p.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={p.priority} size="sm" />
                        <StatusBadge status={p.status} size="sm" />
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-navy-600 font-medium">Progress</span>
                        <span className="font-bold text-corporate-700">{p.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-navy-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-corporate-600 transition-all duration-500"
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-navy-500 pt-1 border-t border-navy-100">
                      <span>{p.completedTasks} / {p.totalTasks} Tasks Completed</span>
                      {p.unassignedTasks > 0 && (
                        <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          {p.unassignedTasks} Unassigned
                        </span>
                      )}
                      <span className="font-bold text-corporate-600 inline-flex items-center gap-0.5">
                        <span>Open Task Plan</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Today's Work & Team Member Distribution */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Today's Work & Staff</span>
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/leader/daily-work')}
              className="text-xs text-corporate-600"
            >
              Full Command
            </Button>
          </div>

          <Card className="p-4 bg-white border-navy-200 shadow-xs space-y-3">
            <div className="text-xs font-bold text-navy-800">Team Staff Allocations ({teamMembers.length})</div>
            <div className="divide-y divide-navy-100 max-h-72 overflow-y-auto">
              {teamMembers.map((member) => (
                <div key={member.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-7 h-7 rounded-full bg-corporate-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 overflow-hidden">
                      {member.profilePhotoUrl ? (
                        <img src={member.profilePhotoUrl} alt={member.fullName} className="w-full h-full object-cover" />
                      ) : (
                        member.fullName?.charAt(0)
                      )}
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-bold text-navy-900 block truncate">{member.fullName}</span>
                      <span className="text-[10px] text-navy-500 block truncate">{member.designation || 'Staff'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">
                      {member.todayTasksCount} Today
                    </span>
                    <span className="text-[10px] font-bold bg-navy-100 text-navy-700 px-1.5 py-0.5 rounded">
                      {member.activeTasksCount} Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

