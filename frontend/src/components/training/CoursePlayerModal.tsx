import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { CourseEnrollment, CourseModule } from '../../types';
import { useToast } from '../../hooks/useToast';
import { api } from '../../lib/api-client';
import { CheckCircle, Play, FileText, BookOpen, Clock, Award } from 'lucide-react';

interface CoursePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollment: CourseEnrollment | null;
  onProgressUpdate: (updatedEnrollment: CourseEnrollment) => void;
}

export const CoursePlayerModal: React.FC<CoursePlayerModalProps> = ({
  isOpen,
  onClose,
  enrollment,
  onProgressUpdate,
}) => {
  const { showToast } = useToast();
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!enrollment || !enrollment.modules || enrollment.modules.length === 0) return null;

  const currentModule: CourseModule = enrollment.modules[activeModuleIndex] || enrollment.modules[0];
  const isCurrentCompleted = enrollment.completedModuleIds.includes(currentModule.id);

  const handleToggleModuleComplete = async () => {
    setIsUpdating(true);
    try {
      const response = await api.patch<{ progress: number; status: string; completedModuleIds: string[] }>(
        `/lms/enrollments/${enrollment.enrollmentId}/progress`,
        {
          moduleId: currentModule.id,
          isCompleted: !isCurrentCompleted,
        }
      );

      const updated: CourseEnrollment = {
        ...enrollment,
        progress: response.progress,
        status: response.status as any,
        completedModuleIds: response.completedModuleIds,
        completedModulesCount: response.completedModuleIds.length,
      };

      onProgressUpdate(updated);
      showToast(
        'success',
        isCurrentCompleted ? 'Module Marked Incomplete' : 'Module Completed 🎉',
        `Course progress is now ${response.progress}%`
      );
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message || 'Could not update progress.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 dark:text-white truncate block max-w-md">
              {enrollment.courseTitle}
            </span>
            <p className="text-xs font-normal text-slate-500">Corporate Training Portal • {enrollment.courseCategory}</p>
          </div>
        </div>
      }
      size="full"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[72vh]">
        {/* Module Content Player View (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col justify-between overflow-y-auto pr-1">
          <div className="space-y-4">
            {/* Header / Module Title */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Module {activeModuleIndex + 1} of {enrollment.modules.length}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{currentModule.title}</h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span>{currentModule.durationMinutes || 15} mins</span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleModuleComplete}
                  disabled={isUpdating}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors ${
                    isCurrentCompleted
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 hover:bg-emerald-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  {isCurrentCompleted ? 'Completed ✓' : 'Mark Module Complete'}
                </button>
              </div>
            </div>

            {/* Content Renderer */}
            {currentModule.contentType === 'VIDEO' && (
              <div className="bg-black rounded-xl overflow-hidden shadow-lg aspect-video flex items-center justify-center">
                {currentModule.contentUrl ? (
                  <video
                    controls
                    className="w-full h-full object-contain"
                    src={currentModule.contentUrl}
                    poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80"
                  />
                ) : (
                  <div className="text-center text-slate-400 p-8">
                    <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Corporate HD Video Player Ready</p>
                  </div>
                )}
              </div>
            )}

            {currentModule.contentType === 'TEXT' && (
              <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 prose dark:prose-invert max-w-none">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Lesson Overview</h4>
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {currentModule.textContent || currentModule.description}
                </div>
              </div>
            )}

            {currentModule.contentType === 'PDF' && (
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center space-y-3">
                <FileText className="w-12 h-12 text-indigo-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{currentModule.title} - Official PDF Handbook</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {currentModule.description || 'Download and review the corporate engineering standards documentation.'}
                </p>
                <a
                  href={currentModule.contentUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Open PDF Viewer / Download
                </a>
              </div>
            )}
          </div>

          {/* Bottom Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700 mt-6">
            <button
              type="button"
              disabled={activeModuleIndex === 0}
              onClick={() => setActiveModuleIndex((prev) => prev - 1)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200"
            >
              ← Previous Module
            </button>

            <button
              type="button"
              disabled={activeModuleIndex === enrollment.modules.length - 1}
              onClick={() => setActiveModuleIndex((prev) => prev + 1)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white disabled:opacity-40 hover:bg-indigo-700"
            >
              Next Module →
            </button>
          </div>
        </div>

        {/* Sidebar Syllabus & Progress Checklist (1 Col) */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            {/* Overall Course Progress Bar */}
            <div className="p-3.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-700 dark:text-slate-300">Course Progress</span>
                <span className="text-emerald-600 dark:text-emerald-400">{enrollment.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${enrollment.progress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                {enrollment.completedModulesCount} of {enrollment.totalModules} modules completed
              </p>
            </div>

            {/* Module Checklist */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Modules Syllabus</h4>
              <div className="space-y-1.5">
                {enrollment.modules.map((mod, idx) => {
                  const isDone = enrollment.completedModuleIds.includes(mod.id);
                  const isSelected = idx === activeModuleIndex;

                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => setActiveModuleIndex(idx)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-400'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-sm ${isDone ? 'text-emerald-500 font-bold' : 'text-slate-400'}`}>
                          {isDone ? '✓' : '○'}
                        </span>
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                          {mod.title}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700">
                        {mod.contentType}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Certificate Badge if 100% */}
          {enrollment.progress === 100 && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mt-4">
              <Award className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Congratulations! Course completed & certified.</span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
