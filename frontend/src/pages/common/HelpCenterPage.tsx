import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api-client';
import { KnowledgeBaseItem, PaginatedResponse } from '../../types';
import { useToast } from '../../hooks/useToast';
import { HelpCircle, Search, ChevronDown, ChevronUp, Layers, Users, Briefcase, FileCheck, ShieldAlert } from 'lucide-react';

const KB_CATEGORIES = [
  { id: '', label: 'All FAQs', icon: Layers },
  { id: 'WORK_PROCESS', label: 'Work & Tasks Process', icon: Briefcase },
  { id: 'COMPANY_POLICIES', label: 'Company Policies', icon: ShieldAlert },
  { id: 'HR', label: 'HR & Leaves', icon: Users },
  { id: 'TECHNICAL', label: 'Technical & LMS', icon: FileCheck },
];

export const HelpCenterPage: React.FC = () => {
  const { showToast } = useToast();
  const [faqs, setFaqs] = useState<KnowledgeBaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [openIds, setOpenIds] = useState<string[]>([]);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (search.trim()) params.append('search', search.trim());
      const response = await api.get<PaginatedResponse<KnowledgeBaseItem>>(`/cms/knowledge-base?${params.toString()}`);
      setFaqs(response.data);
      // Auto open first FAQ
      if (response.data.length > 0) {
        setOpenIds([response.data[0].id]);
      }
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Failed to load knowledge base articles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, [selectedCategory]);

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFaqs();
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-1">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Help Center & Knowledge Base</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Find answers to common questions regarding daily work, submissions, reviews, leaves, and policies.
        </p>
      </div>

      {/* Search & Categories */}
      <div className="space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type your question (e.g. How do I submit work?)..."
            className="w-full pl-12 pr-4 py-3 text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </form>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {KB_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : faqs.length > 0 ? (
          faqs.map((item) => {
            const isOpen = openIds.includes(item.id);
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0">
                      Q
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.question}</h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700">
                      {item.category.replace('_', ' ')}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/40 dark:bg-slate-900/20">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-10 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Matching Articles</h3>
            <p className="text-xs text-slate-400 mt-1">Try searching with a different term or clear the filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
