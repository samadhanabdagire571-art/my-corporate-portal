import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Briefcase,
  Layers,
  Filter,
  Search,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { api } from '../../lib/api-client';
import { useAuth } from '../../hooks/useAuth';
import {
  EmployeeWorkloadSummary,
  TeamWorkloadSummary,
  OrganizationWorkloadSummary,
  WorkloadState,
} from '../../types';

export const WorkloadPage: React.FC = () => {
  const { user, isAdmin, isTeamLeader } = useAuth();
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Admin Query: Organization Workload
  const { data: orgData, isLoading: isOrgLoading } = useQuery<OrganizationWorkloadSummary>({
    queryKey: ['workload-org', selectedDept],
    queryFn: () => api.get<OrganizationWorkloadSummary>('/api/v1/workload/organization'),
    enabled: isAdmin,
  });

  // 2. Team Leader / Employee Team Query
  const { data: myTeamData, isLoading: isTeamLoading } = useQuery<TeamWorkloadSummary>({
    queryKey: ['workload-my-team'],
    queryFn: async () => {
      const teams = await api.get<any[]>('/api/v1/teams');
      if (teams && teams.length > 0) {
        return api.get<TeamWorkloadSummary>(`/api/v1/workload/team/${teams[0].id}`);
      }
      return null as any;
    },
    enabled: isTeamLeader,
  });

  // 3. Employee Personal Workload
  const { data: myWorkload, isLoading: isMyLoading } = useQuery<EmployeeWorkloadSummary>({
    queryKey: ['workload-me'],
    queryFn: () => api.get<EmployeeWorkloadSummary>('/api/v1/workload/me'),
    enabled: !isAdmin,
  });

  const getBadgeStyle = (state: WorkloadState) => {
    switch (state) {
      case 'OVERLOADED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'NORMAL':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'LOW':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-950 tracking-tight flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-blue-600" />
            Workforce Capacity & Workload Management
          </h1>
          <p className="text-sm text-navy-500 mt-1">
            Real-time assigned work distribution, upcoming deadlines, and team capacity monitoring.
          </p>
        </div>
      </div>

      {/* ADMIN VIEW */}
      {isAdmin && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-navy-100 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-navy-500">Active Staff</span>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="mt-2 text-2xl font-bold text-navy-900">{orgData?.totalEmployees ?? '...'}</div>
              <div className="mt-1 text-xs text-navy-500">Total in organization</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-navy-100 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-navy-500">Active Tasks</span>
                <Layers className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="mt-2 text-2xl font-bold text-navy-900">{orgData?.totalActiveTasks ?? '...'}</div>
              <div className="mt-1 text-xs text-navy-500">Currently in-flight</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-navy-100 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-navy-500">Overdue Deliverables</span>
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div className="mt-2 text-2xl font-bold text-red-600">{orgData?.totalOverdueTasks ?? '0'}</div>
              <div className="mt-1 text-xs text-navy-500">Past target due dates</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-navy-100 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-navy-500">Capacity Balance</span>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="mt-2 text-2xl font-bold text-navy-900">
                {orgData?.workloadDistribution.overloaded ? `${orgData.workloadDistribution.overloaded} Overloaded` : 'Balanced'}
              </div>
              <div className="mt-1 text-xs text-emerald-600 font-medium">
                {orgData?.workloadDistribution.normal} normal / {orgData?.workloadDistribution.high} high
              </div>
            </div>
          </div>

          {/* Department Breakdown Cards */}
          <div className="bg-white rounded-xl border border-navy-100 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-semibold text-navy-900">Department Workload Distribution</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orgData?.departmentBreakdown.map((dept, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-navy-50/70 border border-navy-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-navy-900">{dept.department}</span>
                    <span className="text-xs text-navy-500">{dept.employeeCount} staff</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-navy-600">
                    <span>Active Tasks: <strong>{dept.activeTasks}</strong></span>
                    <span>Overdue: <strong className={dept.overdueTasks > 0 ? 'text-red-600' : 'text-emerald-600'}>{dept.overdueTasks}</strong></span>
                  </div>
                  <div className="w-full bg-navy-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${dept.overloadedCount > 0 ? 'bg-amber-500' : 'bg-blue-600'}`}
                      style={{ width: `${Math.min(100, (dept.activeTasks / Math.max(1, dept.employeeCount * 3)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TEAM LEADER VIEW */}
      {isTeamLeader && myTeamData && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-navy-100 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-navy-100">
              <div>
                <h2 className="text-lg font-bold text-navy-900">{myTeamData.teamName} Workload Roster</h2>
                <p className="text-xs text-navy-500">Department: {myTeamData.department} • Leader: {myTeamData.leaderName}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-800 rounded-full border border-blue-200">
                  {myTeamData.totalMembers} Members
                </span>
                <span className="text-xs font-semibold px-3 py-1 bg-navy-100 text-navy-800 rounded-full">
                  {myTeamData.totalActiveTasks} Active Tasks
                </span>
              </div>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-navy-100 text-xs font-semibold text-navy-500 uppercase tracking-wider bg-navy-50/50">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Designation</th>
                    <th className="py-3 px-4">Active Tasks</th>
                    <th className="py-3 px-4">Due Soon (48h)</th>
                    <th className="py-3 px-4">Overdue</th>
                    <th className="py-3 px-4">Revision Req</th>
                    <th className="py-3 px-4 text-center">Workload Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {myTeamData.members.map((member) => (
                    <tr key={member.employeeId} className="hover:bg-navy-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-navy-900">{member.fullName}</td>
                      <td className="py-3.5 px-4 text-navy-600 text-xs">{member.designation}</td>
                      <td className="py-3.5 px-4 font-semibold text-navy-900">{member.activeTasks}</td>
                      <td className="py-3.5 px-4 text-amber-600 font-medium">{member.dueSoonTasks}</td>
                      <td className="py-3.5 px-4">
                        <span className={`font-semibold ${member.overdueTasks > 0 ? 'text-red-600' : 'text-navy-400'}`}>
                          {member.overdueTasks}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-purple-600 font-medium">{member.revisionRequiredTasks}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle(member.workloadState)}`}>
                          {member.workloadState}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* INDIVIDUAL EMPLOYEE VIEW */}
      {!isAdmin && !isTeamLeader && myWorkload && (
        <div className="bg-white rounded-xl border border-navy-100 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-navy-100">
            <div>
              <h2 className="text-lg font-bold text-navy-900">My Work Capacity & Schedule</h2>
              <p className="text-xs text-navy-500">Department: {myWorkload.department} • Team: {myWorkload.teamName || 'Assigned Team'}</p>
            </div>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getBadgeStyle(myWorkload.workloadState)}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              Workload Status: {myWorkload.workloadState}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-navy-50 border border-navy-100">
              <span className="text-xs text-navy-500 font-medium uppercase tracking-wider">Active Deliverables</span>
              <div className="mt-2 text-2xl font-bold text-navy-900">{myWorkload.activeTasks}</div>
            </div>
            <div className="p-4 rounded-xl bg-navy-50 border border-navy-100">
              <span className="text-xs text-navy-500 font-medium uppercase tracking-wider">Due Soon (48 Hours)</span>
              <div className="mt-2 text-2xl font-bold text-amber-600">{myWorkload.dueSoonTasks}</div>
            </div>
            <div className="p-4 rounded-xl bg-navy-50 border border-navy-100">
              <span className="text-xs text-navy-500 font-medium uppercase tracking-wider">Overdue Tasks</span>
              <div className="mt-2 text-2xl font-bold text-red-600">{myWorkload.overdueTasks}</div>
            </div>
            <div className="p-4 rounded-xl bg-navy-50 border border-navy-100">
              <span className="text-xs text-navy-500 font-medium uppercase tracking-wider">Pending Reviews</span>
              <div className="mt-2 text-2xl font-bold text-blue-600">{myWorkload.pendingSubmissions}</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-sm flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span>
              Tip: Manage your deliverables in the <strong>Daily Work</strong> station. Keep deadlines updated to ensure healthy workload distribution across your project sprint.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
