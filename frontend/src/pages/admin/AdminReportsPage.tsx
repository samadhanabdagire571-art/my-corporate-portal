import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api-client';
import {
  OrganizationReportData,
  WorkReportData,
  ProjectReportItem,
  EmployeeReportItem,
} from '../../types';
import { useToast } from '../../hooks/useToast';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  BarChart3,
  Download,
  Building2,
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  RefreshCw,
  FolderGit2,
} from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'ORGANIZATION' | 'WORK' | 'PROJECTS' | 'EMPLOYEES'>('ORGANIZATION');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Data states
  const [orgData, setOrgData] = useState<OrganizationReportData | null>(null);
  const [workData, setWorkData] = useState<WorkReportData | null>(null);
  const [projectsData, setProjectsData] = useState<ProjectReportItem[]>([]);
  const [employeesData, setEmployeesData] = useState<EmployeeReportItem[]>([]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [orgRes, workRes, projRes, empRes] = await Promise.all([
        api.get<OrganizationReportData>('/reports/organization'),
        api.get<WorkReportData>('/reports/work'),
        api.get<ProjectReportItem[]>('/reports/projects'),
        api.get<EmployeeReportItem[]>('/reports/employees'),
      ]);
      setOrgData(orgRes);
      setWorkData(workRes);
      setProjectsData(projRes);
      setEmployeesData(empRes);
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Failed to load enterprise reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExport = async (type: string, format: 'csv' | 'xlsx' = 'csv') => {
    setExporting(true);
    try {
      const token = localStorage.getItem('corporate_token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const response = await fetch(
        `${baseUrl}/api/reports/export?type=${type}&format=${format}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to generate export file');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast('success', 'Export Downloaded', `Successfully exported ${type} report as ${format.toUpperCase()}.`);
    } catch (err: any) {
      showToast('error', 'Export Failed', err.message || 'Could not export report data.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Enterprise Analytics & Intelligence Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time corporate metrics, project deliverable health, and workforce performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchReports}
            disabled={loading}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => handleExport(activeTab.toLowerCase(), 'csv')}
            disabled={exporting}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exporting ? 'Generating...' : `Export ${activeTab} (CSV)`}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('ORGANIZATION')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'ORGANIZATION'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Organization Report</span>
        </button>

        <button
          onClick={() => setActiveTab('WORK')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'WORK'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Work Deliverables</span>
        </button>

        <button
          onClick={() => setActiveTab('PROJECTS')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'PROJECTS'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Projects Portfolio</span>
        </button>

        <button
          onClick={() => setActiveTab('EMPLOYEES')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'EMPLOYEES'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Employee Performance</span>
        </button>
      </div>

      {/* Tab 1: Organization Report */}
      {activeTab === 'ORGANIZATION' && orgData && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Staff</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{orgData.totalEmployees}</p>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Active Accounts</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Active Employees</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">{orgData.activeEmployees}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">Full-time Staff</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Interns Count</span>
              <p className="text-2xl font-black text-cyan-600 mt-1">{orgData.internsCount}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">Trainees / Interns</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Corporate Teams</span>
              <p className="text-2xl font-black text-indigo-600 mt-1">{orgData.totalTeams}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">Operational units</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Team Leaders</span>
              <p className="text-2xl font-black text-purple-600 mt-1">{orgData.totalLeaders}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">Project Leads</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Active Projects</span>
              <p className="text-2xl font-black text-amber-600 mt-1">{orgData.activeProjects}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">In Flight</span>
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              Department Staff Distribution
            </h3>
            <div className="space-y-4">
              {orgData.departmentBreakdown.map((dept) => {
                const percentage = orgData.totalEmployees > 0 ? Math.round((dept.count / orgData.totalEmployees) * 100) : 0;
                return (
                  <div key={dept.department} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{dept.department}</span>
                      <span className="text-slate-500 font-mono">
                        {dept.count} members ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Work Report */}
      {activeTab === 'WORK' && workData && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Tasks</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{workData.totalTasks}</p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 mt-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{workData.completionRate}% completion rate</span>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Completed</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">{workData.completed}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">Approved & Done</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">In Progress</span>
              <p className="text-2xl font-black text-indigo-600 mt-1">{workData.inProgress}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">Currently Active</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Pending / Unassigned</span>
              <p className="text-2xl font-black text-amber-600 mt-1">{workData.pending}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">Awaiting Start</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Overdue Work</span>
              <p className="text-2xl font-black text-rose-600 mt-1">{workData.overdue}</p>
              <span className="text-[10px] text-rose-500 mt-1 block">Passed Target Due Date</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Revision Required</span>
              <p className="text-2xl font-black text-orange-600 mt-1">{workData.revisionRequired}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">Feedback Given</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Under Review</span>
              <p className="text-2xl font-black text-sky-600 mt-1">{workData.submitted}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">Pending TL Decision</span>
            </div>

            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900 shadow-sm">
              <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block">Work Velocity</span>
              <p className="text-2xl font-black text-indigo-900 dark:text-white mt-1">{workData.completionRate}%</p>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1 block">Overall Portal Health</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Projects Report */}
      {activeTab === 'PROJECTS' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3">Team Leader</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Tasks</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3 text-right">Overdue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {projectsData.map((p) => (
                  <tr key={p.projectId} className="hover:bg-slate-50/70 dark:hover:bg-slate-750 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-slate-400">{p.projectCode}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">{p.projectName}</td>
                    <td className="px-4 py-3.5">{p.department}</td>
                    <td className="px-4 py-3.5">{p.teamName}</td>
                    <td className="px-4 py-3.5 font-medium">{p.leaderName}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono">
                      <span className="text-emerald-600 font-bold">{p.completedTasks}</span>
                      <span className="text-slate-400">/{p.totalTasks}</span>
                    </td>
                    <td className="px-4 py-3.5 min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              p.progressPercentage >= 80
                                ? 'bg-emerald-500'
                                : p.progressPercentage >= 40
                                ? 'bg-indigo-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${p.progressPercentage}%` }}
                          />
                        </div>
                        <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300 w-9 text-right">
                          {p.progressPercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold">
                      {p.overdueTasks > 0 ? (
                        <span className="text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full text-[10px]">
                          {p.overdueTasks} Overdue
                        </span>
                      ) : (
                        <span className="text-emerald-600 text-[11px]">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Employee Report */}
      {activeTab === 'EMPLOYEES' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Designation</th>
                  <th className="px-4 py-3 text-center">Assigned</th>
                  <th className="px-4 py-3 text-center">Done</th>
                  <th className="px-4 py-3 text-center">In Progress</th>
                  <th className="px-4 py-3 text-center">Revisions</th>
                  <th className="px-4 py-3">Completion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {employeesData.map((e) => (
                  <tr key={e.employeeId} className="hover:bg-slate-50/70 dark:hover:bg-slate-750 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-slate-400">{e.employeeId}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-900 dark:text-white">{e.fullName}</p>
                      <p className="text-[11px] text-slate-400">{e.email}</p>
                    </td>
                    <td className="px-4 py-3.5">{e.department}</td>
                    <td className="px-4 py-3.5">{e.designation}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-slate-800 dark:text-slate-200">
                      {e.assignedTasks}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-emerald-600">{e.completedTasks}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-indigo-600">{e.inProgressTasks}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-orange-600">{e.revisionCount}</td>
                    <td className="px-4 py-3.5 min-w-[130px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${e.completionRate}%` }}
                          />
                        </div>
                        <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300 w-8 text-right">
                          {e.completionRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
