import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api-client';
import { GlobalSearchResults } from '../../types';
import { Modal } from '../ui/Modal';
import {
  Search,
  User,
  Users,
  FolderGit2,
  CheckCircle2,
  BookOpen,
  FileText,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.get<GlobalSearchResults>(`/search?q=${encodeURIComponent(query.trim())}`);
        setResults(data);
      } catch {
        // quiet fail on typeahead
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (url: string) => {
    onClose();
    navigate(url);
  };

  const hasResults =
    results &&
    (results.employees.length > 0 ||
      results.teams.length > 0 ||
      results.projects.length > 0 ||
      results.tasks.length > 0 ||
      results.courses.length > 0 ||
      results.resources.length > 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <span>Enterprise Global Search</span>
        </div>
      }
      size="lg"
    >
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employees, IDs, teams, projects, tasks, courses, resources..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
          />
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
          {loading && (
            <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span>Searching enterprise directory...</span>
            </div>
          )}

          {!loading && !hasResults && query.trim() && (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching records found for "{query}".
            </div>
          )}

          {!loading && !query.trim() && (
            <div className="py-8 text-center text-xs text-slate-400">
              Type keywords above or search by Employee ID (e.g. <code>EMP-010</code>, <code>Portal</code>, <code>Python</code>).
            </div>
          )}

          {/* Employees */}
          {results && results.employees.length > 0 && (
            <div className="pt-3 first:pt-0 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                Staff Members ({results.employees.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.employees.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => handleSelect('/admin/employees')}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-indigo-50/50 dark:hover:bg-slate-750 cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{emp.fullName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {emp.employeeId} • {emp.department}
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {results && results.projects.length > 0 && (
            <div className="pt-3 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-amber-500" />
                Projects ({results.projects.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.projects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelect('/admin/projects')}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-amber-50/50 dark:hover:bg-slate-750 cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {p.code} • {p.status}
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {results && results.tasks.length > 0 && (
            <div className="pt-3 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Deliverables ({results.tasks.length})
              </span>
              <div className="space-y-1.5">
                {results.tasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleSelect('/employee/work-history')}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{t.title}</p>
                      <p className="text-[10px] text-slate-400">
                        {t.projectName} • {t.status}
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Courses */}
          {results && results.courses.length > 0 && (
            <div className="pt-3 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                LMS Courses ({results.courses.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.courses.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelect('/employee/training')}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-purple-50/50 dark:hover:bg-slate-750 cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{c.title}</p>
                      <p className="text-[10px] text-slate-400">{c.category}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resources */}
          {results && results.resources.length > 0 && (
            <div className="pt-3 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-500" />
                Company Documents ({results.resources.length})
              </span>
              <div className="space-y-1.5">
                {results.resources.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => handleSelect('/employee/documents')}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-cyan-50/50 dark:hover:bg-slate-750 cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{r.title}</p>
                      <p className="text-[10px] text-slate-400">{r.fileName}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
