import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Inject,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/types';

@Controller(['api/tasks', 'api/v1/tasks'])
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(
    @Inject(TasksService) private readonly tasksService: TasksService,
  ) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.tasksService.findAllPaginated({
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 20,
      search: query.search,
      status: query.status,
      priority: query.priority,
      projectId: query.projectId,
      assignedTo: query.assignedTo,
      unassignedOnly: query.unassignedOnly,
      todayWorkOnly: query.todayWorkOnly,
    });
  }

  @Get('unassigned')
  async findUnassigned(@Query() query: any) {
    return this.tasksService.findAllPaginated({
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 20,
      search: query.search,
      priority: query.priority,
      projectId: query.projectId,
      unassignedOnly: true,
    });
  }

  @Get('today-work')
  async findTodayWork(@Query() query: any) {
    return this.tasksService.findAllPaginated({
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 50,
      search: query.search,
      projectId: query.projectId,
      assignedTo: query.assignedTo,
      todayWorkOnly: true,
    });
  }

  @Get('pending-reviews')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async findPendingReviews(@Query() query: any, @Request() req: any) {
    return this.tasksService.findPendingReviews(req.user?.userId, {
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 20,
      search: query.search,
      status: query.status,
    });
  }

  @Get('my-work')
  async findMyWork(@Query() query: any, @Request() req: any) {
    return this.tasksService.findMyWork(req.user?.userId, {
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 20,
      search: query.search,
      status: query.status,
      priority: query.priority,
      projectId: query.projectId,
      startDate: query.startDate,
      endDate: query.endDate,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  // Employee: Start Work -> IN_PROGRESS
  @Post(':id/start-work')
  async startWork(@Param('id') id: string, @Request() req: any) {
    return this.tasksService.startWork(id, req.user?.userId);
  }

  // Employee: Submit Work -> SUBMITTED
  @Post(':id/submit-work')
  async submitWork(
    @Param('id') id: string,
    @Body() body: { completionMessage: string; attachmentUrl?: string; attachmentName?: string; comment?: string },
    @Request() req: any
  ) {
    return this.tasksService.submitWork(id, body, req.user?.userId);
  }

  // Leader: Review Work -> APPROVE / REVISION_REQUIRED
  @Post(':id/review')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async reviewWork(
    @Param('id') id: string,
    @Body() body: { decision: 'APPROVE' | 'REVISION_REQUIRED'; feedback?: string },
    @Request() req: any
  ) {
    return this.tasksService.reviewWork(id, body, req.user?.userId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async create(@Body() body: any) {
    return this.tasksService.create(body);
  }

  // Create complete project task plan in one operation
  @Post('bulk-plan')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async createBulkTaskPlan(@Body() body: { projectId: string; tasks: any[] }, @Request() req: any) {
    return this.tasksService.bulkCreateTaskPlan(body.projectId, body.tasks, req.user?.userId);
  }

  // Excel / CSV Bulk Upload
  @Post('bulk-upload')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async bulkUpload(@Body() body: { projectId: string; rows: any[] }, @Request() req: any) {
    return this.tasksService.bulkUpload(body.projectId, body.rows, req.user?.userId);
  }

  // Single Task Assignment
  @Patch(':id/assign')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async assignTask(
    @Param('id') id: string,
    @Body() body: { assignedToId: string; dueDate?: string; reason?: string },
    @Request() req: any,
  ) {
    return this.tasksService.assign(id, body.assignedToId, body.dueDate, req.user?.userId, body.reason);
  }

  // Task Reassignment
  @Patch(':id/reassign')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async reassignTask(
    @Param('id') id: string,
    @Body() body: { newEmployeeId: string; reason?: string },
    @Request() req: any,
  ) {
    return this.tasksService.reassign(id, body.newEmployeeId, body.reason, req.user?.userId);
  }

  // Bulk Task Assignment
  @Post('bulk-assign')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async bulkAssign(
    @Body() body: { taskIds: string[]; employeeId: string; dueDate?: string },
    @Request() req: any,
  ) {
    return this.tasksService.bulkAssign(body.taskIds, body.employeeId, body.dueDate, req.user?.userId);
  }

  // Dispatch Daily Work
  @Patch(':id/daily-work')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async setDailyWork(
    @Param('id') id: string,
    @Body() body: { isTodayWork: boolean; dailyWorkDate?: string },
  ) {
    return this.tasksService.setDailyWork(id, body.isTodayWork, body.dailyWorkDate);
  }

  @Post('daily-work/batch')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async bulkSetDailyWork(@Body() body: { taskIds: string[]; isTodayWork: boolean }) {
    return this.tasksService.bulkSetDailyWork(body.taskIds, body.isTodayWork);
  }

  // Status transition (Available to all roles including Employee/Intern)
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: any }) {
    return this.tasksService.updateStatus(id, body.status);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async update(@Param('id') id: string, @Body() body: any) {
    return this.tasksService.update(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }

  @Delete('bulk-delete/batch')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async bulkDelete(@Body() body: { taskIds: string[] }) {
    return this.tasksService.bulkDelete(body.taskIds);
  }
}
