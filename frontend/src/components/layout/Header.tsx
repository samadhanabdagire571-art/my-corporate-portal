import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  Search,
  Building,
  KeyRound,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Check,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { StatusBadge } from '../ui/StatusBadge';
import { api } from '../../lib/api-client';
import { NotificationItem, PaginatedResponse } from '../../types';
import { GlobalSearchModal } from '../search/GlobalSearchModal';
import { AdminViewBanner } from './AdminViewBanner';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Global search shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchNotificationData = async () => {
    try {
      const [countRes, listRes] = await Promise.all([
        api.get<{ unreadCount: number }>('/notifications/unread-count'),
        api.get<PaginatedResponse<NotificationItem>>('/notifications?limit=5'),
      ]);
      setUnreadCount(countRes.unreadCount);
      setNotifications(listRes.data);
    } catch {
      // Quiet fail if not logged in
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotificationData();
      const interval = setInterval(fetchNotificationData, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all', {});
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      //
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`, {});
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch {
      //
    }
  };

  // Derive page title from path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/admin/dashboard')) return 'Admin Overview';
    if (path.includes('/admin/employees')) return 'Employee & Intern Management';
    if (path.includes('/admin/team-leaders')) return 'Team Leader Management';
    if (path.includes('/admin/teams')) return 'Corporate Team Management';
    if (path.includes('/admin/projects')) return 'Projects Portfolio';
    if (path.includes('/admin/announcements')) return 'Company Announcements';
    if (path.includes('/admin/resources')) return 'Company Resources';
    if (path.includes('/admin/knowledge-base')) return 'Knowledge Base';
    if (path.includes('/admin/courses')) return 'LMS Courses';
    if (path.includes('/admin/reports')) return 'Enterprise Intelligence & Reports';
    if (path.includes('/admin/audit-logs')) return 'Immutable Audit Trail';
    if (path.includes('/admin/settings')) return 'Enterprise Governance & Settings';
    if (path.includes('/leader/dashboard')) return 'Team Leader Workstation';
    if (path.includes('/leader/submissions')) return 'Work Submissions & Reviews';
    if (path.includes('/leader/task-plans')) return 'Project Task Plans';
    if (path.includes('/leader/daily-work')) return "Today's Work Command Center";
    if (path.includes('/employee/dashboard')) return 'Employee Workstation';
    if (path.includes('/employee/daily-work')) return "Today's Work Focus";
    if (path.includes('/employee/work-history')) return 'My Work Deliverables';
    if (path.includes('/employee/training')) return 'LMS Training Portal';
    if (path.includes('/employee/documents')) return 'Company Resources';
    if (path.includes('/employee/help-center')) return 'Help Center';
    if (path.includes('/notifications')) return 'Notifications Center';
    return 'Portal';
  };

  return (
    <>
      <AdminViewBanner />
      <header className="h-16 bg-white border-b border-navy-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-subtle">
        {/* Title & Organization Info */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-base font-bold text-navy-900 tracking-tight flex items-center gap-2">
              <span>{getPageTitle()}</span>
            </h1>
            <div className="flex items-center gap-2 text-xs text-navy-500">
              <span className="flex items-center gap-1 font-medium text-navy-700">
                <Building className="w-3 h-3 text-corporate-600" />
                Nexus Global Enterprises
              </span>
              <span>•</span>
              <span className="text-[11px] text-navy-400">Enterprise SaaS Platform</span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Search Button */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 text-xs text-navy-400 bg-navy-50 hover:bg-navy-100/70 border border-navy-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-navy-400" />
            <span>Quick search...</span>
            <kbd className="text-[10px] bg-white border border-navy-200 rounded px-1 text-navy-500 shadow-sm font-mono">
              ⌘K
            </kbd>
          </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className="relative p-2 rounded-lg text-navy-600 hover:text-navy-900 hover:bg-navy-50 border border-navy-200 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-navy-200 shadow-elevated p-3 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-navy-100">
                <span className="text-xs font-bold text-navy-900">
                  Notifications {unreadCount > 0 && `(${unreadCount} new)`}
                </span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-semibold text-corporate-600 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-navy-100 py-1 max-h-64 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (!n.isRead) handleMarkRead(n.id);
                        if (n.link) {
                          navigate(n.link);
                          setNotificationsOpen(false);
                        }
                      }}
                      className={`py-2 px-2 rounded-lg transition-colors cursor-pointer ${
                        !n.isRead ? 'bg-indigo-50/60' : 'hover:bg-navy-50'
                      }`}
                    >
                      <p className="text-xs font-semibold text-navy-800 leading-snug">{n.title}</p>
                      <p className="text-[11px] text-navy-500 line-clamp-1 mt-0.5">{n.message}</p>
                      <span className="text-[9px] text-navy-400 mt-1 block">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-navy-400 text-center py-4">No recent notifications</p>
                )}
              </div>

              <div className="pt-2 border-t border-navy-100 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs font-semibold text-corporate-600 hover:underline inline-flex items-center gap-1"
                >
                  View all notifications <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>


        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-navy-200 hover:bg-navy-50 transition-colors cursor-pointer bg-white"
          >
            <div className="w-7 h-7 rounded-full bg-corporate-600 text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden">
              {user?.profilePhotoUrl ? (
                <img src={user.profilePhotoUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>
            <div className="text-left hidden md:block">
              <span className="text-xs font-bold text-navy-900 block leading-tight truncate max-w-[120px]">
                {user?.name}
              </span>
              <span className="text-[10px] text-navy-500 block truncate max-w-[120px]">
                {user?.designation || user?.role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-navy-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-navy-200 shadow-elevated p-2 z-50 animate-in fade-in duration-150">
              <div className="p-3 border-b border-navy-100 mb-1">
                <p className="text-xs font-bold text-navy-900 leading-tight">{user?.name}</p>
                <p className="text-[11px] text-navy-500 truncate mt-0.5">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge status={user?.role || 'EMPLOYEE'} size="sm" />
                  <span className="text-[10px] text-navy-400 font-mono">{user?.employeeId}</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    if (user?.role === 'ADMIN' || user?.role === 'TEAM_LEADER') {
                      navigate('/admin/employees');
                    } else {
                      navigate('/employee/dashboard');
                    }
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-navy-700 hover:bg-navy-50 rounded-lg transition-colors text-left"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-navy-400" />
                  <span>My Personnel Record</span>
                </button>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/admin/settings');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-navy-700 hover:bg-navy-50 rounded-lg transition-colors text-left"
                >
                  <KeyRound className="w-3.5 h-3.5 text-navy-400" />
                  <span>Security & Password</span>
                </button>
              </div>

              <div className="border-t border-navy-100 mt-1 pt-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
    <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};
