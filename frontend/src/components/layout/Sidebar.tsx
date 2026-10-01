import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  FolderGit2,
  CheckSquare,
  Send,
  GraduationCap,
  FileText,
  Megaphone,
  BarChart3,
  ShieldAlert,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Building,
  Layers,
  Sun,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Bell,
  Activity,
  Server,
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import { StatusBadge } from '../ui/StatusBadge';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  placeholder?: boolean;
}

interface NavHeader {
  header: string;
}

type NavEntry = NavItem | NavHeader;

export const Sidebar: React.FC = () => {
  const { user, logout, isAdmin, isTeamLeader } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Admin Navigation links
  const adminNav: NavEntry[] = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Employees', path: '/admin/employees', icon: Users, badge: 'Core' },
    { name: 'Team Leaders', path: '/admin/team-leaders', icon: UserCheck },
    { name: 'Teams', path: '/admin/teams', icon: Building2 },
    { name: 'Projects', path: '/admin/projects', icon: FolderGit2 },
    { header: 'TASK & WORKFORCE OPS' },
    { name: 'Task Plans', path: '/admin/projects', icon: Layers },
    { name: 'Daily Work', path: '/leader/daily-work', icon: Sun },
    { name: 'Unassigned Tasks', path: '/leader/unassigned-tasks', icon: AlertCircle },
    { name: 'Task Templates', path: '/leader/templates', icon: Sparkles },
    { name: 'Workload Capacity', path: '/admin/workload', icon: Activity },
    { header: 'CMS & LMS MODULES' },
    { name: 'Announcements', path: '/admin/announcements', icon: Megaphone },
    { name: 'Company Resources', path: '/admin/resources', icon: FileText },
    { name: 'Knowledge Base', path: '/admin/knowledge-base', icon: HelpCircle },
    { name: 'LMS Courses', path: '/admin/courses', icon: GraduationCap },
    { header: 'ENTERPRISE GOVERNANCE' },
    { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert },
    { name: 'System Monitoring', path: '/admin/monitoring', icon: Server },
    { name: 'System Settings', path: '/admin/settings', icon: Settings },
    { header: 'ACCOUNT' },
    { name: 'Notifications', path: '/notifications', icon: Bell },
  ];

  // Team Leader Navigation
  const leaderNav: NavEntry[] = [
    { name: 'Dashboard', path: '/leader/dashboard', icon: LayoutDashboard },
    { name: 'My Team', path: '/admin/teams', icon: Building2 },
    { name: 'My Projects', path: '/admin/projects', icon: FolderGit2 },
    { name: 'Task Plans', path: '/leader/task-plans', icon: Layers },
    { name: 'Daily Work', path: '/leader/daily-work', icon: Sun },
    { name: 'Team Workload', path: '/leader/workload', icon: Activity },
    { name: 'Unassigned Tasks', path: '/leader/unassigned-tasks', icon: AlertCircle },
    { name: 'Submissions', path: '/leader/submissions', icon: Send },
    { name: 'Work History', path: '/employee/work-history', icon: BarChart3 },
    { name: 'Training', path: '/employee/training', icon: GraduationCap },
    { name: 'Documents', path: '/employee/documents', icon: FileText },
    { name: 'Help Center', path: '/help-center', icon: HelpCircle },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Profile', path: '/profile', icon: Settings },
  ];

  // Employee / Intern Navigation
  const employeeNav: NavEntry[] = [
    { name: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
    { name: 'Today\'s Work', path: '/employee/daily-work', icon: Sun },
    { name: 'My Projects', path: '/admin/projects', icon: FolderGit2 },
    { name: 'My Work', path: '/employee/work-history', icon: Layers },
    { name: 'My Capacity', path: '/employee/workload', icon: Activity },
    { name: 'Training', path: '/employee/training', icon: GraduationCap },
    { name: 'Documents', path: '/employee/documents', icon: FileText },
    { name: 'Help Center', path: '/help-center', icon: HelpCircle },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Profile', path: '/profile', icon: Settings },
  ];

  const currentNav = isAdmin ? adminNav : isTeamLeader ? leaderNav : employeeNav;


  return (
    <aside
      className={cn(
        'relative bg-white border-r border-navy-200 flex flex-col h-screen select-none transition-all duration-300 z-30 shrink-0',
        collapsed ? 'w-20' : 'w-64',
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-navy-100 bg-white">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-corporate-600 flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
              <Building className="w-5 h-5" />
            </div>
            <div className="leading-tight truncate">
              <span className="text-sm font-bold text-navy-900 tracking-tight block">
                NEXUS CORP
              </span>
              <span className="text-[10px] font-semibold text-corporate-600 uppercase tracking-wider block">
                Workforce Portal
              </span>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-lg bg-corporate-600 flex items-center justify-center text-white mx-auto shadow-sm">
            <Building className="w-5 h-5" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-navy-400 hover:text-navy-700 hover:bg-navy-50 p-1.5 rounded-md transition-colors hidden md:flex items-center justify-center cursor-pointer"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {currentNav.map((item, index) => {
          if ('header' in item) {
            if (collapsed) return <div key={index} className="my-2 border-t border-navy-100" />;
            return (
              <div
                key={index}
                className="pt-4 pb-1.5 px-3 text-[10px] font-bold text-navy-400 uppercase tracking-wider"
              >
                {item.header}
              </div>
            );
          }

          const IconComponent = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative',
                  isActive
                    ? 'bg-corporate-50 text-corporate-700 font-semibold'
                    : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900',
                  collapsed && 'justify-center px-0 py-2.5',
                )
              }
              title={collapsed ? item.name : undefined}
            >
              {({ isActive }) => (
                <>
                  <IconComponent
                    className="w-4 h-4 shrink-0 transition-colors group-hover:text-corporate-600"
                  />

                  {!collapsed && (
                    <span className="truncate flex-1 flex items-center justify-between">
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="bg-corporate-100 text-corporate-800 text-[10px] px-1.5 py-0.5 rounded font-semibold">
                          {item.badge}
                        </span>
                      )}
                      {item.placeholder && (
                        <span className="text-[9px] text-navy-400 font-normal border border-navy-200 rounded px-1">
                          Soon
                        </span>
                      )}
                    </span>
                  )}

                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-corporate-600 rounded-r-full" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-navy-100 bg-navy-50/50">
        {!collapsed ? (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 px-1">
              <div className="w-8 h-8 rounded-full bg-corporate-600 text-white flex items-center justify-center font-semibold text-xs shrink-0 shadow-sm overflow-hidden">
                {user?.profilePhotoUrl ? (
                  <img src={user.profilePhotoUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || 'U'
                )}
              </div>
              <div className="truncate flex-1">
                <p className="text-xs font-semibold text-navy-900 truncate leading-tight">{user?.name}</p>
                <p className="text-[10px] text-navy-500 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between px-1">
              <StatusBadge status={user?.role || 'EMPLOYEE'} size="sm" />
              <button
                onClick={logout}
                className="text-navy-500 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-md transition-colors flex items-center gap-1 text-xs cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="text-[11px]">Logout</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-corporate-600 text-white flex items-center justify-center font-semibold text-xs shadow-sm overflow-hidden">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <button
              onClick={logout}
              className="text-navy-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
