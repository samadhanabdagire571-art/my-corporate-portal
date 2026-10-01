import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { api } from '../../lib/api-client';
import { Task, Announcement, CourseEnrollment, EmployeeDashboardMetrics } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { WorkSubmissionModal } from '../../components/tasks/WorkSubmissionModal';
import { TaskDetailsModal } from '../../components/tasks/TaskDetailsModal';
import { CoursePlayerModal } from '../../components/training/CoursePlayerModal';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  PlayCircle,
  Send,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
  Eye,
  Megaphone,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [metrics, setMetrics] = useState<EmployeeDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseEnrollment | null>(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const data = await api.get<EmployeeDashboardMetrics>('/dashboard/employee');
      setMetrics(data);
    } catch (err: any) {
      showToast('error', 'Failed to load dashboard', err.message || 'Could not fetch your workstation metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStartWork = async (task: Task) => {
    try {
      const updated = await api.post<Task>(`/tasks/${task.id}/start-work`, {});
      showToast('success', 'Work Started', `Task "${task.title}" is now In Progress.`);
      fetchDashboardData();
    } catch (err: any) {
      showToast('error', 'Could not start work', err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const greeting = metrics?.greeting || `Good Morning, ${user?.name || 'Employee'} 👋`;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Greeting & Prompt */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-indigo-900/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-indigo-300">
              Corporate Workstation
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-0.5 tracking-tight">{greeting}</h1>
            <p className="text-sm text-slate-300 mt-1">
              Here is your daily focus and today's assigned deliverables.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/employee/work-history"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-4 h-4 text-indigo-300" />
              My Work History
            </Link>
            <Link
              to="/employee/training"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              LMS Training
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Simple 4-KPI Metric Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Work */}
        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Today's Work</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics?.todayWorkCount || 0}
            </span>
          </div>
        </div>

        {/* Pending */}
        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Pending</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics?.pendingCount || 0}
            </span>
          </div>
        </div>

        {/* Completed */}
        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Completed</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics?.completedCount || 0}
            </span>
          </div>
        </div>

        {/* Revision Required */}
        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Revision Required</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics?.revisionRequiredCount || 0}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Action Section: "What do I need to do today?" */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Today's Assigned Deliverables</h2>
            <p className="text-xs text-slate-500">Pick a task, start working, and submit when completed.</p>
          </div>
          <Link
            to="/employee/daily-work"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            View Workstation <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {metrics?.todayTasks && metrics.todayTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.todayTasks.map((task) => {
              const isRevision = task.status === 'REVISION_REQUIRED';
              const isInProgress = task.status === 'IN_PROGRESS';
              const isAssigned = task.status === 'ASSIGNED';
              const isSubmitted = task.status === 'SUBMITTED' || task.status === 'UNDER_REVIEW';
              const isCompleted = task.status === 'COMPLETED' || task.status === 'APPROVED';

              return (
                <div
                  key={task.id}
                  className={`p-5 bg-white dark:bg-slate-800 rounded-2xl border transition-all shadow-sm flex flex-col justify-between ${
                    isRevision
                      ? 'border-amber-300 dark:border-amber-700 ring-1 ring-amber-400/40'
                      : isInProgress
                      ? 'border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-400/40'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        {task.projectName || 'Project Deliverable'}
                      </span>
                      <StatusBadge status={task.priority} />
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Due: {task.dueDate || 'Today, 6 PM'}</span>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>

                    {/* Feedback Callout */}
                    {isRevision && task.reviewFeedback && (
                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
                        <span className="font-bold">Lead Feedback:</span> {task.reviewFeedback}
                      </div>
                    )}
                  </div>

                  {/* Task Action Bar */}
                  <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTask(task);
                        setIsDetailsModalOpen(true);
                      }}
                      className="p-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Details
                    </button>

                    {isAssigned && (
                      <button
                        type="button"
                        onClick={() => handleStartWork(task)}
                        className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <PlayCircle className="w-4 h-4" />
                        Start Work
                      </button>
                    )}

                    {isInProgress && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTask(task);
                          setIsSubmitModalOpen(true);
                        }}
                        className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Send className="w-4 h-4" />
                        Submit Work
                      </button>
                    )}

                    {isRevision && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTask(task);
                          setIsSubmitModalOpen(true);
                        }}
                        className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-amber-600 hover:bg-amber-700 transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Send className="w-4 h-4" />
                        Update & Resubmit
                      </button>
                    )}

                    {isSubmitted && (
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800">
                        Under Review ⏳
                      </span>
                    )}

                    {isCompleted && (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        Approved ✓
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">All Caught Up!</h3>
            <p className="text-xs text-slate-500 mt-1">
              You have no active tasks scheduled for today. Check your course training or work history.
            </p>
          </div>
        )}
      </div>

      {/* 4. Active Announcements & LMS Training Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Announcements (CMS) */}
        <div className="lg:col-span-1 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Announcements</h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Live CMS</span>
          </div>

          <div className="space-y-3">
            {metrics?.recentAnnouncements && metrics.recentAnnouncements.length > 0 ? (
              metrics.recentAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1"
                >
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{ann.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{ann.content}</p>
                  <span className="text-[10px] text-slate-400 block pt-1">{ann.publishDate}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No active corporate announcements.</p>
            )}
          </div>
        </div>

        {/* Assigned Training (LMS) */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Assigned LMS Training</h3>
            </div>
            <Link
              to="/employee/training"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              All Courses →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {metrics?.assignedCourses && metrics.assignedCourses.length > 0 ? (
              metrics.assignedCourses.map((crs) => (
                <div
                  key={crs.enrollmentId}
                  className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                      {crs.courseCategory}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                      {crs.courseTitle}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{crs.courseDescription}</p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="text-slate-500 text-[11px]">Progress</span>
                      <span className="text-emerald-600">{crs.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-3">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${crs.progress}%` }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCourse(crs);
                        setIsCourseModalOpen(true);
                      }}
                      className="w-full py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      Continue Course →
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No training assigned yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <WorkSubmissionModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        task={selectedTask}
        onSuccess={() => fetchDashboardData()}
      />

      <TaskDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        task={selectedTask}
        onStartWork={(t) => handleStartWork(t)}
        onSubmitWork={(t) => {
          setSelectedTask(t);
          setIsSubmitModalOpen(true);
        }}
      />

      <CoursePlayerModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        enrollment={selectedCourse}
        onProgressUpdate={() => fetchDashboardData()}
      />
    </div>
  );
};
