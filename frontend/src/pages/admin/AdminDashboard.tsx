import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  UserCheck,
  Building2,
  FolderGit2,
  UserPlus,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { api } from '../../lib/api-client';
import { DashboardMetrics } from '../../types';
import { DashboardCard } from '../../components/ui/DashboardCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { CardSkeleton } from '../../components/shared/LoadingSkeleton';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ['admin-dashboard-overview'],
    queryFn: () => api.get<DashboardMetrics>('/api/dashboard/overview'),
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const { cards, departmentDistribution, projectProgress, workCompletionRate, recentActivities } = data;

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="bg-white rounded-xl border border-navy-200 p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-corporate-600 block mb-1">
            Enterprise Command Center
          </span>
          <h2 className="text-xl font-bold text-navy-900 tracking-tight">
            Organization Executive Overview
          </h2>
          <p className="text-xs text-navy-500 mt-1 max-w-xl">
            Real-time workforce intelligence, team allocations, active project tracking, and enterprise access governance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/teams')}
            leftIcon={<Building2 className="w-4 h-4 text-corporate-600" />}
          >
            Manage Teams
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/team-leaders')}
            leftIcon={<UserCheck className="w-4 h-4 text-corporate-600" />}
          >
            Team Leaders
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/admin/employees')}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Manage Employees
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards (6 Cards requested) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <DashboardCard
          title="Total Employees"
          value={cards.totalEmployees}
          icon={<Users className="w-5 h-5" />}
          colorScheme="blue"
          trend={{ value: '100% active', isPositive: true }}
          onClick={() => navigate('/admin/employees?type=EMPLOYEE')}
        />

        <DashboardCard
          title="Total Interns"
          value={cards.totalInterns}
          icon={<GraduationCap className="w-5 h-5" />}
          colorScheme="cyan"
          trend={{ value: 'Enrolled', isPositive: true }}
          onClick={() => navigate('/admin/employees?type=INTERN')}
        />

        <DashboardCard
          title="Team Leaders"
          value={cards.totalTeamLeaders}
          icon={<UserCheck className="w-5 h-5" />}
          colorScheme="indigo"
          subtitle="Department leads"
          onClick={() => navigate('/admin/team-leaders')}
        />

        <DashboardCard
          title="Total Teams"
          value={cards.totalTeams}
          icon={<Building2 className="w-5 h-5" />}
          colorScheme="purple"
          subtitle="Active units"
          onClick={() => navigate('/admin/teams')}
        />

        <DashboardCard
          title="Active Projects"
          value={cards.activeProjects}
          icon={<FolderGit2 className="w-5 h-5" />}
          colorScheme="emerald"
          subtitle="In pipeline"
          onClick={() => navigate('/admin/projects')}
        />

        <DashboardCard
          title="Active Staff"
          value={cards.activeEmployees}
          icon={<CheckCircle2 className="w-5 h-5" />}
          colorScheme="amber"
          subtitle="Verified status"
          onClick={() => navigate('/admin/employees?status=ACTIVE')}
        />
      </div>

      {/* Mid Section: Projects Tracker & Work Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Progress Tracker (2 cols) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Enterprise Projects Portfolio</CardTitle>
                <p className="text-xs text-navy-500 mt-0.5">Execution milestones and department assignments</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/projects')}
                className="text-xs text-corporate-600 hover:text-corporate-700"
                rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent className="divide-y divide-navy-100">
              {projectProgress.map((project) => (
                <div key={project.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-navy-900">{project.name}</span>
                        <span className="text-[10px] font-mono text-navy-500 bg-navy-100 px-1.5 py-0.5 rounded">
                          {project.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={project.status} size="sm" />
                        <span className="text-[11px] text-navy-500">Priority: {project.priority}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-navy-900">{project.progress}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-navy-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-corporate-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Work Completion Rate Gauge & Stats (1 col) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Work Completion Rate</CardTitle>
                <p className="text-xs text-navy-500 mt-0.5">Sprint velocity & task resolution</p>
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="inline-flex items-center justify-center p-6 rounded-full bg-corporate-50 border-4 border-corporate-100">
                <div className="text-center">
                  <span className="text-3xl font-extrabold text-corporate-700 tracking-tight">
                    {workCompletionRate.rate}%
                  </span>
                  <span className="block text-[10px] font-semibold text-navy-500 uppercase tracking-wider mt-0.5">
                    Monthly Efficiency
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-navy-100 text-left">
                <div className="bg-navy-50 p-2.5 rounded-lg border border-navy-200">
                  <span className="text-[10px] text-navy-500 uppercase font-semibold block">Completed</span>
                  <span className="text-sm font-bold text-navy-900">
                    {workCompletionRate.completedTasks} Tasks
                  </span>
                </div>
                <div className="bg-navy-50 p-2.5 rounded-lg border border-navy-200">
                  <span className="text-[10px] text-navy-500 uppercase font-semibold block">Total In Scope</span>
                  <span className="text-sm font-bold text-navy-900">
                    {workCompletionRate.totalTasks} Tasks
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Department Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Department Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {departmentDistribution.map((dept) => (
                <div key={dept.department} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-navy-800">{dept.department}</span>
                    <span className="text-navy-500 font-semibold">{dept.count} staff ({dept.percentage}%)</span>
                  </div>
                  <div className="w-full bg-navy-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-corporate-500 h-full rounded-full"
                      style={{ width: `${dept.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Status Section (Part 6 Enterprise Infrastructure) */}
      <div className="bg-white rounded-xl border border-navy-200 p-5 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-navy-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wide">Enterprise Infrastructure Health</h3>
          </div>
          <button
            onClick={() => navigate('/admin/monitoring')}
            className="text-xs font-semibold text-corporate-600 hover:text-corporate-700 flex items-center gap-1 transition-colors"
          >
            View System Monitoring <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3">
          <div className="p-2.5 rounded-lg bg-navy-50 border border-navy-200/70 text-center">
            <span className="text-[11px] font-semibold text-navy-600 block">API Gateway</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Healthy
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-navy-50 border border-navy-200/70 text-center">
            <span className="text-[11px] font-semibold text-navy-600 block">Database</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Healthy
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-navy-50 border border-navy-200/70 text-center">
            <span className="text-[11px] font-semibold text-navy-600 block">Redis Cache</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Healthy
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-navy-50 border border-navy-200/70 text-center">
            <span className="text-[11px] font-semibold text-navy-600 block">Queue Workers</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Healthy
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-navy-50 border border-navy-200/70 text-center">
            <span className="text-[11px] font-semibold text-navy-600 block">Notifications</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Healthy
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-navy-50 border border-navy-200/70 text-center">
            <span className="text-[11px] font-semibold text-navy-600 block">Event Bus</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Healthy
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Activities Stream */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-corporate-600" />
            <CardTitle>Recent Corporate Platform Activities</CardTitle>
          </div>
          <span className="text-xs text-navy-500">Live Audit Stream</span>
        </CardHeader>
        <CardContent className="divide-y divide-navy-100">
          {recentActivities.map((act) => (
            <div key={act.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-corporate-500 shrink-0" />
                <div>
                  <span className="font-semibold text-navy-900">{act.user}: </span>
                  <span className="text-navy-700">{act.action}</span>
                </div>
              </div>
              <span className="text-[11px] text-navy-400 font-mono shrink-0">{act.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
