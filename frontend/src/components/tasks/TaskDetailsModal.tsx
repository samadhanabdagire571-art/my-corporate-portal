import React from 'react';
import { Modal } from '../ui/Modal';
import { Task } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { Calendar, AlertCircle, PlayCircle, Send, Clock, User, CheckCircle2, FileText, Download } from 'lucide-react';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onStartWork?: (task: Task) => void;
  onSubmitWork?: (task: Task) => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  isOpen,
  onClose,
  task,
  onStartWork,
  onSubmitWork,
}) => {
  if (!task) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">Task Details</span>
            <p className="text-xs font-normal text-slate-500">{task.projectName || 'Project Task'}</p>
          </div>
        </div>
      }
      size="lg"
    >
      <div className="space-y-4">
        {/* Title & Status */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{task.title}</h3>
            <div className="flex items-center gap-2">
              <StatusBadge status={task.status} />
              <StatusBadge status={task.priority} />
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {task.description || 'No detailed description provided for this task.'}
          </p>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Assigned Date</span>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-slate-700 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {task.startDate || task.createdAt?.split('T')[0] || 'Recently'}
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Due Date</span>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-slate-700 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              {task.dueDate || 'Today, 6:00 PM'}
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Assigned To</span>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-slate-700 dark:text-slate-300">
              <User className="w-3.5 h-3.5 text-indigo-500" />
              {task.assignedEmployee?.fullName || 'Assigned Staff'}
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Daily Work</span>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-slate-700 dark:text-slate-300">
              <CheckCircle2 className={`w-3.5 h-3.5 ${task.isTodayWork ? 'text-emerald-500' : 'text-slate-400'}`} />
              {task.isTodayWork ? "Today's Work" : 'Standard Queue'}
            </div>
          </div>
        </div>

        {/* Revision Feedback callout */}
        {task.status === 'REVISION_REQUIRED' && task.reviewFeedback && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                  Revision Instructions from Team Leader
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">{task.reviewFeedback}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submission History / Attachment if submitted */}
        {task.submittedAt && (
          <div className="p-4 bg-indigo-50/40 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50 space-y-2">
            <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
              Latest Submission ({new Date(task.submittedAt).toLocaleString()})
            </h4>
            {task.submissionMessage && (
              <p className="text-xs text-slate-700 dark:text-slate-300">
                <span className="font-semibold text-slate-900 dark:text-white">Message:</span> {task.submissionMessage}
              </p>
            )}
            {task.submissionComment && (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-white">Comment:</span> {task.submissionComment}
              </p>
            )}
            {task.submissionAttachmentUrl && (
              <div className="pt-2">
                <a
                  href={task.submissionAttachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  {task.submissionAttachmentName || 'Download Attachment'}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>

          {task.status === 'ASSIGNED' && onStartWork && (
            <button
              type="button"
              onClick={() => {
                onStartWork(task);
                onClose();
              }}
              className="px-4 py-2 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5"
            >
              <PlayCircle className="w-4 h-4" />
              Start Work
            </button>
          )}

          {(task.status === 'IN_PROGRESS' || task.status === 'REVISION_REQUIRED') && onSubmitWork && (
            <button
              type="button"
              onClick={() => {
                onSubmitWork(task);
                onClose();
              }}
              className="px-4 py-2 text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              {task.status === 'REVISION_REQUIRED' ? 'Update & Resubmit' : 'Submit Work'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
