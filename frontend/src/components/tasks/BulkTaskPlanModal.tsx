import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Layers,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useToast } from '../../hooks/useToast';
import { Employee, TaskTemplate } from '../../types';

interface TaskRow {
  tempId: string;
  title: string;
  description: string;
  priority: 'LOW' | 'NORMAL' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  startDate: string;
  dueDate: string;
  assignedTo: string;
  dependsOnIndex: string;
}

interface BulkTaskPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  projectStartDate?: string;
  projectTargetDate?: string;
  teamEmployees: Employee[];
  onSuccess: () => void;
}

export const BulkTaskPlanModal: React.FC<BulkTaskPlanModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  projectStartDate,
  projectTargetDate,
  teamEmployees,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const defaultStartDate = projectStartDate || new Date().toISOString().split('T')[0];
  const defaultDueDate = projectTargetDate || '';

  const initialRows: TaskRow[] = [
    {
      tempId: 'row-1',
      title: 'Requirement Analysis & Stakeholder Scope',
      description: 'Define functional requirements and project architecture boundaries',
      priority: 'HIGH',
      startDate: defaultStartDate,
      dueDate: defaultDueDate,
      assignedTo: '',
      dependsOnIndex: '',
    },
    {
      tempId: 'row-2',
      title: 'UI/UX Wireframes & Component Tokens',
      description: 'Design interactive views in Figma matching brand styling',
      priority: 'NORMAL',
      startDate: defaultStartDate,
      dueDate: defaultDueDate,
      assignedTo: '',
      dependsOnIndex: '1',
    },
    {
      tempId: 'row-3',
      title: 'Database Schema & Table Migrations',
      description: 'PostgreSQL relational DDL, foreign keys and indexes',
      priority: 'HIGH',
      startDate: defaultStartDate,
      dueDate: defaultDueDate,
      assignedTo: '',
      dependsOnIndex: '1',
    },
    {
      tempId: 'row-4',
      title: 'Core API Implementation & Controllers',
      description: 'NestJS REST endpoints, DTO validations and business logic',
      priority: 'CRITICAL',
      startDate: defaultStartDate,
      dueDate: defaultDueDate,
      assignedTo: '',
      dependsOnIndex: '3',
    },
  ];

  const [rows, setRows] = useState<TaskRow[]>(initialRows);

  // Fetch templates for quick load
  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('corporate_token') || localStorage.getItem('nexus_token');
      fetch('/api/task-templates', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setTemplates(data);
        })
        .catch(() => { });
    }
  }, [isOpen]);

  const handleApplyTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) return;

    const tpl = templates.find((t) => t.id === templateId);
    if (tpl && tpl.tasks) {
      const newRows: TaskRow[] = tpl.tasks.map((t, idx) => ({
        tempId: `tpl-row-${idx + 1}-${Date.now()}`,
        title: t.title,
        description: t.description || '',
        priority: t.priority || 'NORMAL',
        startDate: defaultStartDate,
        dueDate: defaultDueDate,
        assignedTo: '',
        dependsOnIndex: t.dependsOnIndex ? String(t.dependsOnIndex) : '',
      }));
      setRows(newRows);
      showToast('success', `Applied template: ${tpl.name}`);
    }
  };

  const handleAddRow = () => {
    const newRow: TaskRow = {
      tempId: `row-${Date.now()}-${Math.random()}`,
      title: '',
      description: '',
      priority: 'NORMAL',
      startDate: defaultStartDate,
      dueDate: defaultDueDate,
      assignedTo: '',
      dependsOnIndex: '',
    };
    setRows([...rows, newRow]);
  };

  const handleDuplicateRow = (index: number) => {
    const rowToDup = rows[index];
    const dupRow: TaskRow = {
      ...rowToDup,
      tempId: `row-dup-${Date.now()}`,
      title: `${rowToDup.title} (Copy)`,
    };
    const updated = [...rows];
    updated.splice(index + 1, 0, dupRow);
    setRows(updated);
  };

  const handleDeleteRow = (index: number) => {
    if (rows.length <= 1) {
      showToast('error', 'The task plan must have at least one task row.');
      return;
    }
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
  };

  const handleMoveRow = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === rows.length - 1)) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...rows];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setRows(updated);
  };

  const handleFieldChange = (index: number, field: keyof TaskRow, value: string) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: value };
    setRows(updated);
  };

  const handleSavePlan = async () => {
    // Validate rows
    const emptyTitles = rows.some((r) => !r.title.trim());
    if (emptyTitles) {
      showToast('error', 'All task rows must have a valid task title.');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('corporate_token') || localStorage.getItem('nexus_token');

      // Map rows with order index
      const tasksPayload = rows.map((r, idx) => ({
        title: r.title.trim(),
        description: r.description.trim(),
        priority: r.priority,
        startDate: r.startDate || undefined,
        dueDate: r.dueDate || undefined,
        assignedTo: r.assignedTo || null,
        orderIndex: idx + 1,
      }));

      const res = await fetch('/api/tasks/bulk-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          tasks: tasksPayload,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save complete task plan');
      }

      const data = await res.json();

      // If user checked "Save as Template"
      if (saveAsTemplate && templateName.trim()) {
        await fetch('/api/task-templates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: templateName.trim(),
            description: `Saved from project: ${projectName}`,
            department: 'Engineering',
            tasks: rows.map((r, idx) => ({
              title: r.title,
              description: r.description,
              priority: r.priority,
              orderIndex: idx + 1,
            })),
          }),
        });
      }

      showToast('success', `Successfully created complete task plan (${data.count} tasks saved)!`);
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast('error', error.message || 'Error creating task plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const employeeOptions = [
    { value: '', label: 'Unassigned (Assign Later)' },
    ...teamEmployees.map((e) => ({
      value: e.id,
      label: `${e.fullName} (${e.employeeType === 'INTERN' ? 'Intern' : e.designation || 'Staff'})`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-corporate-100 text-corporate-700 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-navy-900">Complete Project Task Plan Builder</h2>
            <p className="text-xs text-navy-500 font-normal">Project: <span className="font-semibold text-corporate-700">{projectName}</span></p>
          </div>
        </div>
      }
      size="full"
    >
      <div className="space-y-4">
        {/* Template Bar & Quick Actions */}
        <div className="bg-navy-50/80 border border-navy-200 rounded-xl p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-navy-700 whitespace-nowrap">
              <Sparkles className="w-4 h-4 text-corporate-600" />
              <span>Use Pre-Built Template:</span>
            </div>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleApplyTemplate(e.target.value)}
              className="bg-white border border-navy-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-corporate-500/20 text-navy-800 font-medium w-full md:w-64"
            >
              <option value="">-- Choose Reusable Template --</option>
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name} ({tpl.tasks?.length || 0} tasks)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddRow}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="bg-white border-navy-200 text-navy-800"
            >
              Add Task Row
            </Button>
            <span className="text-xs font-semibold px-2.5 py-1 bg-corporate-100 text-corporate-800 rounded-md">
              Total Rows: {rows.length}
            </span>
          </div>
        </div>

        {/* Dynamic Multi-Task Spreadsheet Table */}
        <div className="border border-navy-200 rounded-xl overflow-hidden shadow-xs bg-white">
          <div className="max-h-[50vh] overflow-y-auto overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-navy-50/90 text-navy-600 uppercase text-[10px] tracking-wider font-semibold border-b border-navy-200 sticky top-0 z-10 backdrop-blur-xs">
                <tr>
                  <th className="py-2.5 px-2 w-10 text-center">#</th>
                  <th className="py-2.5 px-3 min-w-[220px]">Task Name *</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Description</th>
                  <th className="py-2.5 px-3 w-28">Priority</th>
                  <th className="py-2.5 px-3 w-32">Start Date</th>
                  <th className="py-2.5 px-3 w-32">Due Date</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Assign Employee (Optional)</th>
                  <th className="py-2.5 px-2 w-28 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {rows.map((row, index) => (
                  <tr key={row.tempId} className="hover:bg-corporate-50/40 transition-colors group">
                    <td className="py-2 px-2 text-center text-navy-400 font-mono font-bold">
                      {index + 1}
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={row.title}
                        onChange={(e) => handleFieldChange(index, 'title', e.target.value)}
                        placeholder="e.g. Requirement Analysis, UI Design..."
                        className="w-full bg-navy-50/50 focus:bg-white border border-navy-200 focus:border-corporate-500 rounded px-2 py-1 text-xs text-navy-900 font-medium focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                        placeholder="Deliverables / specs..."
                        className="w-full bg-navy-50/50 focus:bg-white border border-navy-200 focus:border-corporate-500 rounded px-2 py-1 text-xs text-navy-700 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <select
                        value={row.priority}
                        onChange={(e) => handleFieldChange(index, 'priority', e.target.value as any)}
                        className="w-full bg-navy-50/50 focus:bg-white border border-navy-200 rounded px-2 py-1 text-xs text-navy-800 font-medium focus:outline-none"
                      >
                        <option value="LOW">Low</option>
                        <option value="NORMAL">Normal</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="date"
                        value={row.startDate}
                        onChange={(e) => handleFieldChange(index, 'startDate', e.target.value)}
                        className="w-full bg-navy-50/50 focus:bg-white border border-navy-200 rounded px-1.5 py-1 text-xs text-navy-700 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="date"
                        value={row.dueDate}
                        onChange={(e) => handleFieldChange(index, 'dueDate', e.target.value)}
                        className="w-full bg-navy-50/50 focus:bg-white border border-navy-200 rounded px-1.5 py-1 text-xs text-navy-700 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <select
                        value={row.assignedTo}
                        onChange={(e) => handleFieldChange(index, 'assignedTo', e.target.value)}
                        className={`w-full border rounded px-2 py-1 text-xs focus:outline-none ${!row.assignedTo
                          ? 'bg-amber-50/70 border-amber-300 text-amber-900 font-semibold'
                          : 'bg-navy-50/50 focus:bg-white border-navy-200 text-navy-800 font-medium'
                          }`}
                      >
                        {employeeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveRow(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-navy-400 hover:text-navy-700 disabled:opacity-30 transition-colors"
                          title="Move row up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveRow(index, 'down')}
                          disabled={index === rows.length - 1}
                          className="p-1 text-navy-400 hover:text-navy-700 disabled:opacity-30 transition-colors"
                          title="Move row down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateRow(index)}
                          className="p-1 text-navy-400 hover:text-corporate-600 transition-colors"
                          title="Duplicate task"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(index)}
                          className="p-1 text-navy-400 hover:text-rose-600 transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Save Template Option & Info */}
        <div className="bg-navy-50/50 border border-navy-200 rounded-xl p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="saveTemplateCheck"
              checked={saveAsTemplate}
              onChange={(e) => setSaveAsTemplate(e.target.checked)}
              className="w-4 h-4 text-corporate-600 rounded border-navy-300 focus:ring-corporate-500 cursor-pointer"
            />
            <label htmlFor="saveTemplateCheck" className="text-xs font-semibold text-navy-800 cursor-pointer">
              Save this task plan as a reusable corporate template
            </label>
          </div>

          {saveAsTemplate && (
            <div className="w-full md:w-72">
              <Input
                placeholder="Template Name e.g. Web Dev 2026"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="text-xs py-1"
              />
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-navy-200">
          <div className="flex items-center gap-1.5 text-xs text-navy-500">
            <HelpCircle className="w-4 h-4 text-navy-400" />
            <span>Unassigned tasks will remain in the pool for later assignment.</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSavePlan}
              isLoading={isSubmitting}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Complete Task Plan
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
