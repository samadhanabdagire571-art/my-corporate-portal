import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Task } from '../../types';
import { useToast } from '../../hooks/useToast';
import { api } from '../../lib/api-client';
import { CheckCircle, AlertTriangle, Download, User, Calendar, MessageSquare } from 'lucide-react';

interface ReviewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSuccess: (updatedTask: Task) => void;
}

export const ReviewSubmissionModal: React.FC<ReviewSubmissionModalProps> = ({
  isOpen,
  onClose,
  task,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [isRevisionMode, setIsRevisionMode] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    setIsRevisionMode(false);
    setFeedback('');
  }, [task, isOpen]);

  const handleApprove = async () => {
    if (!task) return;
    setIsSubmitting(true);
    try {
      const response = await api.post<Task>(`/tasks/${task.id}/review`, {
        decision: 'APPROVE',
        feedback: feedback.trim() || 'Work approved. Great job!',
      });
      showToast('success', 'Work Approved', `Task "${task.title}" has been marked Completed.`);
      onSuccess(response);
      onClose();
    } catch (err: any) {
      showToast('error', 'Review Failed', err.message || 'Could not approve work.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!task) return;
    if (!feedback.trim()) {
      showToast('error', 'Feedback Required', 'Please explain what needs to be improved for the revision.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post<Task>(`/tasks/${task.id}/review`, {
        decision: 'REVISION_REQUIRED',
        feedback: feedback.trim(),
      });
      showToast('info', 'Revision Requested', `Feedback sent to employee for "${task.title}".`);
      onSuccess(response);
      onClose();
    } catch (err: any) {
      showToast('error', 'Review Failed', err.message || 'Could not submit revision request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!task) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">Review Work Submission</span>
            <p className="text-xs font-normal text-slate-500">{task.projectName || 'Project Task'}</p>
          </div>
        </div>
      }
      size="lg"
    >
      <div className="space-y-4">
        {/* Submitter & Task Banner */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{task.title}</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
              {task.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-500" />
              <span>Employee: <strong className="text-slate-900 dark:text-white">{task.assignedEmployee?.fullName || 'Assigned Staff'}</strong></span>
            </div>
            {task.submittedAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Submitted: {new Date(task.submittedAt).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Deliverables Section */}
        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Employee Deliverables</h4>

          <div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Completion Message:</span>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-sm text-slate-800 dark:text-slate-200 leading-relaxed border border-slate-200 dark:border-slate-700">
              {task.submissionMessage || 'Work has been completed and submitted for review.'}
            </div>
          </div>

          {task.submissionComment && (
            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Additional Comment:</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded-lg">
                "{task.submissionComment}"
              </p>
            </div>
          )}

          {task.submissionAttachmentUrl && (
            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Attached File:</span>
              <a
                href={task.submissionAttachmentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
              >
                <Download className="w-4 h-4" />
                {task.submissionAttachmentName || 'Download Submission Attachment'}
              </a>
            </div>
          )}
        </div>

        {/* Revision Mode Feedback Form */}
        {isRevisionMode ? (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
              <MessageSquare className="w-4 h-4" />
              Specific Feedback / Revision Instructions
            </div>
            <textarea
              required
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g. Please improve the mobile layout and submit again..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRevisionMode(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestRevision}
                disabled={isSubmitting}
                className="px-4 py-1.5 text-xs font-semibold rounded-md text-white bg-amber-600 hover:bg-amber-700 transition-colors flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Confirm Revision Request
              </button>
            </div>
          </div>
        ) : (
          /* Decision Action Bar */
          <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => setIsRevisionMode(true)}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold rounded-lg text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 transition-colors flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4" />
              Request Revision
            </button>

            <button
              type="button"
              onClick={handleApprove}
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle className="w-4 h-4" />
              Approve Work
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
