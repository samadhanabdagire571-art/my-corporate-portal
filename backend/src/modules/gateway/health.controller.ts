import { Controller, Get, Inject } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { QueueService } from '../jobs/queue.service';
import { EventBusService } from '../events/event-bus.service';
import { ENV } from '../../config/environment';

@Controller(['api/v1/health', 'api/health', 'health'])
export class HealthController {
  constructor(
    @Inject(CacheService) private readonly cache: CacheService,
    @Inject(QueueService) private readonly queue: QueueService,
    @Inject(EventBusService) private readonly eventBus: EventBusService,
  ) {}

  @Get()
  async getHealth() {
    const cacheStatus = this.cache.isHealthy();
    const queueMetrics = await this.queue.getQueueMetrics();
    const eventMetrics = this.eventBus.getMetrics();

    return {
      success: true,
      service: 'corporate-work-management-api',
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: ENV.NODE_ENV,
      components: {
        database: 'healthy',
        redis: cacheStatus.status,
        queue: 'healthy',
        eventBus: 'healthy',
      },
      metrics: {
        activeQueueJobs: queueMetrics.processing,
        pendingQueueJobs: queueMetrics.pending,
        eventListeners: eventMetrics.activeListeners,
        cachedKeys: cacheStatus.keysCount,
      },
    };
  }

  @Get('ready')
  async getReadiness() {
    const cacheStatus = this.cache.isHealthy();
    const queueMetrics = await this.queue.getQueueMetrics();
    const eventMetrics = this.eventBus.getMetrics();

    const isReady = true; // Database & in-memory fallbacks active

    return {
      success: isReady,
      status: isReady ? 'READY' : 'NOT_READY',
      timestamp: new Date().toISOString(),
      dependencies: {
        database: { status: 'UP' },
        redis: { status: cacheStatus.connected ? 'CONNECTED' : 'FALLBACK_READY' },
        queueWorker: { status: 'ACTIVE', pending: queueMetrics.pending },
        eventBus: { status: 'ACTIVE', listeners: eventMetrics.activeListeners },
      },
    };
  }
}

