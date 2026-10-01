import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  FileText,
  Trash2,
  ArrowRight,
  RefreshCw,
  Info,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useToast } from '../../hooks/useToast';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  onSuccess: () => void;
}

interface ParsedRow {
  task: string;
  description: string;
  priority: string;
  dueDate: string;
  assignedEmployeeEmailOrId: string;
  isValid: boolean;
  error?: string;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Upload, 2: Preview & Validate, 3: Success summary
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ successCount: number; errors: string[] } | null>(null);

  const handleDownloadSample = () => {
    const sampleCsv = `Task,Description,Priority,Due Date,Assigned Employee Email
UI Design,Design portal dashboard and components,Normal,2026-10-02,elena.rostova@corporate.com
Database Schema,Create relational PostgreSQL schema and indexes,High,2026-10-04,david.kim@corporate.com
Backend APIs,Implement NestJS controllers and services,High,2026-10-07,employee@corporate.com
Automation Testing,Write regression test suites,Normal,2026-10-10,rachel.zane@corporate.com
Security Audit,Production compliance and SAST scanning,Critical,2026-10-15,
Documentation,Generate developer documentation,Normal,2026-10-18,`;

    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `task_plan_sample_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCsvContent = (text: string) => {
    const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) {
      throw new Error('CSV file appears empty or contains only headers.');
    }

    // Header parse
    const headerLine = lines[0];
    const separator = headerLine.includes('\t') ? '\t' : headerLine.includes(';') ? ';' : ',';
    const headers = headerLine.split(separator).map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));

    const taskIdx = headers.findIndex((h) => h.includes('task') || h.includes('title') || h.includes('name'));
    const descIdx = headers.findIndex((h) => h.includes('desc') || h.includes('detail'));
    const prioIdx = headers.findIndex((h) => h.includes('prior'));
    const dueIdx = headers.findIndex((h) => h.includes('due') || h.includes('date') || h.includes('target'));
    const empIdx = headers.findIndex((h) => h.includes('assign') || h.includes('email') || h.includes('emp'));

    if (taskIdx === -1) {
      throw new Error("Could not find a 'Task' or 'Title' column in CSV headers.");
    }

    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(separator).map((c) => c.trim().replace(/^["']|["']$/g, ''));
      const taskTitle = cols[taskIdx] || '';
      const description = descIdx !== -1 ? cols[descIdx] || '' : '';
      const priority = prioIdx !== -1 ? cols[prioIdx] || 'Normal' : 'Normal';
      const dueDate = dueIdx !== -1 ? cols[dueIdx] || '' : '';
      const assignedEmployee = empIdx !== -1 ? cols[empIdx] || '' : '';

      let isValid = true;
      let error = '';

      if (!taskTitle) {
        isValid = false;
        error = 'Missing task name';
      }

      rows.push({
        task: taskTitle,
        description,
        priority: priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase(),
        dueDate,
        assignedEmployeeEmailOrId: assignedEmployee,
        isValid,
        error,
      });
    }

    return rows;
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = parseCsvContent(text);
        setParsedRows(rows);
        setStep(2); // Step 2: Show validation & preview
        showToast('info', `Parsed ${rows.length} task rows from ${file.name}`);
      } catch (err: any) {
        showToast('error', err.message || 'Failed to parse file');
      }
    };

    reader.readAsText(file);
  };

  const handleConfirmUpload = async () => {
    try {
      setIsUploading(true);
      const token = localStorage.getItem('corporate_token') || localStorage.getItem('nexus_token');

      // Send structured payload to bulk-upload endpoint
      const rowsToSend = parsedRows
        .filter((r) => r.isValid)
        .map((r) => ({
          task: r.task,
          description: r.description,
          priority: r.priority,
          dueDate: r.dueDate || undefined,
          assignedEmployeeEmailOrId: r.assignedEmployeeEmailOrId || undefined,
        }));

      const res = await fetch('/api/tasks/bulk-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          rows: rowsToSend,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to upload task plan');
      }

      const result = await res.json();
      setUploadResult(result);
      setStep(3); // Show completion summary
      showToast('success', `Bulk upload finished! ${result.successCount} tasks created.`);
      onSuccess();
    } catch (err: any) {
      showToast('error', err.message || 'Bulk upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setFileName('');
    setParsedRows([]);
    setUploadResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-navy-900">Upload Task Plan (CSV / Excel)</h2>
            <p className="text-xs text-navy-500 font-normal">Project: <span className="font-semibold text-corporate-700">{projectName}</span></p>
          </div>
        </div>
      }
      size="xl"
    >
      <div className="space-y-4">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-navy-100 pb-3">
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 text-xs font-semibold ${step >= 1 ? 'text-corporate-700' : 'text-navy-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 1 ? 'bg-corporate-600 text-white' : 'bg-navy-200 text-navy-600'}`}>
                1
              </span>
              <span>Upload File</span>
            </div>
            <div className="w-8 h-0.5 bg-navy-200" />
            <div className={`flex items-center gap-2 text-xs font-semibold ${step >= 2 ? 'text-corporate-700' : 'text-navy-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 2 ? 'bg-corporate-600 text-white' : 'bg-navy-200 text-navy-600'}`}>
                2
              </span>
              <span>Preview & Validate</span>
            </div>
            <div className="w-8 h-0.5 bg-navy-200" />
            <div className={`flex items-center gap-2 text-xs font-semibold ${step >= 3 ? 'text-emerald-700' : 'text-navy-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 3 ? 'bg-emerald-600 text-white' : 'bg-navy-200 text-navy-600'}`}>
                3
              </span>
              <span>Done</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadSample}
            leftIcon={<Download className="w-3.5 h-3.5 text-corporate-600" />}
            className="text-xs text-corporate-700 hover:bg-corporate-50"
          >
            Download CSV Template
          </Button>
        </div>

        {/* Step 1: Upload Dropzone */}
        {step === 1 && (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-navy-300 hover:border-corporate-500 bg-navy-50/50 hover:bg-corporate-50/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-corporate-100 text-corporate-600 group-hover:scale-110 flex items-center justify-center mb-3 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-navy-900 mb-1">Click to browse or drag & drop CSV file</h3>
              <p className="text-xs text-navy-500 max-w-sm mb-4">
                Upload your project task spreadsheet. Columns supported: <span className="font-semibold text-navy-700">Task, Description, Priority, Due Date, Assigned Employee</span>.
              </p>
              <Button size="sm" variant="outline" className="pointer-events-none bg-white">
                Select CSV / XLSX File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.tsv"
                onChange={handleFileSelected}
                className="hidden"
              />
            </div>

            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900 leading-relaxed">
                <span className="font-semibold">Bulk Ingestion Engine:</span> All tasks are inserted using an atomic batch query, ensuring high performance even with hundreds of rows. Assignments are optional and unassigned tasks will be automatically queued.
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Preview & Validation Table */}
        {step === 2 && (
          <div className="space-y-3">
            {/* Validation Banner */}
            <div className="flex items-center justify-between bg-navy-50/80 border border-navy-200 rounded-xl p-3">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-corporate-600" />
                <span className="text-xs font-bold text-navy-900 truncate">{fileName}</span>
                <span className="text-xs text-navy-500">({parsedRows.length} total rows)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {validCount} Valid
                </span>
                {invalidCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md">
                    <AlertCircle className="w-3.5 h-3.5" /> {invalidCount} Invalid
                  </span>
                )}
                <Button size="sm" variant="ghost" onClick={handleReset} leftIcon={<RefreshCw className="w-3 h-3" />}>
                  Re-upload
                </Button>
              </div>
            </div>

            {/* Preview Grid */}
            <div className="border border-navy-200 rounded-xl overflow-hidden shadow-xs bg-white">
              <div className="max-h-[45vh] overflow-y-auto overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-navy-50/90 text-navy-600 uppercase text-[10px] tracking-wider font-semibold border-b border-navy-200 sticky top-0 z-10 backdrop-blur-xs">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 min-w-[180px]">Task Name</th>
                      <th className="py-2.5 px-3 min-w-[160px]">Description</th>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3">Due Date</th>
                      <th className="py-2.5 px-3 min-w-[160px]">Assigned Employee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-100">
                    {parsedRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          row.isValid ? 'hover:bg-corporate-50/30' : 'bg-rose-50/50 hover:bg-rose-50'
                        }`}
                      >
                        <td className="py-2 px-3 text-center text-navy-400 font-mono font-bold">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full" title={row.error}>
                              <AlertCircle className="w-3 h-3" /> Error
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-medium text-navy-900">{row.task || <span className="text-rose-500 italic">Empty</span>}</td>
                        <td className="py-2 px-3 text-navy-600 truncate max-w-xs">{row.description || '-'}</td>
                        <td className="py-2 px-3 font-semibold text-navy-700">{row.priority}</td>
                        <td className="py-2 px-3 text-navy-700">{row.dueDate || '-'}</td>
                        <td className="py-2 px-3">
                          {row.assignedEmployeeEmailOrId ? (
                            <span className="text-navy-800 font-medium">{row.assignedEmployeeEmailOrId}</span>
                          ) : (
                            <span className="text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
                              Unassigned
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Step 2 Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-navy-200">
              <Button variant="outline" onClick={handleReset}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmUpload}
                isLoading={isUploading}
                disabled={validCount === 0}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Confirm & Bulk Insert ({validCount} Tasks)
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Success Confirmation */}
        {step === 3 && uploadResult && (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-900">Task Plan Ingestion Successful!</h3>
              <p className="text-xs text-navy-600 mt-1">
                Successfully inserted <span className="font-bold text-emerald-700">{uploadResult.successCount} tasks</span> into project <span className="font-semibold text-navy-900">{projectName}</span>.
              </p>
            </div>

            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left max-h-32 overflow-y-auto">
                <div className="text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Warnings / Unassigned Fallbacks:</span>
                </div>
                <ul className="text-[11px] text-amber-800 space-y-0.5 list-disc list-inside">
                  {uploadResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2">
              <Button variant="primary" onClick={onClose} className="px-6">
                View Project Task Plan
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
