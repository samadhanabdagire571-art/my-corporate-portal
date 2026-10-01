import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { TeamLeadersModule } from './modules/team-leaders/team-leaders.module';
import { TeamsModule } from './modules/teams/teams.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { TaskTemplatesModule } from './modules/templates/templates.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CmsModule } from './modules/cms/cms.module';
import { LmsModule } from './modules/lms/lms.module';
import { UploadModule } from './modules/upload/upload.module';
import { AuditModule } from './modules/audit/audit.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SearchModule } from './modules/search/search.module';
import { SettingsModule } from './modules/settings/settings.module';
import { DocsModule } from './modules/docs/docs.module';
import { CacheModule } from './modules/cache/cache.module';
import { EventsModule } from './modules/events/events.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { WorkloadModule } from './modules/workload/workload.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { ChatModule } from './modules/chat/chat.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';

@Module({
  imports: [
    DatabaseModule,
    CacheModule,
    EventsModule,
    JobsModule,
    GatewayModule,
    AuthModule,
    EmployeesModule,
    TeamLeadersModule,
    TeamsModule,
    ProjectsModule,
    TasksModule,
    TaskTemplatesModule,
    DashboardModule,
    NotificationsModule,
    CmsModule,
    LmsModule,
    UploadModule,
    AuditModule,
    ReportsModule,
    SearchModule,
    SettingsModule,
    DocsModule,
    WorkloadModule,
    DocumentsModule,
    ChatModule,
    MonitoringModule,
  ],
})
export class AppModule {}


