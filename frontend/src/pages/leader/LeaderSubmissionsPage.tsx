import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api-client';
import { Task, PaginatedResponse } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Pagination } from '../../components/ui/Pagination';
import { ReviewSubmissionModal } from '../../components/tasks/ReviewSubmissionModal';
import { useToast } from '../../hooks/useToast';
import { CheckCircle, AlertTriangle, Download, Search, Clock, User, FileText, Inbox } from 'lucide-react';

export const LeaderSubmissionsPage: React.FC = () => {
  const { showToast } = useToast();
  const [submissions, setSubmissions] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Review Modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get<PaginatedResponse<Task>>(`/tasks/pending-reviews?${params.toString()}`);
      setSubmissions(response.data);
      setTotalPages(response.meta.totalPages);
      setTotal(response.meta.total);
    } catch (err: any) {
      showToast('error', 'Failed to load reviews', err.message || 'Could not fetch submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [page, limit, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSubmissions();
  };

  const handleQuickApprove = async (task: Task) => {
    try {
      await api.post<Task>(`/tasks/${task.id}/review`, {
        decision: 'APPROVE',
        feedback: 'Work approved. Great job!',
      });
      showToast('success', 'Work Approved', `Task "${task.title}" has been marked Completed.`);
      fetchSubmissions();
    } catch (err: any) {
      showToast('error', 'Approval Failed', err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Inbox className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Pending Reviews & Submissions</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review completed staff deliverables, inspect attachments, approve, or request revisions.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300">
          Pending Reviews: {total}
        </div>
      </div>

      {/* Filter Row */}
      <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by task title, description, or submitter..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Review Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="REVISION_REQUIRED">Revision Required</option>
            </select>
          </div>
        </form>
      </div>

      {/* Submissions List / Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : submissions.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {submissions.map((task) => (
              <div key={task.id} className="p-5 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Task & Employee metadata */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        {task.projectName || 'Corporate Project'}
                      </span>
                      <StatusBadge status={task.status} />
                      <StatusBadge status={task.priority} />
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{task.title}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                        <User className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Submitted by: <strong>{task.assignedEmployee?.fullName || 'Assigned Staff'}</strong></span>
                      </div>
                      {task.submittedAt && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Time: {new Date(task.submittedAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Completion Message Box */}
                    {task.submissionMessage && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                        <strong className="text-slate-900 dark:text-white block mb-0.5">Deliverables Summary:</strong>
                        {task.submissionMessage}
                        {task.submissionComment && (
                          <p className="mt-1 text-[11px] text-slate-500 italic">Note: "{task.submissionComment}"</p>
                        )}
                      </div>
                    )}

                    {/* Attachment Link */}
                    {task.submissionAttachmentUrl && (
                      <div className="pt-1">
                        <a
                          href={task.submissionAttachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {task.submissionAttachmentName || 'View Attachment'}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex lg:flex-col items-center lg:items-end gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTask(task);
                        setIsReviewModalOpen(true);
                      }}
                      className="px-4 py-2 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Submission
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTask(task);
                          setIsReviewModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 text-xs font-bold rounded-xl text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 transition-colors flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Revision
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickApprove(task)}
                        className="px-4 py-1.5 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-60" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">All Submissions Reviewed!</h3>
            <p className="text-xs text-slate-400 mt-1">There are no pending submissions awaiting team leader review.</p>
          </div>
        )}

        {submissions.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onPageChange={(p) => setPage(p)}
              onLimitChange={(l) => {
                setLimit(l);
                setPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ReviewSubmissionModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        task={selectedTask}
        onSuccess={() => fetchSubmissions()}
      />
    </div>
  );
};
