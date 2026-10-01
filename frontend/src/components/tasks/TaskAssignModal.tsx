import React, { useState } from 'react';
import {
  UserCheck,
  Calendar,
  History,
  ArrowRight,
  AlertCircle,
  FileText,
  User,
  Clock,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { StatusBadge } from '../ui/StatusBadge';
import { useToast } from '../../hooks/useToast';
import { Task, Employee } from '../../types';

interface TaskAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  teamEmployees: Employee[];
  onSuccess: () => void;
}

export const TaskAssignModal: React.FC<TaskAssignModalProps> = ({
  isOpen,
  onClose,
  task,
  teamEmployees,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistoryTab, setShowHistoryTab] = useState(false);

  React.useEffect(() => {
    if (task) {
      setSelectedEmployeeId(task.assignedTo || '');
      setDueDate(task.dueDate || '');
      setReason('');
      setShowHistoryTab(false);
    }
  }, [task, isOpen]);

  if (!task) return null;

  const isReassignment = !!task.assignedTo && task.assignedTo !== selectedEmployeeId;
  const currentAssigneeName = task.assignedEmployee?.fullName || 'Unassigned';

  const handleSave = async () => {
    if (!selectedEmployeeId) {
      showToast('error', 'Please select an employee to assign this task to.');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('corporate_token') || localStorage.getItem('nexus_token');

      const endpoint = isReassignment
        ? `/api/tasks/${task.id}/reassign`
        : `/api/tasks/${task.id}/assign`;

      const bodyPayload = isReassignment
        ? { newEmployeeId: selectedEmployeeId, reason: reason.trim() || undefined }
        : { assignedToId: selectedEmployeeId, dueDate: dueDate || undefined, reason: reason.trim() || undefined };

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update task assignment');
      }

      showToast(
        'success',
        isReassignment
          ? `Task reassigned to new team member!`
          : `Task successfully assigned!`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast('error', err.message || 'Error assigning task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const employeeOptions = [
    { value: '', label: '-- Choose Employee / Intern --' },
    ...teamEmployees.map((e) => ({
      value: e.id,
      label: `${e.fullName} (${e.employeeType === 'INTERN' ? 'Intern' : e.designation || 'Staff'}) - ${e.department}`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-corporate-100 text-corporate-700 flex items-center justify-center">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-navy-900">
              {task.assignedTo ? 'Task Reassignment' : 'Task Assignment'}
            </h2>
            <p className="text-xs text-navy-500 font-normal">Task: <span className="font-semibold text-navy-800">{task.title}</span></p>
          </div>
        </div>
      }
      size="md"
    >
      <div className="space-y-4">
        {/* Navigation Tabs (Assignment vs History) */}
        <div className="flex border-b border-navy-200">
          <button
            type="button"
            onClick={() => setShowHistoryTab(false)}
            className={`px-4 py-2 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
              !showHistoryTab
                ? 'border-corporate-600 text-corporate-700'
                : 'border-transparent text-navy-500 hover:text-navy-900'
            }`}
          >
            Assignment Form
          </button>
          <button
            type="button"
            onClick={() => setShowHistoryTab(true)}
            className={`px-4 py-2 text-xs font-semibold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              showHistoryTab
                ? 'border-corporate-600 text-corporate-700'
                : 'border-transparent text-navy-500 hover:text-navy-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Assignment History ({task.assignmentHistory?.length || 0})</span>
          </button>
        </div>

        {!showHistoryTab ? (
          <div className="space-y-4">
            {/* Current State Info Card */}
            <div className="bg-navy-50/70 border border-navy-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-navy-500">Current Assignee:</span>
                <span className="text-xs font-bold text-navy-900">{currentAssigneeName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-navy-500">Current Status:</span>
                <StatusBadge status={task.status} size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-navy-500">Priority:</span>
                <StatusBadge status={task.priority} size="sm" />
              </div>
            </div>

            {/* Select Assignee */}
            <div>
              <label className="block text-xs font-semibold text-navy-800 mb-1.5">
                Assign To *
              </label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full bg-white border border-navy-200 rounded-lg px-3 py-2 text-xs font-medium text-navy-900 focus:outline-none focus:ring-2 focus:ring-corporate-500/20"
              >
                {employeeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-navy-800 mb-1.5">
                Target Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-white border border-navy-200 rounded-lg px-3 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-corporate-500/20"
              />
            </div>

            {/* Optional Reason for Reassignment / Assignment */}
            <div>
              <label className="block text-xs font-semibold text-navy-800 mb-1.5">
                {task.assignedTo ? 'Reassignment Reason (Recorded in audit history)' : 'Assignment Note / Reason'}
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="e.g. Workload rebalancing, specialist skill alignment..."
                className="w-full bg-white border border-navy-200 rounded-lg p-2.5 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-corporate-500/20 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-navy-100">
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                isLoading={isSubmitting}
                leftIcon={<UserCheck className="w-4 h-4" />}
              >
                {task.assignedTo ? 'Confirm Reassignment' : 'Assign Task'}
              </Button>
            </div>
          </div>
        ) : (
          /* Assignment Audit History Log */
          <div className="space-y-3">
            {(!task.assignmentHistory || task.assignmentHistory.length === 0) ? (
              <div className="text-center py-8 text-navy-400 text-xs">
                No previous assignment history recorded for this task.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {task.assignmentHistory.map((item, index) => (
                  <div key={item.id || index} className="p-3 bg-navy-50/70 border border-navy-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-navy-900">
                        <span>{item.fromEmployeeName || 'Unassigned'}</span>
                        <ArrowRight className="w-3 h-3 text-navy-400" />
                        <span className="text-corporate-700">{item.toEmployeeName}</span>
                      </div>
                      <span className="text-[10px] text-navy-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    {item.reason && (
                      <p className="text-[11px] text-navy-600 bg-white/70 p-1.5 rounded border border-navy-100">
                        "{item.reason}"
                      </p>
                    )}
                    <div className="text-[10px] text-navy-500 pt-0.5">
                      Changed by: <span className="font-semibold text-navy-700">{item.changedByName || item.changedBy}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowHistoryTab(false)}>
                Back to Form
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
