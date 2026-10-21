export enum UserRole {
  ADMIN = 'ADMIN',
  TEAM_LEADER = 'TEAM_LEADER',
  EMPLOYEE = 'EMPLOYEE',
  INTERN = 'INTERN',
}

export enum EntityStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
}

export enum EmployeeType {
  EMPLOYEE = 'EMPLOYEE',
  INTERN = 'INTERN',
}

export enum TaskStatus {
  UNASSIGNED = 'UNASSIGNED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REVISION_REQUIRED = 'REVISION_REQUIRED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ProjectStatus {
  NOT_STARTED = 'NOT_STARTED',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export interface UserEntity {
  id: string;
  organizationId: string;
  email: string;
  employeeId: string;
  passwordHash: string;
  role: UserRole;
  status: EntityStatus;
  lastLoginAt?: string;
  rememberToken?: string;
  resetToken?: string;
  resetExpires?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeEntity {
  id: string;
  userId: string;
  organizationId: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface TeamEntity {
  id: string;
  organizationId: string;
  name: string;
  department: string;
  leaderId?: string | null;
  description?: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMemberEntity {
  id: string;
  teamId: string;
  employeeId: string;
  roleInTeam: string;
  status: EntityStatus;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectEntity {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  description?: string;
  department?: string;
  teamId?: string | null;
  leaderId?: string | null;
  status: 'NOT_STARTED' | 'ACTIVE' | 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  startDate?: string;
  targetDate?: string;
  progress?: number;
  totalTasks?: number;
  completedTasks?: number;
  unassignedTasks?: number;
  createdAt: string;
  updatedAt: string;
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

export interface TaskEntity {
  assignedToUserId: any;
  id: string;
  organizationId: string;
  projectId: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'NORMAL' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  startDate?: string;
  dueDate?: string;
  assignedTo?: string | null; // Employee ID
  status: TaskStatus;
  orderIndex: number;
  dependsOnTaskId?: string | null;
  isTodayWork?: boolean;
  dailyWorkDate?: string | null;
  assignmentHistory: AssignmentHistoryItem[];
  // Submission & Review Fields
  submissionMessage?: string;
  submissionAttachmentUrl?: string;
  submissionAttachmentName?: string;
  submissionComment?: string;
  submittedAt?: string;
  reviewFeedback?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationEntity {
  id: string;
  organizationId: string;
  userId: string;
  title: string;
  message: string;
  type: 'TASK_ASSIGNED' | 'TASK_REASSIGNED' | 'WORK_SUBMITTED' | 'WORK_RESUBMITTED' | 'WORK_APPROVED' | 'REVISION_REQUESTED' | 'ANNOUNCEMENT' | 'TRAINING_ASSIGNED' | 'DEADLINE_APPROACHING' | 'SYSTEM';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AnnouncementEntity {
  id: string;
  organizationId: string;
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

export interface ResourceEntity {
  id: string;
  organizationId: string;
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

export interface KnowledgeBaseEntity {
  id: string;
  organizationId: string;
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

export interface CourseEntity {
  id: string;
  organizationId: string;
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

export interface CourseEnrollmentEntity {
  id: string;
  organizationId: string;
  courseId: string;
  employeeId: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  progress: number;
  completedModuleIds: string[];
  assignedAt: string;
  completedAt?: string;
}

export interface EmployeeDashboardMetrics {
  greeting: string;
  todayWorkCount: number;
  pendingCount: number;
  completedCount: number;
  revisionRequiredCount: number;
  todayTasks: TaskEntity[];
  recentAnnouncements: AnnouncementEntity[];
  assignedCourses: Array<{
    enrollmentId: string;
    courseId: string;
    courseTitle: string;
    courseDescription: string;
    courseCategory: string;
    thumbnailUrl?: string;
    status: string;
    progress: number;
    completedModuleIds: string[];
    totalModules: number;
    completedModulesCount: number;
    modules: CourseModule[];
  }>;
}

export interface TaskTemplateEntity {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  department: string;
  tasks: Array<{
    title: string;
    description?: string;
    priority: 'LOW' | 'NORMAL' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    orderIndex: number;
    defaultEstimatedDays?: number;
    dependsOnIndex?: number | null;
  }>;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: string;
  priority?: string;
  type?: string;
  projectId?: string;
  teamId?: string;
  leaderId?: string;
  assignedTo?: string;
  unassignedOnly?: boolean | string;
  todayWorkOnly?: boolean | string;
  category?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
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

export interface AuditLogEntity {
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

export interface TaskPlanVersionEntity {
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

export interface OrganizationReport {
  totalEmployees: number;
  activeEmployees: number;
  internsCount: number;
  totalTeams: number;
  totalLeaders: number;
  activeProjects: number;
  departmentBreakdown: Array<{ department: string; count: number }>;
}

export interface WorkReport {
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

export enum WorkloadState {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  OVERLOADED = 'OVERLOADED',
}

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
  dueSoonTasks: number; // due in next 48h
  overdueTasks: number;
  criticalTasks: number;
  revisionRequiredTasks: number;
  pendingSubmissions: number;
  activeProjects: number;
  workloadState: WorkloadState;
  score: number; // 0 - 100 indicator (for UI visualization, not performance rating)
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

export interface DocumentVersionEntity {
  id: string;
  documentId: string; // references resourceId or knowledgeBaseId
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

export enum JobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum JobType {
  EXCEL_TASK_IMPORT = 'EXCEL_TASK_IMPORT',
  CSV_IMPORT = 'CSV_IMPORT',
  REPORT_EXPORT_CSV = 'REPORT_EXPORT_CSV',
  REPORT_EXPORT_XLSX = 'REPORT_EXPORT_XLSX',
  BULK_TASK_ASSIGN = 'BULK_TASK_ASSIGN',
  BULK_TASK_REASSIGN = 'BULK_TASK_REASSIGN',
  BULK_EMPLOYEE_IMPORT = 'BULK_EMPLOYEE_IMPORT',
  NOTIFICATION_DISPATCH = 'NOTIFICATION_DISPATCH',
  AI_DOCUMENT_INDEXING = 'AI_DOCUMENT_INDEXING',
  DOC_VERSION_PROCESSING = 'DOC_VERSION_PROCESSING',
}

export interface BackgroundJobEntity {
  id: string;
  type: JobType;
  status: JobStatus;
  progress: number; // 0 to 100
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

export interface ConversationEntity {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSourceReference {
  title: string;
  type: 'POLICY' | 'GUIDELINE' | 'HANDBOOK' | 'TASK' | 'PROJECT' | 'COURSE' | 'ANNOUNCEMENT';
  url?: string;
  snippet?: string;
}

export interface ChatMessageEntity {
  id: string;
  conversationId: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  intent?: string;
  sourceReferences?: ChatSourceReference[];
  createdAt: string;
}

export enum ChatIntent {
  MY_TASKS = 'MY_TASKS',
  TASK_STATUS = 'TASK_STATUS',
  TASK_DEADLINE = 'TASK_DEADLINE',
  TASK_SUBMISSION = 'TASK_SUBMISSION',
  PROJECT_STATUS = 'PROJECT_STATUS',
  TEAM_WORKLOAD = 'TEAM_WORKLOAD',
  OVERDUE_TASKS = 'OVERDUE_TASKS',
  TRAINING_STATUS = 'TRAINING_STATUS',
  NOTIFICATIONS = 'NOTIFICATIONS',
  COMPANY_POLICY = 'COMPANY_POLICY',
  KNOWLEDGE_SEARCH = 'KNOWLEDGE_SEARCH',
  RESOURCE_SEARCH = 'RESOURCE_SEARCH',
  GENERAL_HELP = 'GENERAL_HELP',
  UNKNOWN = 'UNKNOWN',
}

export interface SystemHealthMetrics {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  version: string;
  memoryUsage: {
    heapUsedMb: number;
    heapTotalMb: number;
    rssMb: number;
  };
  components: {
    database: { status: 'healthy' | 'degraded' | 'unhealthy'; type: string; latencyMs: number };
    redis: { status: 'healthy' | 'fallback_in_memory'; connected: boolean };
    queue: { status: 'healthy'; pendingJobs: number; activeJobs: number; completedJobs: number; failedJobs: number };
    eventBus: { status: 'healthy'; activeListeners: number };
  };
}


