import React, { useState, useEffect } from 'react';
import {
  Sun,
  Flame,
  CheckCircle2,
  Clock,
  User,
  Users,
  AlertCircle,
  Play,
  Send,
  Sparkles,
  ArrowRight,
  FolderGit2,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Task, TaskStatus } from '../../types';

export const DailyWorkPage: React.FC = () => {
  const { user, isTeamLeader, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDailyWork = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('corporate_token') || localStorage.getItem('nexus_token');
      const res = await fetch('/api/tasks/today-work', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTodayTasks(data.data || []);
    } catch {
      showToast('error', 'Failed to load today’s work');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyWork();
  }, []);

  const handleStatusTransition = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const token = localStorage.getItem('corporate_token') || localStorage.getItem('nexus_token');
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast('success', `Status updated to ${newStatus}`);
        fetchDailyWork();
      }
    } catch {
      showToast('error', 'Failed to update status');
    }
  };

  const handleRemoveFromToday = async (taskId: string) => {
    try {
      const token = localStorage.getItem('corporate_token') || localStorage.getItem('nexus_token');
      const res = await fetch(`/api/tasks/${taskId}/daily-work`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isTodayWork: false }),
      });
      if (res.ok) {
        showToast('info', "Removed task from Today's Work");
        fetchDailyWork();
      }
    } catch {
      showToast('error', 'Failed to remove from daily work');
    }
  };

  // Group daily work tasks by assigned employee
  const groupedByEmployee: Record<string, { employee: any; tasks: Task[] }> = {};

  todayTasks.forEach((t) => {
    const key = t.assignedTo || 'unassigned';
    if (!groupedByEmployee[key]) {
      groupedByEmployee[key] = {
        employee: t.assignedEmployee || { fullName: 'Unassigned Staff', designation: 'Open Pool' },
        tasks: [],
      };
    }
    groupedByEmployee[key].tasks.push(t);
  });

  const completedToday = todayTasks.filter((t) => t.status === 'COMPLETED' || t.status === 'APPROVED').length;
  const inProgressToday = todayTasks.filter((t) => t.status === 'IN_PROGRESS').length;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-corporate-700 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-semibold">
            <Sun className="w-3.5 h-3.5 text-amber-200" />
            <span>Daily Execution Focus &bull; {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Today's Work Command Center</h1>
          <p className="text-xs text-amber-100 max-w-xl">
            Active daily work dispatched by Team Leaders. Employees and Interns focus on these priority deliverables during today's shift.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-2xl border border-white/20 text-center">
            <span className="text-[10px] font-semibold text-amber-200 uppercase block">Active Today</span>
            <span className="text-2xl font-extrabold text-white">{todayTasks.length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-2xl border border-white/20 text-center">
            <span className="text-[10px] font-semibold text-emerald-200 uppercase block">Completed</span>
            <span className="text-2xl font-extrabold text-white">{completedToday}</span>
          </div>
        </div>
      </div>

      {/* Daily Work Breakdown per Employee */}
      <div className="space-y-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-5 animate-pulse space-y-3">
                <div className="h-4 bg-navy-200 rounded w-1/3" />
                <div className="h-10 bg-navy-100 rounded" />
                <div className="h-10 bg-navy-100 rounded" />
              </Card>
            ))}
          </div>
        ) : todayTasks.length === 0 ? (
          <Card className="p-12 text-center bg-white">
            <Sun className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-navy-800">No Tasks Dispatched for Today's Work</h3>
            <p className="text-xs text-navy-500 mt-1 max-w-sm mx-auto">
              Team leaders can mark tasks in any Project Task Plan with the sun icon to dispatch them to Today's Work.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {Object.entries(groupedByEmployee).map(([empId, group]) => (
              <Card key={empId} className="p-5 bg-white border-navy-200 shadow-xs space-y-3">
                {/* Employee Header */}
                <div className="flex items-center justify-between border-b border-navy-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-corporate-600 text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden">
                      {group.employee.profilePhotoUrl ? (
                        <img src={group.employee.profilePhotoUrl} alt={group.employee.fullName} className="w-full h-full object-cover" />
                      ) : (
                        group.employee.fullName?.charAt(0) || 'U'
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-navy-900 leading-tight">{group.employee.fullName}</h3>
                      <span className="text-[11px] text-navy-500 font-medium">
                        {group.employee.employeeType === 'INTERN' ? 'Engineering Intern' : group.employee.designation || 'Staff'}
                      </span>
                    </div>
                  </div>

                  <span className="bg-corporate-50 text-corporate-800 text-xs font-bold px-2.5 py-1 rounded-full border border-corporate-200">
                    {group.tasks.length} {group.tasks.length === 1 ? 'Task' : 'Tasks'}
                  </span>
                </div>

                {/* Tasks List */}
                <div className="space-y-2.5">
                  {group.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 bg-navy-50/50 hover:bg-corporate-50/30 border border-navy-200 rounded-xl transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-corporate-600 bg-corporate-50 px-1.5 py-0.5 rounded border border-corporate-200 mr-1.5">
                            {task.projectCode || 'PRJ'}
                          </span>
                          <span className="text-xs font-bold text-navy-900">{task.title}</span>
                        </div>
                        <StatusBadge status={task.priority} size="sm" />
                      </div>

                      {task.description && (
                        <p className="text-[11px] text-navy-600 line-clamp-1">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-navy-100 text-[11px]">
                        <StatusBadge status={task.status} size="sm" />

                        <div className="flex items-center gap-1.5">
                          {task.status === 'ASSIGNED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusTransition(task.id, 'IN_PROGRESS')}
                              className="text-[11px] py-0.5 px-2 bg-white"
                              leftIcon={<Play className="w-3 h-3 text-corporate-600" />}
                            >
                              Start
                            </Button>
                          )}

                          {task.status === 'IN_PROGRESS' && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleStatusTransition(task.id, 'SUBMITTED')}
                              className="text-[11px] py-0.5 px-2"
                              leftIcon={<Send className="w-3 h-3" />}
                            >
                              Submit Work
                            </Button>
                          )}

                          {(task.status === 'SUBMITTED' || task.status === 'UNDER_REVIEW') && (isAdmin || isTeamLeader) && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleStatusTransition(task.id, 'COMPLETED')}
                              className="text-[11px] py-0.5 px-2 bg-emerald-600 hover:bg-emerald-700"
                              leftIcon={<CheckCircle2 className="w-3 h-3" />}
                            >
                              Approve
                            </Button>
                          )}

                          {(isAdmin || isTeamLeader) && (
                            <button
                              onClick={() => handleRemoveFromToday(task.id)}
                              className="text-navy-400 hover:text-rose-600 text-[10px] p-1 rounded"
                              title="Remove from Today's Work"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
