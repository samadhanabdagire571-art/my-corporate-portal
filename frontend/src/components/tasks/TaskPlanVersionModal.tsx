import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api-client';
import { TaskPlanVersion } from '../../types';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../ui/Modal';
import {
  History,
  GitCommit,
  User,
  Calendar,
  CheckCircle2,
  PlusCircle,
  MinusCircle,
  FileCode,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface TaskPlanVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

export const TaskPlanVersionModal: React.FC<TaskPlanVersionModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
}) => {
  const { showToast } = useToast();
  const [versions, setVersions] = useState<TaskPlanVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedVersion, setExpandedVersion] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchVersions();
    }
  }, [isOpen, projectId]);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const data = await api.get<TaskPlanVersion[]>(`/projects/${projectId}/versions`);
      setVersions(data);
      if (data.length > 0) setExpandedVersion(data[0].versionNumber);
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Failed to load task plan version history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600" />
          <span>Task Plan Version History — {projectName}</span>
        </div>
      }
      size="lg"
    >
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading version timeline...</div>
        ) : versions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No version baselines recorded yet for this project.
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((ver) => {
              const isExpanded = expandedVersion === ver.versionNumber;
              return (
                <div
                  key={ver.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm transition-all"
                >
                  <div
                    onClick={() => setExpandedVersion(isExpanded ? null : ver.versionNumber)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs border border-indigo-200 dark:border-indigo-800">
                        v{ver.versionNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            Version {ver.versionNumber} → {ver.totalTasks} Deliverables
                          </h4>
                          {ver.versionNumber === versions[0].versionNumber && (
                            <span className="px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold">
                              Current Baseline
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{ver.summary}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <div className="text-right hidden sm:block">
                        <span className="block font-medium text-slate-700 dark:text-slate-300">
                          {ver.changedByName}
                        </span>
                        <span className="text-[10px]">
                          {new Date(ver.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Expanded Snapshot view */}
                  {isExpanded && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/60 space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] text-slate-400 block font-semibold">TOTAL TASKS</span>
                          <span className="font-bold text-slate-900 dark:text-white">{ver.totalTasks}</span>
                        </div>
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] text-emerald-600 block font-semibold">ADDED</span>
                          <span className="font-bold text-emerald-600">+{ver.addedCount}</span>
                        </div>
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] text-indigo-600 block font-semibold">MODIFIED / RETAINED</span>
                          <span className="font-bold text-indigo-600">{ver.modifiedCount}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Version Snapshot Tasks ({ver.snapshot.length})
                        </span>
                        {ver.snapshot.map((t, idx) => (
                          <div
                            key={t.id || idx}
                            className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                          >
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                              {idx + 1}. {t.title}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-slate-400">{t.priority}</span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                {t.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold"
          >
            Close Version History
          </button>
        </div>
      </div>
    </Modal>
  );
};
