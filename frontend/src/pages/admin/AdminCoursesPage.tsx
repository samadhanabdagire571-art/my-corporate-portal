import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api-client';
import { Course, CourseModule, PaginatedResponse } from '../../types';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../../components/ui/Modal';
import { BookOpen, Plus, Trash2, Edit3, Play, FileText, CheckCircle2, Search, Video } from 'lucide-react';

export const AdminCoursesPage: React.FC = () => {
  const { showToast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technical Engineering');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'DRAFT' | 'ARCHIVED'>('ACTIVE');
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await api.get<PaginatedResponse<Course>>('/lms/courses');
      setCourses(response.data);
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setCategory('Technical Engineering');
    setThumbnailUrl('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80');
    setStatus('ACTIVE');
    setModules([
      {
        id: 'mod-' + Date.now(),
        title: '1. Introduction & Overview',
        description: 'Getting started with core concepts.',
        contentType: 'VIDEO',
        contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        durationMinutes: 15,
        orderIndex: 1,
      },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingId(course.id);
    setTitle(course.title);
    setDescription(course.description);
    setCategory(course.category);
    setThumbnailUrl(course.thumbnailUrl || '');
    setStatus(course.status as any);
    setModules(course.modules ? [...course.modules] : []);
    setIsModalOpen(true);
  };

  const handleAddModule = () => {
    const newMod: CourseModule = {
      id: 'mod-' + Date.now(),
      title: `${modules.length + 1}. Module Title`,
      description: 'Module syllabus overview.',
      contentType: 'VIDEO',
      durationMinutes: 15,
      orderIndex: modules.length + 1,
    };
    setModules([...modules, newMod]);
  };

  const handleRemoveModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  const handleModuleChange = (index: number, field: keyof CourseModule, value: any) => {
    const updated = [...modules];
    updated[index] = { ...updated[index], [field]: value };
    setModules(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('error', 'Required Field', 'Course title is mandatory.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        thumbnailUrl,
        status,
        modules,
      };

      if (editingId) {
        await api.put(`/lms/courses/${editingId}`, payload);
        showToast('success', 'Updated', 'Course curriculum updated.');
      } else {
        await api.post('/lms/courses', payload);
        showToast('success', 'Created', 'New LMS course created.');
      }

      setIsModalOpen(false);
      fetchCourses();
    } catch (err: any) {
      showToast('error', 'Save Failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.delete(`/lms/courses/${id}`);
      showToast('success', 'Deleted', 'Course removed.');
      fetchCourses();
    } catch (err: any) {
      showToast('error', 'Delete Failed', err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              LMS Course Builder & Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create corporate training courses, add video/text/pdf modules, and track staff learning curricula.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Course
        </button>
      </div>

      {/* Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : courses.length > 0 ? (
          courses.map((crs) => (
            <div
              key={crs.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-36 bg-slate-900 overflow-hidden">
                  <img
                    src={crs.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'}
                    alt={crs.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                    {crs.category}
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-white/90 text-[10px] font-bold text-slate-800">
                    {crs.modules?.length || 0} Modules
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">{crs.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{crs.description}</p>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/60 mt-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  crs.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {crs.status}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(crs)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(crs.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No LMS Courses Yet</h3>
            <p className="text-xs text-slate-400 mt-1">Click "Create Course" to add training modules.</p>
          </div>
        )}
      </div>

      {/* Create / Edit Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <span>{editingId ? 'Edit Course Curriculum' : 'Create New LMS Course'}</span>
          </div>
        }
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Course Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Python & Enterprise Backend Architecture"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief course objectives and syllabus summary..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Compliance, Engineering"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="ACTIVE">Active (Published)</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          {/* Modules List */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Course Modules ({modules.length})
              </span>
              <button
                type="button"
                onClick={handleAddModule}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Module
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {modules.map((mod, idx) => (
                <div
                  key={mod.id}
                  className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={mod.title}
                      onChange={(e) => handleModuleChange(idx, 'title', e.target.value)}
                      placeholder="Module Title"
                      className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <select
                      value={mod.contentType}
                      onChange={(e) => handleModuleChange(idx, 'contentType', e.target.value as any)}
                      className="w-28 px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="VIDEO">Video</option>
                      <option value="TEXT">Text</option>
                      <option value="PDF">PDF</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveModule(idx)}
                      className="p-1 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-sm font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : editingId ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
