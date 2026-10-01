import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api-client';
import { CourseEnrollment } from '../../types';
import { CoursePlayerModal } from '../../components/training/CoursePlayerModal';
import { useToast } from '../../hooks/useToast';
import { BookOpen, Award, Clock, PlayCircle, CheckCircle2 } from 'lucide-react';

export const EmployeeTrainingPage: React.FC = () => {
  const { showToast } = useToast();
  const [courses, setCourses] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

  // Player modal
  const [selectedCourse, setSelectedCourse] = useState<CourseEnrollment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTraining = async () => {
    setLoading(true);
    try {
      const data = await api.get<CourseEnrollment[]>('/lms/my-training');
      setCourses(data);
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Failed to load assigned training courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTraining();
  }, []);

  const filteredCourses = courses.filter((c) => {
    if (activeTab === 'IN_PROGRESS') return c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED';
    if (activeTab === 'COMPLETED') return c.status === 'COMPLETED' || c.progress === 100;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              LMS Employee Training Portal
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete assigned courses, watch technical modules, and track your certifications.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'ALL' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All Courses ({courses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('IN_PROGRESS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'IN_PROGRESS' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            In Progress ({courses.filter((c) => c.status !== 'COMPLETED').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'COMPLETED' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Completed ({courses.filter((c) => c.status === 'COMPLETED').length})
          </button>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isCompleted = course.progress === 100 || course.status === 'COMPLETED';

            return (
              <div
                key={course.enrollmentId}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Thumbnail Banner */}
                  <div className="relative h-36 bg-slate-900 overflow-hidden">
                    <img
                      src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'}
                      alt={course.courseTitle}
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                      {course.courseCategory}
                    </div>

                    {isCompleted && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-600 text-[10px] font-bold text-white flex items-center gap-1 shadow-sm">
                        <Award className="w-3 h-3" />
                        Certified ✓
                      </div>
                    )}
                  </div>

                  {/* Course Details */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                      {course.courseTitle}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {course.courseDescription}
                    </p>

                    {/* Module Checklist preview */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Modules ({course.completedModulesCount}/{course.totalModules})
                      </span>
                      {course.modules.slice(0, 4).map((mod) => {
                        const done = course.completedModuleIds.includes(mod.id);
                        return (
                          <div key={mod.id} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className={done ? 'text-emerald-500 font-bold' : 'text-slate-400'}>
                                {done ? '✓' : '○'}
                              </span>
                              <span className={`truncate ${done ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>
                                {mod.title}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0 uppercase">{mod.contentType}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Progress & Launch Bar */}
                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 mb-3">
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-500">Course Progress</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-black">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCourse(course);
                      setIsModalOpen(true);
                    }}
                    className={`w-full py-2.5 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm ${
                      isCompleted
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <PlayCircle className="w-4 h-4" />
                    {isCompleted ? 'Review Course Material' : 'Launch Course Player'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500">
          <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Courses in this Tab</h3>
          <p className="text-xs text-slate-400 mt-1">Select "All Courses" to view all enrolled training curricula.</p>
        </div>
      )}

      {/* Course Player Modal */}
      <CoursePlayerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        enrollment={selectedCourse}
        onProgressUpdate={() => fetchTraining()}
      />
    </div>
  );
};
