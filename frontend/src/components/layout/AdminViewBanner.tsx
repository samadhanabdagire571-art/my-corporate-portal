import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ShieldAlert, LogOut } from 'lucide-react';

export const AdminViewBanner: React.FC = () => {
  const { user } = useAuth();

  // Check if session has impersonation flag
  const isImpersonated = (user as any)?.isImpersonated || localStorage.getItem('corporate_impersonating') === 'true';

  if (!isImpersonated) return null;

  const handleExitViewMode = () => {
    const backupAdminToken = localStorage.getItem('corporate_admin_backup_token');
    const backupAdminUser = localStorage.getItem('corporate_admin_backup_user');

    if (backupAdminToken && backupAdminUser) {
      localStorage.setItem('corporate_token', backupAdminToken);
      localStorage.setItem('corporate_user', backupAdminUser);
      localStorage.removeItem('corporate_impersonating');
      localStorage.removeItem('corporate_admin_backup_token');
      localStorage.removeItem('corporate_admin_backup_user');
      window.location.href = '/admin/dashboard';
    } else {
      localStorage.removeItem('corporate_impersonating');
      localStorage.removeItem('corporate_token');
      localStorage.removeItem('corporate_user');
      window.location.href = '/login';
    }
  };

  return (
    <div className="bg-amber-500 text-slate-950 font-bold px-4 py-2 flex items-center justify-between text-xs z-50 sticky top-0 shadow-md">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-slate-950 animate-pulse" />
        <span>
          ADMIN VIEW MODE: You are viewing this portal as{' '}
          <strong className="underline decoration-slate-900">{user?.name}</strong> ({user?.role}) for diagnostic & support monitoring.
        </span>
      </div>

      <button
        type="button"
        onClick={handleExitViewMode}
        className="px-3 py-1 bg-slate-950 text-white hover:bg-slate-900 text-xs rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Exit View Mode</span>
      </button>
    </div>
  );
};
