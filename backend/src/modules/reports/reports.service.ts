import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ReportsService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
  ) {}

  async getOrganizationReport() {
    return this.db.getOrganizationReport();
  }

  async getWorkReport() {
    return this.db.getWorkReport();
  }

  async getProjectsReport() {
    return this.db.getProjectsReport();
  }

  async getEmployeesReport() {
    return this.db.getEmployeesReport();
  }

  async exportReportData(reportType: string, format: 'csv' | 'xlsx' = 'csv') {
    const type = (reportType || '').toLowerCase();

    if (type === 'organization') {
      const org = await this.db.getOrganizationReport();
      if (format === 'csv') {
        const rows = [
          ['Metric', 'Value'],
          ['Total Employees', org.totalEmployees],
          ['Active Employees', org.activeEmployees],
          ['Interns Count', org.internsCount],
          ['Total Teams', org.totalTeams],
          ['Total Leaders', org.totalLeaders],
          ['Active Projects', org.activeProjects],
          ['', ''],
          ['Department', 'Staff Count'],
          ...org.departmentBreakdown.map((d) => [d.department, d.count]),
        ];
        return {
          filename: `organization_report_${new Date().toISOString().split('T')[0]}.csv`,
          mimeType: 'text/csv',
          content: rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n'),
        };
      }
    }

    if (type === 'work') {
      const work = await this.db.getWorkReport();
      const rows = [
        ['Metric', 'Value'],
        ['Total Deliverables', work.totalTasks],
        ['Completed Deliverables', work.completed],
        ['Pending Deliverables', work.pending],
        ['In Progress Deliverables', work.inProgress],
        ['Overdue Deliverables', work.overdue],
        ['Revision Required', work.revisionRequired],
        ['Under Review / Submitted', work.submitted],
        ['Overall Completion Rate (%)', `${work.completionRate}%`],
      ];
      return {
        filename: `work_report_${new Date().toISOString().split('T')[0]}.csv`,
        mimeType: 'text/csv',
        content: rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n'),
      };
    }

    if (type === 'projects' || type === 'project') {
      const projects = await this.db.getProjectsReport();
      const headers = ['Project Code', 'Project Name', 'Department', 'Assigned Team', 'Team Leader', 'Status', 'Total Tasks', 'Completed', 'Pending', 'Progress (%)', 'Overdue Tasks'];
      const rows = projects.map((p) => [
        p.projectCode,
        p.projectName,
        p.department,
        p.teamName,
        p.leaderName,
        p.status,
        p.totalTasks,
        p.completedTasks,
        p.pendingTasks,
        `${p.progressPercentage}%`,
        p.overdueTasks,
      ]);
      return {
        filename: `projects_report_${new Date().toISOString().split('T')[0]}.csv`,
        mimeType: 'text/csv',
        content: [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n'),
      };
    }

    if (type === 'employees' || type === 'employee') {
      const employees = await this.db.getEmployeesReport();
      const headers = ['Employee ID', 'Full Name', 'Email', 'Department', 'Designation', 'Assigned Tasks', 'Completed Tasks', 'In Progress Tasks', 'Pending Tasks', 'Completion Rate (%)', 'Revisions'];
      const rows = employees.map((e) => [
        e.employeeId,
        e.fullName,
        e.email,
        e.department,
        e.designation,
        e.assignedTasks,
        e.completedTasks,
        e.inProgressTasks,
        e.pendingTasks,
        `${e.completionRate}%`,
        e.revisionCount,
      ]);
      return {
        filename: `employees_report_${new Date().toISOString().split('T')[0]}.csv`,
        mimeType: 'text/csv',
        content: [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n'),
      };
    }

    throw new BadRequestException(`Unknown report type: ${reportType}. Supported: organization, work, projects, employees`);
  }
}
