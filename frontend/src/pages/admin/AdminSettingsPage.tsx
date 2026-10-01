import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api-client';
import { OrganizationSettings } from '../../types';
import { useToast } from '../../hooks/useToast';
import {
  Sliders,
  Save,
  Building,
  ShieldCheck,
  FileCheck,
  Bell,
  GraduationCap,
  Megaphone,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newDepartment, setNewDepartment] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await api.get<OrganizationSettings>('/settings');
      setSettings(data);
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Failed to load organization settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await api.patch<OrganizationSettings>('/settings', settings);
      setSettings(updated);
      showToast('success', 'Settings Saved', 'Corporate configuration successfully updated.');
    } catch (err: any) {
      showToast('error', 'Save Failed', err.message || 'Could not save organization settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddDepartment = () => {
    if (!newDepartment.trim() || !settings) return;
    if (settings.departments.includes(newDepartment.trim())) {
      showToast('warning', 'Already Exists', 'This department is already in the corporate roster.');
      return;
    }
    setSettings({
      ...settings,
      departments: [...settings.departments, newDepartment.trim()],
    });
    setNewDepartment('');
  };

  const handleRemoveDepartment = (deptToRemove: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      departments: settings.departments.filter((d) => d !== deptToRemove),
    });
  };

  if (loading || !settings) {
    return (
      <div className="p-12 text-center text-slate-400">
        Loading organization settings...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Enterprise Governance & System Policies
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global defaults, department catalogs, storage quotas, notification rules, and LMS/CMS policies.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Organization Identity */}
        <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
            <Building className="w-4 h-4 text-indigo-500" />
            Organization Identity & Defaults
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Corporate Entity Name
              </label>
              <input
                type="text"
                value={settings.organizationName}
                onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Enterprise Email Domain
              </label>
              <input
                type="text"
                value={settings.domain}
                onChange={(e) => setSettings({ ...settings, domain: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Default Deliverable Priority
              </label>
              <select
                value={settings.defaultTaskPriority}
                onChange={(e) => setSettings({ ...settings, defaultTaskPriority: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Storage & File Policies */}
        <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
            <FileCheck className="w-4 h-4 text-emerald-500" />
            File Upload & Storage Governance
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Max Upload File Size (MB)
              </label>
              <input
                type="number"
                value={settings.maxFileUploadSizeMb}
                onChange={(e) => setSettings({ ...settings, maxFileUploadSizeMb: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                min={1}
                max={100}
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Applies to deliverables, LMS resources, and CMS attachments.</span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Allowed File Extensions
              </label>
              <div className="flex flex-wrap gap-1.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900">
                {settings.allowedFileExtensions.map((ext) => (
                  <span
                    key={ext}
                    className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    {ext}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Departments Management */}
        <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
            <ShieldCheck className="w-4 h-4 text-purple-500" />
            Corporate Departments Directory
          </h3>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="New Department name..."
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddDepartment}
                className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg max-h-48 overflow-y-auto">
              {settings.departments.map((dept) => (
                <div key={dept} className="flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-750">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{dept}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDepartment(dept)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Notifications & LMS/CMS Automation */}
        <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
            <Bell className="w-4 h-4 text-amber-500" />
            Notification & Learning Automation
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">In-App Live Notifications</span>
                <span className="text-[11px] text-slate-400">Push real-time alerts for submissions, reviews, and assignments</span>
              </div>
              <input
                type="checkbox"
                checked={settings.inAppNotificationsEnabled}
                onChange={(e) => setSettings({ ...settings, inAppNotificationsEnabled: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">LMS Auto-Enrollment</span>
                <span className="text-[11px] text-slate-400">Automatically assign mandatory compliance courses to new joiners</span>
              </div>
              <input
                type="checkbox"
                checked={settings.lmsAutoEnrollNewEmployees}
                onChange={(e) => setSettings({ ...settings, lmsAutoEnrollNewEmployees: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Email Notification Relays</span>
                <span className="text-[11px] text-slate-400">Dispatch daily digest summary emails for pending approvals</span>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotificationsEnabled}
                onChange={(e) => setSettings({ ...settings, emailNotificationsEnabled: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </label>
          </div>
        </div>
      </form>
    </div>
  );
};
