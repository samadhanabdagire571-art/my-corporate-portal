import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AdminLayout } from './components/layout/AdminLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { EmployeeManagement } from './pages/admin/EmployeeManagement';
import { TeamLeaderManagement } from './pages/admin/TeamLeaderManagement';
import { TeamManagement } from './pages/admin/TeamManagement';
import { ProjectManagement } from './pages/admin/ProjectManagement';

// Leader & Employee Dashboards & Workstation Pages
import { LeaderDashboard } from './pages/leader/LeaderDashboard';
import { ProjectTaskPlanPage } from './pages/leader/ProjectTaskPlanPage';
import { UnassignedTasksPage } from './pages/leader/UnassignedTasksPage';
import { DailyWorkPage } from './pages/leader/DailyWorkPage';
import { TaskTemplatesPage } from './pages/leader/TaskTemplatesPage';
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';

// Part 3 Pages
import { EmployeeWorkHistoryPage } from './pages/employee/EmployeeWorkHistoryPage';
import { LeaderSubmissionsPage } from './pages/leader/LeaderSubmissionsPage';
import { EmployeeTrainingPage } from './pages/employee/EmployeeTrainingPage';
import { CompanyDocumentsPage } from './pages/common/CompanyDocumentsPage';
import { HelpCenterPage } from './pages/common/HelpCenterPage';
import { NotificationsPage } from './pages/common/NotificationsPage';
import { AdminAnnouncementsPage } from './pages/admin/AdminAnnouncementsPage';
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminMonitoringPage } from './pages/admin/AdminMonitoringPage';
import { WorkloadPage } from './pages/common/WorkloadPage';

// Placeholders
import { GenericPlaceholderPage } from './pages/placeholders/GenericPlaceholderPage';

// Configure TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Root index redirector based on authenticated role
const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'TEAM_LEADER') return <Navigate to="/leader/dashboard" replace />;
  return <Navigate to="/employee/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Shared Protected Shell */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'TEAM_LEADER', 'EMPLOYEE', 'INTERN']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                {/* Global Common Routes */}
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/help-center" element={<HelpCenterPage />} />
                <Route path="/profile" element={<GenericPlaceholderPage title="User Profile & Security Settings" />} />

                {/* Admin Specific Routes */}
                <Route path="/admin">
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route
                    path="dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="team-leaders"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <TeamLeaderManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="employees"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'TEAM_LEADER']}>
                        <EmployeeManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="teams"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'TEAM_LEADER']}>
                        <TeamManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="projects" element={<ProjectManagement />} />
                  <Route path="projects/:id" element={<ProjectTaskPlanPage />} />
                  <Route path="announcements" element={<AdminAnnouncementsPage />} />
                  <Route path="resources" element={<CompanyDocumentsPage />} />
                  <Route path="knowledge-base" element={<HelpCenterPage />} />
                  <Route path="courses" element={<AdminCoursesPage />} />
                  <Route path="reports" element={<AdminReportsPage />} />
                  <Route path="audit-logs" element={<AdminAuditLogsPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                  <Route path="workload" element={<WorkloadPage />} />
                  <Route path="monitoring" element={<AdminMonitoringPage />} />
                </Route>

                {/* Team Leader Routes */}
                <Route path="/leader">
                  <Route index element={<Navigate to="/leader/dashboard" replace />} />
                  <Route path="dashboard" element={<LeaderDashboard />} />
                  <Route path="projects" element={<ProjectManagement />} />
                  <Route path="projects/:id/plan" element={<ProjectTaskPlanPage />} />
                  <Route path="task-plans" element={<ProjectManagement />} />
                  <Route path="unassigned-tasks" element={<UnassignedTasksPage />} />
                  <Route path="daily-work" element={<DailyWorkPage />} />
                  <Route path="templates" element={<TaskTemplatesPage />} />
                  <Route path="submissions" element={<LeaderSubmissionsPage />} />
                  <Route path="workload" element={<WorkloadPage />} />
                  <Route path="training" element={<EmployeeTrainingPage />} />
                  <Route path="documents" element={<CompanyDocumentsPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                </Route>

                {/* Employee Routes */}
                <Route path="/employee">
                  <Route index element={<Navigate to="/employee/dashboard" replace />} />
                  <Route path="dashboard" element={<EmployeeDashboard />} />
                  <Route path="daily-work" element={<DailyWorkPage />} />
                  <Route path="work-history" element={<EmployeeWorkHistoryPage />} />
                  <Route path="workload" element={<WorkloadPage />} />
                  <Route path="training" element={<EmployeeTrainingPage />} />
                  <Route path="documents" element={<CompanyDocumentsPage />} />
                  <Route path="help-center" element={<HelpCenterPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                </Route>
              </Route>

              {/* Root & Catch-all */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};


export default App;
