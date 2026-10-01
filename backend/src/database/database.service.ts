import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Pool } from 'pg';
import { ENV } from '../config/environment';
import {
  UserEntity,
  EmployeeEntity,
  TeamEntity,
  TeamMemberEntity,
  ProjectEntity,
  TaskEntity,
  TaskTemplateEntity,
  NotificationEntity,
  AnnouncementEntity,
  ResourceEntity,
  KnowledgeBaseEntity,
  CourseEntity,
  CourseEnrollmentEntity,
  EmployeeDashboardMetrics,
  CourseModule,
  AuditLogEntity,
  TaskPlanVersionEntity,
  OrganizationReport,
  WorkReport,
  ProjectReportItem,
  EmployeeReportItem,
  GlobalSearchResults,
  OrganizationSettings,
  TaskStatus,
  UserRole,
  EntityStatus,
  EmployeeType,
  PaginationParams,
  PaginatedResult,
  DocumentVersionEntity,
  BackgroundJobEntity,
  JobStatus,
  JobType,
  ConversationEntity,
  ChatMessageEntity,
  WorkloadState,
  EmployeeWorkloadSummary,
  TeamWorkloadSummary,
  OrganizationWorkloadSummary,
} from '../common/types';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  private pgPool: Pool | null = null;
  private usePostgres = false;

  // In-memory repositories for resilient local execution & Supabase sync fallback
  private organizations: Array<{ id: string; name: string; slug: string }> = [];
  private users: UserEntity[] = [];
  private employees: EmployeeEntity[] = [];
  private teams: TeamEntity[] = [];
  private teamMembers: TeamMemberEntity[] = [];
  private projects: ProjectEntity[] = [];
  private tasks: TaskEntity[] = [];
  private taskTemplates: TaskTemplateEntity[] = [];
  private notifications: NotificationEntity[] = [];
  private announcements: AnnouncementEntity[] = [];
  private resources: ResourceEntity[] = [];
  private knowledgeBase: KnowledgeBaseEntity[] = [];
  private courses: CourseEntity[] = [];
  private courseEnrollments: CourseEnrollmentEntity[] = [];
  private auditLogs: AuditLogEntity[] = [];
  private taskPlanVersions: TaskPlanVersionEntity[] = [];
  private documentVersions: DocumentVersionEntity[] = [];
  private backgroundJobs: BackgroundJobEntity[] = [];
  private conversations: ConversationEntity[] = [];
  private chatMessages: ChatMessageEntity[] = [];
  private organizationSettings: OrganizationSettings = {
    organizationName: 'Nexus Global Enterprises',
    domain: 'corporate.com',
    defaultTaskPriority: 'NORMAL',
    allowSelfRegistration: false,
    maxFileUploadSizeMb: 25,
    allowedFileExtensions: ['.pdf', '.zip', '.png', '.jpg', '.jpeg', '.docx', '.xlsx', '.csv', '.txt'],
    emailNotificationsEnabled: true,
    inAppNotificationsEnabled: true,
    departments: ['Engineering', 'Design', 'Product', 'Marketing', 'Human Resources', 'QA & Testing'],
    lmsAutoEnrollNewEmployees: true,
    cmsRequireAdminApproval: false,
  };

  async onModuleInit() {
    if (ENV.DATABASE_URL) {
      try {
        this.pgPool = new Pool({
          connectionString: ENV.DATABASE_URL,
          ssl: ENV.DATABASE_URL.includes('supabase') ? { rejectUnauthorized: false } : undefined,
        });
        await this.pgPool.query('SELECT NOW()');
        this.usePostgres = true;
        this.logger.log('Connected successfully to PostgreSQL / Supabase database');
      } catch (err) {
        this.logger.warn(`Failed to connect to DATABASE_URL: ${err.message}. Falling back to high-performance local store.`);
        this.usePostgres = false;
      }
    } else {
      this.logger.log('DATABASE_URL not set. Running with high-performance seeded data store.');
    }

    await this.seedInitialData();
  }

  private async seedInitialData() {
    const orgId = 'a0000000-0000-0000-0000-000000000001';
    this.organizations = [
      { id: orgId, name: 'Nexus Global Enterprises', slug: 'nexus-global' },
    ];

    // Password hashes for test accounts (password matches [Role]@123456)
    const adminHash = await bcrypt.hash('Admin@123456', 10);
    const leaderHash = await bcrypt.hash('Leader@123456', 10);
    const empHash = await bcrypt.hash('Employee@123456', 10);
    const internHash = await bcrypt.hash('Intern@123456', 10);

    const now = new Date().toISOString();

    // 1. Initial Users
    this.users = [
      {
        id: 'b0000000-0000-0000-0000-000000000001',
        organizationId: orgId,
        email: 'admin@corporate.com',
        employeeId: 'EMP-ADM-001',
        passwordHash: adminHash,
        role: UserRole.ADMIN,
        status: EntityStatus.ACTIVE,
        createdAt: '2023-01-10T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'b0000000-0000-0000-0000-000000000002',
        organizationId: orgId,
        email: 'leader@corporate.com',
        employeeId: 'EMP-TL-001',
        passwordHash: leaderHash,
        role: UserRole.TEAM_LEADER,
        status: EntityStatus.ACTIVE,
        createdAt: '2023-02-01T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'b0000000-0000-0000-0000-000000000003',
        organizationId: orgId,
        email: 'sarah.tl@corporate.com',
        employeeId: 'EMP-TL-002',
        passwordHash: leaderHash,
        role: UserRole.TEAM_LEADER,
        status: EntityStatus.ACTIVE,
        createdAt: '2023-02-15T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'b0000000-0000-0000-0000-000000000004',
        organizationId: orgId,
        email: 'employee@corporate.com',
        employeeId: 'EMP-DEV-001',
        passwordHash: empHash,
        role: UserRole.EMPLOYEE,
        status: EntityStatus.ACTIVE,
        createdAt: '2023-03-01T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'b0000000-0000-0000-0000-000000000005',
        organizationId: orgId,
        email: 'intern@corporate.com',
        employeeId: 'INT-ENG-001',
        passwordHash: internHash,
        role: UserRole.INTERN,
        status: EntityStatus.ACTIVE,
        createdAt: '2024-01-15T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'b0000000-0000-0000-0000-000000000006',
        organizationId: orgId,
        email: 'david.kim@corporate.com',
        employeeId: 'EMP-DEV-002',
        passwordHash: empHash,
        role: UserRole.EMPLOYEE,
        status: EntityStatus.ACTIVE,
        createdAt: '2023-04-10T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'b0000000-0000-0000-0000-000000000007',
        organizationId: orgId,
        email: 'elena.rostova@corporate.com',
        employeeId: 'INT-DES-002',
        passwordHash: internHash,
        role: UserRole.INTERN,
        status: EntityStatus.ACTIVE,
        createdAt: '2024-02-01T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'b0000000-0000-0000-0000-000000000008',
        organizationId: orgId,
        email: 'rachel.zane@corporate.com',
        employeeId: 'EMP-DEV-003',
        passwordHash: empHash,
        role: UserRole.EMPLOYEE,
        status: EntityStatus.ACTIVE,
        createdAt: '2023-05-12T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'b0000000-0000-0000-0000-000000000009',
        organizationId: orgId,
        email: 'liam.neilson@corporate.com',
        employeeId: 'INT-QA-001',
        passwordHash: internHash,
        role: UserRole.INTERN,
        status: EntityStatus.ACTIVE,
        createdAt: '2024-03-01T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'b0000000-0000-0000-0000-000000000010',
        organizationId: orgId,
        email: 'amit@corporate.com',
        employeeId: 'EMP-DEV-010',
        passwordHash: empHash,
        role: UserRole.EMPLOYEE,
        status: EntityStatus.ACTIVE,
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'b0000000-0000-0000-0000-000000000011',
        organizationId: orgId,
        email: 'sneha@corporate.com',
        employeeId: 'EMP-DEV-011',
        passwordHash: empHash,
        role: UserRole.EMPLOYEE,
        status: EntityStatus.ACTIVE,
        createdAt: '2024-01-05T08:00:00Z',
        updatedAt: now,
      }
    ];

    // 2. Initial Employees
    this.employees = [
      {
        id: 'c0000000-0000-0000-0000-000000000001',
        userId: 'b0000000-0000-0000-0000-000000000001',
        organizationId: orgId,
        fullName: 'Alexander Vance',
        employeeId: 'EMP-ADM-001',
        email: 'admin@corporate.com',
        phone: '+1 (555) 019-2831',
        department: 'Executive Leadership',
        designation: 'Chief Operations Officer',
        employeeType: EmployeeType.EMPLOYEE,
        joiningDate: '2023-01-15',
        profilePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        status: EntityStatus.ACTIVE,
        createdAt: '2023-01-15T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'c0000000-0000-0000-0000-000000000002',
        userId: 'b0000000-0000-0000-0000-000000000002',
        organizationId: orgId,
        fullName: 'Marcus Sterling',
        employeeId: 'EMP-TL-001',
        email: 'leader@corporate.com',
        phone: '+1 (555) 018-9922',
        department: 'Engineering',
        designation: 'Lead Platform Architect',
        employeeType: EmployeeType.EMPLOYEE,
        joiningDate: '2023-03-01',
        profilePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        status: EntityStatus.ACTIVE,
        createdAt: '2023-03-01T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'c0000000-0000-0000-0000-000000000003',
        userId: 'b0000000-0000-0000-0000-000000000003',
        organizationId: orgId,
        fullName: 'Sarah Jenkins',
        employeeId: 'EMP-TL-002',
        email: 'sarah.tl@corporate.com',
        phone: '+1 (555) 017-4821',
        department: 'Product Design',
        designation: 'Design Director',
        employeeType: EmployeeType.EMPLOYEE,
        joiningDate: '2023-04-10',
        profilePhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        status: EntityStatus.ACTIVE,
        createdAt: '2023-04-10T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'c0000000-0000-0000-0000-000000000004',
        userId: 'b0000000-0000-0000-0000-000000000004',
        organizationId: orgId,
        fullName: 'Jonathan Reed',
        employeeId: 'EMP-DEV-001',
        email: 'employee@corporate.com',
        phone: '+1 (555) 016-3382',
        department: 'Engineering',
        designation: 'Senior Full Stack Engineer',
        employeeType: EmployeeType.EMPLOYEE,
        joiningDate: '2023-06-20',
        profilePhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        status: EntityStatus.ACTIVE,
        createdAt: '2023-06-20T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'c0000000-0000-0000-0000-000000000005',
        userId: 'b0000000-0000-0000-0000-000000000005',
        organizationId: orgId,
        fullName: 'Aiden Clark',
        employeeId: 'INT-ENG-001',
        email: 'intern@corporate.com',
        phone: '+1 (555) 015-7729',
        department: 'Engineering',
        designation: 'Software Engineering Intern',
        employeeType: EmployeeType.INTERN,
        joiningDate: '2024-01-10',
        profilePhotoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        status: EntityStatus.ACTIVE,
        createdAt: '2024-01-10T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'c0000000-0000-0000-0000-000000000006',
        userId: 'b0000000-0000-0000-0000-000000000006',
        organizationId: orgId,
        fullName: 'David Kim',
        employeeId: 'EMP-DEV-002',
        email: 'david.kim@corporate.com',
        phone: '+1 (555) 014-6632',
        department: 'Engineering',
        designation: 'Cloud Infrastructure Engineer',
        employeeType: EmployeeType.EMPLOYEE,
        joiningDate: '2023-08-15',
        profilePhotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        status: EntityStatus.ACTIVE,
        createdAt: '2023-08-15T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'c0000000-0000-0000-0000-000000000007',
        userId: 'b0000000-0000-0000-0000-000000000007',
        organizationId: orgId,
        fullName: 'Elena Rostova',
        employeeId: 'INT-DES-002',
        email: 'elena.rostova@corporate.com',
        phone: '+1 (555) 013-1120',
        department: 'Product Design',
        designation: 'UI/UX Design Intern',
        employeeType: EmployeeType.INTERN,
        joiningDate: '2024-02-01',
        profilePhotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        status: EntityStatus.ACTIVE,
        createdAt: '2024-02-01T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'c0000000-0000-0000-0000-000000000008',
        userId: 'b0000000-0000-0000-0000-000000000008',
        organizationId: orgId,
        fullName: 'Rachel Zane',
        employeeId: 'EMP-DEV-003',
        email: 'rachel.zane@corporate.com',
        phone: '+1 (555) 012-7711',
        department: 'Quality Assurance',
        designation: 'QA Automation Lead',
        employeeType: EmployeeType.EMPLOYEE,
        joiningDate: '2023-05-12',
        profilePhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        status: EntityStatus.ACTIVE,
        createdAt: '2023-05-12T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'c0000000-0000-0000-0000-000000000009',
        userId: 'b0000000-0000-0000-0000-000000000009',
        organizationId: orgId,
        fullName: 'Liam Neilson',
        employeeId: 'INT-QA-001',
        email: 'liam.neilson@corporate.com',
        phone: '+1 (555) 011-9944',
        department: 'Quality Assurance',
        designation: 'QA Testing Intern',
        employeeType: EmployeeType.INTERN,
        joiningDate: '2024-03-01',
        profilePhotoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
        status: EntityStatus.ACTIVE,
        createdAt: '2024-03-01T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'c0000000-0000-0000-0000-000000000010',
        userId: 'b0000000-0000-0000-0000-000000000010',
        organizationId: orgId,
        fullName: 'Amit Sharma',
        employeeId: 'EMP-DEV-010',
        email: 'amit@corporate.com',
        phone: '+1 (555) 011-2233',
        department: 'Engineering',
        designation: 'Frontend Software Engineer',
        employeeType: EmployeeType.EMPLOYEE,
        joiningDate: '2024-01-01',
        profilePhotoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        status: EntityStatus.ACTIVE,
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'c0000000-0000-0000-0000-000000000011',
        userId: 'b0000000-0000-0000-0000-000000000011',
        organizationId: orgId,
        fullName: 'Sneha Patel',
        employeeId: 'EMP-DEV-011',
        email: 'sneha@corporate.com',
        phone: '+1 (555) 011-4455',
        department: 'Engineering',
        designation: 'Full Stack Engineer',
        employeeType: EmployeeType.EMPLOYEE,
        joiningDate: '2024-01-05',
        profilePhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        status: EntityStatus.ACTIVE,
        createdAt: '2024-01-05T08:00:00Z',
        updatedAt: now,
      }
    ];

    // 3. Teams
    this.teams = [
      {
        id: 'd0000000-0000-0000-0000-000000000001',
        organizationId: orgId,
        name: 'Core Platform Engineering',
        department: 'Engineering',
        leaderId: 'c0000000-0000-0000-0000-000000000002', // Marcus Sterling
        description: 'Mission-critical distributed services, APIs, and cloud infrastructure.',
        status: EntityStatus.ACTIVE,
        createdAt: '2023-03-05T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'd0000000-0000-0000-0000-000000000002',
        organizationId: orgId,
        name: 'Enterprise Experience & UI',
        department: 'Product Design',
        leaderId: 'c0000000-0000-0000-0000-000000000003', // Sarah Jenkins
        description: 'User experience architecture, corporate design system, and accessibility.',
        status: EntityStatus.ACTIVE,
        createdAt: '2023-04-15T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'd0000000-0000-0000-0000-000000000003',
        organizationId: orgId,
        name: 'Quality & Test Automation',
        department: 'Quality Assurance',
        leaderId: null,
        description: 'Automated test pipelines, security regression, and performance audits.',
        status: EntityStatus.ACTIVE,
        createdAt: '2023-05-20T08:00:00Z',
        updatedAt: now,
      }
    ];

    // 4. Team Members
    this.teamMembers = [
      {
        id: 'e0000000-0000-0000-0000-000000000001',
        teamId: 'd0000000-0000-0000-0000-000000000001',
        employeeId: 'c0000000-0000-0000-0000-000000000004', // Jonathan Reed
        roleInTeam: 'MEMBER',
        status: EntityStatus.ACTIVE,
        joinedAt: '2023-06-21T08:00:00Z',
        createdAt: '2023-06-21T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'e0000000-0000-0000-0000-000000000002',
        teamId: 'd0000000-0000-0000-0000-000000000001',
        employeeId: 'c0000000-0000-0000-0000-000000000005', // Aiden Clark (Intern)
        roleInTeam: 'INTERN',
        status: EntityStatus.ACTIVE,
        joinedAt: '2024-01-11T08:00:00Z',
        createdAt: '2024-01-11T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'e0000000-0000-0000-0000-000000000003',
        teamId: 'd0000000-0000-0000-0000-000000000001',
        employeeId: 'c0000000-0000-0000-0000-000000000006', // David Kim
        roleInTeam: 'MEMBER',
        status: EntityStatus.ACTIVE,
        joinedAt: '2023-08-16T08:00:00Z',
        createdAt: '2023-08-16T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'e0000000-0000-0000-0000-000000000004',
        teamId: 'd0000000-0000-0000-0000-000000000002',
        employeeId: 'c0000000-0000-0000-0000-000000000007', // Elena Rostova (Intern)
        roleInTeam: 'INTERN',
        status: EntityStatus.ACTIVE,
        joinedAt: '2024-02-02T08:00:00Z',
        createdAt: '2024-02-02T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'e0000000-0000-0000-0000-000000000005',
        teamId: 'd0000000-0000-0000-0000-000000000003',
        employeeId: 'c0000000-0000-0000-0000-000000000008', // Rachel Zane
        roleInTeam: 'MEMBER',
        status: EntityStatus.ACTIVE,
        joinedAt: '2023-05-22T08:00:00Z',
        createdAt: '2023-05-22T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'e0000000-0000-0000-0000-000000000006',
        teamId: 'd0000000-0000-0000-0000-000000000003',
        employeeId: 'c0000000-0000-0000-0000-000000000009', // Liam Neilson
        roleInTeam: 'INTERN',
        status: EntityStatus.ACTIVE,
        joinedAt: '2024-03-02T08:00:00Z',
        createdAt: '2024-03-02T08:00:00Z',
        updatedAt: now,
      }
    ];

    // 5. Projects
    this.projects = [
      {
        id: 'f0000000-0000-0000-0000-000000000001',
        organizationId: orgId,
        name: 'Enterprise Portal 2.0 Foundation',
        code: 'PRJ-PORTAL-01',
        description: 'Core corporate work management portal with high security RBAC and workflow engine.',
        department: 'Engineering',
        teamId: 'd0000000-0000-0000-0000-000000000001',
        leaderId: 'c0000000-0000-0000-0000-000000000002', // Marcus Sterling
        status: 'ACTIVE',
        priority: 'CRITICAL',
        startDate: '2024-01-01',
        targetDate: '2024-06-30',
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'f0000000-0000-0000-0000-000000000002',
        organizationId: orgId,
        name: 'Corporate Design System Revamp',
        code: 'PRJ-DESIGN-02',
        description: 'White and blue corporate token library with accessible components.',
        department: 'Product Design',
        teamId: 'd0000000-0000-0000-0000-000000000002',
        leaderId: 'c0000000-0000-0000-0000-000000000003', // Sarah Jenkins
        status: 'ACTIVE',
        priority: 'HIGH',
        startDate: '2024-02-15',
        targetDate: '2024-07-15',
        createdAt: '2024-02-15T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'f0000000-0000-0000-0000-000000000003',
        organizationId: orgId,
        name: 'Cloud Infrastructure Optimization',
        code: 'PRJ-CLOUD-03',
        description: 'Multi-region failover and autoscaling policies for mission-critical microservices.',
        department: 'Engineering',
        teamId: 'd0000000-0000-0000-0000-000000000001',
        leaderId: 'c0000000-0000-0000-0000-000000000002', // Marcus Sterling
        status: 'PLANNING',
        priority: 'MEDIUM',
        startDate: '2024-04-01',
        targetDate: '2024-09-30',
        createdAt: '2024-04-01T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'f0000000-0000-0000-0000-000000000004',
        organizationId: orgId,
        name: 'Automated Security Scanner Integration',
        code: 'PRJ-SEC-04',
        description: 'Continuous dependency scanning and SAST/DAST pipeline enforcement.',
        department: 'Quality Assurance',
        teamId: 'd0000000-0000-0000-0000-000000000003',
        leaderId: null,
        status: 'ACTIVE',
        priority: 'HIGH',
        startDate: '2024-03-10',
        targetDate: '2024-08-30',
        createdAt: '2024-03-10T08:00:00Z',
        updatedAt: now,
      }
    ];

    // 6. Seeded Task Templates
    this.taskTemplates = [
      {
        id: 't0000000-0000-0000-0000-000000000001',
        organizationId: orgId,
        name: 'Enterprise Web Application Lifecycle',
        description: 'Standard 9-phase enterprise software engineering task plan from discovery to prod audit.',
        department: 'Engineering',
        tasks: [
          { title: 'Requirement Analysis & Architecture Scope', description: 'Align stakeholder deliverables, compliance rules, and non-functional reqs.', priority: 'HIGH', orderIndex: 1, defaultEstimatedDays: 5 },
          { title: 'UI/UX Wireframes & Component Specs', description: 'High-fidelity mockups in Figma aligned with Nexus Design System.', priority: 'NORMAL', orderIndex: 2, defaultEstimatedDays: 7 },
          { title: 'Database Schema & Migration DDL', description: 'Design 3NF relational PostgreSQL schema, indexes, and RLS policies.', priority: 'HIGH', orderIndex: 3, defaultEstimatedDays: 4 },
          { title: 'Frontend Core SPA Scaffolding', description: 'Setup React, TypeScript, Tailwind styling tokens, and layout components.', priority: 'HIGH', orderIndex: 4, defaultEstimatedDays: 6 },
          { title: 'Backend REST API & Microservices', description: 'Implement NestJS controllers, services, DTOs, and validation pipes.', priority: 'CRITICAL', orderIndex: 5, defaultEstimatedDays: 8 },
          { title: 'Authentication & RBAC Guards', description: 'JWT authentication, refresh tokens, role guards, and bcrypt hashing.', priority: 'CRITICAL', orderIndex: 6, defaultEstimatedDays: 4 },
          { title: 'Unit, Integration & E2E Testing', description: 'Write Vitest and Jest suites targeting >80% statement coverage.', priority: 'HIGH', orderIndex: 7, defaultEstimatedDays: 5 },
          { title: 'API Documentation & Swagger/OpenAPI', description: 'Generate comprehensive endpoints documentation and usage guides.', priority: 'NORMAL', orderIndex: 8, defaultEstimatedDays: 3 },
          { title: 'Final Production Security & Performance Audit', description: 'Run OWASP ZAP, load tests, and cloud deployment validation.', priority: 'CRITICAL', orderIndex: 9, defaultEstimatedDays: 3 },
        ],
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 't0000000-0000-0000-0000-000000000002',
        organizationId: orgId,
        name: 'Design System Revamp Sprint',
        description: 'Structured tasks for brand styling, accessible primitives, and token migration.',
        department: 'Product Design',
        tasks: [
          { title: 'Color Palette & Semantic Tokens Audit', description: 'Define primary navy and corporate blue color scales with WCAG AAA contrast.', priority: 'HIGH', orderIndex: 1, defaultEstimatedDays: 3 },
          { title: 'Typography Hierarchy & Font System', description: 'Standardize Inter font sizes, weights, and responsive line heights.', priority: 'NORMAL', orderIndex: 2, defaultEstimatedDays: 2 },
          { title: 'Core UI Primitive Component Library', description: 'Build Button, Input, Modal, Table, Tabs, and Toast components.', priority: 'CRITICAL', orderIndex: 3, defaultEstimatedDays: 8 },
          { title: 'Accessibility (a11y) Keyboard & Screen Reader Pass', description: 'Ensure full aria labels, focus states, and keyboard navigation.', priority: 'HIGH', orderIndex: 4, defaultEstimatedDays: 4 },
          { title: 'Documentation & Storybook Catalog', description: 'Publish interactive component showcase for engineering handoff.', priority: 'NORMAL', orderIndex: 5, defaultEstimatedDays: 3 },
        ],
        createdAt: '2024-01-10T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 't0000000-0000-0000-0000-000000000003',
        organizationId: orgId,
        name: 'QA Automation & Security Sprint',
        description: 'Comprehensive test pipeline automation and vulnerability scanning setup.',
        department: 'Quality Assurance',
        tasks: [
          { title: 'Test Plan & Risk Matrix Definition', description: 'Outline critical user journeys and edge-case boundary scenarios.', priority: 'HIGH', orderIndex: 1, defaultEstimatedDays: 3 },
          { title: 'Automated Regression Test Suite', description: 'Implement Cypress/Playwright regression scripts for core workflows.', priority: 'CRITICAL', orderIndex: 2, defaultEstimatedDays: 7 },
          { title: 'API Security & Penetration Testing', description: 'Validate authorization bypasses, rate limiting, and SQL/XSS guards.', priority: 'CRITICAL', orderIndex: 3, defaultEstimatedDays: 4 },
          { title: 'Load & Performance Benchmarking', description: 'Simulate 5,000 concurrent active users with k6 load test scripts.', priority: 'HIGH', orderIndex: 4, defaultEstimatedDays: 3 },
        ],
        createdAt: '2024-01-15T08:00:00Z',
        updatedAt: now,
      }
    ];

    // 7. Seeded Tasks for Project 1 (Enterprise Portal 2.0 Foundation)
    const p1Id = 'f0000000-0000-0000-0000-000000000001';
    const reedId = 'c0000000-0000-0000-0000-000000000004'; // Jonathan Reed
    const clarkId = 'c0000000-0000-0000-0000-000000000005'; // Aiden Clark (Intern)
    const kimId = 'c0000000-0000-0000-0000-000000000006'; // David Kim
    const rostovaId = 'c0000000-0000-0000-0000-000000000007'; // Elena Rostova (Intern)
    const zaneId = 'c0000000-0000-0000-0000-000000000008'; // Rachel Zane
    const leaderUserId = 'b0000000-0000-0000-0000-000000000002'; // Marcus Sterling

    this.tasks = [
      {
        id: '10000000-0000-0000-0000-000000000001',
        organizationId: orgId,
        projectId: p1Id,
        title: 'Requirement Analysis & Stakeholder Signoff',
        description: 'Conduct workshops with department heads to finalize system functional scope.',
        priority: 'HIGH',
        startDate: '2024-01-05',
        dueDate: '2024-01-15',
        assignedTo: reedId,
        status: TaskStatus.COMPLETED,
        orderIndex: 1,
        isTodayWork: false,
        dailyWorkDate: null,
        assignmentHistory: [
          {
            id: uuidv4(),
            fromEmployeeId: null,
            toEmployeeId: reedId,
            fromEmployeeName: 'Unassigned',
            toEmployeeName: 'Jonathan Reed',
            changedBy: leaderUserId,
            changedByName: 'Marcus Sterling',
            reason: 'Assigned as lead technical requirements owner',
            timestamp: '2024-01-05T09:00:00Z',
          }
        ],
        createdAt: '2024-01-05T08:00:00Z',
        updatedAt: '2024-01-15T17:00:00Z',
      },
      {
        id: '10000000-0000-0000-0000-000000000002',
        organizationId: orgId,
        projectId: p1Id,
        title: 'UI Design & Component Architecture',
        description: 'Design corporate white and blue theme, layouts, responsive sidebars and data grids.',
        priority: 'NORMAL',
        startDate: '2024-01-16',
        dueDate: '2024-01-28',
        assignedTo: rostovaId,
        status: TaskStatus.COMPLETED,
        orderIndex: 2,
        dependsOnTaskId: '10000000-0000-0000-0000-000000000001',
        isTodayWork: false,
        dailyWorkDate: null,
        assignmentHistory: [
          {
            id: uuidv4(),
            fromEmployeeId: null,
            toEmployeeId: rostovaId,
            fromEmployeeName: 'Unassigned',
            toEmployeeName: 'Elena Rostova',
            changedBy: leaderUserId,
            changedByName: 'Marcus Sterling',
            reason: 'Assigned UI/UX intern project lead',
            timestamp: '2024-01-16T09:00:00Z',
          }
        ],
        createdAt: '2024-01-16T08:00:00Z',
        updatedAt: '2024-01-28T18:00:00Z',
      },
      {
        id: '10000000-0000-0000-0000-000000000003',
        organizationId: orgId,
        projectId: p1Id,
        title: 'Database Schema & Supabase Architecture',
        description: 'Construct PostgreSQL tables, foreign key constraints, indexes and RLS policies.',
        priority: 'HIGH',
        startDate: '2024-01-25',
        dueDate: '2026-10-05',
        assignedTo: kimId,
        status: TaskStatus.IN_PROGRESS,
        orderIndex: 3,
        dependsOnTaskId: '10000000-0000-0000-0000-000000000001',
        isTodayWork: true,
        dailyWorkDate: '2026-09-30',
        assignmentHistory: [
          {
            id: uuidv4(),
            fromEmployeeId: null,
            toEmployeeId: kimId,
            fromEmployeeName: 'Unassigned',
            toEmployeeName: 'David Kim',
            changedBy: leaderUserId,
            changedByName: 'Marcus Sterling',
            reason: 'Assigned cloud database engineer',
            timestamp: '2024-01-25T09:00:00Z',
          }
        ],
        createdAt: '2024-01-25T08:00:00Z',
        updatedAt: now,
      },
      {
        id: '10000000-0000-0000-0000-000000000004',
        organizationId: orgId,
        projectId: p1Id,
        title: 'Authentication & RBAC Security Engine',
        description: 'Build JWT Passport strategy, bcrypt hashing, role validation guards, and session refresh.',
        priority: 'CRITICAL',
        startDate: '2024-02-01',
        dueDate: '2026-10-06',
        assignedTo: reedId,
        status: TaskStatus.IN_PROGRESS,
        orderIndex: 4,
        dependsOnTaskId: '10000000-0000-0000-0000-000000000003',
        isTodayWork: true,
        dailyWorkDate: '2026-09-30',
        assignmentHistory: [
          {
            id: uuidv4(),
            fromEmployeeId: null,
            toEmployeeId: reedId,
            fromEmployeeName: 'Unassigned',
            toEmployeeName: 'Jonathan Reed',
            changedBy: leaderUserId,
            changedByName: 'Marcus Sterling',
            reason: 'Assigned senior engineer for critical auth pipeline',
            timestamp: '2024-02-01T09:00:00Z',
          }
        ],
        createdAt: '2024-02-01T08:00:00Z',
        updatedAt: now,
      },
      {
        id: '10000000-0000-0000-0000-000000000005',
        organizationId: orgId,
        projectId: p1Id,
        title: 'Complete Project Task Plan Builder Engine',
        description: 'Build interactive bulk task grid, reordering, duplicate, and atomic database persistence.',
        priority: 'CRITICAL',
        startDate: '2024-02-05',
        dueDate: '2026-10-08',
        assignedTo: clarkId,
        status: TaskStatus.IN_PROGRESS,
        orderIndex: 5,
        dependsOnTaskId: '10000000-0000-0000-0000-000000000004',
        isTodayWork: true,
        dailyWorkDate: '2026-09-30',
        assignmentHistory: [
          {
            id: uuidv4(),
            fromEmployeeId: null,
            toEmployeeId: clarkId,
            fromEmployeeName: 'Unassigned',
            toEmployeeName: 'Aiden Clark',
            changedBy: leaderUserId,
            changedByName: 'Marcus Sterling',
            reason: 'Assigned engineering intern',
            timestamp: '2024-02-05T09:00:00Z',
          }
        ],
        createdAt: '2024-02-05T08:00:00Z',
        updatedAt: now,
      },
      {
        id: '10000000-0000-0000-0000-000000000006',
        organizationId: orgId,
        projectId: p1Id,
        title: 'Excel & CSV Bulk Upload Ingestion Pipeline',
        description: 'Support multi-format spreadsheets, validation preview, error reporting, and bulk insert.',
        priority: 'HIGH',
        startDate: '2024-02-10',
        dueDate: '2026-10-12',
        assignedTo: zaneId,
        status: TaskStatus.ASSIGNED,
        orderIndex: 6,
        dependsOnTaskId: '10000000-0000-0000-0000-000000000005',
        isTodayWork: false,
        dailyWorkDate: null,
        assignmentHistory: [
          {
            id: uuidv4(),
            fromEmployeeId: null,
            toEmployeeId: zaneId,
            fromEmployeeName: 'Unassigned',
            toEmployeeName: 'Rachel Zane',
            changedBy: leaderUserId,
            changedByName: 'Marcus Sterling',
            reason: 'Assigned QA automation lead',
            timestamp: '2024-02-10T09:00:00Z',
          }
        ],
        createdAt: '2024-02-10T08:00:00Z',
        updatedAt: now,
      },
      {
        id: '10000000-0000-0000-0000-000000000007',
        organizationId: orgId,
        projectId: p1Id,
        title: 'Work Submissions & Review Workflow',
        description: 'Enable staff to submit code / artifact links and allow team leaders to approve or request revisions.',
        priority: 'NORMAL',
        startDate: '2024-02-15',
        dueDate: '2026-10-18',
        assignedTo: null,
        status: TaskStatus.UNASSIGNED,
        orderIndex: 7,
        isTodayWork: false,
        dailyWorkDate: null,
        assignmentHistory: [],
        createdAt: '2024-02-15T08:00:00Z',
        updatedAt: now,
      },
      {
        id: '10000000-0000-0000-0000-000000000008',
        organizationId: orgId,
        projectId: p1Id,
        title: 'End-to-End System Performance & Load Testing',
        description: 'Simulate high concurrency work submissions, task plan batch processing, and API benchmarks.',
        priority: 'HIGH',
        startDate: '2024-02-20',
        dueDate: '2026-10-22',
        assignedTo: null,
        status: TaskStatus.UNASSIGNED,
        orderIndex: 8,
        isTodayWork: false,
        dailyWorkDate: null,
        assignmentHistory: [],
        createdAt: '2024-02-20T08:00:00Z',
        updatedAt: now,
      },
      {
        id: '10000000-0000-0000-0000-000000000009',
        organizationId: orgId,
        projectId: p1Id,
        title: 'Production Readiness & Security Compliance Audit',
        description: 'Verify SOC2 policies, secret rotation, container scanning, and final rollout signoff.',
        priority: 'CRITICAL',
        startDate: '2024-02-25',
        dueDate: '2026-10-25',
        assignedTo: null,
        status: TaskStatus.UNASSIGNED,
        orderIndex: 9,
        isTodayWork: false,
        dailyWorkDate: null,
        assignmentHistory: [],
        createdAt: '2024-02-25T08:00:00Z',
        updatedAt: now,
      }
    ];

    // Seeded tasks for Project 2 (Corporate Design System Revamp)
    const p2Id = 'f0000000-0000-0000-0000-000000000002';
    this.tasks.push(
      {
        id: '20000000-0000-0000-0000-000000000001',
        organizationId: orgId,
        projectId: p2Id,
        title: 'Design Token System Definition',
        description: 'Define semantic color palette, shadow levels, and spacing tokens.',
        priority: 'HIGH',
        startDate: '2024-02-15',
        dueDate: '2024-02-28',
        assignedTo: rostovaId,
        status: TaskStatus.COMPLETED,
        orderIndex: 1,
        isTodayWork: false,
        dailyWorkDate: null,
        assignmentHistory: [],
        createdAt: '2024-02-15T08:00:00Z',
        updatedAt: '2024-02-28T17:00:00Z',
      },
      {
        id: '20000000-0000-0000-0000-000000000002',
        organizationId: orgId,
        projectId: p2Id,
        title: 'Accessible Form Primitives & Select Modals',
        description: 'Build WCAG 2.1 compliant input controls, select pickers, and checkboxes.',
        priority: 'NORMAL',
        startDate: '2024-03-01',
        dueDate: '2026-10-04',
        assignedTo: rostovaId,
        status: TaskStatus.IN_PROGRESS,
        orderIndex: 2,
        isTodayWork: true,
        dailyWorkDate: '2026-09-30',
        assignmentHistory: [],
        createdAt: '2024-03-01T08:00:00Z',
        updatedAt: now,
      },
      {
        id: '20000000-0000-0000-0000-000000000003',
        organizationId: orgId,
        projectId: p2Id,
        title: 'Data Grid & Table Component Polish',
        description: 'Create sortable, filterable enterprise data table with sticky headers and pagination.',
        priority: 'HIGH',
        startDate: '2024-03-10',
        dueDate: '2026-10-15',
        assignedTo: null,
        status: TaskStatus.UNASSIGNED,
        orderIndex: 3,
        isTodayWork: false,
        dailyWorkDate: null,
        assignmentHistory: [],
        createdAt: '2024-03-10T08:00:00Z',
        updatedAt: now,
      }
    );

    // Seeded tasks for Amit Sharma (EMP-DEV-010) & Sneha Patel (EMP-DEV-011)
    const amitId = 'c0000000-0000-0000-0000-000000000010';
    const snehaId = 'c0000000-0000-0000-0000-000000000011';

    this.tasks.push(
      {
        id: '30000000-0000-0000-0000-000000000001',
        organizationId: orgId,
        projectId: p1Id,
        title: 'Create Login Page & Auth Form UX',
        description: 'Implement modern corporate login screen with email/password validation and JWT auth handshake.',
        priority: 'HIGH',
        startDate: '2026-09-28',
        dueDate: '2026-09-30',
        assignedTo: amitId,
        status: TaskStatus.ASSIGNED,
        orderIndex: 10,
        isTodayWork: true,
        dailyWorkDate: '2026-09-30',
        assignmentHistory: [
          {
            id: uuidv4(),
            fromEmployeeId: null,
            toEmployeeId: amitId,
            fromEmployeeName: 'Unassigned',
            toEmployeeName: 'Amit Sharma',
            changedBy: leaderUserId,
            changedByName: 'Marcus Sterling',
            reason: 'Assigned for frontend authentication milestone',
            timestamp: '2026-09-28T09:00:00Z',
          }
        ],
        createdAt: '2026-09-28T08:00:00Z',
        updatedAt: now,
      },
      {
        id: '30000000-0000-0000-0000-000000000002',
        organizationId: orgId,
        projectId: p1Id,
        title: 'Database Schema Optimizations & Index Tuning',
        description: 'Review database queries, create composite indexes for task filters, and verify query plan benchmarks.',
        priority: 'HIGH',
        startDate: '2026-09-28',
        dueDate: '2026-10-02',
        assignedTo: amitId,
        status: TaskStatus.IN_PROGRESS,
        orderIndex: 11,
        isTodayWork: true,
        dailyWorkDate: '2026-09-30',
        assignmentHistory: [],
        createdAt: '2026-09-28T08:00:00Z',
        updatedAt: now,
      },
      {
        id: '30000000-0000-0000-0000-000000000003',
        organizationId: orgId,
        projectId: p1Id,
        title: 'Frontend Authentication Guards & Protected Routes',
        description: 'Wrap private application routes with role-based JWT auth guards and redirect unauthenticated requests.',
        priority: 'NORMAL',
        startDate: '2026-09-27',
        dueDate: '2026-09-30',
        assignedTo: amitId,
        status: TaskStatus.SUBMITTED,
        submissionMessage: 'Completed React Router guard middleware with role redirect rules and token expiration listener.',
        submissionAttachmentName: 'auth_guard_bundle.zip',
        submissionAttachmentUrl: 'https://storage.supabase.co/v0/object/public/portal-assets/auth_guard_bundle.zip',
        submissionComment: 'Ready for Marcus to review. Unit tests are all green.',
        submittedAt: '2026-09-29T17:30:00Z',
        orderIndex: 12,
        isTodayWork: true,
        dailyWorkDate: '2026-09-30',
        assignmentHistory: [],
        createdAt: '2026-09-27T08:00:00Z',
        updatedAt: now,
      },
      {
        id: '30000000-0000-0000-0000-000000000004',
        organizationId: orgId,
        projectId: p1Id,
        title: 'Mobile Navigation Drawer & Sidebar Layout',
        description: 'Implement responsive mobile navigation drawer with touch gestures and clean collapse animations.',
        priority: 'HIGH',
        startDate: '2026-09-25',
        dueDate: '2026-09-29',
        assignedTo: amitId,
        status: TaskStatus.REVISION_REQUIRED,
        submissionMessage: 'Initial drawer implementation committed.',
        submittedAt: '2026-09-28T16:00:00Z',
        reviewFeedback: 'Please improve the mobile layout and spacing on screens under 380px, and submit again.',
        reviewedAt: '2026-09-28T18:00:00Z',
        reviewedBy: leaderUserId,
        orderIndex: 13,
        isTodayWork: false,
        dailyWorkDate: null,
        assignmentHistory: [],
        createdAt: '2026-09-25T08:00:00Z',
        updatedAt: now,
      },
      {
        id: '30000000-0000-0000-0000-000000000005',
        organizationId: orgId,
        projectId: p1Id,
        title: 'Swagger API Specification & Postman Collection',
        description: 'Publish complete OpenAPI specification for task management and assignment endpoints.',
        priority: 'NORMAL',
        startDate: '2026-09-20',
        dueDate: '2026-09-26',
        assignedTo: amitId,
        status: TaskStatus.COMPLETED,
        submissionMessage: 'All OpenAPI tags and schemas documented with 100% endpoint coverage.',
        submittedAt: '2026-09-26T14:00:00Z',
        reviewedAt: '2026-09-26T16:00:00Z',
        reviewedBy: leaderUserId,
        orderIndex: 14,
        isTodayWork: false,
        dailyWorkDate: null,
        assignmentHistory: [],
        createdAt: '2026-09-20T08:00:00Z',
        updatedAt: now,
      },
      {
        id: '30000000-0000-0000-0000-000000000006',
        organizationId: orgId,
        projectId: p1Id,
        title: 'Backend API Rate Limiting & Security Headers',
        description: 'Configure Helmet headers, CORS policies, and rate-limiting throttlers.',
        priority: 'HIGH',
        startDate: '2026-09-28',
        dueDate: '2026-10-03',
        assignedTo: snehaId,
        status: TaskStatus.IN_PROGRESS,
        orderIndex: 15,
        isTodayWork: true,
        dailyWorkDate: '2026-09-30',
        assignmentHistory: [],
        createdAt: '2026-09-28T08:00:00Z',
        updatedAt: now,
      }
    );

    // 8. Seeded CMS Announcements
    this.announcements = [
      {
        id: 'ann-001',
        organizationId: orgId,
        title: '🚀 Q4 Corporate Town Hall & Strategic Product Roadmap 2026',
        content: 'Join Executive Leadership this Thursday at 3:00 PM for our global quarterly town hall covering enterprise milestones, new AI initiatives, and employee recognition.',
        audience: 'ALL',
        publishDate: '2026-09-25',
        expiryDate: '2026-10-15',
        status: 'ACTIVE',
        createdBy: 'b0000000-0000-0000-0000-000000000001',
        createdAt: '2026-09-25T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'ann-002',
        organizationId: orgId,
        title: '🛡️ Annual Information Security & Compliance Training Due',
        content: 'All corporate employees and interns are requested to complete the 2026 Corporate Security & Compliance module in the LMS before end of month.',
        audience: 'EMPLOYEES',
        department: 'Engineering',
        publishDate: '2026-09-26',
        expiryDate: '2026-10-31',
        status: 'ACTIVE',
        createdBy: 'b0000000-0000-0000-0000-000000000001',
        createdAt: '2026-09-26T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'ann-003',
        organizationId: orgId,
        title: '💼 Annual Learning & Skill Development Stipend Now Available',
        content: 'Employees can claim up to $1,500 for technical certifications, conferences, and approved online learning materials through the HR portal.',
        audience: 'ALL',
        publishDate: '2026-09-20',
        expiryDate: '2026-11-30',
        status: 'ACTIVE',
        createdBy: 'b0000000-0000-0000-0000-000000000001',
        createdAt: '2026-09-20T08:00:00Z',
        updatedAt: now,
      }
    ];

    // 9. Seeded Company Resources / Documents (CMS)
    this.resources = [
      {
        id: 'res-001',
        organizationId: orgId,
        title: 'Nexus Global Employee Handbook 2026',
        description: 'Complete guide to company values, workplace policies, remote work guidelines, benefits, and conduct.',
        category: 'POLICIES',
        fileUrl: 'https://storage.supabase.co/v0/object/public/portal-assets/employee_handbook_2026.pdf',
        fileName: 'Nexus_Employee_Handbook_2026.pdf',
        fileSize: 2450000,
        fileType: 'application/pdf',
        uploadedBy: 'b0000000-0000-0000-0000-000000000001',
        createdAt: '2026-01-10T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'res-002',
        organizationId: orgId,
        title: 'Enterprise Architecture & Clean Code Guidelines',
        description: 'Engineering standards for TypeScript, NestJS microservices, database schemas, and REST API conventions.',
        category: 'GUIDELINES',
        fileUrl: 'https://storage.supabase.co/v0/object/public/portal-assets/engineering_guidelines.pdf',
        fileName: 'Nexus_Engineering_Standards_v3.pdf',
        fileSize: 1850000,
        fileType: 'application/pdf',
        uploadedBy: 'b0000000-0000-0000-0000-000000000002',
        createdAt: '2026-02-01T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'res-003',
        organizationId: orgId,
        title: 'Leave Policy, Public Holidays & Benefits Schedule',
        description: 'Comprehensive overview of paid time off, sick leave, parental leave, and company holiday calendar.',
        category: 'POLICIES',
        fileUrl: 'https://storage.supabase.co/v0/object/public/portal-assets/leave_policy.pdf',
        fileName: 'Nexus_Leave_Policy_2026.pdf',
        fileSize: 950000,
        fileType: 'application/pdf',
        uploadedBy: 'b0000000-0000-0000-0000-000000000001',
        createdAt: '2026-01-15T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'res-004',
        organizationId: orgId,
        title: 'Frontend Design Tokens & UI Component Manual',
        description: 'Specifications for typography hierarchy, corporate navy color palette, and accessible form controls.',
        category: 'DOCUMENTS',
        fileUrl: 'https://storage.supabase.co/v0/object/public/portal-assets/design_tokens_manual.pdf',
        fileName: 'Design_Tokens_Manual.pdf',
        fileSize: 3100000,
        fileType: 'application/pdf',
        uploadedBy: 'b0000000-0000-0000-0000-000000000003',
        createdAt: '2026-03-01T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'res-005',
        organizationId: orgId,
        title: 'Intern Onboarding & 90-Day Ramp-Up Roadmap',
        description: 'Checklist and milestones for new interns joining engineering and design cohorts.',
        category: 'TRAINING',
        fileUrl: 'https://storage.supabase.co/v0/object/public/portal-assets/intern_roadmap.pdf',
        fileName: 'Intern_Rampup_Roadmap.pdf',
        fileSize: 1200000,
        fileType: 'application/pdf',
        uploadedBy: 'b0000000-0000-0000-0000-000000000002',
        createdAt: '2026-01-20T08:00:00Z',
        updatedAt: now,
      }
    ];

    // 10. Seeded Knowledge Base (CMS)
    this.knowledgeBase = [
      {
        id: 'kb-001',
        organizationId: orgId,
        question: 'How do I start and submit my assigned daily tasks?',
        answer: 'Navigate to your Dashboard or Today\'s Work view. On any assigned task card, click "Start Work" to change its status to In Progress. When you complete the deliverable, click "Submit Work", enter a concise completion message and optional attachment/comment. Your Team Leader will immediately receive a review notification.',
        category: 'WORK_PROCESS',
        status: 'PUBLISHED',
        createdBy: 'b0000000-0000-0000-0000-000000000001',
        createdAt: '2026-01-10T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'kb-002',
        organizationId: orgId,
        question: 'What happens when a Team Leader requests revision on a task?',
        answer: 'If your submission requires improvements, the task status changes to "Revision Required" with specific feedback from your Team Leader. You can view the feedback directly on the task card, make the required updates, and click "Update Work" to resubmit.',
        category: 'WORK_PROCESS',
        status: 'PUBLISHED',
        createdBy: 'b0000000-0000-0000-0000-000000000001',
        createdAt: '2026-01-12T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'kb-003',
        organizationId: orgId,
        question: 'How do I access company policies, guidelines, and training resources?',
        answer: 'All official company resources, employee handbooks, design guidelines, and training manuals are organized by category under the "Documents" navigation item. You can preview or download approved PDFs directly.',
        category: 'COMPANY_POLICIES',
        status: 'PUBLISHED',
        createdBy: 'b0000000-0000-0000-0000-000000000001',
        createdAt: '2026-01-15T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'kb-004',
        organizationId: orgId,
        question: 'How do I track my course completion in the LMS Training Portal?',
        answer: 'Open the "Training" tab from your sidebar. Click on any assigned course to view the syllabus and module player. As you finish each module (video, document, or text lesson), click "Mark Complete" to automatically advance your progress meter toward 100%.',
        category: 'TECHNICAL',
        status: 'PUBLISHED',
        createdBy: 'b0000000-0000-0000-0000-000000000001',
        createdAt: '2026-01-18T08:00:00Z',
        updatedAt: now,
      },
      {
        id: 'kb-005',
        organizationId: orgId,
        question: 'What is the procedure for requesting annual or sick leave?',
        answer: 'Submit your leave request under the Attendance/Leave section. Provide your start date, end date, leave type, and reason. Requests are routed to your designated Team Leader and HR for rapid one-click approval.',
        category: 'HR',
        status: 'PUBLISHED',
        createdBy: 'b0000000-0000-0000-0000-000000000001',
        createdAt: '2026-01-20T08:00:00Z',
        updatedAt: now,
      }
    ];

    // 11. Seeded LMS Courses & Modules
    const course1Id = 'crs-001';
    const course2Id = 'crs-002';
    const course3Id = 'crs-003';

    this.courses = [
      {
        id: course1Id,
        organizationId: orgId,
        title: 'Python & Enterprise Backend Architecture Fundamentals',
        description: 'Comprehensive corporate curriculum covering modern Python syntax, modular services, database design, and REST APIs.',
        category: 'Technical Engineering',
        thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80',
        status: 'ACTIVE',
        modules: [
          {
            id: 'mod-101',
            title: '1. Introduction & Development Environment Setup',
            description: 'Overview of Python 3.12, virtual environments, Poetry, and linting standards.',
            contentType: 'VIDEO',
            contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            durationMinutes: 15,
            orderIndex: 1,
          },
          {
            id: 'mod-102',
            title: '2. Variables, Data Types & Control Flow Structures',
            description: 'Mastering primitive types, collections, list comprehensions, and branch logic.',
            contentType: 'TEXT',
            textContent: '### Python Data Structures\n\nPython provides dynamic, high-level built-in data types:\n- **Primitives**: `int`, `float`, `str`, `bool`\n- **Sequences**: `list`, `tuple`, `range`\n- **Mappings**: `dict`\n- **Sets**: `set`, `frozenset`\n\nAlways use type annotations for clean code and readability.',
            durationMinutes: 20,
            orderIndex: 2,
          },
          {
            id: 'mod-103',
            title: '3. Modular Architecture, Functions & Package Management',
            description: 'Writing reusable pure functions, decorators, generators, and package imports.',
            contentType: 'PDF',
            contentUrl: 'https://storage.supabase.co/v0/object/public/portal-assets/python_modules_handbook.pdf',
            durationMinutes: 25,
            orderIndex: 3,
          },
          {
            id: 'mod-104',
            title: '4. Object-Oriented Programming (OOP) & Clean Design Patterns',
            description: 'Classes, inheritance, abstract base classes, SOLID principles, and dependency injection.',
            contentType: 'VIDEO',
            contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            durationMinutes: 30,
            orderIndex: 4,
          },
        ],
        createdById: 'b0000000-0000-0000-0000-000000000002',
        createdAt: '2026-01-10T08:00:00Z',
        updatedAt: now,
      },
      {
        id: course2Id,
        organizationId: orgId,
        title: 'Corporate Security, OWASP Top 10 & Compliance 2026',
        description: 'Mandatory annual training on data protection, credential safety, phishing prevention, and SOC2 guidelines.',
        category: 'Compliance & Security',
        thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&auto=format&fit=crop&q=80',
        status: 'ACTIVE',
        modules: [
          {
            id: 'mod-201',
            title: '1. Information Security & Zero Trust Architecture',
            description: 'Principles of least privilege, multi-factor authentication, and safe API access.',
            contentType: 'TEXT',
            textContent: '### Zero Trust Principles\n\n1. **Verify Explicitly**: Always authenticate and authorize based on all available data points.\n2. **Least Privilege Access**: Limit user and service access with Just-In-Time and Just-Enough-Access.\n3. **Assume Breach**: Minimize blast radius and segment access.',
            durationMinutes: 15,
            orderIndex: 1,
          },
          {
            id: 'mod-202',
            title: '2. Data Privacy, RLS Policies & Regulatory Compliance',
            description: 'Handling sensitive customer data and applying row-level database security.',
            contentType: 'PDF',
            contentUrl: 'https://storage.supabase.co/v0/object/public/portal-assets/compliance_rules.pdf',
            durationMinutes: 20,
            orderIndex: 2,
          },
          {
            id: 'mod-203',
            title: '3. Phishing Prevention & Secure Session Management',
            description: 'Identifying social engineering attacks, secure token storage, and reporting suspicious activity.',
            contentType: 'VIDEO',
            contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            durationMinutes: 15,
            orderIndex: 3,
          },
        ],
        createdById: 'b0000000-0000-0000-0000-000000000001',
        createdAt: '2026-01-15T08:00:00Z',
        updatedAt: now,
      },
      {
        id: course3Id,
        organizationId: orgId,
        title: 'Agile Sprint Delivery & Collaborative Code Reviews',
        description: 'Best practices for high-velocity teams: daily standups, pull request etiquette, and continuous deployment.',
        category: 'Agile & Teamwork',
        thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80',
        status: 'ACTIVE',
        modules: [
          {
            id: 'mod-301',
            title: '1. Effective Sprint Execution & Daily Standup Rhythm',
            description: 'How to communicate blockers, update task plans, and coordinate daily work.',
            contentType: 'TEXT',
            textContent: '### Daily Standup Essentials\n\n- What did I achieve yesterday?\n- What will I deliver today?\n- Are there any blockers or dependencies requiring lead assistance?',
            durationMinutes: 10,
            orderIndex: 1,
          },
          {
            id: 'mod-302',
            title: '2. Git Branching, Pull Requests & Constructive Reviews',
            description: 'Writing descriptive commit messages, maintaining small PR sizes, and constructive code feedback.',
            contentType: 'VIDEO',
            contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            durationMinutes: 25,
            orderIndex: 2,
          }
        ],
        createdById: 'b0000000-0000-0000-0000-000000000002',
        createdAt: '2026-01-20T08:00:00Z',
        updatedAt: now,
      }
    ];

    // 12. Seeded Course Enrollments (Amit has 75% on Python course: mod-101, mod-102, mod-103 done)
    this.courseEnrollments = [
      {
        id: 'enr-001',
        organizationId: orgId,
        courseId: course1Id,
        employeeId: amitId,
        status: 'IN_PROGRESS',
        progress: 75,
        completedModuleIds: ['mod-101', 'mod-102', 'mod-103'],
        assignedAt: '2026-09-01T08:00:00Z',
      },
      {
        id: 'enr-002',
        organizationId: orgId,
        courseId: course2Id,
        employeeId: amitId,
        status: 'ASSIGNED',
        progress: 0,
        completedModuleIds: [],
        assignedAt: '2026-09-15T08:00:00Z',
      },
      {
        id: 'enr-003',
        organizationId: orgId,
        courseId: course1Id,
        employeeId: snehaId,
        status: 'COMPLETED',
        progress: 100,
        completedModuleIds: ['mod-101', 'mod-102', 'mod-103', 'mod-104'],
        assignedAt: '2026-08-15T08:00:00Z',
        completedAt: '2026-09-20T17:00:00Z',
      },
      {
        id: 'enr-004',
        organizationId: orgId,
        courseId: course2Id,
        employeeId: reedId,
        status: 'COMPLETED',
        progress: 100,
        completedModuleIds: ['mod-201', 'mod-202', 'mod-203'],
        assignedAt: '2026-09-01T08:00:00Z',
        completedAt: '2026-09-22T15:00:00Z',
      },
      {
        id: 'enr-005',
        organizationId: orgId,
        courseId: course3Id,
        employeeId: clarkId,
        status: 'IN_PROGRESS',
        progress: 50,
        completedModuleIds: ['mod-301'],
        assignedAt: '2026-09-10T08:00:00Z',
      }
    ];

    // 13. Seeded Notifications for Amit Sharma & Team Leader
    const userAmitId = 'b0000000-0000-0000-0000-000000000010';
    this.notifications = [
      {
        id: 'notif-001',
        organizationId: orgId,
        userId: userAmitId,
        title: 'New Task Assigned',
        message: 'Marcus Sterling assigned you "Create Login Page & Auth Form UX" due today.',
        type: 'TASK_ASSIGNED',
        link: '/employee/daily-work',
        isRead: false,
        createdAt: '2026-09-30T03:00:00Z',
      },
      {
        id: 'notif-002',
        organizationId: orgId,
        userId: userAmitId,
        title: 'Revision Requested',
        message: 'Mobile Navigation Drawer requires layout improvements for mobile viewports.',
        type: 'REVISION_REQUESTED',
        link: '/employee/work-history',
        isRead: false,
        createdAt: '2026-09-29T18:05:00Z',
      },
      {
        id: 'notif-003',
        organizationId: orgId,
        userId: userAmitId,
        title: 'Work Approved 🎉',
        message: 'Your work on "Swagger API Specification" was approved and marked Completed.',
        type: 'WORK_APPROVED',
        link: '/employee/work-history',
        isRead: true,
        createdAt: '2026-09-26T16:05:00Z',
      },
      {
        id: 'notif-004',
        organizationId: orgId,
        userId: userAmitId,
        title: 'New Training Course Assigned',
        message: 'You have been enrolled in "Corporate Security & Compliance 2026".',
        type: 'TRAINING_ASSIGNED',
        link: '/employee/training',
        isRead: true,
        createdAt: '2026-09-15T09:00:00Z',
      },
      {
        id: 'notif-005',
        organizationId: orgId,
        userId: leaderUserId,
        title: 'Work Submitted for Review',
        message: 'Amit Sharma submitted "Frontend Authentication Guards & Protected Routes" for review.',
        type: 'WORK_SUBMITTED',
        link: '/leader/submissions',
        isRead: false,
        createdAt: '2026-09-29T17:31:00Z',
      }
    ];

    // 14. Seeded Audit Logs
    this.auditLogs = [
      {
        id: 'aud-001',
        organizationId: orgId,
        userId: 'b0000000-0000-0000-0000-000000000001',
        userName: 'Corporate Administrator',
        userRole: 'ADMIN',
        action: 'CREATED_EMPLOYEE',
        entity: 'EMPLOYEE',
        entityId: amitId,
        details: 'Onboarded staff member Amit Sharma (EMP-010)',
        previousValue: null,
        newValue: { fullName: 'Amit Sharma', email: 'amit@corporate.com', department: 'Engineering' },
        ipAddress: '192.168.1.10',
        createdAt: '2026-09-01T08:00:00Z',
      },
      {
        id: 'aud-002',
        organizationId: orgId,
        userId: 'b0000000-0000-0000-0000-000000000001',
        userName: 'Corporate Administrator',
        userRole: 'ADMIN',
        action: 'CREATED_TEAM',
        entity: 'TEAM',
        entityId: 'd0000000-0000-0000-0000-000000000001',
        details: 'Created Core Platform & Web Engineering team with Leader Marcus Sterling',
        previousValue: null,
        newValue: { name: 'Core Platform & Web Engineering', department: 'Engineering' },
        ipAddress: '192.168.1.10',
        createdAt: '2026-09-01T08:30:00Z',
      },
      {
        id: 'aud-003',
        organizationId: orgId,
        userId: leaderUserId,
        userName: 'Marcus Sterling',
        userRole: 'TEAM_LEADER',
        action: 'CREATED_TASK_PLAN',
        entity: 'PROJECT',
        entityId: p1Id,
        details: 'Generated complete task plan version 1 with 9 deliverables',
        previousValue: null,
        newValue: { version: 1, totalTasks: 9 },
        ipAddress: '192.168.1.45',
        createdAt: '2026-09-02T09:00:00Z',
      },
      {
        id: 'aud-004',
        organizationId: orgId,
        userId: leaderUserId,
        userName: 'Marcus Sterling',
        userRole: 'TEAM_LEADER',
        action: 'ASSIGNED_TASK',
        entity: 'TASK',
        entityId: '10000000-0000-0000-0000-000000000001',
        details: 'Assigned "Create Login Page & Auth Form UX" to Amit Sharma',
        previousValue: { assignedTo: null, status: 'UNASSIGNED' },
        newValue: { assignedTo: amitId, status: 'ASSIGNED' },
        ipAddress: '192.168.1.45',
        createdAt: '2026-09-30T03:00:00Z',
      },
      {
        id: 'aud-005',
        organizationId: orgId,
        userId: userAmitId,
        userName: 'Amit Sharma',
        userRole: 'EMPLOYEE',
        action: 'SUBMITTED_WORK',
        entity: 'TASK',
        entityId: '10000000-0000-0000-0000-000000000004',
        details: 'Submitted "Frontend Authentication Guards & Protected Routes" deliverable',
        previousValue: { status: 'IN_PROGRESS' },
        newValue: { status: 'SUBMITTED', completionMessage: 'Protected routes and RBAC guards implemented.' },
        ipAddress: '192.168.1.88',
        createdAt: '2026-09-29T17:30:00Z',
      },
      {
        id: 'aud-006',
        organizationId: orgId,
        userId: leaderUserId,
        userName: 'Marcus Sterling',
        userRole: 'TEAM_LEADER',
        action: 'REQUESTED_REVISION',
        entity: 'TASK',
        entityId: '10000000-0000-0000-0000-000000000005',
        details: 'Requested revision on "Mobile Navigation Drawer" with feedback: Layout improvements for mobile viewports.',
        previousValue: { status: 'SUBMITTED' },
        newValue: { status: 'REVISION_REQUIRED' },
        ipAddress: '192.168.1.45',
        createdAt: '2026-09-29T18:05:00Z',
      },
      {
        id: 'aud-007',
        organizationId: orgId,
        userId: leaderUserId,
        userName: 'Marcus Sterling',
        userRole: 'TEAM_LEADER',
        action: 'APPROVED_WORK',
        entity: 'TASK',
        entityId: '10000000-0000-0000-0000-000000000003',
        details: 'Approved work deliverable for "Swagger API Specification" as Completed',
        previousValue: { status: 'SUBMITTED' },
        newValue: { status: 'COMPLETED' },
        ipAddress: '192.168.1.45',
        createdAt: '2026-09-26T16:05:00Z',
      }
    ];

    // 15. Seeded Task Plan Version
    const p1Tasks = this.tasks.filter((t) => t.projectId === p1Id);
    this.taskPlanVersions = [
      {
        id: 'ver-001',
        organizationId: orgId,
        projectId: p1Id,
        versionNumber: 1,
        changedById: 'c0000000-0000-0000-0000-000000000002',
        changedByName: 'Marcus Sterling',
        totalTasks: p1Tasks.length,
        addedCount: p1Tasks.length,
        removedCount: 0,
        modifiedCount: 0,
        summary: 'Initial project task plan baseline uploaded from corporate template',
        snapshot: p1Tasks.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          priority: t.priority,
          assignedTo: t.assignedTo,
          status: t.status,
          dueDate: t.dueDate,
        })),
        createdAt: '2026-09-02T09:00:00Z',
      }
    ];

    this.logger.log(`Data seeded: ${this.users.length} users, ${this.employees.length} employees, ${this.teams.length} teams, ${this.projects.length} projects, ${this.tasks.length} tasks, ${this.courses.length} courses, ${this.announcements.length} announcements, ${this.auditLogs.length} audit logs`);
  }

  // ============================================================================
  // USER / AUTH REPOSITORY METHODS
  // ============================================================================

  async findUserByEmailOrEmpId(identifier: string): Promise<UserEntity | null> {
    const clean = identifier.trim().toLowerCase();
    const user = this.users.find(
      (u) => u.email.toLowerCase() === clean || u.employeeId.toLowerCase() === clean
    );
    return user ? { ...user } : null;
  }

  async findUserById(id: string): Promise<UserEntity | null> {
    const user = this.users.find((u) => u.id === id);
    return user ? { ...user } : null;
  }

  async createUser(data: Partial<UserEntity>): Promise<UserEntity> {
    const now = new Date().toISOString();
    const newUser: UserEntity = {
      id: data.id || uuidv4(),
      organizationId: data.organizationId || 'a0000000-0000-0000-0000-000000000001',
      email: data.email!,
      employeeId: data.employeeId!,
      passwordHash: data.passwordHash!,
      role: data.role || UserRole.EMPLOYEE,
      status: data.status || EntityStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };
    this.users.push(newUser);
    return { ...newUser };
  }

  async updateUser(id: string, updates: Partial<UserEntity>): Promise<UserEntity | null> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    this.users[index] = {
      ...this.users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return { ...this.users[index] };
  }

  async findUserByResetToken(token: string): Promise<UserEntity | null> {
    const clean = token.trim().toUpperCase();
    const user = this.users.find(
      (u) => u.resetToken && u.resetToken.toUpperCase() === clean
    );
    if (!user) return null;
    if (user.resetExpires && new Date(user.resetExpires).getTime() < Date.now()) {
      return null;
    }
    return { ...user };
  }

  // ============================================================================
  // EMPLOYEE REPOSITORY METHODS
  // ============================================================================

  async findEmployeesPaginated(params: PaginationParams): Promise<PaginatedResult<EmployeeEntity & { role?: UserRole; teamName?: string }>> {
    let list = [...this.employees];

    // Filter by type (EMPLOYEE / INTERN)
    if (params.type) {
      const typeClean = params.type.toUpperCase();
      list = list.filter((e) => e.employeeType === typeClean);
    }

    // Filter by department
    if (params.department && params.department !== 'ALL') {
      list = list.filter((e) => e.department.toLowerCase() === params.department!.toLowerCase());
    }

    // Filter by status
    if (params.status && params.status !== 'ALL') {
      list = list.filter((e) => e.status === params.status);
    }

    // Search by full name, email, employee ID
    if (params.search && params.search.trim()) {
      const term = params.search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.fullName.toLowerCase().includes(term) ||
          e.email.toLowerCase().includes(term) ||
          e.employeeId.toLowerCase().includes(term) ||
          e.designation.toLowerCase().includes(term)
      );
    }

    const total = list.length;
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const paginated = list.slice(offset, offset + limit);

    // Enrich with user role & team name
    const enriched = paginated.map((emp) => {
      const user = this.users.find((u) => u.id === emp.userId);
      const membership = this.teamMembers.find((tm) => tm.employeeId === emp.id && tm.status === EntityStatus.ACTIVE);
      const team = membership ? this.teams.find((t) => t.id === membership.teamId) : null;
      return {
        ...emp,
        role: user ? user.role : UserRole.EMPLOYEE,
        teamName: team ? team.name : undefined,
      };
    });

    return {
      data: enriched,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findEmployeeById(id: string): Promise<(EmployeeEntity & { role?: UserRole; team?: TeamEntity | null }) | null> {
    const emp = this.employees.find((e) => e.id === id);
    if (!emp) return null;

    const user = this.users.find((u) => u.id === emp.userId);
    const membership = this.teamMembers.find((tm) => tm.employeeId === emp.id && tm.status === EntityStatus.ACTIVE);
    const team = membership ? this.teams.find((t) => t.id === membership.teamId) : null;

    return {
      ...emp,
      role: user ? user.role : UserRole.EMPLOYEE,
      team: team || null,
    };
  }

  async findEmployeeByUserId(userId: string): Promise<EmployeeEntity | null> {
    const emp = this.employees.find((e) => e.userId === userId);
    return emp ? { ...emp } : null;
  }

  async createEmployee(data: {
    fullName: string;
    employeeId: string;
    email: string;
    phone?: string;
    department: string;
    designation: string;
    employeeType?: EmployeeType;
    joiningDate?: string;
    profilePhotoUrl?: string;
    password?: string;
    role?: UserRole;
    teamId?: string;
  }): Promise<EmployeeEntity> {
    const now = new Date().toISOString();
    const userId = uuidv4();
    const empId = uuidv4();
    const defaultPassword = data.password || 'Corporate@123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const userRole = data.role || (data.employeeType === EmployeeType.INTERN ? UserRole.INTERN : UserRole.EMPLOYEE);

    const newUser: UserEntity = {
      id: userId,
      organizationId: 'a0000000-0000-0000-0000-000000000001',
      email: data.email,
      employeeId: data.employeeId,
      passwordHash,
      role: userRole,
      status: EntityStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };
    this.users.push(newUser);

    const newEmp: EmployeeEntity = {
      id: empId,
      userId,
      organizationId: 'a0000000-0000-0000-0000-000000000001',
      fullName: data.fullName,
      employeeId: data.employeeId,
      email: data.email,
      phone: data.phone || '',
      department: data.department,
      designation: data.designation,
      employeeType: data.employeeType || EmployeeType.EMPLOYEE,
      joiningDate: data.joiningDate || new Date().toISOString().split('T')[0],
      profilePhotoUrl: data.profilePhotoUrl || '',
      status: EntityStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };
    this.employees.push(newEmp);

    if (data.teamId) {
      this.teamMembers.push({
        id: uuidv4(),
        teamId: data.teamId,
        employeeId: empId,
        roleInTeam: data.employeeType === EmployeeType.INTERN ? 'INTERN' : 'MEMBER',
        status: EntityStatus.ACTIVE,
        joinedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { ...newEmp };
  }

  async updateEmployee(id: string, updates: Partial<EmployeeEntity>): Promise<EmployeeEntity | null> {
    const index = this.employees.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const existing = this.employees[index];
    const updated: EmployeeEntity = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.employees[index] = updated;

    // Sync email and employeeId to User auth record if changed
    if (updates.email || updates.employeeId) {
      const uIndex = this.users.findIndex((u) => u.id === existing.userId);
      if (uIndex !== -1) {
        if (updates.email) this.users[uIndex].email = updates.email;
        if (updates.employeeId) this.users[uIndex].employeeId = updates.employeeId;
        this.users[uIndex].updatedAt = new Date().toISOString();
      }
    }

    return { ...updated };
  }

  async updateEmployeeStatus(id: string, status: EntityStatus): Promise<EmployeeEntity | null> {
    const emp = await this.updateEmployee(id, { status });
    if (emp) {
      const user = this.users.find((u) => u.id === emp.userId);
      if (user) {
        user.status = status;
        user.updatedAt = new Date().toISOString();
      }
    }
    return emp;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    const index = this.employees.findIndex((e) => e.id === id);
    if (index === -1) return false;
    const emp = this.employees[index];

    // Remove user account
    const uIndex = this.users.findIndex((u) => u.id === emp.userId);
    if (uIndex !== -1) this.users.splice(uIndex, 1);

    // Remove team memberships
    this.teamMembers = this.teamMembers.filter((tm) => tm.employeeId !== id);

    // Remove team leader reference if leading any team
    this.teams.forEach((t) => {
      if (t.leaderId === id) t.leaderId = null;
    });

    this.employees.splice(index, 1);
    return true;
  }

  // ============================================================================
  // TEAM LEADER METHODS
  // ============================================================================

  async findTeamLeadersPaginated(params: PaginationParams): Promise<PaginatedResult<any>> {
    // Find all users with role TEAM_LEADER
    const tlUsers = this.users.filter((u) => u.role === UserRole.TEAM_LEADER);
    const tlUserIds = new Set(tlUsers.map((u) => u.id));

    let list = this.employees.filter((e) => tlUserIds.has(e.userId));

    if (params.department && params.department !== 'ALL') {
      list = list.filter((e) => e.department.toLowerCase() === params.department!.toLowerCase());
    }

    if (params.status && params.status !== 'ALL') {
      list = list.filter((e) => e.status === params.status);
    }

    if (params.search && params.search.trim()) {
      const term = params.search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.fullName.toLowerCase().includes(term) ||
          e.email.toLowerCase().includes(term) ||
          e.employeeId.toLowerCase().includes(term)
      );
    }

    const total = list.length;
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const paginated = list.slice(offset, offset + limit);

    // Attach active assigned teams
    const enriched = paginated.map((tl) => {
      const assignedTeams = this.teams.filter((t) => t.leaderId === tl.id);
      return {
        ...tl,
        role: UserRole.TEAM_LEADER,
        assignedTeamsCount: assignedTeams.length,
        assignedTeams: assignedTeams.map((t) => ({ id: t.id, name: t.name, department: t.department })),
      };
    });

    return {
      data: enriched,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async createTeamLeader(data: {
    fullName: string;
    employeeId: string;
    email: string;
    phone?: string;
    department: string;
    designation?: string;
    profilePhotoUrl?: string;
    password?: string;
  }): Promise<any> {
    return this.createEmployee({
      fullName: data.fullName,
      employeeId: data.employeeId,
      email: data.email,
      phone: data.phone,
      department: data.department,
      designation: data.designation || 'Team Lead',
      employeeType: EmployeeType.EMPLOYEE,
      role: UserRole.TEAM_LEADER,
      profilePhotoUrl: data.profilePhotoUrl,
      password: data.password || 'Leader@123456',
    });
  }

  // ============================================================================
  // TEAM MANAGEMENT METHODS
  // ============================================================================

  async findTeamsPaginated(params: PaginationParams): Promise<PaginatedResult<any>> {
    let list = [...this.teams];

    if (params.department && params.department !== 'ALL') {
      list = list.filter((t) => t.department.toLowerCase() === params.department!.toLowerCase());
    }

    if (params.status && params.status !== 'ALL') {
      list = list.filter((t) => t.status === params.status);
    }

    if (params.search && params.search.trim()) {
      const term = params.search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(term) ||
          (t.description && t.description.toLowerCase().includes(term)) ||
          t.department.toLowerCase().includes(term)
      );
    }

    const total = list.length;
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const paginated = list.slice(offset, offset + limit);

    const enriched = paginated.map((team) => {
      const leader = team.leaderId ? this.employees.find((e) => e.id === team.leaderId) : null;
      const activeMemberships = this.teamMembers.filter(
        (tm) => tm.teamId === team.id && tm.status === EntityStatus.ACTIVE
      );
      const members = activeMemberships
        .map((tm) => {
          const emp = this.employees.find((e) => e.id === tm.employeeId);
          return emp ? { ...emp, roleInTeam: tm.roleInTeam } : null;
        })
        .filter(Boolean);

      return {
        ...team,
        leader: leader
          ? {
              id: leader.id,
              fullName: leader.fullName,
              email: leader.email,
              employeeId: leader.employeeId,
              profilePhotoUrl: leader.profilePhotoUrl,
            }
          : null,
        membersCount: members.length,
        members,
      };
    });

    return {
      data: enriched,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findTeamById(id: string): Promise<any | null> {
    const team = this.teams.find((t) => t.id === id);
    if (!team) return null;

    const leader = team.leaderId ? this.employees.find((e) => e.id === team.leaderId) : null;
    const memberships = this.teamMembers.filter((tm) => tm.teamId === team.id && tm.status === EntityStatus.ACTIVE);
    const members = memberships
      .map((tm) => {
        const emp = this.employees.find((e) => e.id === tm.employeeId);
        return emp ? { ...emp, roleInTeam: tm.roleInTeam } : null;
      })
      .filter(Boolean);

    const teamProjects = this.projects.filter((p) => p.teamId === team.id);

    return {
      ...team,
      leader: leader
        ? {
            id: leader.id,
            fullName: leader.fullName,
            email: leader.email,
            employeeId: leader.employeeId,
            profilePhotoUrl: leader.profilePhotoUrl,
          }
        : null,
      membersCount: members.length,
      members,
      projects: teamProjects,
    };
  }

  async createTeam(data: {
    name: string;
    department: string;
    leaderId?: string | null;
    description?: string;
    memberIds?: string[];
  }): Promise<TeamEntity> {
    const now = new Date().toISOString();
    const teamId = uuidv4();
    const newTeam: TeamEntity = {
      id: teamId,
      organizationId: 'a0000000-0000-0000-0000-000000000001',
      name: data.name,
      department: data.department,
      leaderId: data.leaderId || null,
      description: data.description || '',
      status: EntityStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };
    this.teams.push(newTeam);

    if (data.memberIds && Array.isArray(data.memberIds)) {
      data.memberIds.forEach((empId) => {
        const emp = this.employees.find((e) => e.id === empId);
        this.teamMembers.push({
          id: uuidv4(),
          teamId,
          employeeId: empId,
          roleInTeam: emp?.employeeType === EmployeeType.INTERN ? 'INTERN' : 'MEMBER',
          status: EntityStatus.ACTIVE,
          joinedAt: now,
          createdAt: now,
          updatedAt: now,
        });
      });
    }

    return { ...newTeam };
  }

  async updateTeam(id: string, updates: Partial<TeamEntity>): Promise<TeamEntity | null> {
    const index = this.teams.findIndex((t) => t.id === id);
    if (index === -1) return null;
    this.teams[index] = {
      ...this.teams[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return { ...this.teams[index] };
  }

  async deleteTeam(id: string): Promise<boolean> {
    const index = this.teams.findIndex((t) => t.id === id);
    if (index === -1) return false;
    this.teamMembers = this.teamMembers.filter((tm) => tm.teamId !== id);
    this.projects.forEach((p) => {
      if (p.teamId === id) p.teamId = null;
    });
    this.teams.splice(index, 1);
    return true;
  }

  async assignTeamLeader(teamId: string, leaderId: string | null): Promise<TeamEntity | null> {
    return this.updateTeam(teamId, { leaderId });
  }

  async addMemberToTeam(teamId: string, employeeId: string, roleInTeam = 'MEMBER'): Promise<boolean> {
    // Check if team and employee exist
    const team = this.teams.find((t) => t.id === teamId);
    const emp = this.employees.find((e) => e.id === employeeId);
    if (!team || !emp) return false;

    // Check if membership already exists
    const existing = this.teamMembers.find((tm) => tm.teamId === teamId && tm.employeeId === employeeId);
    if (existing) {
      existing.status = EntityStatus.ACTIVE;
      existing.updatedAt = new Date().toISOString();
      return true;
    }

    const now = new Date().toISOString();
    this.teamMembers.push({
      id: uuidv4(),
      teamId,
      employeeId,
      roleInTeam: emp.employeeType === EmployeeType.INTERN ? 'INTERN' : roleInTeam,
      status: EntityStatus.ACTIVE,
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return true;
  }

  async removeMemberFromTeam(teamId: string, employeeId: string): Promise<boolean> {
    const index = this.teamMembers.findIndex((tm) => tm.teamId === teamId && tm.employeeId === employeeId);
    if (index === -1) return false;
    this.teamMembers.splice(index, 1);
    return true;
  }

  // ============================================================================
  // PROJECT MANAGEMENT & PROGRESS METHODS
  // ============================================================================

  async findProjectsPaginated(params: PaginationParams, currentUserId?: string, currentUserRole?: string): Promise<PaginatedResult<any>> {
    let list = [...this.projects];

    // Team Leader access control: if user is TL, filter by assigned leader projects or team leader
    if (currentUserRole === UserRole.TEAM_LEADER && currentUserId) {
      const currentEmployee = this.employees.find((e) => e.userId === currentUserId);
      if (currentEmployee) {
        // Teams led by this leader
        const ledTeams = this.teams.filter((t) => t.leaderId === currentEmployee.id).map((t) => t.id);
        list = list.filter((p) => p.leaderId === currentEmployee.id || (p.teamId && ledTeams.includes(p.teamId)));
      }
    }

    if (params.status && params.status !== 'ALL') {
      list = list.filter((p) => p.status === params.status);
    }

    if (params.priority && params.priority !== 'ALL') {
      list = list.filter((p) => p.priority === params.priority);
    }

    if (params.department && params.department !== 'ALL') {
      list = list.filter((p) => p.department && p.department.toLowerCase() === params.department!.toLowerCase());
    }

    if (params.teamId && params.teamId !== 'ALL') {
      list = list.filter((p) => p.teamId === params.teamId);
    }

    if (params.leaderId && params.leaderId !== 'ALL') {
      list = list.filter((p) => p.leaderId === params.leaderId);
    }

    if (params.search && params.search.trim()) {
      const term = params.search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.code.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term))
      );
    }

    const total = list.length;
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const paginated = list.slice(offset, offset + limit);

    // Enrich projects with real-time task progress metrics, team info, and leader info
    const enriched = paginated.map((p) => {
      const team = p.teamId ? this.teams.find((t) => t.id === p.teamId) : null;
      const leader = p.leaderId
        ? this.employees.find((e) => e.id === p.leaderId)
        : team?.leaderId
        ? this.employees.find((e) => e.id === team.leaderId)
        : null;

      const projectTasks = this.tasks.filter((t) => t.projectId === p.id);
      const totalTasks = projectTasks.length;
      const completedTasks = projectTasks.filter((t) => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.APPROVED).length;
      const unassignedTasks = projectTasks.filter((t) => t.status === TaskStatus.UNASSIGNED || !t.assignedTo).length;
      const inProgressTasks = projectTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...p,
        teamName: team ? team.name : 'Unassigned',
        department: p.department || team?.department || 'General',
        leaderName: leader ? leader.fullName : 'Unassigned',
        leader: leader
          ? { id: leader.id, fullName: leader.fullName, email: leader.email, profilePhotoUrl: leader.profilePhotoUrl }
          : null,
        team: team
          ? { id: team.id, name: team.name, department: team.department }
          : null,
        progress,
        totalTasks,
        completedTasks,
        unassignedTasks,
        inProgressTasks,
      };
    });

    return {
      data: enriched,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findProjectById(id: string): Promise<any | null> {
    const project = this.projects.find((p) => p.id === id);
    if (!project) return null;

    const team = project.teamId ? this.teams.find((t) => t.id === project.teamId) : null;
    const leader = project.leaderId
      ? this.employees.find((e) => e.id === project.leaderId)
      : team?.leaderId
      ? this.employees.find((e) => e.id === team.leaderId)
      : null;

    const projectTasks = this.tasks
      .filter((t) => t.projectId === project.id)
      .sort((a, b) => a.orderIndex - b.orderIndex);

    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter((t) => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.APPROVED).length;
    const unassignedTasks = projectTasks.filter((t) => t.status === TaskStatus.UNASSIGNED || !t.assignedTo).length;
    const inProgressTasks = projectTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      ...project,
      teamName: team ? team.name : 'Unassigned',
      department: project.department || team?.department || 'General',
      leaderName: leader ? leader.fullName : 'Unassigned',
      leader: leader
        ? { id: leader.id, fullName: leader.fullName, email: leader.email, profilePhotoUrl: leader.profilePhotoUrl }
        : null,
      team: team
        ? { id: team.id, name: team.name, department: team.department }
        : null,
      progress,
      totalTasks,
      completedTasks,
      unassignedTasks,
      inProgressTasks,
    };
  }

  async createProject(data: {
    name: string;
    code?: string;
    description?: string;
    department?: string;
    teamId?: string | null;
    leaderId?: string | null;
    startDate?: string;
    targetDate?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status?: 'NOT_STARTED' | 'ACTIVE' | 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
    templateId?: string;
  }): Promise<ProjectEntity> {
    const now = new Date().toISOString();
    const projectId = uuidv4();
    const autoCode = data.code || `PRJ-${data.name.substring(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newProject: ProjectEntity = {
      id: projectId,
      organizationId: 'a0000000-0000-0000-0000-000000000001',
      name: data.name,
      code: autoCode,
      description: data.description || '',
      department: data.department || 'Engineering',
      teamId: data.teamId || null,
      leaderId: data.leaderId || null,
      status: (data.status as any) || 'ACTIVE',
      priority: data.priority || 'MEDIUM',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      targetDate: data.targetDate || '',
      createdAt: now,
      updatedAt: now,
    };

    this.projects.push(newProject);

    // If templateId provided, clone template tasks into this project
    if (data.templateId) {
      const template = this.taskTemplates.find((t) => t.id === data.templateId);
      if (template && template.tasks) {
        template.tasks.forEach((t, idx) => {
          this.tasks.push({
            id: uuidv4(),
            organizationId: 'a0000000-0000-0000-0000-000000000001',
            projectId: newProject.id,
            title: t.title,
            description: t.description || '',
            priority: (t.priority as any) || 'NORMAL',
            startDate: newProject.startDate,
            dueDate: newProject.targetDate,
            assignedTo: null,
            status: TaskStatus.UNASSIGNED,
            orderIndex: t.orderIndex || idx + 1,
            isTodayWork: false,
            dailyWorkDate: null,
            assignmentHistory: [],
            createdAt: now,
            updatedAt: now,
          });
        });
      }
    }

    return { ...newProject };
  }

  async updateProject(id: string, updates: Partial<ProjectEntity>): Promise<ProjectEntity | null> {
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) return null;

    this.projects[index] = {
      ...this.projects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return { ...this.projects[index] };
  }

  async archiveProject(id: string): Promise<ProjectEntity | null> {
    return this.updateProject(id, { status: 'ARCHIVED' });
  }

  async deleteProject(id: string): Promise<boolean> {
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) return false;

    // Delete associated tasks
    this.tasks = this.tasks.filter((t) => t.projectId !== id);
    this.projects.splice(index, 1);
    return true;
  }

  // ============================================================================
  // TASK MANAGEMENT & TASK PLAN METHODS
  // ============================================================================

  async findTasksPaginated(params: PaginationParams): Promise<PaginatedResult<any>> {
    let list = [...this.tasks];

    if (params.projectId && params.projectId !== 'ALL') {
      list = list.filter((t) => t.projectId === params.projectId);
    }

    if (params.status && params.status !== 'ALL') {
      list = list.filter((t) => t.status === params.status);
    }

    if (params.priority && params.priority !== 'ALL') {
      list = list.filter((t) => t.priority === params.priority);
    }

    if (params.assignedTo) {
      list = list.filter((t) => t.assignedTo === params.assignedTo);
    }

    if (params.unassignedOnly === true || params.unassignedOnly === 'true') {
      list = list.filter((t) => t.status === TaskStatus.UNASSIGNED || !t.assignedTo);
    }

    if (params.todayWorkOnly === true || params.todayWorkOnly === 'true') {
      list = list.filter((t) => t.isTodayWork === true);
    }

    if (params.search && params.search.trim()) {
      const term = params.search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          (t.description && t.description.toLowerCase().includes(term))
      );
    }

    // Default sorting by orderIndex
    list.sort((a, b) => a.orderIndex - b.orderIndex);

    const total = list.length;
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 20);
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const paginated = list.slice(offset, offset + limit);

    // Enrich tasks with assignee employee details & project info & dependsOnTask details
    const enriched = paginated.map((t) => {
      const assignedEmp = t.assignedTo ? this.employees.find((e) => e.id === t.assignedTo) : null;
      const project = this.projects.find((p) => p.id === t.projectId);
      const dependsOn = t.dependsOnTaskId ? this.tasks.find((ot) => ot.id === t.dependsOnTaskId) : null;

      return {
        ...t,
        projectName: project ? project.name : 'Unknown Project',
        projectCode: project ? project.code : '',
        assignedEmployee: assignedEmp
          ? {
              id: assignedEmp.id,
              fullName: assignedEmp.fullName,
              employeeId: assignedEmp.employeeId,
              email: assignedEmp.email,
              designation: assignedEmp.designation,
              employeeType: assignedEmp.employeeType,
              profilePhotoUrl: assignedEmp.profilePhotoUrl,
            }
          : null,
        dependsOnTask: dependsOn
          ? { id: dependsOn.id, title: dependsOn.title, status: dependsOn.status }
          : null,
      };
    });

    return {
      data: enriched,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findTaskById(id: string): Promise<any | null> {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return null;

    const assignedEmp = task.assignedTo ? this.employees.find((e) => e.id === task.assignedTo) : null;
    const project = this.projects.find((p) => p.id === task.projectId);
    const dependsOn = task.dependsOnTaskId ? this.tasks.find((ot) => ot.id === task.dependsOnTaskId) : null;

    return {
      ...task,
      projectName: project ? project.name : 'Unknown Project',
      projectCode: project ? project.code : '',
      assignedEmployee: assignedEmp
        ? {
            id: assignedEmp.id,
            fullName: assignedEmp.fullName,
            employeeId: assignedEmp.employeeId,
            email: assignedEmp.email,
            designation: assignedEmp.designation,
            employeeType: assignedEmp.employeeType,
            profilePhotoUrl: assignedEmp.profilePhotoUrl,
          }
        : null,
      dependsOnTask: dependsOn
        ? { id: dependsOn.id, title: dependsOn.title, status: dependsOn.status }
        : null,
    };
  }

  async createTask(data: Partial<TaskEntity>): Promise<TaskEntity> {
    const now = new Date().toISOString();
    const taskId = data.id || uuidv4();
    const assigned = !!data.assignedTo;

    const newTask: TaskEntity = {
      id: taskId,
      organizationId: data.organizationId || 'a0000000-0000-0000-0000-000000000001',
      projectId: data.projectId!,
      title: data.title!,
      description: data.description || '',
      priority: data.priority || 'NORMAL',
      startDate: data.startDate || '',
      dueDate: data.dueDate || '',
      assignedTo: data.assignedTo || null,
      status: data.status || (assigned ? TaskStatus.ASSIGNED : TaskStatus.UNASSIGNED),
      orderIndex: data.orderIndex !== undefined ? data.orderIndex : this.tasks.filter((t) => t.projectId === data.projectId).length + 1,
      dependsOnTaskId: data.dependsOnTaskId || null,
      isTodayWork: data.isTodayWork || false,
      dailyWorkDate: data.dailyWorkDate || null,
      assignmentHistory: data.assignmentHistory || [],
      createdAt: now,
      updatedAt: now,
    };

    if (assigned && data.assignedTo) {
      const emp = this.employees.find((e) => e.id === data.assignedTo);
      newTask.assignmentHistory.push({
        id: uuidv4(),
        fromEmployeeId: null,
        toEmployeeId: data.assignedTo,
        fromEmployeeName: 'Unassigned',
        toEmployeeName: emp ? emp.fullName : 'Employee',
        changedBy: 'SYSTEM',
        changedByName: 'Creator',
        reason: 'Initial assignment upon task creation',
        timestamp: now,
      });
    }

    this.tasks.push(newTask);
    return { ...newTask };
  }

  // Complete Project Task Plan: creates or replaces multiple tasks in one atomic operation
  async bulkCreateTaskPlan(projectId: string, tasksData: Array<{
    id?: string;
    title: string;
    description?: string;
    priority?: 'LOW' | 'NORMAL' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    startDate?: string;
    dueDate?: string;
    assignedTo?: string | null;
    status?: TaskStatus;
    orderIndex?: number;
    dependsOnTaskId?: string | null;
  }>, currentUserId?: string): Promise<{ count: number; tasks: TaskEntity[] }> {
    const now = new Date().toISOString();
    const currentUser = currentUserId ? this.users.find((u) => u.id === currentUserId) : null;
    const currentEmp = currentUser ? this.employees.find((e) => e.userId === currentUser.id) : null;
    const actorName = currentEmp ? currentEmp.fullName : 'Team Leader';

    const createdTasks: TaskEntity[] = [];

    tasksData.forEach((item, idx) => {
      const taskId = item.id || uuidv4();
      const assigned = !!item.assignedTo;
      const emp = assigned ? this.employees.find((e) => e.id === item.assignedTo) : null;

      const history = [];
      if (assigned && item.assignedTo) {
        history.push({
          id: uuidv4(),
          fromEmployeeId: null,
          toEmployeeId: item.assignedTo,
          fromEmployeeName: 'Unassigned',
          toEmployeeName: emp ? emp.fullName : 'Employee',
          changedBy: currentUserId || 'SYSTEM',
          changedByName: actorName,
          reason: 'Assigned during Task Plan bulk creation',
          timestamp: now,
        });
      }

      const newTask: TaskEntity = {
        id: taskId,
        organizationId: 'a0000000-0000-0000-0000-000000000001',
        projectId,
        title: item.title,
        description: item.description || '',
        priority: (item.priority as any) || 'NORMAL',
        startDate: item.startDate || '',
        dueDate: item.dueDate || '',
        assignedTo: item.assignedTo || null,
        status: item.status || (assigned ? TaskStatus.ASSIGNED : TaskStatus.UNASSIGNED),
        orderIndex: item.orderIndex !== undefined ? item.orderIndex : idx + 1,
        dependsOnTaskId: item.dependsOnTaskId || null,
        isTodayWork: false,
        dailyWorkDate: null,
        assignmentHistory: history,
        createdAt: now,
        updatedAt: now,
      };

      this.tasks.push(newTask);
      createdTasks.push(newTask);
    });

    return { count: createdTasks.length, tasks: createdTasks };
  }

  // Bulk Upload (CSV/XLSX parsed rows validation and ingestion)
  async bulkUploadTasks(projectId: string, rows: Array<{
    task: string;
    description?: string;
    priority?: string;
    dueDate?: string;
    startDate?: string;
    assignedEmployeeEmailOrId?: string;
  }>, currentUserId?: string): Promise<{ successCount: number; errors: string[]; createdTasks: TaskEntity[] }> {
    const errors: string[] = [];
    const validRowsToInsert: Array<any> = [];

    rows.forEach((row, index) => {
      const rowNum = index + 1;
      if (!row.task || !row.task.trim()) {
        errors.push(`Row ${rowNum}: Task title is required.`);
        return;
      }

      let assignedToId: string | null = null;
      if (row.assignedEmployeeEmailOrId && row.assignedEmployeeEmailOrId.trim()) {
        const query = row.assignedEmployeeEmailOrId.trim().toLowerCase();
        const emp = this.employees.find(
          (e) => e.email.toLowerCase() === query || e.employeeId.toLowerCase() === query || e.fullName.toLowerCase() === query
        );
        if (emp) {
          assignedToId = emp.id;
        } else {
          // Warning but allow unassigned fallback
          errors.push(`Row ${rowNum}: Assignee '${row.assignedEmployeeEmailOrId}' not found. Left as Unassigned.`);
        }
      }

      let priority: any = 'NORMAL';
      if (row.priority) {
        const pUpper = row.priority.trim().toUpperCase();
        if (['LOW', 'NORMAL', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(pUpper)) {
          priority = pUpper;
        }
      }

      validRowsToInsert.push({
        title: row.task.trim(),
        description: row.description ? row.description.trim() : '',
        priority,
        startDate: row.startDate || '',
        dueDate: row.dueDate || '',
        assignedTo: assignedToId,
      });
    });

    const res = await this.bulkCreateTaskPlan(projectId, validRowsToInsert, currentUserId);
    return {
      successCount: res.count,
      errors,
      createdTasks: res.tasks,
    };
  }

  // Single Task Assignment
  async assignTask(taskId: string, assignedToId: string, dueDate?: string, currentUserId?: string, reason?: string): Promise<TaskEntity | null> {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return null;

    const newEmp = this.employees.find((e) => e.id === assignedToId);
    if (!newEmp) return null;

    const now = new Date().toISOString();
    const currentUser = currentUserId ? this.users.find((u) => u.id === currentUserId) : null;
    const currentEmp = currentUser ? this.employees.find((e) => e.userId === currentUser.id) : null;
    const actorName = currentEmp ? currentEmp.fullName : 'Team Leader';

    const oldEmpId = task.assignedTo;
    const oldEmp = oldEmpId ? this.employees.find((e) => e.id === oldEmpId) : null;

    task.assignedTo = assignedToId;
    if (dueDate) task.dueDate = dueDate;
    if (task.status === TaskStatus.UNASSIGNED) {
      task.status = TaskStatus.ASSIGNED;
    }
    task.updatedAt = now;

    task.assignmentHistory.push({
      id: uuidv4(),
      fromEmployeeId: oldEmpId || null,
      toEmployeeId: assignedToId,
      fromEmployeeName: oldEmp ? oldEmp.fullName : 'Unassigned',
      toEmployeeName: newEmp.fullName,
      changedBy: currentUserId || 'SYSTEM',
      changedByName: actorName,
      reason: reason || 'Task assigned by Team Leader',
      timestamp: now,
    });

    return { ...task };
  }

  // Task Reassignment with optional reason & history tracking
  async reassignTask(taskId: string, newEmployeeId: string, reason?: string, currentUserId?: string): Promise<TaskEntity | null> {
    return this.assignTask(taskId, newEmployeeId, undefined, currentUserId, reason || 'Reassigned to new team member');
  }

  // Bulk Task Assignment (one atomic operation)
  async bulkAssignTasks(taskIds: string[], employeeId: string, dueDate?: string, currentUserId?: string): Promise<{ successCount: number; updatedTasks: TaskEntity[] }> {
    const emp = this.employees.find((e) => e.id === employeeId);
    if (!emp) return { successCount: 0, updatedTasks: [] };

    const updatedTasks: TaskEntity[] = [];

    for (const taskId of taskIds) {
      const updated = await this.assignTask(taskId, employeeId, dueDate, currentUserId, 'Bulk assigned by Team Leader');
      if (updated) {
        updatedTasks.push(updated);
      }
    }

    return { successCount: updatedTasks.length, updatedTasks };
  }

  // Daily Work Dispatching
  async setDailyWork(taskId: string, isTodayWork: boolean, dailyWorkDate?: string): Promise<TaskEntity | null> {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return null;

    task.isTodayWork = isTodayWork;
    task.dailyWorkDate = isTodayWork ? (dailyWorkDate || new Date().toISOString().split('T')[0]) : null;
    task.updatedAt = new Date().toISOString();
    return { ...task };
  }

  async bulkSetDailyWork(taskIds: string[], isTodayWork: boolean): Promise<{ successCount: number }> {
    const today = new Date().toISOString().split('T')[0];
    let count = 0;

    taskIds.forEach((id) => {
      const task = this.tasks.find((t) => t.id === id);
      if (task) {
        task.isTodayWork = isTodayWork;
        task.dailyWorkDate = isTodayWork ? today : null;
        task.updatedAt = new Date().toISOString();
        count++;
      }
    });

    return { successCount: count };
  }

  // Task status transition
  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<TaskEntity | null> {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return null;

    task.status = status;
    task.updatedAt = new Date().toISOString();
    return { ...task };
  }

  async updateTask(id: string, updates: Partial<TaskEntity>): Promise<TaskEntity | null> {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;

    this.tasks[index] = {
      ...this.tasks[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return { ...this.tasks[index] };
  }

  async deleteTask(id: string): Promise<boolean> {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return false;
    this.tasks.splice(index, 1);
    return true;
  }

  async bulkDeleteTasks(taskIds: string[]): Promise<number> {
    const initial = this.tasks.length;
    this.tasks = this.tasks.filter((t) => !taskIds.includes(t.id));
    return initial - this.tasks.length;
  }

  // ============================================================================
  // TASK TEMPLATES METHODS
  // ============================================================================

  async findAllTaskTemplates(): Promise<TaskTemplateEntity[]> {
    return [...this.taskTemplates];
  }

  async findTaskTemplateById(id: string): Promise<TaskTemplateEntity | null> {
    const t = this.taskTemplates.find((item) => item.id === id);
    return t ? { ...t } : null;
  }

  async createTaskTemplate(data: {
    name: string;
    description?: string;
    department?: string;
    tasks: Array<{
      title: string;
      description?: string;
      priority: 'LOW' | 'NORMAL' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      orderIndex: number;
      defaultEstimatedDays?: number;
      dependsOnIndex?: number | null;
    }>;
    createdById?: string;
  }): Promise<TaskTemplateEntity> {
    const now = new Date().toISOString();
    const template: TaskTemplateEntity = {
      id: uuidv4(),
      organizationId: 'a0000000-0000-0000-0000-000000000001',
      name: data.name,
      description: data.description || '',
      department: data.department || 'Engineering',
      tasks: data.tasks || [],
      createdById: data.createdById,
      createdAt: now,
      updatedAt: now,
    };
    this.taskTemplates.push(template);
    return { ...template };
  }

  async updateTaskTemplate(id: string, updates: Partial<TaskTemplateEntity>): Promise<TaskTemplateEntity | null> {
    const index = this.taskTemplates.findIndex((t) => t.id === id);
    if (index === -1) return null;

    this.taskTemplates[index] = {
      ...this.taskTemplates[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return { ...this.taskTemplates[index] };
  }

  async deleteTaskTemplate(id: string): Promise<boolean> {
    const index = this.taskTemplates.findIndex((t) => t.id === id);
    if (index === -1) return false;
    this.taskTemplates.splice(index, 1);
    return true;
  }

  // ============================================================================
  // DASHBOARDS (ADMIN & TEAM LEADER METRICS)
  // ============================================================================

  async getLeaderDashboardOverview(userId: string): Promise<{
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
    todayWork: Array<any>;
    unassignedTasks: Array<any>;
    teamMembers: Array<any>;
  }> {
    const currentEmp = this.employees.find((e) => e.userId === userId);
    const ledTeams = currentEmp ? this.teams.filter((t) => t.leaderId === currentEmp.id).map((t) => t.id) : [];

    // Projects relevant to this TL
    const leaderProjects = this.projects.filter(
      (p) => (currentEmp && p.leaderId === currentEmp.id) || (p.teamId && ledTeams.includes(p.teamId))
    );

    const projectIds = leaderProjects.map((p) => p.id);
    const relevantTasks = this.tasks.filter((t) => projectIds.includes(t.projectId));

    const totalTasksCount = relevantTasks.length;
    const completedTasksCount = relevantTasks.filter((t) => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.APPROVED).length;
    const overallProgress = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

    const unassignedTasks = relevantTasks.filter((t) => t.status === TaskStatus.UNASSIGNED || !t.assignedTo);
    const todayWork = relevantTasks.filter((t) => t.isTodayWork === true);

    const nowIso = new Date().toISOString().split('T')[0];
    const overdueWork = relevantTasks.filter(
      (t) => t.dueDate && t.dueDate < nowIso && t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.APPROVED
    );

    const pendingReviews = relevantTasks.filter(
      (t) => t.status === TaskStatus.SUBMITTED || t.status === TaskStatus.UNDER_REVIEW
    );

    const projectsEnriched = leaderProjects.map((p) => {
      const pTasks = relevantTasks.filter((t) => t.projectId === p.id);
      const pTotal = pTasks.length;
      const pCompleted = pTasks.filter((t) => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.APPROVED).length;
      const pUnassigned = pTasks.filter((t) => t.status === TaskStatus.UNASSIGNED || !t.assignedTo).length;
      const pProg = pTotal > 0 ? Math.round((pCompleted / pTotal) * 100) : 0;

      return {
        id: p.id,
        name: p.name,
        code: p.code,
        progress: pProg,
        status: p.status,
        priority: p.priority,
        totalTasks: pTotal,
        completedTasks: pCompleted,
        unassignedTasks: pUnassigned,
      };
    });

    // Enriched today work list with employee name
    const enrichedTodayWork = todayWork.map((t) => {
      const emp = t.assignedTo ? this.employees.find((e) => e.id === t.assignedTo) : null;
      const proj = this.projects.find((p) => p.id === t.projectId);
      return {
        ...t,
        projectName: proj?.name,
        assignedEmployee: emp
          ? { id: emp.id, fullName: emp.fullName, profilePhotoUrl: emp.profilePhotoUrl, designation: emp.designation }
          : null,
      };
    });

    // Team members under this TL
    const memberIds = new Set(
      this.teamMembers.filter((tm) => ledTeams.includes(tm.teamId)).map((tm) => tm.employeeId)
    );
    const teamMembers = this.employees
      .filter((e) => memberIds.has(e.id))
      .map((e) => {
        const empTasks = relevantTasks.filter((t) => t.assignedTo === e.id);
        const activeCount = empTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS || t.status === TaskStatus.ASSIGNED).length;
        const todayCount = empTasks.filter((t) => t.isTodayWork).length;
        return {
          id: e.id,
          fullName: e.fullName,
          employeeId: e.employeeId,
          designation: e.designation,
          employeeType: e.employeeType,
          profilePhotoUrl: e.profilePhotoUrl,
          activeTasksCount: activeCount,
          todayTasksCount: todayCount,
        };
      });

    return {
      cards: {
        myProjectsCount: leaderProjects.length,
        overallProgress,
        unassignedTasksCount: unassignedTasks.length,
        todayWorkCount: todayWork.length,
        overdueWorkCount: overdueWork.length,
        pendingReviewsCount: pendingReviews.length,
      },
      myProjects: projectsEnriched,
      todayWork: enrichedTodayWork,
      unassignedTasks: unassignedTasks.slice(0, 10).map((t) => {
        const proj = this.projects.find((p) => p.id === t.projectId);
        return { ...t, projectName: proj?.name };
      }),
      teamMembers,
    };
  }

  async getDashboardOverview(): Promise<{
    cards: {
      totalEmployees: number;
      totalInterns: number;
      totalTeamLeaders: number;
      totalTeams: number;
      activeProjects: number;
      activeEmployees: number;
    };
    departmentDistribution: Array<{ department: string; count: number; percentage: number }>;
    projectProgress: Array<{ id: string; name: string; code: string; progress: number; status: string; priority: string }>;
    workCompletionRate: {
      rate: number;
      completedTasks: number;
      totalTasks: number;
    };
    recentActivities: Array<{ id: string; user: string; action: string; time: string; type: string }>;
  }> {
    const totalEmployees = this.employees.filter((e) => e.employeeType === EmployeeType.EMPLOYEE).length;
    const totalInterns = this.employees.filter((e) => e.employeeType === EmployeeType.INTERN).length;
    const totalTeamLeaders = this.users.filter((u) => u.role === UserRole.TEAM_LEADER).length;
    const totalTeams = this.teams.filter((t) => t.status === EntityStatus.ACTIVE).length;
    const activeProjects = this.projects.filter((p) => p.status === 'ACTIVE' || p.status === 'IN_PROGRESS').length;
    const activeEmployees = this.employees.filter((e) => e.status === EntityStatus.ACTIVE).length;

    // Calculate department distribution
    const deptMap: Record<string, number> = {};
    this.employees.forEach((e) => {
      deptMap[e.department] = (deptMap[e.department] || 0) + 1;
    });

    const totalStaff = this.employees.length || 1;
    const departmentDistribution = Object.entries(deptMap).map(([department, count]) => ({
      department,
      count,
      percentage: Math.round((count / totalStaff) * 100),
    }));

    const projectProgress = this.projects.map((p) => {
      const pTasks = this.tasks.filter((t) => t.projectId === p.id);
      const total = pTasks.length;
      const completed = pTasks.filter((t) => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.APPROVED).length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        id: p.id,
        name: p.name,
        code: p.code,
        progress,
        status: p.status,
        priority: p.priority,
      };
    });

    const totalAllTasks = this.tasks.length || 1;
    const completedAllTasks = this.tasks.filter((t) => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.APPROVED).length;

    const recentActivities = [
      { id: '1', user: 'Alexander Vance (Admin)', action: 'Created project task plan for Enterprise Portal 2.0', time: '10 mins ago', type: 'PROJECT' },
      { id: '2', user: 'Marcus Sterling (Lead)', action: 'Dispatched 3 tasks to Today\'s Work workstation', time: '25 mins ago', type: 'WORK' },
      { id: '3', user: 'Sarah Jenkins (Lead)', action: 'Assigned Design Token System to Elena Rostova', time: '1 hour ago', type: 'ASSIGNMENT' },
      { id: '4', user: 'Jonathan Reed (Dev)', action: 'Completed Task: Requirement Analysis & Signoff', time: '2 hours ago', type: 'WORK' },
      { id: '5', user: 'Aiden Clark (Intern)', action: 'Started work on Task Plan Builder Engine', time: '3 hours ago', type: 'WORK' },
    ];

    return {
      cards: {
        totalEmployees,
        totalInterns,
        totalTeamLeaders,
        totalTeams,
        activeProjects,
        activeEmployees,
      },
      departmentDistribution,
      projectProgress,
      workCompletionRate: {
        rate: Math.round((completedAllTasks / totalAllTasks) * 100),
        completedTasks: completedAllTasks,
        totalTasks: totalAllTasks,
      },
      recentActivities,
    };
  }

  // ============================================================================
  // PART 3: TASK WORKFLOW (START, SUBMIT, REVIEW, REVISION)
  // ============================================================================

  async startTaskWork(taskId: string, currentUserId: string): Promise<TaskEntity | null> {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return null;

    task.status = TaskStatus.IN_PROGRESS;
    task.updatedAt = new Date().toISOString();
    return { ...task };
  }

  async submitTaskWork(
    taskId: string,
    data: { completionMessage: string; attachmentUrl?: string; attachmentName?: string; comment?: string },
    currentUserId: string
  ): Promise<TaskEntity | null> {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return null;

    const now = new Date().toISOString();
    task.status = TaskStatus.SUBMITTED;
    task.submissionMessage = data.completionMessage;
    task.submissionAttachmentUrl = data.attachmentUrl;
    task.submissionAttachmentName = data.attachmentName;
    task.submissionComment = data.comment;
    task.submittedAt = now;
    task.updatedAt = now;

    // Find submitter employee name
    const submitter = this.employees.find((e) => e.userId === currentUserId || e.id === task.assignedTo);
    const submitterName = submitter?.fullName || 'Employee';

    // Notify Project / Team Leader
    const project = this.projects.find((p) => p.id === task.projectId);
    const leaderEmployee = project?.leaderId ? this.employees.find((e) => e.id === project.leaderId) : null;
    const leaderUserId = leaderEmployee?.userId || 'b0000000-0000-0000-0000-000000000002'; // Default to Marcus Sterling

    this.notifications.unshift({
      id: uuidv4(),
      organizationId: task.organizationId,
      userId: leaderUserId,
      title: 'Work Submitted for Review',
      message: `${submitterName} submitted "${task.title}" for review.`,
      type: 'WORK_SUBMITTED',
      link: '/leader/submissions',
      isRead: false,
      createdAt: now,
    });

    return { ...task };
  }

  async reviewTaskSubmission(
    taskId: string,
    data: { decision: 'APPROVE' | 'REVISION_REQUIRED'; feedback?: string },
    reviewerUserId: string
  ): Promise<TaskEntity | null> {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return null;

    const now = new Date().toISOString();
    task.reviewedAt = now;
    task.reviewedBy = reviewerUserId;

    const assignedEmp = task.assignedTo ? this.employees.find((e) => e.id === task.assignedTo) : null;
    const empUserId = assignedEmp?.userId;

    if (data.decision === 'APPROVE') {
      task.status = TaskStatus.COMPLETED;
      task.reviewFeedback = data.feedback || 'Work approved. Great job!';
      task.updatedAt = now;

      if (empUserId) {
        this.notifications.unshift({
          id: uuidv4(),
          organizationId: task.organizationId,
          userId: empUserId,
          title: 'Work Approved 🎉',
          message: `Your deliverable for "${task.title}" has been approved!`,
          type: 'WORK_APPROVED',
          link: '/employee/work-history',
          isRead: false,
          createdAt: now,
        });
      }
    } else {
      task.status = TaskStatus.REVISION_REQUIRED;
      task.reviewFeedback = data.feedback || 'Please address feedback and submit again.';
      task.updatedAt = now;

      if (empUserId) {
        this.notifications.unshift({
          id: uuidv4(),
          organizationId: task.organizationId,
          userId: empUserId,
          title: 'Revision Requested ⚠️',
          message: `Revision requested on "${task.title}": ${data.feedback || 'Please update and resubmit.'}`,
          type: 'REVISION_REQUESTED',
          link: '/employee/work-history',
          isRead: false,
          createdAt: now,
        });
      }
    }

    return { ...task };
  }

  async findPendingReviewTasks(
    leaderUserId?: string,
    params: PaginationParams = {}
  ): Promise<PaginatedResult<TaskEntity & { assignedEmployee?: EmployeeEntity | null; project?: ProjectEntity | null }>> {
    let list = this.tasks.filter(
      (t) =>
        t.status === TaskStatus.SUBMITTED ||
        t.status === TaskStatus.UNDER_REVIEW ||
        t.status === TaskStatus.REVISION_REQUIRED
    );

    if (leaderUserId) {
      const leaderEmp = this.employees.find((e) => e.userId === leaderUserId);
      if (leaderEmp) {
        const leaderProjIds = this.projects.filter((p) => p.leaderId === leaderEmp.id).map((p) => p.id);
        list = list.filter((t) => leaderProjIds.includes(t.projectId));
      }
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)));
    }

    if (params.status) {
      list = list.filter((t) => t.status === params.status);
    }

    const total = list.length;
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const offset = (page - 1) * limit;

    const enriched = list.slice(offset, offset + limit).map((t) => {
      const assignedEmployee = t.assignedTo ? this.employees.find((e) => e.id === t.assignedTo) || null : null;
      const project = this.projects.find((p) => p.id === t.projectId) || null;
      return {
        ...t,
        assignedEmployee,
        project,
      };
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: enriched,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findEmployeeTasksPaginated(
    employeeId: string,
    params: PaginationParams = {}
  ): Promise<PaginatedResult<TaskEntity & { project?: ProjectEntity | null }>> {
    let list = this.tasks.filter((t) => t.assignedTo === employeeId);

    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)));
    }

    if (params.status) {
      list = list.filter((t) => t.status === params.status);
    }

    if (params.priority) {
      list = list.filter((t) => t.priority === params.priority);
    }

    if (params.projectId) {
      list = list.filter((t) => t.projectId === params.projectId);
    }

    if (params.todayWorkOnly === true || params.todayWorkOnly === 'true') {
      list = list.filter((t) => t.isTodayWork);
    }

    if (params.startDate) {
      list = list.filter((t) => (t.dueDate ? t.dueDate >= params.startDate! : true));
    }

    if (params.endDate) {
      list = list.filter((t) => (t.dueDate ? t.dueDate <= params.endDate! : true));
    }

    // Sort
    list.sort((a, b) => {
      if (params.sortBy === 'dueDate') {
        const d1 = a.dueDate || '';
        const d2 = b.dueDate || '';
        return params.sortOrder === 'asc' ? d1.localeCompare(d2) : d2.localeCompare(d1);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = list.length;
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const offset = (page - 1) * limit;

    const enriched = list.slice(offset, offset + limit).map((t) => {
      const project = this.projects.find((p) => p.id === t.projectId) || null;
      return {
        ...t,
        project,
      };
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: enriched,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  // ============================================================================
  // NOTIFICATIONS REPOSITORY METHODS
  // ============================================================================

  async findNotificationsPaginated(
    userId: string,
    params: PaginationParams = {}
  ): Promise<PaginatedResult<NotificationEntity>> {
    let list = this.notifications.filter((n) => n.userId === userId);

    if (params.status === 'unread') {
      list = list.filter((n) => !n.isRead);
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = list.length;
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const offset = (page - 1) * limit;

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: list.slice(offset, offset + limit),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async markNotificationAsRead(id: string, userId: string): Promise<NotificationEntity | null> {
    const notif = this.notifications.find((n) => n.id === id && n.userId === userId);
    if (!notif) return null;
    notif.isRead = true;
    return { ...notif };
  }

  async markAllNotificationsAsRead(userId: string): Promise<{ updatedCount: number }> {
    let count = 0;
    this.notifications.forEach((n) => {
      if (n.userId === userId && !n.isRead) {
        n.isRead = true;
        count++;
      }
    });
    return { updatedCount: count };
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return this.notifications.filter((n) => n.userId === userId && !n.isRead).length;
  }

  async createNotification(data: Omit<NotificationEntity, 'id' | 'createdAt'>): Promise<NotificationEntity> {
    const newNotif: NotificationEntity = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(newNotif);
    return { ...newNotif };
  }

  // ============================================================================
  // CMS: ANNOUNCEMENTS METHODS
  // ============================================================================

  async findAnnouncementsPaginated(params: PaginationParams = {}): Promise<PaginatedResult<AnnouncementEntity>> {
    let list = [...this.announcements];

    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter((a) => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q));
    }

    if (params.status) {
      list = list.filter((a) => a.status === params.status);
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = list.length;
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: list.slice(offset, offset + limit),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findAnnouncementById(id: string): Promise<AnnouncementEntity | null> {
    const item = this.announcements.find((a) => a.id === id);
    return item ? { ...item } : null;
  }

  async createAnnouncement(data: Partial<AnnouncementEntity>): Promise<AnnouncementEntity> {
    const now = new Date().toISOString();
    const newAnn: AnnouncementEntity = {
      id: uuidv4(),
      organizationId: data.organizationId || 'a0000000-0000-0000-0000-000000000001',
      title: data.title!,
      content: data.content!,
      audience: data.audience || 'ALL',
      department: data.department,
      publishDate: data.publishDate || now.split('T')[0],
      expiryDate: data.expiryDate,
      status: data.status || 'ACTIVE',
      createdBy: data.createdBy,
      createdAt: now,
      updatedAt: now,
    };
    this.announcements.unshift(newAnn);
    return { ...newAnn };
  }

  async updateAnnouncement(id: string, updates: Partial<AnnouncementEntity>): Promise<AnnouncementEntity | null> {
    const idx = this.announcements.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    this.announcements[idx] = {
      ...this.announcements[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return { ...this.announcements[idx] };
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    const idx = this.announcements.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    this.announcements.splice(idx, 1);
    return true;
  }

  // ============================================================================
  // CMS: COMPANY RESOURCES METHODS
  // ============================================================================

  async findResourcesPaginated(params: PaginationParams = {}): Promise<PaginatedResult<ResourceEntity>> {
    let list = [...this.resources];

    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter((r) => r.title.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q)));
    }

    if (params.category) {
      list = list.filter((r) => r.category === params.category);
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = list.length;
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 12;
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: list.slice(offset, offset + limit),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findResourceById(id: string): Promise<ResourceEntity | null> {
    const item = this.resources.find((r) => r.id === id);
    return item ? { ...item } : null;
  }

  async createResource(data: Partial<ResourceEntity>): Promise<ResourceEntity> {
    const now = new Date().toISOString();
    const newRes: ResourceEntity = {
      id: uuidv4(),
      organizationId: data.organizationId || 'a0000000-0000-0000-0000-000000000001',
      title: data.title!,
      description: data.description,
      category: data.category || 'DOCUMENTS',
      fileUrl: data.fileUrl || 'https://storage.supabase.co/v0/object/public/portal-assets/sample_document.pdf',
      fileName: data.fileName || 'Corporate_Document.pdf',
      fileSize: data.fileSize || 1024000,
      fileType: data.fileType || 'application/pdf',
      uploadedBy: data.uploadedBy,
      createdAt: now,
      updatedAt: now,
    };
    this.resources.unshift(newRes);
    return { ...newRes };
  }

  async updateResource(id: string, updates: Partial<ResourceEntity>): Promise<ResourceEntity | null> {
    const idx = this.resources.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    this.resources[idx] = {
      ...this.resources[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return { ...this.resources[idx] };
  }

  async deleteResource(id: string): Promise<boolean> {
    const idx = this.resources.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    this.resources.splice(idx, 1);
    return true;
  }

  // ============================================================================
  // CMS: KNOWLEDGE BASE / HELP CENTER METHODS
  // ============================================================================

  async findKnowledgeBasePaginated(params: PaginationParams = {}): Promise<PaginatedResult<KnowledgeBaseEntity>> {
    let list = [...this.knowledgeBase];

    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter((k) => k.question.toLowerCase().includes(q) || k.answer.toLowerCase().includes(q));
    }

    if (params.category) {
      list = list.filter((k) => k.category === params.category);
    }

    if (params.status) {
      list = list.filter((k) => k.status === params.status);
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = list.length;
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: list.slice(offset, offset + limit),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findKnowledgeBaseById(id: string): Promise<KnowledgeBaseEntity | null> {
    const item = this.knowledgeBase.find((k) => k.id === id);
    return item ? { ...item } : null;
  }

  async createKnowledgeBase(data: Partial<KnowledgeBaseEntity>): Promise<KnowledgeBaseEntity> {
    const now = new Date().toISOString();
    const newKB: KnowledgeBaseEntity = {
      id: uuidv4(),
      organizationId: data.organizationId || 'a0000000-0000-0000-0000-000000000001',
      question: data.question!,
      answer: data.answer!,
      category: data.category || 'GENERAL',
      status: data.status || 'PUBLISHED',
      createdBy: data.createdBy,
      createdAt: now,
      updatedAt: now,
    };
    this.knowledgeBase.unshift(newKB);
    return { ...newKB };
  }

  async updateKnowledgeBase(id: string, updates: Partial<KnowledgeBaseEntity>): Promise<KnowledgeBaseEntity | null> {
    const idx = this.knowledgeBase.findIndex((k) => k.id === id);
    if (idx === -1) return null;
    this.knowledgeBase[idx] = {
      ...this.knowledgeBase[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return { ...this.knowledgeBase[idx] };
  }

  async deleteKnowledgeBase(id: string): Promise<boolean> {
    const idx = this.knowledgeBase.findIndex((k) => k.id === id);
    if (idx === -1) return false;
    this.knowledgeBase.splice(idx, 1);
    return true;
  }

  // ============================================================================
  // LMS: COURSES & MODULES METHODS
  // ============================================================================

  async findCoursesPaginated(params: PaginationParams = {}): Promise<PaginatedResult<CourseEntity>> {
    let list = [...this.courses];

    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }

    if (params.category) {
      list = list.filter((c) => c.category === params.category);
    }

    if (params.status) {
      list = list.filter((c) => c.status === params.status);
    }

    const total = list.length;
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: list.slice(offset, offset + limit),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findCourseById(id: string): Promise<CourseEntity | null> {
    const item = this.courses.find((c) => c.id === id);
    return item ? { ...item } : null;
  }

  async createCourse(data: Partial<CourseEntity>): Promise<CourseEntity> {
    const now = new Date().toISOString();
    const newCourse: CourseEntity = {
      id: uuidv4(),
      organizationId: data.organizationId || 'a0000000-0000-0000-0000-000000000001',
      title: data.title!,
      description: data.description || '',
      category: data.category || 'General',
      thumbnailUrl: data.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80',
      status: data.status || 'ACTIVE',
      modules: data.modules || [],
      createdById: data.createdById,
      createdAt: now,
      updatedAt: now,
    };
    this.courses.unshift(newCourse);
    return { ...newCourse };
  }

  async updateCourse(id: string, updates: Partial<CourseEntity>): Promise<CourseEntity | null> {
    const idx = this.courses.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.courses[idx] = {
      ...this.courses[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return { ...this.courses[idx] };
  }

  async deleteCourse(id: string): Promise<boolean> {
    const idx = this.courses.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.courses.splice(idx, 1);
    return true;
  }

  // LMS: ENROLLMENTS & EMPLOYEE PROGRESS
  async findEmployeeCourses(employeeId: string): Promise<Array<{
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
  }>> {
    const enrollments = this.courseEnrollments.filter((e) => e.employeeId === employeeId);
    return enrollments.map((enr) => {
      const course = this.courses.find((c) => c.id === enr.courseId);
      const totalModules = course?.modules.length || 0;
      const completedModulesCount = enr.completedModuleIds.length;
      return {
        enrollmentId: enr.id,
        courseId: enr.courseId,
        courseTitle: course?.title || 'Unknown Course',
        courseDescription: course?.description || '',
        courseCategory: course?.category || 'General',
        thumbnailUrl: course?.thumbnailUrl,
        status: enr.status,
        progress: enr.progress,
        completedModuleIds: enr.completedModuleIds,
        totalModules,
        completedModulesCount,
        modules: course?.modules || [],
      };
    });
  }

  async enrollEmployeeInCourse(courseId: string, employeeId: string): Promise<CourseEnrollmentEntity> {
    const existing = this.courseEnrollments.find((e) => e.courseId === courseId && e.employeeId === employeeId);
    if (existing) return { ...existing };

    const newEnr: CourseEnrollmentEntity = {
      id: uuidv4(),
      organizationId: 'a0000000-0000-0000-0000-000000000001',
      courseId,
      employeeId,
      status: 'ASSIGNED',
      progress: 0,
      completedModuleIds: [],
      assignedAt: new Date().toISOString(),
    };
    this.courseEnrollments.push(newEnr);
    return { ...newEnr };
  }

  async updateModuleProgress(
    enrollmentId: string,
    moduleId: string,
    isCompleted: boolean,
    employeeId?: string
  ): Promise<CourseEnrollmentEntity | null> {
    const enr = this.courseEnrollments.find(
      (e) => e.id === enrollmentId && (employeeId ? e.employeeId === employeeId : true)
    );
    if (!enr) return null;

    const course = this.courses.find((c) => c.id === enr.courseId);
    const totalModules = course?.modules.length || 1;

    if (isCompleted) {
      if (!enr.completedModuleIds.includes(moduleId)) {
        enr.completedModuleIds.push(moduleId);
      }
    } else {
      enr.completedModuleIds = enr.completedModuleIds.filter((id) => id !== moduleId);
    }

    const calculatedProgress = Math.min(100, Math.round((enr.completedModuleIds.length / totalModules) * 100));
    enr.progress = calculatedProgress;

    if (calculatedProgress === 100) {
      enr.status = 'COMPLETED';
      enr.completedAt = new Date().toISOString();
    } else if (calculatedProgress > 0) {
      enr.status = 'IN_PROGRESS';
    } else {
      enr.status = 'ASSIGNED';
    }

    return { ...enr };
  }

  // ============================================================================
  // EMPLOYEE DASHBOARD OVERVIEW
  // ============================================================================

  async getEmployeeDashboardOverview(userId: string): Promise<EmployeeDashboardMetrics> {
    const employee = this.employees.find((e) => e.userId === userId);
    const empId = employee?.id || 'c0000000-0000-0000-0000-000000000010';
    const empName = employee?.fullName || 'Employee';

    // Get time-based greeting
    const hour = new Date().getHours();
    let greetingPrefix = 'Good Morning';
    if (hour >= 12 && hour < 17) greetingPrefix = 'Good Afternoon';
    else if (hour >= 17) greetingPrefix = 'Good Evening';
    const greeting = `${greetingPrefix}, ${empName.split(' ')[0]} 👋`;

    const empTasks = this.tasks.filter((t) => t.assignedTo === empId);

    const todayWorkTasks = empTasks.filter((t) => t.isTodayWork);
    const todayWorkCount = todayWorkTasks.length;
    const pendingCount = empTasks.filter((t) => t.status === TaskStatus.ASSIGNED || t.status === TaskStatus.IN_PROGRESS).length;
    const completedCount = empTasks.filter((t) => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.APPROVED).length;
    const revisionRequiredCount = empTasks.filter((t) => t.status === TaskStatus.REVISION_REQUIRED).length;

    const recentAnnouncements = this.announcements.filter((a) => a.status === 'ACTIVE').slice(0, 3);
    const assignedCourses = await this.findEmployeeCourses(empId);

    return {
      greeting,
      todayWorkCount,
      pendingCount,
      completedCount,
      revisionRequiredCount,
      todayTasks: todayWorkTasks.map((t) => {
        const proj = this.projects.find((p) => p.id === t.projectId);
        return {
          ...t,
          projectName: proj?.name,
          projectCode: proj?.code,
        } as any;
      }),
      recentAnnouncements,
      assignedCourses,
    };
  }

  // ============================================================================
  // PART 4: AUDIT LOGS REPOSITORY METHODS
  // ============================================================================

  async recordAuditLog(params: {
    organizationId?: string;
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
  }): Promise<AuditLogEntity> {
    const orgId = params.organizationId || this.organizations[0]?.id || 'a0000000-0000-0000-0000-000000000001';
    const log: AuditLogEntity = {
      id: uuidv4(),
      organizationId: orgId,
      userId: params.userId,
      userName: params.userName,
      userRole: params.userRole,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      details: params.details,
      previousValue: params.previousValue,
      newValue: params.newValue,
      ipAddress: params.ipAddress || '127.0.0.1',
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    return log;
  }

  async findAuditLogsPaginated(params: PaginationParams): Promise<PaginatedResult<AuditLogEntity>> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 15));
    let filtered = [...this.auditLogs];

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.userName.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.entity.toLowerCase().includes(q) ||
          (l.details && l.details.toLowerCase().includes(q))
      );
    }

    if (params.type) {
      filtered = filtered.filter((l) => l.entity.toUpperCase() === params.type?.toUpperCase());
    }

    if (params.startDate) {
      filtered = filtered.filter((l) => new Date(l.createdAt) >= new Date(params.startDate!));
    }
    if (params.endDate) {
      filtered = filtered.filter((l) => new Date(l.createdAt) <= new Date(params.endDate!));
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const data = filtered.slice(startIndex, startIndex + limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  // ============================================================================
  // PART 4: TASK PLAN VERSIONING REPOSITORY METHODS
  // ============================================================================

  async recordTaskPlanVersion(params: {
    projectId: string;
    changedById?: string;
    changedByName: string;
    summary?: string;
  }): Promise<TaskPlanVersionEntity> {
    const project = this.projects.find((p) => p.id === params.projectId);
    if (!project) throw new Error('Project not found');

    const projectTasks = this.tasks.filter((t) => t.projectId === params.projectId);
    const existingVersions = this.taskPlanVersions.filter((v) => v.projectId === params.projectId);
    const versionNumber = existingVersions.length + 1;

    const previousVersion = existingVersions[0];
    let addedCount = projectTasks.length;
    let removedCount = 0;
    let modifiedCount = 0;

    if (previousVersion) {
      const prevIds = new Set(previousVersion.snapshot.map((t) => t.id));
      const currIds = new Set(projectTasks.map((t) => t.id));
      addedCount = projectTasks.filter((t) => !prevIds.has(t.id)).length;
      removedCount = previousVersion.snapshot.filter((t) => !currIds.has(t.id)).length;
      modifiedCount = projectTasks.filter((t) => prevIds.has(t.id)).length;
    }

    const version: TaskPlanVersionEntity = {
      id: uuidv4(),
      organizationId: project.organizationId,
      projectId: params.projectId,
      versionNumber,
      changedById: params.changedById,
      changedByName: params.changedByName,
      totalTasks: projectTasks.length,
      addedCount,
      removedCount,
      modifiedCount,
      summary: params.summary || `Version ${versionNumber} created with ${projectTasks.length} tasks`,
      snapshot: projectTasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        priority: t.priority,
        assignedTo: t.assignedTo,
        status: t.status,
        dueDate: t.dueDate,
      })),
      createdAt: new Date().toISOString(),
    };

    this.taskPlanVersions.unshift(version);
    return version;
  }

  async findTaskPlanVersions(projectId: string): Promise<TaskPlanVersionEntity[]> {
    return this.taskPlanVersions
      .filter((v) => v.projectId === projectId)
      .sort((a, b) => b.versionNumber - a.versionNumber);
  }

  // ============================================================================
  // PART 4: ENTERPRISE REPORTS REPOSITORY METHODS
  // ============================================================================

  async getOrganizationReport(): Promise<OrganizationReport> {
    const totalEmployees = this.employees.length;
    const activeEmployees = this.employees.filter((e) => e.status === EntityStatus.ACTIVE).length;
    const internsCount = this.employees.filter((e) => e.employeeType === EmployeeType.INTERN).length;
    const totalTeams = this.teams.length;
    const totalLeaders = this.employees.filter((e) => {
      const u = this.users.find((user) => user.id === e.userId);
      return u?.role === UserRole.TEAM_LEADER;
    }).length;
    const activeProjects = this.projects.filter((p) => p.status === 'ACTIVE' || p.status === 'PLANNING').length;

    const deptCounts: Record<string, number> = {};
    this.employees.forEach((e) => {
      deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
    });

    const departmentBreakdown = Object.entries(deptCounts).map(([department, count]) => ({ department, count }));

    return {
      totalEmployees,
      activeEmployees,
      internsCount,
      totalTeams,
      totalLeaders,
      activeProjects,
      departmentBreakdown,
    };
  }

  async getWorkReport(): Promise<WorkReport> {
    const totalTasks = this.tasks.length;
    const completed = this.tasks.filter((t) => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.APPROVED).length;
    const pending = this.tasks.filter((t) => t.status === TaskStatus.UNASSIGNED || t.status === TaskStatus.ASSIGNED).length;
    const inProgress = this.tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;
    const revisionRequired = this.tasks.filter((t) => t.status === TaskStatus.REVISION_REQUIRED).length;
    const submitted = this.tasks.filter((t) => t.status === TaskStatus.SUBMITTED || t.status === TaskStatus.UNDER_REVIEW).length;

    const todayStr = new Date().toISOString().split('T')[0];
    const overdue = this.tasks.filter(
      (t) => t.dueDate && t.dueDate < todayStr && t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.APPROVED
    ).length;

    const completionRate = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completed,
      pending,
      inProgress,
      overdue,
      revisionRequired,
      submitted,
      completionRate,
    };
  }

  async getProjectsReport(): Promise<ProjectReportItem[]> {
    return this.projects.map((p) => {
      const projTasks = this.tasks.filter((t) => t.projectId === p.id);
      const totalTasks = projTasks.length;
      const completedTasks = projTasks.filter((t) => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.APPROVED).length;
      const pendingTasks = projTasks.filter((t) => t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.APPROVED).length;
      const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const todayStr = new Date().toISOString().split('T')[0];
      const overdueTasks = projTasks.filter(
        (t) => t.dueDate && t.dueDate < todayStr && t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.APPROVED
      ).length;

      const team = this.teams.find((tm) => tm.id === p.teamId);
      const leader = this.employees.find((e) => e.id === p.leaderId);

      return {
        projectId: p.id,
        projectName: p.name,
        projectCode: p.code,
        department: p.department || team?.department || 'Engineering',
        teamName: team?.name || 'Unassigned Team',
        leaderName: leader?.fullName || 'Not Assigned',
        status: p.status,
        totalTasks,
        completedTasks,
        pendingTasks,
        progressPercentage,
        overdueTasks,
      };
    });
  }

  async getEmployeesReport(): Promise<EmployeeReportItem[]> {
    return this.employees.map((emp) => {
      const empTasks = this.tasks.filter((t) => t.assignedTo === emp.id);
      const assignedTasks = empTasks.length;
      const completedTasks = empTasks.filter((t) => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.APPROVED).length;
      const inProgressTasks = empTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;
      const pendingTasks = empTasks.filter((t) => t.status === TaskStatus.ASSIGNED || t.status === TaskStatus.UNASSIGNED).length;
      const revisionCount = empTasks.filter((t) => t.status === TaskStatus.REVISION_REQUIRED).length;
      const completionRate = assignedTasks > 0 ? Math.round((completedTasks / assignedTasks) * 100) : 0;

      return {
        employeeId: emp.employeeId,
        fullName: emp.fullName,
        email: emp.email,
        department: emp.department,
        designation: emp.designation,
        assignedTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        completionRate,
        revisionCount,
      };
    });
  }

  // ============================================================================
  // PART 4: GLOBAL SEARCH
  // ============================================================================

  async globalSearch(query: string): Promise<GlobalSearchResults> {
    const q = (query || '').trim().toLowerCase();
    if (!q) {
      return {
        employees: [],
        teams: [],
        projects: [],
        tasks: [],
        courses: [],
        resources: [],
      };
    }

    const employees = this.employees
      .filter(
        (e) =>
          e.fullName.toLowerCase().includes(q) ||
          e.employeeId.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map((e) => ({
        id: e.id,
        fullName: e.fullName,
        employeeId: e.employeeId,
        email: e.email,
        department: e.department,
        designation: e.designation,
      }));

    const teams = this.teams
      .filter((t) => t.name.toLowerCase().includes(q) || t.department.toLowerCase().includes(q))
      .slice(0, 5)
      .map((t) => ({ id: t.id, name: t.name, department: t.department }));

    const projects = this.projects
      .filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q))
      .slice(0, 5)
      .map((p) => ({ id: p.id, name: p.name, code: p.code, status: p.status }));

    const tasks = this.tasks
      .filter((t) => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)))
      .slice(0, 5)
      .map((t) => {
        const proj = this.projects.find((p) => p.id === t.projectId);
        return {
          id: t.id,
          title: t.title,
          projectName: proj?.name || 'Project',
          status: t.status,
          priority: t.priority,
        };
      });

    const courses = this.courses
      .filter((c) => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q))
      .slice(0, 5)
      .map((c) => ({ id: c.id, title: c.title, category: c.category }));

    const resources = this.resources
      .filter((r) => r.title.toLowerCase().includes(q) || r.fileName.toLowerCase().includes(q) || r.category.toLowerCase().includes(q))
      .slice(0, 5)
      .map((r) => ({ id: r.id, title: r.title, category: r.category, fileName: r.fileName }));

    return {
      employees,
      teams,
      projects,
      tasks,
      courses,
      resources,
    };
  }

  // ============================================================================
  // PART 4: ORGANIZATION SETTINGS
  // ============================================================================

  async getOrganizationSettings(): Promise<OrganizationSettings> {
    return { ...this.organizationSettings };
  }

  async updateOrganizationSettings(updates: Partial<OrganizationSettings>): Promise<OrganizationSettings> {
    this.organizationSettings = {
      ...this.organizationSettings,
      ...updates,
    };
    return { ...this.organizationSettings };
  }

  // ============================================================================
  // PART 5: DOCUMENT VERSIONING
  // ============================================================================

  async createDocumentVersion(data: {
    documentId: string;
    fileName: string;
    fileUrl: string;
    fileSize?: number;
    fileType?: string;
    uploadedBy: string;
    uploadedByName: string;
    changeDescription?: string;
  }): Promise<DocumentVersionEntity> {
    // Demote current versions to not current
    this.documentVersions
      .filter((v) => v.documentId === data.documentId)
      .forEach((v) => {
        v.isCurrent = false;
      });

    const currentVersions = this.documentVersions.filter((v) => v.documentId === data.documentId);
    const nextVersionNumber = currentVersions.length > 0
      ? Math.max(...currentVersions.map((v) => v.versionNumber)) + 1
      : 1;

    const newVersion: DocumentVersionEntity = {
      id: uuidv4(),
      documentId: data.documentId,
      versionNumber: nextVersionNumber,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileSize: data.fileSize || 1024 * 1024,
      fileType: data.fileType || 'application/pdf',
      uploadedBy: data.uploadedBy,
      uploadedByName: data.uploadedByName,
      changeDescription: data.changeDescription || `Version ${nextVersionNumber} updated`,
      status: 'ACTIVE',
      isCurrent: true,
      createdAt: new Date().toISOString(),
    };

    this.documentVersions.push(newVersion);

    // Also update resource fileUrl and updatedAt if resource exists
    const resource = this.resources.find((r) => r.id === data.documentId);
    if (resource) {
      resource.fileUrl = data.fileUrl;
      resource.fileName = data.fileName;
      resource.fileSize = data.fileSize || resource.fileSize;
      resource.updatedAt = new Date().toISOString();
    }

    return newVersion;
  }

  async findDocumentVersions(documentId: string): Promise<DocumentVersionEntity[]> {
    // If no versions exist yet, create initial Version 1 from existing resource
    const existingVersions = this.documentVersions.filter((v) => v.documentId === documentId);
    if (existingVersions.length === 0) {
      const resource = this.resources.find((r) => r.id === documentId);
      if (resource) {
        const initialVersion: DocumentVersionEntity = {
          id: uuidv4(),
          documentId: resource.id,
          versionNumber: 1,
          fileName: resource.fileName,
          fileUrl: resource.fileUrl,
          fileSize: resource.fileSize || 1024 * 512,
          fileType: 'application/pdf',
          uploadedBy: resource.uploadedBy || 'b0000000-0000-0000-0000-000000000001',
          uploadedByName: 'Enterprise Administrator',
          changeDescription: 'Initial production baseline document version',
          status: 'ACTIVE',
          isCurrent: true,
          createdAt: resource.createdAt || new Date().toISOString(),
        };
        this.documentVersions.push(initialVersion);
        return [initialVersion];
      }
    }
    return existingVersions.sort((a, b) => b.versionNumber - a.versionNumber);
  }

  async findDocumentVersionById(id: string): Promise<DocumentVersionEntity | null> {
    const version = this.documentVersions.find((v) => v.id === id);
    return version || null;
  }

  async restoreDocumentVersion(documentId: string, versionId: string): Promise<DocumentVersionEntity | null> {
    const targetVersion = this.documentVersions.find((v) => v.id === versionId && v.documentId === documentId);
    if (!targetVersion) return null;

    // Demote current versions
    this.documentVersions
      .filter((v) => v.documentId === documentId)
      .forEach((v) => {
        v.isCurrent = false;
      });

    targetVersion.isCurrent = true;

    // Update resource file reference
    const resource = this.resources.find((r) => r.id === documentId);
    if (resource) {
      resource.fileUrl = targetVersion.fileUrl;
      resource.fileName = targetVersion.fileName;
      resource.updatedAt = new Date().toISOString();
    }

    return targetVersion;
  }

  // ============================================================================
  // PART 5: BACKGROUND JOBS QUEUE
  // ============================================================================

  async createBackgroundJob(job: {
    type: JobType;
    payload: any;
    createdBy?: string;
    maxRetries?: number;
  }): Promise<BackgroundJobEntity> {
    const newJob: BackgroundJobEntity = {
      id: uuidv4(),
      type: job.type,
      status: JobStatus.PENDING,
      progress: 0,
      payload: job.payload,
      retryCount: 0,
      maxRetries: job.maxRetries ?? 3,
      createdAt: new Date().toISOString(),
      createdBy: job.createdBy,
    };

    this.backgroundJobs.unshift(newJob);
    return newJob;
  }

  async findBackgroundJobs(filters?: { status?: JobStatus; type?: JobType; limit?: number }): Promise<BackgroundJobEntity[]> {
    let list = [...this.backgroundJobs];
    if (filters?.status) {
      list = list.filter((j) => j.status === filters.status);
    }
    if (filters?.type) {
      list = list.filter((j) => j.type === filters.type);
    }
    const limit = filters?.limit || 50;
    return list.slice(0, limit);
  }

  async findBackgroundJobById(id: string): Promise<BackgroundJobEntity | null> {
    return this.backgroundJobs.find((j) => j.id === id) || null;
  }

  async updateBackgroundJob(id: string, updates: Partial<BackgroundJobEntity>): Promise<BackgroundJobEntity | null> {
    const job = this.backgroundJobs.find((j) => j.id === id);
    if (!job) return null;

    Object.assign(job, updates);
    return job;
  }

  async cancelBackgroundJob(id: string): Promise<BackgroundJobEntity | null> {
    const job = this.backgroundJobs.find((j) => j.id === id);
    if (!job) return null;

    if (job.status === JobStatus.PENDING || job.status === JobStatus.PROCESSING) {
      job.status = JobStatus.CANCELLED;
      job.completedAt = new Date().toISOString();
    }
    return job;
  }

  // ============================================================================
  // PART 5: CONVERSATIONS & CHAT MESSAGES
  // ============================================================================

  async createConversation(userId: string, title?: string): Promise<ConversationEntity> {
    const newConv: ConversationEntity = {
      id: uuidv4(),
      userId,
      title: title || 'New Assistant Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.conversations.unshift(newConv);
    return newConv;
  }

  async getUserConversations(userId: string): Promise<ConversationEntity[]> {
    return this.conversations.filter((c) => c.userId === userId).sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));
  }

  async getConversationById(id: string, userId: string): Promise<ConversationEntity | null> {
    return this.conversations.find((c) => c.id === id && c.userId === userId) || null;
  }

  async deleteConversation(id: string, userId: string): Promise<boolean> {
    const index = this.conversations.findIndex((c) => c.id === id && c.userId === userId);
    if (index === -1) return false;
    this.conversations.splice(index, 1);
    this.chatMessages = this.chatMessages.filter((m) => m.conversationId !== id);
    return true;
  }

  async createChatMessage(data: {
    conversationId: string;
    role: 'USER' | 'ASSISTANT' | 'SYSTEM';
    content: string;
    intent?: string;
    sourceReferences?: any[];
  }): Promise<ChatMessageEntity> {
    const msg: ChatMessageEntity = {
      id: uuidv4(),
      conversationId: data.conversationId,
      role: data.role,
      content: data.content,
      intent: data.intent,
      sourceReferences: data.sourceReferences || [],
      createdAt: new Date().toISOString(),
    };

    this.chatMessages.push(msg);

    // Update conversation updatedAt
    const conv = this.conversations.find((c) => c.id === data.conversationId);
    if (conv) {
      conv.updatedAt = new Date().toISOString();
      if (data.role === 'USER' && (conv.title === 'New Assistant Chat' || !conv.title)) {
        conv.title = data.content.length > 35 ? `${data.content.substring(0, 32)}...` : data.content;
      }
    }

    return msg;
  }

  async getConversationMessages(conversationId: string): Promise<ChatMessageEntity[]> {
    return this.chatMessages.filter((m) => m.conversationId === conversationId).sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
  }

  // ============================================================================
  // PART 5: EMPLOYEE WORKLOAD MANAGEMENT & AGGREGATIONS
  // ============================================================================

  async getEmployeeWorkloadSummary(employeeId: string): Promise<EmployeeWorkloadSummary | null> {
    const employee = this.employees.find((e) => e.id === employeeId || e.employeeId === employeeId);
    if (!employee) return null;

    const teamMember = this.teamMembers.find((tm) => tm.employeeId === employee.id && tm.status === EntityStatus.ACTIVE);
    const team = teamMember ? this.teams.find((t) => t.id === teamMember.teamId) : null;

    // Calculate active tasks
    const activeTasksList = this.tasks.filter((t) => {
      const isMine = t.assignedTo === employee.id;
      const isActiveStatus = [
        TaskStatus.ASSIGNED,
        TaskStatus.IN_PROGRESS,
        TaskStatus.SUBMITTED,
        TaskStatus.UNDER_REVIEW,
        TaskStatus.REVISION_REQUIRED,
      ].includes(t.status as any);
      return isMine && isActiveStatus;
    });

    const now = new Date();
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const activeTasks = activeTasksList.length;
    let dueSoonTasks = 0;
    let overdueTasks = 0;
    let criticalTasks = 0;
    let revisionRequiredTasks = 0;
    let pendingSubmissions = 0;

    const projectIds = new Set<string>();

    for (const t of activeTasksList) {
      if (t.projectId) projectIds.add(t.projectId);
      if (t.status === TaskStatus.REVISION_REQUIRED) revisionRequiredTasks++;
      if (t.status === TaskStatus.SUBMITTED || t.status === TaskStatus.UNDER_REVIEW) pendingSubmissions++;
      if (t.priority === 'CRITICAL' || t.priority === 'HIGH') criticalTasks++;

      if (t.dueDate) {
        const due = new Date(t.dueDate);
        if (due < now && t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.APPROVED) {
          overdueTasks++;
        } else if (due >= now && due <= in48Hours) {
          dueSoonTasks++;
        }
      }
    }

    // Determine Workload State
    let workloadState = WorkloadState.NORMAL;
    let score = 20;

    if (activeTasks === 0) {
      workloadState = WorkloadState.LOW;
      score = 10;
    } else if (overdueTasks >= 2 || (activeTasks >= 6 && criticalTasks >= 2) || revisionRequiredTasks >= 2) {
      workloadState = WorkloadState.OVERLOADED;
      score = 92;
    } else if (activeTasks >= 4 || overdueTasks === 1 || dueSoonTasks >= 3 || criticalTasks >= 2) {
      workloadState = WorkloadState.HIGH;
      score = 75;
    } else {
      workloadState = WorkloadState.NORMAL;
      score = Math.min(60, 30 + activeTasks * 10);
    }

    return {
      employeeId: employee.id,
      fullName: employee.fullName,
      email: employee.email,
      department: employee.department,
      designation: employee.designation,
      employeeType: employee.employeeType,
      teamId: team?.id,
      teamName: team?.name,
      activeTasks,
      dueSoonTasks,
      overdueTasks,
      criticalTasks,
      revisionRequiredTasks,
      pendingSubmissions,
      activeProjects: projectIds.size,
      workloadState,
      score,
    };
  }

  async getTeamWorkloadSummary(teamId: string): Promise<TeamWorkloadSummary | null> {
    const team = this.teams.find((t) => t.id === teamId);
    if (!team) return null;

    const leader = team.leaderId ? this.employees.find((e) => e.id === team.leaderId) : null;
    const memberLinks = this.teamMembers.filter((tm) => tm.teamId === team.id && tm.status === EntityStatus.ACTIVE);

    const members: EmployeeWorkloadSummary[] = [];
    const workloadDistribution = { low: 0, normal: 0, high: 0, overloaded: 0 };
    let totalActiveTasks = 0;
    let totalOverdue = 0;

    for (const link of memberLinks) {
      const summary = await this.getEmployeeWorkloadSummary(link.employeeId);
      if (summary) {
        members.push(summary);
        totalActiveTasks += summary.activeTasks;
        totalOverdue += summary.overdueTasks;

        if (summary.workloadState === WorkloadState.LOW) workloadDistribution.low++;
        else if (summary.workloadState === WorkloadState.NORMAL) workloadDistribution.normal++;
        else if (summary.workloadState === WorkloadState.HIGH) workloadDistribution.high++;
        else if (summary.workloadState === WorkloadState.OVERLOADED) workloadDistribution.overloaded++;
      }
    }

    return {
      teamId: team.id,
      teamName: team.name,
      department: team.department,
      leaderName: leader ? leader.fullName : 'Unassigned',
      totalMembers: members.length,
      totalActiveTasks,
      overdueTasks: totalOverdue,
      workloadDistribution,
      members,
    };
  }

  async getOrganizationWorkloadSummary(filters?: { teamId?: string; department?: string; status?: string }): Promise<OrganizationWorkloadSummary> {
    const activeEmployees = this.employees.filter((e) => e.status === EntityStatus.ACTIVE);

    let totalActiveTasks = 0;
    let totalOverdueTasks = 0;
    let totalRevisionRequired = 0;
    const workloadDistribution = { low: 0, normal: 0, high: 0, overloaded: 0 };

    const deptMap: Record<string, { employeeCount: number; activeTasks: number; overdueTasks: number; overloadedCount: number }> = {};

    for (const emp of activeEmployees) {
      const summary = await this.getEmployeeWorkloadSummary(emp.id);
      if (summary) {
        totalActiveTasks += summary.activeTasks;
        totalOverdueTasks += summary.overdueTasks;
        totalRevisionRequired += summary.revisionRequiredTasks;

        if (summary.workloadState === WorkloadState.LOW) workloadDistribution.low++;
        else if (summary.workloadState === WorkloadState.NORMAL) workloadDistribution.normal++;
        else if (summary.workloadState === WorkloadState.HIGH) workloadDistribution.high++;
        else if (summary.workloadState === WorkloadState.OVERLOADED) workloadDistribution.overloaded++;

        const dept = emp.department || 'General';
        if (!deptMap[dept]) {
          deptMap[dept] = { employeeCount: 0, activeTasks: 0, overdueTasks: 0, overloadedCount: 0 };
        }
        deptMap[dept].employeeCount++;
        deptMap[dept].activeTasks += summary.activeTasks;
        deptMap[dept].overdueTasks += summary.overdueTasks;
        if (summary.workloadState === WorkloadState.OVERLOADED) {
          deptMap[dept].overloadedCount++;
        }
      }
    }

    const departmentBreakdown = Object.entries(deptMap).map(([department, stats]) => ({
      department,
      ...stats,
    }));

    return {
      totalEmployees: activeEmployees.length,
      totalActiveTasks,
      totalOverdueTasks,
      totalRevisionRequired,
      workloadDistribution,
      departmentBreakdown,
    };
  }

  // ============================================================================
  // CONVENIENCE ENTITY ACCESS HELPERS
  // ============================================================================

  async findTasksByAssignee(employeeId: string): Promise<TaskEntity[]> {
    return this.tasks.filter((t) => t.assignedTo === employeeId);
  }

  async findTasksByTeam(teamId: string): Promise<TaskEntity[]> {
    const projectIds = this.projects.filter((p) => p.teamId === teamId).map((p) => p.id);
    return this.tasks.filter((t) => projectIds.includes(t.projectId));
  }

  async findTeamsByLeader(leaderId: string): Promise<TeamEntity[]> {
    return this.teams.filter((t) => t.leaderId === leaderId);
  }

  async findTeamMembersByEmployee(employeeId: string): Promise<TeamMemberEntity[]> {
    return this.teamMembers.filter((tm) => tm.employeeId === employeeId);
  }

  async findCourseEnrollmentsByEmployee(employeeId: string): Promise<CourseEnrollmentEntity[]> {
    return this.courseEnrollments.filter((ce) => ce.employeeId === employeeId);
  }

  async createAuditLog(data: {
    organizationId?: string;
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    details?: any;
    previousValue?: any;
    newValue?: any;
  }): Promise<AuditLogEntity> {
    const user = data.userId ? this.users.find((u) => u.id === data.userId) : null;
    const employee = data.userId ? this.employees.find((e) => e.userId === data.userId) : null;
    return this.recordAuditLog({
      organizationId: data.organizationId,
      userId: data.userId,
      userName: employee ? employee.fullName : (user ? user.email : 'System User'),
      userRole: user ? user.role : 'ADMIN',
      action: data.action,
      entity: data.entity,
      entityId: data.entityId,
      details: typeof data.details === 'object' ? JSON.stringify(data.details) : data.details,
      previousValue: data.previousValue,
      newValue: data.newValue,
    });
  }
}



