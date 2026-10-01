import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api-client';
import { CompanyResource, PaginatedResponse, DocumentVersion } from '../../types';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import {
  FileText,
  Download,
  Search,
  Folder,
  ShieldCheck,
  BookOpen,
  Layers,
  FileCode,
  History,
  Upload,
  RotateCcw,
  CheckCircle2,
  X,
  Plus,
} from 'lucide-react';

const CATEGORIES = [
  { id: '', label: 'All Documents', icon: Folder },
  { id: 'POLICIES', label: 'Company Policies', icon: ShieldCheck },
  { id: 'GUIDELINES', label: 'Architecture Guidelines', icon: FileCode },
  { id: 'DOCUMENTS', label: 'Manuals & Specs', icon: FileText },
  { id: 'TRAINING', label: 'Training Materials', icon: BookOpen },
  { id: 'INTERNAL_PDFS', label: 'Internal PDFs', icon: Layers },
];

export const CompanyDocumentsPage: React.FC = () => {
  const { showToast } = useToast();
  const { isAdmin, isTeamLeader } = useAuth();
  const [resources, setResources] = useState<CompanyResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');

  // Versioning state
  const [selectedDocForVersions, setSelectedDocForVersions] = useState<CompanyResource | null>(null);
  const [versionHistory, setVersionHistory] = useState<DocumentVersion[]>([]);
  const [isVersionsLoading, setIsVersionsLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileUrl, setUploadFileUrl] = useState('');
  const [uploadChangeDesc, setUploadChangeDesc] = useState('');
  const [isSubmittingVersion, setIsSubmittingVersion] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (search.trim()) params.append('search', search.trim());
      const response = await api.get<PaginatedResponse<CompanyResource>>(`/cms/resources?${params.toString()}`);
      setResources(response.data);
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Failed to load company resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources();
  };

  const handleOpenVersions = async (doc: CompanyResource) => {
    setSelectedDocForVersions(doc);
    setIsVersionsLoading(true);
    try {
      const versions = await api.get<DocumentVersion[]>(`/api/v1/documents/${doc.id}/versions`);
      setVersionHistory(versions || []);
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Failed to load document version history.');
    } finally {
      setIsVersionsLoading(false);
    }
  };

  const handleRestoreVersion = async (docId: string, versionId: string) => {
    try {
      await api.post(`/api/v1/documents/${docId}/versions/${versionId}/restore`);
      showToast('success', 'Version Restored', 'The document has been restored to the selected version.');
      if (selectedDocForVersions) {
        handleOpenVersions(selectedDocForVersions);
      }
      fetchResources();
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Failed to restore document version.');
    }
  };

  const handleUploadVersionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocForVersions || !uploadFileName || !uploadFileUrl) return;

    setIsSubmittingVersion(true);
    try {
      await api.post(`/api/v1/documents/${selectedDocForVersions.id}/versions`, {
        fileName: uploadFileName,
        fileUrl: uploadFileUrl,
        changeDescription: uploadChangeDesc || 'Updated revision',
      });
      showToast('success', 'Version Uploaded', 'New document version has been successfully recorded.');
      setIsUploadModalOpen(false);
      setUploadFileName('');
      setUploadFileUrl('');
      setUploadChangeDesc('');
      handleOpenVersions(selectedDocForVersions);
      fetchResources();
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Failed to upload document version.');
    } finally {
      setIsSubmittingVersion(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-navy-950 tracking-tight">
            Company Resources & Versioned Documents
          </h1>
        </div>
        <p className="text-xs text-navy-500 mt-1">
          Official employee handbooks, engineering guidelines, company policies, and version-tracked resources.
        </p>
      </div>

      {/* Category Pills & Search */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-navy-700 border border-navy-200 hover:bg-navy-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by title or topic..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-navy-200 bg-white text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs"
          />
        </form>
      </div>

      {/* Document Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((res) => (
            <div
              key={res.id}
              className="p-5 bg-white rounded-2xl border border-navy-100 shadow-xs flex flex-col justify-between hover:border-blue-200 hover:shadow-md transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200/50">
                    {res.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-navy-900 group-hover:text-blue-600 transition-colors">
                    {res.title}
                  </h3>
                  {res.description && (
                    <p className="text-xs text-navy-500 mt-1 line-clamp-2">
                      {res.description}
                    </p>
                  )}
                </div>

                <div className="text-[11px] text-navy-400">
                  <span>{(res.fileSize / (1024 * 1024)).toFixed(2)} MB • {res.fileName}</span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-navy-100 flex items-center gap-2">
                <a
                  href={res.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 text-xs font-bold rounded-xl bg-navy-50 text-navy-700 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>

                {/* Version History Button */}
                <button
                  type="button"
                  onClick={() => handleOpenVersions(res)}
                  className="px-3 py-2 text-xs font-bold rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1"
                  title="View Version History"
                >
                  <History className="w-3.5 h-3.5" />
                  Versions
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-navy-100 text-navy-500">
          <Folder className="w-12 h-12 text-navy-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-navy-900">No Resources Found</h3>
          <p className="text-xs text-navy-400 mt-1">No documents match the chosen category or search term.</p>
        </div>
      )}

      {/* VERSION HISTORY MODAL */}
      {selectedDocForVersions && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-navy-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-navy-100">
              <div>
                <h3 className="font-bold text-lg text-navy-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-600" />
                  Version History: {selectedDocForVersions.title}
                </h3>
                <p className="text-xs text-navy-500">Audit trail of revisions, change summaries, and rollbacks.</p>
              </div>
              <button
                onClick={() => setSelectedDocForVersions(null)}
                className="p-1 rounded-lg text-navy-400 hover:text-navy-700 hover:bg-navy-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Upload New Version Button for Admin/Leaders */}
            {(isAdmin || isTeamLeader) && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Upload New Revision
                </button>
              </div>
            )}

            {/* Version List */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {isVersionsLoading ? (
                <div className="py-8 text-center text-navy-400 text-sm">Loading version history...</div>
              ) : versionHistory.length > 0 ? (
                versionHistory.map((v) => (
                  <div
                    key={v.id}
                    className={`p-4 rounded-xl border transition-all ${
                      v.isCurrent
                        ? 'bg-blue-50/50 border-blue-200'
                        : 'bg-navy-50/40 border-navy-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-navy-900">
                            Version {v.versionNumber}.0
                          </span>
                          {v.isCurrent && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3" /> Current Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-navy-600 font-medium">{v.changeDescription}</p>
                        <p className="text-[11px] text-navy-400">
                          {v.fileName} • Uploaded by {v.uploadedByName} on {new Date(v.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={v.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-white border border-navy-200 text-navy-700 hover:text-blue-600 text-xs font-semibold shadow-xs flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" /> View
                        </a>

                        {!v.isCurrent && (isAdmin || isTeamLeader) && (
                          <button
                            type="button"
                            onClick={() => handleRestoreVersion(selectedDocForVersions.id, v.id)}
                            className="p-2 rounded-lg bg-white border border-navy-200 text-navy-700 hover:text-indigo-600 text-xs font-semibold shadow-xs flex items-center gap-1"
                            title="Restore this version"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-indigo-600" /> Rollback
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-navy-400 text-sm">No revisions recorded for this document.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD REVISION MODAL */}
      {isUploadModalOpen && selectedDocForVersions && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-navy-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-navy-100">
              <h4 className="font-bold text-navy-900 text-base flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                Upload New Document Revision
              </h4>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-navy-400 hover:text-navy-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadVersionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-700 mb-1">File Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Employee_Handbook_2025_v2.pdf"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-navy-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-700 mb-1">Storage / Cloud File URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={uploadFileUrl}
                  onChange={(e) => setUploadFileUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-navy-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-700 mb-1">Change Summary / Notes</label>
                <textarea
                  placeholder="Describe the changes in this version..."
                  value={uploadChangeDesc}
                  onChange={(e) => setUploadChangeDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-navy-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-navy-600 hover:bg-navy-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingVersion}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  {isSubmittingVersion ? 'Uploading...' : 'Save & Publish Revision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
