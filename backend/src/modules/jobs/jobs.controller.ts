import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Inject,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { QueueService } from './queue.service';
import { DatabaseService } from '../../database/database.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, JobStatus, JobType } from '../../common/types';

@Controller(['api/jobs', 'api/v1/jobs'])
@UseGuards(JwtAuthGuard, RolesGuard)
export class JobsController {
  constructor(
    @Inject(QueueService) private readonly queueService: QueueService,
    @Inject(DatabaseService) private readonly db: DatabaseService,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async listJobs(
    @Query('status') status?: JobStatus,
    @Query('type') type?: JobType,
    @Query('limit') limit?: string,
  ) {
    const jobs = await this.db.findBackgroundJobs({
      status,
      type,
      limit: limit ? parseInt(limit, 10) : 50,
    });
    const metrics = await this.queueService.getQueueMetrics();
    return {
      jobs,
      metrics,
    };
  }

  @Get('metrics')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async getMetrics() {
    return this.queueService.getQueueMetrics();
  }

  @Get(':id')
  async getJobById(@Param('id') id: string) {
    const job = await this.db.findBackgroundJobById(id);
    if (!job) throw new NotFoundException(`Job with ID ${id} not found`);
    return job;
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async createJob(@Body() body: { type: JobType; payload: any; maxRetries?: number }, @Request() req: any) {
    return this.queueService.addJob(body.type, body.payload, req.user?.userId, body.maxRetries);
  }

  @Post(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async cancelJob(@Param('id') id: string) {
    const cancelled = await this.db.cancelBackgroundJob(id);
    if (!cancelled) throw new NotFoundException(`Job with ID ${id} not found`);
    return { success: true, job: cancelled };
  }

  @Post(':id/retry')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async retryJob(@Param('id') id: string) {
    const job = await this.db.findBackgroundJobById(id);
    if (!job) throw new NotFoundException(`Job with ID ${id} not found`);
    
    await this.db.updateBackgroundJob(id, {
      status: JobStatus.PENDING,
      retryCount: 0,
      errorMessage: undefined,
      progress: 0,
    });

    setImmediate(() => this.queueService.processNextJob());
    return { success: true, message: `Job ${id} re-enqueued for processing.` };
  }
}
