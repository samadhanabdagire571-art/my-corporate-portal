import { Injectable, Inject, Optional, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { PaginationParams, TaskStatus } from '../../common/types';
import { EventBusService } from '../events/event-bus.service';

@Injectable()
export class TasksService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Optional() @Inject(EventBusService) private readonly eventBus?: EventBusService,
  ) { }

  async findAllPaginated(params: PaginationParams) {
    return this.db.findTasksPaginated(params);
  }

  async findOne(id: string) {
    const task = await this.db.findTaskById(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async create(data: any) {
    if (!data.title || !data.projectId) {
      throw new BadRequestException('Task title and projectId are required');
    }
    const created = await this.db.createTask(data);
    if (this.eventBus) {
      await this.eventBus.emit('TaskCreated', {
        taskId: created.id,
        title: created.title,
        projectId: created.projectId,
      });
    }
    return created;
  }

  async bulkCreateTaskPlan(projectId: string, tasks: any[], currentUserId?: string) {
    if (!projectId) {
      throw new BadRequestException('Project ID is required for task plan creation');
    }
    if (!Array.isArray(tasks) || tasks.length === 0) {
      throw new BadRequestException('At least one task must be provided in the task plan');
    }
    const result = await this.db.bulkCreateTaskPlan(projectId, tasks, currentUserId);
    if (this.eventBus) {
      await this.eventBus.emit('TaskPlanCreated', { projectId, taskCount: tasks.length });
    }
    return result;
  }

  async bulkUpload(projectId: string, rows: any[], currentUserId?: string) {
    if (!projectId) {
      throw new BadRequestException('Project ID is required for bulk upload');
    }
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new BadRequestException('No task rows provided for upload');
    }
    return this.db.bulkUploadTasks(projectId, rows, currentUserId);
  }

  async assign(id: string, assignedToId: string, dueDate?: string, currentUserId?: string, reason?: string) {
    const task = await this.db.assignTask(id, assignedToId, dueDate, currentUserId, reason);
    if (!task) {
      throw new NotFoundException(`Task or Employee not found for assignment`);
    }
    if (this.eventBus) {
      const assignedEmp = task.assignedTo ? await this.db.findEmployeeById(task.assignedTo) : null;
      await this.eventBus.emit('TaskAssigned', {
        taskId: task.id,
        taskTitle: task.title,
        assignedToUserId: assignedEmp?.userId,
      });
    }
    return task;
  }

  async reassign(id: string, newEmployeeId: string, reason?: string, currentUserId?: string) {
    const task = await this.db.reassignTask(id, newEmployeeId, reason, currentUserId);
    if (!task) {
      throw new NotFoundException(`Task or Employee not found for reassignment`);
    }
    return task;
  }

  async bulkAssign(taskIds: string[], employeeId: string, dueDate?: string, currentUserId?: string) {
    if (!Array.isArray(taskIds) || taskIds.length === 0 || !employeeId) {
      throw new BadRequestException('Task IDs and Employee ID are required for bulk assignment');
    }
    return this.db.bulkAssignTasks(taskIds, employeeId, dueDate, currentUserId);
  }

  async setDailyWork(id: string, isTodayWork: boolean, dailyWorkDate?: string) {
    const task = await this.db.setDailyWork(id, isTodayWork, dailyWorkDate);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async bulkSetDailyWork(taskIds: string[], isTodayWork: boolean) {
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      throw new BadRequestException('Task IDs are required for bulk daily work dispatch');
    }
    return this.db.bulkSetDailyWork(taskIds, isTodayWork);
  }

  async updateStatus(id: string, status: TaskStatus) {
    const task = await this.db.updateTaskStatus(id, status);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(id: string, updates: any) {
    const updated = await this.db.updateTask(id, updates);
    if (!updated) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.db.deleteTask(id);
    if (!deleted) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return { success: true, message: 'Task deleted successfully' };
  }

  async bulkDelete(taskIds: string[]) {
    const deletedCount = await this.db.bulkDeleteTasks(taskIds);
    return { success: true, deletedCount };
  }

  // ============================================================================
  // PART 3 METHODS
  // ============================================================================

  async startWork(id: string, currentUserId: string) {
    const task = await this.db.startTaskWork(id, currentUserId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async submitWork(
    id: string,
    data: { completionMessage: string; attachmentUrl?: string; attachmentName?: string; comment?: string },
    currentUserId: string
  ) {
    if (!data.completionMessage || !data.completionMessage.trim()) {
      throw new BadRequestException('Completion message is required for submission');
    }
    const task = await this.db.submitTaskWork(id, data, currentUserId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    if (this.eventBus) {
      const submitterEmp = await this.db.findEmployeeByUserId(currentUserId);
      const project = await this.db.findProjectById(task.projectId);
      const leaderEmp = project?.leaderId ? await this.db.findEmployeeById(project.leaderId) : null;
      await this.eventBus.emit('TaskSubmitted', {
        taskId: task.id,
        taskTitle: task.title,
        teamLeaderUserId: leaderEmp?.userId,
        employeeUserId: currentUserId,
        employeeName: submitterEmp?.fullName,
      });
    }
    return task;
  }

  async reviewWork(
    id: string,
    data: { decision: 'APPROVE' | 'REVISION_REQUIRED'; feedback?: string },
    reviewerUserId: string
  ) {
    if (!data.decision || !['APPROVE', 'REVISION_REQUIRED'].includes(data.decision)) {
      throw new BadRequestException('Decision must be either APPROVE or REVISION_REQUIRED');
    }
    const task = await this.db.reviewTaskSubmission(id, data, reviewerUserId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    if (this.eventBus) {
      const eventName = data.decision === 'APPROVE' ? 'TaskApproved' : 'TaskRevisionRequested';
      const assignedEmp = task.assignedTo ? await this.db.findEmployeeById(task.assignedTo) : null;
      await this.eventBus.emit(eventName, {
        taskId: task.id,
        taskTitle: task.title,
        employeeUserId: assignedEmp?.userId,
        feedback: data.feedback,
      });
    }
    return task;
  }

  async findPendingReviews(leaderUserId?: string, params: PaginationParams = {}) {
    return this.db.findPendingReviewTasks(leaderUserId, params);
  }

  async findMyWork(userId: string, params: PaginationParams = {}) {
    const employee = await this.db.findEmployeeByUserId(userId);
    const empId = employee?.id || 'c0000000-0000-0000-0000-000000000010';
    return this.db.findEmployeeTasksPaginated(empId, params);
  }
}
