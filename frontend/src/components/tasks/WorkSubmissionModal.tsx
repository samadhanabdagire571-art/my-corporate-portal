import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Task } from '../../types';
import { useToast } from '../../hooks/useToast';
import { api } from '../../lib/api-client';
import { UploadCloud, CheckCircle2, FileText, X } from 'lucide-react';

interface WorkSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSuccess: (updatedTask: Task) => void;
}

export const WorkSubmissionModal: React.FC<WorkSubmissionModalProps> = ({
  isOpen,
  onClose,
  task,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [completionMessage, setCompletionMessage] = useState('');
  const [comment, setComment] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<{ name: string; url: string; size: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (task) {
      setCompletionMessage(task.submissionMessage || '');
      setComment(task.submissionComment || '');
      if (task.submissionAttachmentUrl && task.submissionAttachmentName) {
        setAttachmentFile({
          name: task.submissionAttachmentName,
          url: task.submissionAttachmentUrl,
          size: 102400,
        });
      } else {
        setAttachmentFile(null);
      }
    }
  }, [task, isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      showToast('error', 'File Too Large', 'Maximum allowed file size is 25MB');
      return;
    }

    setIsUploading(true);
    try {
      const uploadRes = await api.post<{ fileUrl: string; fileName: string; fileSize: number }>('/upload', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      setAttachmentFile({
        name: uploadRes.fileName,
        url: uploadRes.fileUrl,
        size: uploadRes.fileSize,
      });
      showToast('success', 'File Attached', `${file.name} uploaded successfully.`);
    } catch (err: any) {
      showToast('error', 'Upload Failed', err.message || 'Could not upload attachment.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    if (!completionMessage.trim()) {
      showToast('error', 'Required Field', 'Please enter a completion message summarizing your work.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post<Task>(`/tasks/${task.id}/submit-work`, {
        completionMessage: completionMessage.trim(),
        attachmentUrl: attachmentFile?.url,
        attachmentName: attachmentFile?.name,
        comment: comment.trim() || undefined,
      });

      showToast('success', 'Work Submitted', `Task "${task.title}" has been submitted for Team Leader review.`);
      onSuccess(response);
      onClose();
    } catch (err: any) {
      showToast('error', 'Submission Failed', err.message || 'Failed to submit work.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!task) return null;

  const isResubmission = task.status === 'REVISION_REQUIRED';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {isResubmission ? 'Update & Resubmit Work' : 'Submit Completed Work'}
            </span>
            <p className="text-xs font-normal text-slate-500">{task.projectName || 'Corporate Project'}</p>
          </div>
        </div>
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Header Information */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{task.title}</h4>
            <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
              {task.priority} Priority
            </span>
          </div>
          {task.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{task.description}</p>
          )}

          {isResubmission && task.reviewFeedback && (
            <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
              <span className="font-semibold">Revision Feedback from Lead:</span> {task.reviewFeedback}
            </div>
          )}
        </div>

        {/* Completion Message */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Completion Message <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={completionMessage}
            onChange={(e) => setCompletionMessage(e.target.value)}
            placeholder="Briefly describe the deliverables or work completed (e.g., Designed the responsive layout and validated form inputs)..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Optional Attachment */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Optional Attachment (Images, PDF, Documents, ZIP)
          </label>

          {attachmentFile ? (
            <div className="flex items-center justify-between p-3 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{attachmentFile.name}</p>
                  <p className="text-[11px] text-slate-500">{(attachmentFile.size / 1024).toFixed(1)} KB • Ready</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAttachmentFile(null)}
                className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50/20 cursor-pointer transition-colors">
              <UploadCloud className="w-7 h-7 text-slate-400 mb-1" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {isUploading ? 'Uploading file...' : 'Click to attach file or drag & drop'}
              </span>
              <span className="text-[11px] text-slate-400">PDF, PNG, JPG, DOCX, ZIP (Max 25MB)</span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
                accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.zip,.csv,.txt"
              />
            </label>
          )}
        </div>

        {/* Optional Comment */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Optional Comment / Notes
          </label>
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Any extra notes or remarks for your Team Leader..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting || isUploading}
            className="px-4 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="px-5 py-2 text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            {isSubmitting ? (
              <>Submitting...</>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {isResubmission ? 'Submit Revision' : 'Submit Work'}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
