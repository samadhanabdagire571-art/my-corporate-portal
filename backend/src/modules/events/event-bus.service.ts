import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CacheService } from '../cache/cache.service';

export interface BaseEvent<T = any> {
  type: string;
  payload: T;
  timestamp: string;
  triggeredBy?: string;
}

export type EventHandler<T = any> = (event: BaseEvent<T>) => Promise<void> | void;

@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);
  private handlers = new Map<string, EventHandler[]>();
  private eventHistoryCount = 0;

  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(CacheService) private readonly cache: CacheService,
  ) {
    this.registerDefaultSystemHandlers();
  }

  /**
   * Subscribe a handler to a specific event type
   */
  on<T = any>(eventType: string, handler: EventHandler<T>): void {
    const list = this.handlers.get(eventType) || [];
    list.push(handler);
    this.handlers.set(eventType, list);
  }

  /**
   * Dispatch an event across the application
   */
  async emit<T = any>(eventType: string, payload: T, triggeredBy?: string): Promise<void> {
    const event: BaseEvent<T> = {
      type: eventType,
      payload,
      timestamp: new Date().toISOString(),
      triggeredBy,
    };

    this.eventHistoryCount++;
    this.logger.debug(`[EventBus] Dispatched event "${eventType}"`);

    const handlers = this.handlers.get(eventType) || [];
    const wildcardHandlers = this.handlers.get('*') || [];

    const allHandlers = [...handlers, ...wildcardHandlers];

    // Execute asynchronously without blocking
    Promise.allSettled(allHandlers.map((h) => Promise.resolve(h(event)))).catch((err) => {
      this.logger.warn(`Error in event listeners for "${eventType}": ${err.message}`);
    });
  }

  getMetrics() {
    return {
      activeListeners: Array.from(this.handlers.values()).reduce((sum, h) => sum + h.length, 0),
      totalEventsEmitted: this.eventHistoryCount,
      registeredEventTypes: Array.from(this.handlers.keys()),
    };
  }

  private registerDefaultSystemHandlers() {
    // 1. Task Lifecycle Cache Invalidation
    this.on('TaskCreated', async (event) => {
      await this.cache.delPattern('project:*');
      await this.cache.delPattern('dashboard:*');
      await this.cache.delPattern('workload:*');
    });

    this.on('TaskAssigned', async (event) => {
      await this.cache.delPattern('dashboard:*');
      await this.cache.delPattern('workload:*');
      
      const { taskId, taskTitle, assignedToUserId } = event.payload;
      if (assignedToUserId) {
        await this.db.createNotification({
          organizationId: 'a0000000-0000-0000-0000-000000000001',
          userId: assignedToUserId,
          title: 'New Task Assigned',
          message: `You have been assigned to task: "${taskTitle}"`,
          type: 'TASK_ASSIGNED',
          link: `/employee/daily-work`,
          isRead: false,
        });
      }
    });

    this.on('TaskSubmitted', async (event) => {
      await this.cache.delPattern('dashboard:*');
      await this.cache.delPattern('workload:*');

      const { taskId, taskTitle, teamLeaderUserId, employeeName } = event.payload;
      if (teamLeaderUserId) {
        await this.db.createNotification({
          organizationId: 'a0000000-0000-0000-0000-000000000001',
          userId: teamLeaderUserId,
          title: 'Work Submitted for Review',
          message: `${employeeName || 'An employee'} submitted work for review on task: "${taskTitle}"`,
          type: 'WORK_SUBMITTED',
          link: `/leader/submissions`,
          isRead: false,
        });
      }
    });

    this.on('TaskApproved', async (event) => {
      await this.cache.delPattern('dashboard:*');
      await this.cache.delPattern('workload:*');

      const { taskId, taskTitle, employeeUserId } = event.payload;
      if (employeeUserId) {
        await this.db.createNotification({
          organizationId: 'a0000000-0000-0000-0000-000000000001',
          userId: employeeUserId,
          title: 'Task Submission Approved',
          message: `Congratulations! Your submission for "${taskTitle}" has been approved.`,
          type: 'WORK_APPROVED',
          link: `/employee/work-history`,
          isRead: false,
        });
      }
    });

    this.on('TaskRevisionRequested', async (event) => {
      await this.cache.delPattern('dashboard:*');
      await this.cache.delPattern('workload:*');

      const { taskId, taskTitle, employeeUserId, feedback } = event.payload;
      if (employeeUserId) {
        await this.db.createNotification({
          organizationId: 'a0000000-0000-0000-0000-000000000001',
          userId: employeeUserId,
          title: 'Revision Requested on Task',
          message: `A revision has been requested for "${taskTitle}". Feedback: ${feedback || 'Please check task details.'}`,
          type: 'REVISION_REQUESTED',
          link: `/employee/daily-work`,
          isRead: false,
        });
      }
    });

    // 2. Announcements & Resources Cache Invalidation
    this.on('AnnouncementPublished', async () => {
      await this.cache.delPattern('announcements:*');
      await this.cache.delPattern('dashboard:*');
    });

    this.on('ResourcePublished', async () => {
      await this.cache.delPattern('resources:*');
    });
  }
}
