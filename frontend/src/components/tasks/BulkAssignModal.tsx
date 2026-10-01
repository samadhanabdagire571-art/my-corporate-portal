import React, { useState } from 'react';
import { Users, CheckCircle2, Calendar } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useToast } from '../../hooks/useToast';
import { Employee } from '../../types';

interface BulkAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTaskIds: string[];
  teamEmployees: Employee[];
  onSuccess: () => void;
}

export const BulkAssignModal: React.FC<BulkAssignModalProps> = ({
  isOpen,
  onClose,
  selectedTaskIds,
  teamEmployees,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmBulkAssign = async () => {
    if (!selectedEmployeeId) {
      showToast('error', 'Please select an employee for bulk assignment.');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('corporate_token') || localStorage.getItem('nexus_token');

      const res = await fetch('/api/tasks/bulk-assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskIds: selectedTaskIds,
          employeeId: selectedEmployeeId,
          dueDate: dueDate || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to bulk assign tasks');
      }

      const data = await res.json();
      showToast('success', `Successfully assigned ${data.successCount} tasks in one batch operation!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast('error', err.message || 'Bulk assignment failed');
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
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-navy-900">Bulk Task Assignment</h2>
            <p className="text-xs text-navy-500 font-normal">Assigning <span className="font-bold text-corporate-700">{selectedTaskIds.length} selected tasks</span> at once</p>
          </div>
        </div>
      }
      size="sm"
    >
      <div className="space-y-4">
        <div className="bg-corporate-50/60 border border-corporate-200 rounded-xl p-3 text-xs text-corporate-900 leading-relaxed">
          Select a team member below. All <span className="font-bold">{selectedTaskIds.length} tasks</span> will be assigned simultaneously in a single atomic database operation.
        </div>

        <div>
          <label className="block text-xs font-semibold text-navy-800 mb-1.5">
            Assign Selected Tasks To *
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

        <div>
          <label className="block text-xs font-semibold text-navy-800 mb-1.5">
            Set Optional Due Date for All Selected Tasks
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-white border border-navy-200 rounded-lg px-3 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-corporate-500/20"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-navy-100">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmBulkAssign}
            isLoading={isSubmitting}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Assign {selectedTaskIds.length} Tasks
          </Button>
        </div>
      </div>
    </Modal>
  );
};
