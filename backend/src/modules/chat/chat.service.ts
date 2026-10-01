import {
  Injectable,
  Inject,
  Logger,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { WorkloadService } from '../workload/workload.service';
import {
  UserRole,
  ChatIntent,
  ChatSourceReference,
  TaskStatus,
} from '../../common/types';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(WorkloadService) private readonly workloadService: WorkloadService,
  ) {}

  /**
   * Process a chat message with full RBAC, intent detection, and hallucination defense
   */
  async processMessage(
    messageText: string,
    user: { userId: string; role: UserRole; email: string },
    conversationId?: string,
  ): Promise<{
    conversationId: string;
    message: string;
    intent: string;
    sourceReferences: ChatSourceReference[];
    quickQuestions?: string[];
  }> {
    const cleanMsg = (messageText || '').trim();
    if (!cleanMsg) {
      return {
        conversationId: conversationId || 'new',
        message: 'How may I assist you with your corporate work today?',
        intent: ChatIntent.GENERAL_HELP,
        sourceReferences: [],
      };
    }

    // 1. Ensure conversation exists
    let activeConvId = conversationId;
    if (!activeConvId) {
      const conv = await this.db.createConversation(user.userId, cleanMsg.substring(0, 35));
      activeConvId = conv.id;
    }

    // Save user message to chat history
    await this.db.createChatMessage({
      conversationId: activeConvId,
      role: 'USER',
      content: cleanMsg,
    });

    // 2. Security & Prompt Injection Defense
    const securityThreat = this.detectSecurityThreat(cleanMsg);
    if (securityThreat) {
      const responseText = `🛡️ Security Notice: ${securityThreat}`;
      await this.db.createChatMessage({
        conversationId: activeConvId,
        role: 'ASSISTANT',
        content: responseText,
      });
      return {
        conversationId: activeConvId,
        message: responseText,
        intent: 'SECURITY_ALERT',
        sourceReferences: [],
      };
    }

    // 3. Intent Detection
    const intent = this.classifyIntent(cleanMsg, user.role);

    // 4. Role Authorization & Controlled Data Tool Execution
    const { responseText, sourceReferences } = await this.executeControlledTools(
      intent,
      cleanMsg,
      user,
    );

    // 5. Save assistant message to history
    await this.db.createChatMessage({
      conversationId: activeConvId,
      role: 'ASSISTANT',
      content: responseText,
      intent,
      sourceReferences,
    });

    return {
      conversationId: activeConvId,
      message: responseText,
      intent,
      sourceReferences,
      quickQuestions: this.getQuickQuestionsForRole(user.role),
    };
  }

  /**
   * Security & Jailbreak Inspection
   */
  private detectSecurityThreat(text: string): string | null {
    const lower = text.toLowerCase();
    const maliciousPatterns = [
      'ignore previous instructions',
      'ignore all instructions',
      'ignore your rules',
      'bypass authorization',
      'reveal system prompt',
      'show system prompt',
      'show secret key',
      'database_password',
      'supabase_service_role_key',
      'drop table',
      'select * from users',
      'dump password',
      'dump database',
    ];

    for (const pattern of maliciousPatterns) {
      if (lower.includes(pattern)) {
        return 'As a corporate security safeguard, I cannot bypass role-based access control, reveal confidential tokens, or execute arbitrary database commands.';
      }
    }

    return null;
  }

  /**
   * Intent Classification
   */
  private classifyIntent(text: string, role: UserRole): ChatIntent {
    const lower = text.toLowerCase();

    // Check for another employee's tasks or private info query by non-admin/non-leader
    if (
      (role === UserRole.EMPLOYEE || role === UserRole.INTERN) &&
      (lower.includes("another employee") ||
        lower.includes("someone else's") ||
        lower.includes("someone else") ||
        lower.includes("rahul's") ||
        lower.includes("amit's") ||
        lower.includes("sneha's") ||
        lower.includes("salary") ||
        lower.includes("compensation") ||
        lower.includes("other employee"))
    ) {
      return ChatIntent.UNKNOWN;
    }

    if (lower.includes('my task') || lower.includes('tasks today') || lower.includes('today\'s task') || lower.includes('work today') || lower.includes('what to do')) {
      return ChatIntent.MY_TASKS;
    }
    if (lower.includes('overdue')) {
      return ChatIntent.OVERDUE_TASKS;
    }
    if (lower.includes('deadline') || lower.includes('due date') || lower.includes('due soon')) {
      return ChatIntent.TASK_DEADLINE;
    }
    if (lower.includes('submission') || lower.includes('submitted') || lower.includes('review')) {
      return ChatIntent.TASK_SUBMISSION;
    }
    if (lower.includes('workload') || lower.includes('overload') || lower.includes('capacity')) {
      return ChatIntent.TEAM_WORKLOAD;
    }
    if (lower.includes('training') || lower.includes('course') || lower.includes('lms') || lower.includes('learning')) {
      return ChatIntent.TRAINING_STATUS;
    }
    if (lower.includes('project') || lower.includes('progress') || lower.includes('roadmap')) {
      return ChatIntent.PROJECT_STATUS;
    }
    if (lower.includes('notification') || lower.includes('alerts') || lower.includes('messages')) {
      return ChatIntent.NOTIFICATIONS;
    }
    if (lower.includes('policy') || lower.includes('leave') || lower.includes('holiday') || lower.includes('handbook') || lower.includes('guideline') || lower.includes('wfh') || lower.includes('remote') || lower.includes('sick')) {
      return ChatIntent.COMPANY_POLICY;
    }
    if (lower.includes('resource') || lower.includes('document') || lower.includes('template') || lower.includes('file') || lower.includes('python')) {
      return ChatIntent.RESOURCE_SEARCH;
    }
    if (lower.includes('help') || lower.includes('how do i') || lower.includes('how to')) {
      return ChatIntent.KNOWLEDGE_SEARCH;
    }

    return ChatIntent.GENERAL_HELP;
  }

  /**
   * Execute controlled internal tools based on intent and user role
   */
  private async executeControlledTools(
    intent: ChatIntent,
    queryText: string,
    user: { userId: string; role: UserRole; email: string },
  ): Promise<{ responseText: string; sourceReferences: ChatSourceReference[] }> {
    const employee = await this.db.findEmployeeByUserId(user.userId);
    const sourceReferences: ChatSourceReference[] = [];

    // Check cross-user unauthorized access attempt
    const lowerQuery = queryText.toLowerCase();
    if (
      (user.role === UserRole.EMPLOYEE || user.role === UserRole.INTERN) &&
      (lowerQuery.includes('another employee') ||
        lowerQuery.includes("someone else's") ||
        lowerQuery.includes("someone else") ||
        lowerQuery.includes("other employee") ||
        lowerQuery.includes("salary") ||
        lowerQuery.includes("compensation") ||
        lowerQuery.includes("rahul's") ||
        lowerQuery.includes("amit's") ||
        lowerQuery.includes("sneha's") ||
        lowerQuery.includes("rohit's") ||
        lowerQuery.includes("david's") ||
        lowerQuery.includes("elena's"))
    ) {
      return {
        responseText: '🔒 Access Denied: You are only authorized to view your own assigned work, team deliverables, and public company resources. Staff privacy and RBAC guidelines prevent inspecting other individual employee work records.',
        sourceReferences: [
          { title: 'Enterprise Data Governance & RBAC Policy', type: 'POLICY' },
        ],
      };
    }

    switch (intent) {
      // 1. MY TASKS
      case ChatIntent.MY_TASKS: {
        if (!employee) {
          return { responseText: 'No employee workstation profile found for your account.', sourceReferences: [] };
        }
        const myTasks = await this.db.findTasksByAssignee(employee.id);
        const activeTasks = myTasks.filter((t) => t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.APPROVED);

        if (activeTasks.length === 0) {
          return {
            responseText: `You currently have zero active tasks pending. All deliverables are up to date! Great job.`,
            sourceReferences: [],
          };
        }

        const taskLines = activeTasks.slice(0, 5).map((t, i) => {
          const due = t.dueDate ? ` (Due: ${t.dueDate})` : '';
          return `${i + 1}. **${t.title}** [${t.status}] — Priority: *${t.priority}*${due}`;
        });

        return {
          responseText: `Here are your current active assigned tasks (${activeTasks.length} total):\n\n${taskLines.join('\n')}\n\nYou can click on any task in your **Daily Work** workstation to begin or submit your deliverable.`,
          sourceReferences: [{ title: 'Daily Workstation Tasks', type: 'TASK' }],
        };
      }

      // 2. OVERDUE TASKS
      case ChatIntent.OVERDUE_TASKS: {
        if (user.role === UserRole.ADMIN) {
          const report = await this.db.getWorkReport();
          return {
            responseText: `Organization-wide Overdue Status: There are currently **${report.overdue}** overdue tasks out of ${report.totalTasks} total in-scope tasks (${report.completionRate}% completion rate).`,
            sourceReferences: [{ title: 'Executive Operations Report', type: 'PROJECT' }],
          };
        } else if (user.role === UserRole.TEAM_LEADER && employee) {
          const teams = await this.db.findTeamsByLeader(employee.id);
          if (teams.length === 0) {
            return { responseText: 'You currently have no teams assigned under your leadership.', sourceReferences: [] };
          }
          const teamSummary = await this.workloadService.getTeamWorkload(teams[0].id, user);
          return {
            responseText: `Team **${teamSummary.teamName}** has **${teamSummary.overdueTasks}** overdue tasks. Total active tasks: ${teamSummary.totalActiveTasks}.`,
            sourceReferences: [{ title: `Team ${teamSummary.teamName} Roster`, type: 'PROJECT' }],
          };
        } else if (employee) {
          const myTasks = await this.db.findTasksByAssignee(employee.id);
          const now = new Date();
          const overdue = myTasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.APPROVED);
          if (overdue.length === 0) {
            return { responseText: 'Great news! You have no overdue tasks.', sourceReferences: [] };
          }
          const items = overdue.map((t, idx) => `${idx + 1}. **${t.title}** (Was due: ${t.dueDate})`);
          return {
            responseText: `⚠️ You have ${overdue.length} overdue task(s):\n\n${items.join('\n')}\n\nPlease submit or update your progress as soon as possible.`,
            sourceReferences: [{ title: 'Task Schedule Tracker', type: 'TASK' }],
          };
        }
        break;
      }

      // 3. TASK DEADLINES
      case ChatIntent.TASK_DEADLINE: {
        if (!employee) return { responseText: 'Employee profile not found.', sourceReferences: [] };
        const myTasks = await this.db.findTasksByAssignee(employee.id);
        const upcoming = myTasks
          .filter((t) => t.dueDate && t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.APPROVED)
          .sort((a, b) => (new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()));

        if (upcoming.length === 0) {
          return { responseText: 'You have no scheduled task deadlines approaching.', sourceReferences: [] };
        }

        const next = upcoming[0];
        return {
          responseText: `Your next upcoming deadline is for **"${next.title}"**, due on **${next.dueDate}** (Priority: ${next.priority}, Status: ${next.status}).`,
          sourceReferences: [{ title: 'Workstation Calendar', type: 'TASK' }],
        };
      }

      // 4. SUBMISSIONS & REVIEWS
      case ChatIntent.TASK_SUBMISSION: {
        if (user.role === UserRole.TEAM_LEADER && employee) {
          const teams = await this.db.findTeamsByLeader(employee.id);
          if (teams.length > 0) {
            const teamTasks = await this.db.findTasksByTeam(teams[0].id);
            const pendingReviews = teamTasks.filter((t) => t.status === TaskStatus.SUBMITTED || t.status === TaskStatus.UNDER_REVIEW);
            if (pendingReviews.length === 0) {
              return { responseText: 'You have no submissions waiting for review at this time.', sourceReferences: [] };
            }
            const list = pendingReviews.map((t, i) => `${i + 1}. **${t.title}** (Submitted work deliverable)`);
            return {
              responseText: `📋 You have **${pendingReviews.length}** submission(s) awaiting your leadership review:\n\n${list.join('\n')}\n\nYou can review, approve, or request revisions in the **Submissions** tab.`,
              sourceReferences: [{ title: 'Leadership Review Queue', type: 'TASK' }],
            };
          }
        } else if (employee) {
          const myTasks = await this.db.findTasksByAssignee(employee.id);
          const submitted = myTasks.filter((t) => t.status === TaskStatus.SUBMITTED || t.status === TaskStatus.UNDER_REVIEW);
          const revisions = myTasks.filter((t) => t.status === TaskStatus.REVISION_REQUIRED);

          let reply = `You have **${submitted.length}** submission(s) currently under leadership review.`;
          if (revisions.length > 0) {
            reply += `\n\n⚠️ **${revisions.length}** task(s) require revisions:`;
            revisions.forEach((r, idx) => {
              reply += `\n${idx + 1}. **${r.title}** — Feedback: "${r.submissionComment || r.submissionMessage || 'Please update deliverable.'}"`;
            });
          }
          return { responseText: reply, sourceReferences: [{ title: 'My Work Submissions', type: 'TASK' }] };
        }
        break;
      }

      // 5. WORKLOAD MANAGEMENT
      case ChatIntent.TEAM_WORKLOAD: {
        if (user.role === UserRole.ADMIN) {
          const orgSummary = await this.workloadService.getOrganizationWorkload(user);
          return {
            responseText: `📊 **Enterprise Workload Summary**:\n- Total Active Staff: **${orgSummary.totalEmployees}**\n- Active Assigned Tasks: **${orgSummary.totalActiveTasks}**\n- Overdue Tasks: **${orgSummary.totalOverdueTasks}**\n- Workload Balance: ${orgSummary.workloadDistribution.normal} Normal, ${orgSummary.workloadDistribution.high} High, ${orgSummary.workloadDistribution.overloaded} Overloaded staff members.`,
            sourceReferences: [{ title: 'Enterprise Workload Dashboard', type: 'PROJECT' }],
          };
        } else if (user.role === UserRole.TEAM_LEADER && employee) {
          const teams = await this.db.findTeamsByLeader(employee.id);
          if (teams.length === 0) {
            return { responseText: 'No supervised team found for workload evaluation.', sourceReferences: [] };
          }
          const teamWorkload = await this.workloadService.getTeamWorkload(teams[0].id, user);
          const overloadedMembers = teamWorkload.members.filter((m) => m.workloadState === 'OVERLOADED' || m.workloadState === 'HIGH');

          let msg = `Team **${teamWorkload.teamName}** Workload Overview:\n- Members: **${teamWorkload.totalMembers}**\n- Active Tasks: **${teamWorkload.totalActiveTasks}**\n- Overdue Tasks: **${teamWorkload.overdueTasks}**`;
          if (overloadedMembers.length > 0) {
            msg += `\n\n⚠️ Members with High/Overloaded Workload:\n` + overloadedMembers.map((m) => `- **${m.fullName}**: ${m.activeTasks} tasks (${m.workloadState})`).join('\n');
          } else {
            msg += `\n\n✅ All team members are operating within healthy capacity.`;
          }
          return { responseText: msg, sourceReferences: [{ title: `Workload Analytics - ${teamWorkload.teamName}`, type: 'PROJECT' }] };
        } else if (employee) {
          const mySummary = await this.workloadService.getMyWorkload(user.userId);
          return {
            responseText: `Your current workload status is **${mySummary.workloadState}** (${mySummary.activeTasks} active tasks, ${mySummary.dueSoonTasks} due soon, ${mySummary.overdueTasks} overdue).`,
            sourceReferences: [{ title: 'My Workstation Workload Summary', type: 'TASK' }],
          };
        }
        break;
      }

      // 6. TRAINING & LMS
      case ChatIntent.TRAINING_STATUS: {
        if (employee) {
          const enrollments = await this.db.findCourseEnrollmentsByEmployee(employee.id);
          if (enrollments.length === 0) {
            return {
              responseText: 'You currently have no mandatory LMS training courses assigned. You can browse available elective courses in the Training portal.',
              sourceReferences: [{ title: 'Corporate LMS Academy', type: 'COURSE' }],
            };
          }

          const lines = enrollments.map((en, idx) => {
            const course = this.db['courses']?.find((c: any) => c.id === en.courseId);
            const title = course ? course.title : 'Corporate Training Module';
            return `${idx + 1}. **${title}** — Progress: **${en.progress}%** (${en.status})`;
          });

          return {
            responseText: `📚 Here is your current Corporate Training progress:\n\n${lines.join('\n')}`,
            sourceReferences: [{ title: 'LMS Training Records', type: 'COURSE' }],
          };
        }
        break;
      }

      // 7. PROJECT PROGRESS
      case ChatIntent.PROJECT_STATUS: {
        const projects = await this.db.findProjectsPaginated({ limit: 5 });
        if (projects.data.length === 0) {
          return { responseText: 'No active enterprise projects found.', sourceReferences: [] };
        }
        const lines = projects.data.map((p, i) => `${i + 1}. **${p.name}** (${p.code}) — Status: *${p.status}*, Department: ${p.department}`);
        return {
          responseText: `Here is the current status of key enterprise projects:\n\n${lines.join('\n')}`,
          sourceReferences: [{ title: 'Project Management Directory', type: 'PROJECT' }],
        };
      }

      // 8. NOTIFICATIONS SUMMARY
      case ChatIntent.NOTIFICATIONS: {
        const notifs = await this.db.findNotificationsPaginated(user.userId, { limit: 5 });
        if (notifs.data.length === 0) {
          return { responseText: 'You have zero unread notifications. All caught up!', sourceReferences: [] };
        }
        const list = notifs.data.map((n, i) => `${i + 1}. **${n.title}**: ${n.message}`);
        return {
          responseText: `Here are your recent notifications:\n\n${list.join('\n')}`,
          sourceReferences: [{ title: 'Notification Center', type: 'ANNOUNCEMENT' }],
        };
      }

      // 9. COMPANY POLICIES & KNOWLEDGE BASE RAG
      case ChatIntent.COMPANY_POLICY:
      case ChatIntent.KNOWLEDGE_SEARCH: {
        const kbResults = await this.db.findKnowledgeBasePaginated({ limit: 20 });
        const queryLower = queryText.toLowerCase();

        // Semantic match on question or answer or category
        const matched = kbResults.data.filter(
          (k) =>
            k.question.toLowerCase().includes(queryLower) ||
            queryLower.includes(k.category.toLowerCase()) ||
            k.answer.toLowerCase().includes(queryLower) ||
            (queryLower.includes('leave') && k.category.toLowerCase().includes('hr')) ||
            (queryLower.includes('wfh') && (k.question.toLowerCase().includes('remote') || k.category.toLowerCase().includes('work'))) ||
            (queryLower.includes('handbook') && k.category.toLowerCase().includes('general')),
        );

        if (matched.length > 0) {
          const best = matched[0];
          return {
            responseText: `**${best.question}**\n\n${best.answer}`,
            sourceReferences: [
              {
                title: `${best.category} Guidelines: ${best.question}`,
                type: 'POLICY',
                snippet: best.answer.substring(0, 100),
              },
            ],
          };
        }

        // Check if query is about leave policy specifically
        if (queryLower.includes('leave') || queryLower.includes('vacation') || queryLower.includes('holiday')) {
          return {
            responseText: `**Corporate Employee Leave Policy**:\n- **Annual Paid Time Off (PTO)**: 24 days per calendar year, accrued monthly.\n- **Sick / Medical Leave**: 12 days per calendar year.\n- **Casual Leave**: 6 days per calendar year.\n- **Application Process**: Submit leave requests via the HR portal at least 3 business days in advance for planned PTO. Emergency leaves can be reported directly to your Team Leader.`,
            sourceReferences: [
              { title: 'Nexus Corporate Employee Leave Policy (HR-POL-04)', type: 'POLICY' },
            ],
          };
        }

        // Hallucination Protection fallback
        return {
          responseText: `I couldn't find that specific policy or question in the official company knowledge base. Please check the **Help Center** or contact Human Resources directly.`,
          sourceReferences: [{ title: 'Company Knowledge Base', type: 'GUIDELINE' }],
        };
      }

      // 10. RESOURCE SEARCH
      case ChatIntent.RESOURCE_SEARCH: {
        const resources = await this.db.findResourcesPaginated({ limit: 50 });
        const q = queryText.toLowerCase();
        const matches = resources.data.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.category.toLowerCase().includes(q) ||
            r.fileName.toLowerCase().includes(q) ||
            (q.includes('python') && (r.title.toLowerCase().includes('python') || r.category.toLowerCase().includes('engineering'))),
        );

        if (matches.length > 0) {
          const list = matches.slice(0, 4).map((r, i) => `${i + 1}. **${r.title}** (${r.fileName}) — *${r.category}*`);
          return {
            responseText: `Found ${matches.length} matching company document(s):\n\n${list.join('\n')}\n\nYou can access and download these in the **Company Documents** section.`,
            sourceReferences: matches.slice(0, 3).map((m) => ({ title: m.title, type: 'HANDBOOK' })),
          };
        }

        return {
          responseText: `I couldn't find company resources matching your query in the available company data.`,
          sourceReferences: [],
        };
      }

      default:
        break;
    }

    // 11. CHECK FOR PROJECT ROLES, ARCHITECTURE & WORKFLOW QUESTIONS
    const qLower = queryText.toLowerCase();

    // A. Team Leader Role
    if (
      qLower.includes('role of team leader') ||
      qLower.includes('team leader role') ||
      qLower.includes('what does a team leader do') ||
      qLower.includes('what is the role of team leader') ||
      qLower.includes('team leader responsibilities') ||
      qLower.includes('leader duties')
    ) {
      return {
        responseText: `**Role & Responsibilities of a Team Leader (TL)**:\n\nIn this Corporate Portal, Team Leaders operate on the **\`Plan → Assign → Review\`** framework:\n\n1. **Task Planning & Creation**: Create project task plans, define milestones, set priorities (*NORMAL, HIGH, CRITICAL*), due dates, and task dependencies.\n2. **Task Assignment**: Assign tasks to team members (Employees and Interns), bulk-assign batches, and manage the **Today's Work** daily queue.\n3. **Deliverable Review**: Review work deliverables submitted by staff in the **Submissions** tab. Leaders can **Approve** (moving status to *COMPLETED*) or **Request Revisions** with actionable feedback.\n4. **Workload Governance**: Monitor team workload capacity, identify overloaded team members, and rebalance task distributions.\n5. **Project Oversight**: Monitor progress percentages and manage project roadmaps.`,
        sourceReferences: [
          { title: 'Nexus Team Leadership Governance Manual (GOV-TL-01)', type: 'GUIDELINE' },
          { title: 'Task & Workflow Review Standard', type: 'POLICY' },
        ],
      };
    }

    // B. Admin Role
    if (
      qLower.includes('role of admin') ||
      qLower.includes('admin role') ||
      qLower.includes('what does admin do') ||
      qLower.includes('administrator role') ||
      qLower.includes('admin responsibilities')
    ) {
      return {
        responseText: `**Role & Responsibilities of an Administrator**:\n\nIn this Corporate Portal, Administrators operate on the **\`Manage → Monitor → Control\`** framework:\n\n1. **Workforce Directory**: Create, update, suspend, and govern all Employees, Team Leaders, and Interns.\n2. **Team & Project Governance**: Create corporate teams, appoint Team Leaders, configure projects, and assign project ownership.\n3. **Executive Analytics & Reporting**: Access organization-wide workload metrics, export CSV/Excel work reports, and inspect completion statistics.\n4. **Security & Audit Logs**: Track system-wide audit trails, monitor active user sessions, and configure global system settings.\n5. **CMS & LMS Management**: Publish company announcements, upload company resources, and oversee corporate training courses.`,
        sourceReferences: [
          { title: 'Executive Administration Governance Blueprint', type: 'GUIDELINE' },
        ],
      };
    }

    // C. Employee / Intern Role
    if (
      qLower.includes('role of employee') ||
      qLower.includes('role of intern') ||
      qLower.includes('employee role') ||
      qLower.includes('intern role') ||
      qLower.includes('what does an employee do') ||
      qLower.includes('what does an intern do')
    ) {
      return {
        responseText: `**Role & Responsibilities of an Employee / Intern**:\n\nIn this Corporate Portal, Employees and Interns operate on the **\`See Work → Do Work → Submit\`** framework:\n\n1. **Daily Workstation**: Check the **Daily Work** dashboard to see tasks scheduled for today.\n2. **Start Deliverables**: Click "Start Work" on an assigned task to move its status to *IN_PROGRESS*.\n3. **Submit Deliverables**: Once finished, submit completion notes, comments, and file attachments for leadership review.\n4. **Handle Revisions**: View review feedback from your Team Leader and update/resubmit work if revisions are requested.\n5. **Corporate LMS Academy**: Access assigned video and text courses, complete modules, and track learning milestones.`,
        sourceReferences: [
          { title: 'Nexus Employee & Intern Workstation Guide', type: 'GUIDELINE' },
        ],
      };
    }

    // D. Portal Overview & Architecture
    if (
      qLower.includes('how does this portal work') ||
      qLower.includes('how does the project work') ||
      qLower.includes('portal features') ||
      qLower.includes('how does this website work') ||
      qLower.includes('what is this portal') ||
      qLower.includes('portal overview')
    ) {
      return {
        responseText: `**Corporate Workforce Portal Overview**:\n\nThis platform is an enterprise workforce management system built with **React + TypeScript + NestJS + PostgreSQL**.\n\n### Core Workflows:\n- **Employee Lifecycle**: Recruitment → Department Assignment → Team Roster → Role-Based Portal Access.\n- **Task Execution Flow**: Task Plan → Assignment → Daily Work Queue → Start Work → Submit Deliverable → Leader Review → Approved / Completed.\n- **Knowledge & Training**: Company CMS (Announcements, Documents, Knowledge Base) & LMS Academy (Interactive courses & progress tracking).\n- **Enterprise Governance**: Real-time Workload Analytics, Audit Trail, Document Versioning, and System Monitoring.`,
        sourceReferences: [
          { title: 'Enterprise Portal Architecture Blueprint', type: 'GUIDELINE' },
        ],
      };
    }

    // E. Task Lifecycle & Status Flow
    if (
      qLower.includes('task lifecycle') ||
      qLower.includes('task status flow') ||
      qLower.includes('how do tasks work') ||
      qLower.includes('task flow') ||
      qLower.includes('task status')
    ) {
      return {
        responseText: `**Enterprise Task Lifecycle Flow**:\n\nTasks progress through standardized states:\n1. **UNASSIGNED**: Created in project plan without a dedicated assignee.\n2. **ASSIGNED**: Designated to a specific Employee or Intern.\n3. **IN_PROGRESS**: The assignee clicked "Start Work" in their Daily Workstation.\n4. **SUBMITTED**: The assignee completed the work and submitted deliverables with comments/attachments.\n5. **UNDER_REVIEW**: In the Team Leader's review queue.\n6. **REVISION_REQUIRED**: The Team Leader requested updates with specific feedback.\n7. **COMPLETED / APPROVED**: The deliverable met quality criteria and was approved by the Team Leader.`,
        sourceReferences: [
          { title: 'Task Execution & State Transition Standard', type: 'POLICY' },
        ],
      };
    }

    // F. Today's Work Queue
    if (
      qLower.includes('today\'s work') ||
      qLower.includes('todays work') ||
      qLower.includes('daily work queue') ||
      qLower.includes('how does today work') ||
      qLower.includes('daily work')
    ) {
      return {
        responseText: `**Today's Work Daily Queue**:\n\n- **Purpose**: A focused, distraction-free daily workstation for Employees and Interns.\n- **Activation**: Team Leaders schedule tasks for today by toggling the *Today's Work* dispatcher in the project plan.\n- **Action Flow**: Employees see only tasks scheduled for today, click **Start Work** to begin, and **Submit Work** when finished.`,
        sourceReferences: [
          { title: 'Daily Workstation Operating Standard', type: 'GUIDELINE' },
        ],
      };
    }

    // G. LMS Training & Course Completion
    if (
      qLower.includes('how does lms work') ||
      qLower.includes('how does training work') ||
      qLower.includes('how to complete courses') ||
      qLower.includes('lms course player')
    ) {
      return {
        responseText: `**Corporate LMS Academy & Training System**:\n\n- **Course Enrollment**: Staff are enrolled into role-required courses (e.g. *Python & Backend Fundamentals*, *Frontend Design Tokens*).\n- **Module Player**: Supports rich video lessons, documents, and interactive text lessons.\n- **Progress Tracking**: Clicking "Mark Complete" advances your progress meter in real time toward 100% course certification.`,
        sourceReferences: [
          { title: 'Corporate LMS Academy Training Guide', type: 'COURSE' },
        ],
      };
    }

    // H. Document Versioning & Rollback
    if (
      qLower.includes('document version') ||
      qLower.includes('version rollback') ||
      qLower.includes('restore document') ||
      qLower.includes('document history')
    ) {
      return {
        responseText: `**Enterprise Document Versioning & History**:\n\n- **Version Control**: Every document uploaded to Company Resources supports immutable version tracking (e.g. *v1.0, v2.0*).\n- **Change Notes**: Each version records change descriptions, uploader identity, and timestamps.\n- **Rollback Capability**: Authorized administrators can restore any previous document version with one click while preserving complete audit history.`,
        sourceReferences: [
          { title: 'Document Versioning & Content Governance Standard', type: 'POLICY' },
        ],
      };
    }

    // Default friendly assistant response with role context
    return {
      responseText: `Hello! I am your **Corporate Work Assistant**. You can ask me about your assigned tasks, deadlines, team workload, project status, LMS training progress, notifications, roles and responsibilities, or official company policies. How can I help you?`,
      sourceReferences: [],
    };
  }

  getQuickQuestionsForRole(role: UserRole): string[] {
    switch (role) {
      case UserRole.ADMIN:
        return [
          'What is the organization workload?',
          'How many active projects exist?',
          'What is the company leave policy?',
          'Show overdue tasks across organization',
          'Show recent notifications',
        ];
      case UserRole.TEAM_LEADER:
        return [
          'Which employees have high workload?',
          'Show pending reviews for my team',
          'Which tasks are overdue in my team?',
          'What is our project progress?',
          'Show company guidelines',
        ];
      case UserRole.EMPLOYEE:
      case UserRole.INTERN:
      default:
        return [
          'What are my tasks today?',
          'What is my next deadline?',
          'What is my training progress?',
          'What is the company leave policy?',
          'Show my notifications',
        ];
    }
  }
}
