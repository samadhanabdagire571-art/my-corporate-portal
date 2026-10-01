import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  Layers,
  FolderGit2,
  Trash2,
  Edit2,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { TaskTemplate } from '../../types';

export const TaskTemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isTeamLeader } = useAuth();
  const { showToast } = useToast();

  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);

  // Create Template Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateDept, setTemplateDept] = useState('Engineering');
  const [taskRows, setTaskRows] = useState<Array<{ title: string; description: string; priority: any }>>([
    { title: 'Discovery & Requirement Analysis', description: 'Align project scope', priority: 'HIGH' },
    { title: 'UI/UX Design Mockups', description: 'Design tokens and components', priority: 'NORMAL' },
    { title: 'Core Implementation', description: 'Backend and frontend logic', priority: 'CRITICAL' },
    { title: 'Testing & Quality Pass', description: 'Regression and unit tests', priority: 'HIGH' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('corporate_token') || localStorage.getItem('nexus_token');
      const res = await fetch('/api/task-templates', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0 && !selectedTemplate) {
        setSelectedTemplate(data[0]);
      }
    } catch {
      showToast('error', 'Failed to load task templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleAddRow = () => {
    setTaskRows([...taskRows, { title: '', description: '', priority: 'NORMAL' }]);
  };

  const handleDeleteRow = (index: number) => {
    if (taskRows.length <= 1) return;
    setTaskRows(taskRows.filter((_, i) => i !== index));
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) {
      showToast('error', 'Template name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('corporate_token') || localStorage.getItem('nexus_token');
      const res = await fetch('/api/task-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: templateName.trim(),
          description: templateDescription.trim(),
          department: templateDept,
          tasks: taskRows.map((r, i) => ({
            title: r.title,
            description: r.description,
            priority: r.priority,
            orderIndex: i + 1,
          })),
        }),
      });

      if (!res.ok) throw new Error('Failed to create template');
      showToast('success', 'Task Template created successfully!');
      setIsModalOpen(false);
      setTemplateName('');
      setTemplateDescription('');
      fetchTemplates();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save template');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy-900 tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-corporate-600" />
            <span>Reusable Project Task Templates</span>
          </h1>
          <p className="text-xs text-navy-500 mt-0.5">
            Pre-configured task plans that can be instantiated instantly into new projects.
          </p>
        </div>

        {(isAdmin || isTeamLeader) && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Task Template
          </Button>
        )}
      </div>

      {/* Templates Grid & Preview Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Template Cards */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-navy-500 uppercase tracking-wider">
            Available Templates ({templates.length})
          </h2>

          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4 animate-pulse space-y-2">
                <div className="h-4 bg-navy-200 rounded w-2/3" />
                <div className="h-3 bg-navy-100 rounded w-full" />
              </Card>
            ))
          ) : (
            templates.map((tpl) => {
              const isSelected = selectedTemplate?.id === tpl.id;
              return (
                <Card
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`p-4 cursor-pointer transition-all border ${
                    isSelected
                      ? 'border-corporate-600 bg-corporate-50/40 shadow-xs'
                      : 'border-navy-200 hover:border-corporate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-navy-900">{tpl.name}</h3>
                      <span className="text-[10px] font-semibold text-corporate-600 uppercase">
                        {tpl.department}
                      </span>
                    </div>
                    <span className="text-xs font-bold bg-navy-100 text-navy-700 px-2 py-0.5 rounded-full">
                      {tpl.tasks?.length || 0} tasks
                    </span>
                  </div>
                  <p className="text-xs text-navy-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>
                </Card>
              );
            })
          )}
        </div>

        {/* Right Column: Template Breakdown View */}
        <div className="lg:col-span-2">
          {selectedTemplate ? (
            <Card className="p-6 bg-white border-navy-200 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-corporate-700 bg-corporate-50 px-2 py-0.5 rounded border border-corporate-200">
                      {selectedTemplate.department}
                    </span>
                    <span className="text-xs text-navy-500 font-semibold">
                      {selectedTemplate.tasks?.length || 0} Standard Deliverables
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-navy-900">{selectedTemplate.name}</h2>
                  <p className="text-xs text-navy-600 mt-1">{selectedTemplate.description}</p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/admin/projects')}
                  leftIcon={<FolderGit2 className="w-4 h-4" />}
                >
                  Use in New Project
                </Button>
              </div>

              {/* Tasks List Table */}
              <div className="border border-navy-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-navy-50/80 text-navy-600 uppercase text-[10px] tracking-wider font-semibold border-b border-navy-200">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-4">Task Phase Deliverable</th>
                      <th className="py-2.5 px-4">Description</th>
                      <th className="py-2.5 px-3 w-28">Default Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-100">
                    {selectedTemplate.tasks?.map((t, idx) => (
                      <tr key={idx} className="hover:bg-corporate-50/30 transition-colors">
                        <td className="py-3 px-3 text-center font-mono font-bold text-navy-400">
                          {t.orderIndex || idx + 1}
                        </td>
                        <td className="py-3 px-4 font-bold text-navy-900">{t.title}</td>
                        <td className="py-3 px-4 text-navy-600">{t.description || '-'}</td>
                        <td className="py-3 px-3">
                          <StatusBadge status={t.priority} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center bg-white">
              <Sparkles className="w-10 h-10 text-navy-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-navy-800">Select a Task Template</h3>
              <p className="text-xs text-navy-500 mt-1">
                Choose a template from the list to preview its structured task plan.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Create Template Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-corporate-100 text-corporate-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-900">Create Task Plan Template</h2>
              <p className="text-xs text-navy-500 font-normal">Define standard task workflow phases</p>
            </div>
          </div>
        }
        size="lg"
      >
        <form onSubmit={handleCreateTemplate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Template Name *"
              placeholder="e.g. Mobile Application Launch Sprint"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              required
            />
            <div>
              <label className="block text-xs font-semibold text-navy-800 mb-1">Department</label>
              <select
                value={templateDept}
                onChange={(e) => setTemplateDept(e.target.value)}
                className="w-full bg-white border border-navy-200 rounded-lg px-2.5 py-1.5 text-xs text-navy-900 focus:outline-none"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product Design">Product Design</option>
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-800 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Summary of this lifecycle template..."
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              className="w-full bg-white border border-navy-200 rounded-lg p-2.5 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-corporate-500/20 resize-none"
            />
          </div>

          {/* Template Tasks Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy-800">Template Tasks ({taskRows.length})</span>
              <Button size="sm" variant="outline" type="button" onClick={handleAddRow} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Add Task
              </Button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 border border-navy-200 rounded-xl p-2.5 bg-navy-50/40">
              {taskRows.map((r, i) => (
                <div key={i} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-navy-200">
                  <span className="text-xs font-mono font-bold text-navy-400 w-6 text-center">{i + 1}</span>
                  <input
                    type="text"
                    placeholder="Task name"
                    value={r.title}
                    onChange={(e) => {
                      const updated = [...taskRows];
                      updated[i].title = e.target.value;
                      setTaskRows(updated);
                    }}
                    className="flex-1 text-xs border border-navy-200 rounded px-2 py-1 focus:outline-none"
                    required
                  />
                  <select
                    value={r.priority}
                    onChange={(e) => {
                      const updated = [...taskRows];
                      updated[i].priority = e.target.value;
                      setTaskRows(updated);
                    }}
                    className="text-xs border border-navy-200 rounded px-2 py-1 focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleDeleteRow(i)}
                    className="p-1 text-navy-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-navy-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Save Template
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
