export type UserRole = 'ADMIN' | 'TEAM_LEADER' | 'EMPLOYEE' | 'INTERN';

export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED' | 'ON_LEAVE' | 'TERMINATED';

export type EmployeeType = 'EMPLOYEE' | 'INTERN' | 'CONTRACTOR';

export type TaskStatus =
  | 'UNASSIGNED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REVISION_REQUIRED'
  | 'COMPLETED'
  | 'CANCELLED';

export type TaskPriority = 'LOW' | 'NORMAL' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  email: string;
  employeeId: string;
  role: UserRole;
  organizationId: string;
  name: string;
  department?: string;
  designation?: string;
  profilePhotoUrl?: string;
  employeeType?: EmployeeType;
  status?: EntityStatus;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  redirectUrl: string;
  user: User;
}

export interface Employee {
  id: string;
  userId: string;
  organizationId?: string;
  fullName: string;
  employeeId: string;
  email: string;
  phone?: string;
  department: string;
  designation: string;
  employeeType: EmployeeType;
  joiningDate: string;
  profilePhotoUrl?: string;
  status: EntityStatus;
  notes?: string;
  role?: UserRole;
  teamName?: string;
  team?: Team | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeamLeaderSummary {
  id: string;
  userId: string;
  fullName: string;
  employeeId: string;
  email: string;
  phone?: string;
  department: string;
  designation: string;
  profilePhotoUrl?: string;
  status: EntityStatus;
  role: UserRole;
  assignedTeamsCount: number;
  assignedTeams: Array<{ id: string; name: string; department: string }>;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  fullName: string;
  employeeId: string;
  email: string;
  department: string;
  designation: string;
  employeeType: EmployeeType;
  roleInTeam: string;
  status: EntityStatus;
  profilePhotoUrl?: string;
}

export interface Team {
  id: string;
  organizationId?: string;
  name: string;
  department: string;
  leaderId?: string | null;
  leader?: {
    id: string;
    fullName: string;
    email: string;
    employeeId: string;
    profilePhotoUrl?: string;
  } | null;
  description?: string;
  status: EntityStatus;
  membersCount?: number;
  members?: TeamMember[];
  projects?: Project[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  organizationId?: string;
  name: string;
  code: string;
  description?: string;
  department?: string;
  teamId?: string | null;
  teamName?: string;
  leaderId?: string | null;
  leaderName?: string;
  leader?: {
    id: string;
    fullName: string;
    email: string;
    profilePhotoUrl?: string;
  } | null;
  team?: {
    id: string;
    name: string;
    department: string;
  } | null;
  status: 'NOT_STARTED' | 'ACTIVE' | 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  startDate?: string;
  targetDate?: string;
  progress?: number;
  totalTasks?: number;
  completedTasks?: number;
  unassignedTasks?: number;
  inProgressTasks?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssignmentHistoryItem {
  id: string;
  fromEmployeeId: string | null;
  toEmployeeId: string | null;
  fromEmployeeName?: string;
  toEmployeeName?: string;
  changedBy: string;
  changedByName?: string;
  reason?: string;
  timestamp: string;
}

export interface Task {
  id: string;
  organizationId?: string;
  projectId: string;
  projectName?: string;
  projectCode?: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  startDate?: string;
  dueDate?: string;
  assignedTo?: string | null;
  assignedEmployee?: {
    id: string;
    fullName: string;
    employeeId: string;
    email: string;
    designation: string;
    employeeType: EmployeeType;
    profilePhotoUrl?: string;
  } | null;
  status: TaskStatus;
  orderIndex: number;
  dependsOnTaskId?: string | null;
  dependsOnTask?: {
    id: string;
    title: string;
    status: TaskStatus;
  } | null;
  isTodayWork?: boolean;
  dailyWorkDate?: string | null;
  assignmentHistory?: AssignmentHistoryItem[];
  // Submission & Review fields
  submissionMessage?: string;
  submissionAttachmentUrl?: string;
  submissionAttachmentName?: string;
  submissionComment?: string;
  submittedAt?: string;
  reviewFeedback?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  project?: Project | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'TASK_ASSIGNED' | 'TASK_REASSIGNED' | 'WORK_SUBMITTED' | 'WORK_RESUBMITTED' | 'WORK_APPROVED' | 'REVISION_REQUESTED' | 'ANNOUNCEMENT' | 'TRAINING_ASSIGNED' | 'DEADLINE_APPROACHING' | 'SYSTEM';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  audience: 'ALL' | 'DEPARTMENT' | 'TEAM' | 'EMPLOYEES';
  department?: string;
  publishDate: string;
  expiryDate?: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | 'EXPIRED';
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyResource {
  id: string;
  title: string;
  description?: string;
  category: 'POLICIES' | 'GUIDELINES' | 'DOCUMENTS' | 'TRAINING' | 'INTERNAL_PDFS' | 'OTHER';
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType?: string;
  uploadedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeBaseItem {
  id: string;
  question: string;
  answer: string;
  category: 'GENERAL' | 'HR' | 'TECHNICAL' | 'COMPANY_POLICIES' | 'WORK_PROCESS';
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  contentType: 'VIDEO' | 'PDF' | 'TEXT';
  contentUrl?: string;
  textContent?: string;
  durationMinutes?: number;
  orderIndex: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnailUrl?: string;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  modules: CourseModule[];
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseEnrollment {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  courseCategory: string;
  thumbnailUrl?: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  progress: number;
  completedModuleIds: string[];
  totalModules: number;
  completedModulesCount: number;
  modules: CourseModule[];
}

export interface EmployeeDashboardMetrics {
  greeting: string;
  todayWorkCount: number;
  pendingCount: number;
  completedCount: number;
  revisionRequiredCount: number;
  todayTasks: Task[];
  recentAnnouncements: Announcement[];
  assignedCourses: CourseEnrollment[];
}

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  department: string;
  tasks: Array<{
    title: string;
    description?: string;
    priority: TaskPriority;
    orderIndex: number;
    defaultEstimatedDays?: number;
    dependsOnIndex?: number | null;
  }>;
  createdAt?: string;
  updatedAt?: string;
}


export interface LeaderDashboardMetrics {
  cards: {
    myProjectsCount: number;
    overallProgress: number;
    unassignedTasksCount: number;
    todayWorkCount: number;
    overdueWorkCount: number;
    pendingReviewsCount: number;
  };
  myProjects: Array<{
    id: string;
    name: string;
    code: string;
    progress: number;
    status: string;
    priority: string;
    totalTasks: number;
    completedTasks: number;
    unassignedTasks: number;
  }>;
  todayWork: Array<Task>;
  unassignedTasks: Array<Task>;
  teamMembers: Array<{
    id: string;
    fullName: string;
    employeeId: string;
    designation: string;
    employeeType: EmployeeType;
    profilePhotoUrl?: string;
    activeTasksCount: number;
    todayTasksCount: number;
  }>;
}

export interface DashboardMetrics {
  cards: {
    totalEmployees: number;
    totalInterns: number;
    totalTeamLeaders: number;
    totalTeams: number;
    activeProjects: number;
    activeEmployees: number;
  };
  departmentDistribution: Array<{ department: string; count: number; percentage: number }>;
  projectProgress: Array<{
    id: string;
    name: string;
    code: string;
    progress: number;
    status: string;
    priority: string;
  }>;
  workCompletionRate: {
    rate: number;
    completedTasks: number;
    totalTasks: number;
  };
  recentActivities: Array<{
    id: string;
    user: string;
    action: string;
    time: string;
    type: string;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AuditLog {
  id: string;
  organizationId: string;
  userId?: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  previousValue?: any;
  newValue?: any;
  ipAddress?: string;
  createdAt: string;
}

export interface TaskPlanVersion {
  id: string;
  organizationId: string;
  projectId: string;
  versionNumber: number;
  changedById?: string;
  changedByName: string;
  totalTasks: number;
  addedCount: number;
  removedCount: number;
  modifiedCount: number;
  summary?: string;
  snapshot: Array<{
    id: string;
    title: string;
    description?: string;
    priority: string;
    assignedTo?: string | null;
    status: string;
    dueDate?: string;
  }>;
  createdAt: string;
}

export interface OrganizationReportData {
  totalEmployees: number;
  activeEmployees: number;
  internsCount: number;
  totalTeams: number;
  totalLeaders: number;
  activeProjects: number;
  departmentBreakdown: Array<{ department: string; count: number }>;
}

export interface WorkReportData {
  totalTasks: number;
  completed: number;
  pending: number;
  inProgress: number;
  overdue: number;
  revisionRequired: number;
  submitted: number;
  completionRate: number;
}

export interface ProjectReportItem {
  projectId: string;
  projectName: string;
  projectCode: string;
  department: string;
  teamName: string;
  leaderName: string;
  status: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  progressPercentage: number;
  overdueTasks: number;
}

export interface EmployeeReportItem {
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
  designation: string;
  assignedTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completionRate: number;
  revisionCount: number;
}

export interface GlobalSearchResults {
  employees: Array<{ id: string; fullName: string; employeeId: string; email: string; department: string; designation: string }>;
  teams: Array<{ id: string; name: string; department: string }>;
  projects: Array<{ id: string; name: string; code: string; status: string }>;
  tasks: Array<{ id: string; title: string; projectName: string; status: string; priority: string }>;
  courses: Array<{ id: string; title: string; category: string }>;
  resources: Array<{ id: string; title: string; category: string; fileName: string }>;
}

export interface OrganizationSettings {
  organizationName: string;
  domain: string;
  defaultTaskPriority: string;
  allowSelfRegistration: boolean;
  maxFileUploadSizeMb: number;
  allowedFileExtensions: string[];
  emailNotificationsEnabled: boolean;
  inAppNotificationsEnabled: boolean;
  departments: string[];
  lmsAutoEnrollNewEmployees: boolean;
  cmsRequireAdminApproval: boolean;
}

// ============================================================================
// PART 5: WORKLOAD, DOCUMENT VERSIONING, JOBS, AI CHAT & SYSTEM METRICS
// ============================================================================

export type WorkloadState = 'LOW' | 'NORMAL' | 'HIGH' | 'OVERLOADED';

export interface EmployeeWorkloadSummary {
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
  designation: string;
  employeeType: EmployeeType;
  teamId?: string;
  teamName?: string;
  activeTasks: number;
  dueSoonTasks: number;
  overdueTasks: number;
  criticalTasks: number;
  revisionRequiredTasks: number;
  pendingSubmissions: number;
  activeProjects: number;
  workloadState: WorkloadState;
  score: number;
}

export interface TeamWorkloadSummary {
  teamId: string;
  teamName: string;
  department: string;
  leaderName: string;
  totalMembers: number;
  totalActiveTasks: number;
  overdueTasks: number;
  workloadDistribution: {
    low: number;
    normal: number;
    high: number;
    overloaded: number;
  };
  members: EmployeeWorkloadSummary[];
}

export interface OrganizationWorkloadSummary {
  totalEmployees: number;
  totalActiveTasks: number;
  totalOverdueTasks: number;
  totalRevisionRequired: number;
  workloadDistribution: {
    low: number;
    normal: number;
    high: number;
    overloaded: number;
  };
  departmentBreakdown: Array<{
    department: string;
    employeeCount: number;
    activeTasks: number;
    overdueTasks: number;
    overloadedCount: number;
  }>;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedByName: string;
  changeDescription: string;
  status: 'ACTIVE' | 'ARCHIVED';
  isCurrent: boolean;
  createdAt: string;
}

export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export type JobType =
  | 'EXCEL_TASK_IMPORT'
  | 'CSV_IMPORT'
  | 'REPORT_EXPORT_CSV'
  | 'REPORT_EXPORT_XLSX'
  | 'BULK_TASK_ASSIGN'
  | 'BULK_TASK_REASSIGN'
  | 'BULK_EMPLOYEE_IMPORT'
  | 'NOTIFICATION_DISPATCH'
  | 'AI_DOCUMENT_INDEXING'
  | 'DOC_VERSION_PROCESSING';

export interface BackgroundJob {
  id: string;
  type: JobType;
  status: JobStatus;
  progress: number;
  payload: any;
  result?: any;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  createdBy?: string;
}

export interface ChatSourceReference {
  title: string;
  type: 'POLICY' | 'GUIDELINE' | 'HANDBOOK' | 'TASK' | 'PROJECT' | 'COURSE' | 'ANNOUNCEMENT';
  url?: string;
  snippet?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  intent?: string;
  sourceReferences?: ChatSourceReference[];
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemHealthMetrics {
  service: string;
  environment: string;
  version: string;
  timestamp: string;
  uptimeSeconds: number;
  uptimeHuman: string;
  system: {
    platform: string;
    cpus: number;
    freeMemMb: number;
    totalMemMb: number;
  };
  process: {
    heapUsedMb: number;
    heapTotalMb: number;
    rssMb: number;
    nodeVersion: string;
  };
  queue: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    cancelled: number;
    total: number;
  };
  cache: {
    status: string;
    connected: boolean;
    keysCount: number;
  };
  eventBus: {
    activeListeners: number;
    totalEventsEmitted: number;
  };
  database: {
    status: string;
    activeEmployees: number;
    activeProjects: number;
    totalTeams: number;
  };
}

