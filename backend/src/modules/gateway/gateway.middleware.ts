import { Injectable, NestMiddleware, Logger, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ENV } from '../../config/environment';

interface RateLimitTracker {
  count: number;
  resetTime: number;
}

export const GatewayTelemetry = {
  totalRequests: 0,
  totalErrors: 0,
  totalDurationMs: 0,
  slowRequestsCount: 0,
  statusCodes: {
    '2xx': 0,
    '3xx': 0,
    '4xx': 0,
    '5xx': 0,
  },
  getMetrics() {
    const avgResponseTimeMs = this.totalRequests > 0
      ? Math.round(this.totalDurationMs / this.totalRequests)
      : 15;
    return {
      totalRequests: this.totalRequests,
      totalErrors: this.totalErrors,
      avgResponseTimeMs,
      slowRequests: this.slowRequestsCount,
      statusCodes: { ...this.statusCodes },
      status: this.totalErrors > 50 ? 'DEGRADED' : 'HEALTHY',
    };
  },
};

@Injectable()
export class GatewayMiddleware implements NestMiddleware {
  private readonly logger = new Logger('APIGateway');
  private rateLimitMap = new Map<string, RateLimitTracker>();

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    GatewayTelemetry.totalRequests++;

    // 1. Request ID Header
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();
    req.headers['x-request-id'] = requestId;
    res.setHeader('x-request-id', requestId);

    // 2. Security Headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // 3. Rate Limiting Check
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown-client';
    const now = Date.now();
    const windowMs = ENV.RATE_LIMIT_TTL * 1000;
    const maxRequests = ENV.RATE_LIMIT_LIMIT;

    let tracker = this.rateLimitMap.get(clientIp);
    if (!tracker || now > tracker.resetTime) {
      tracker = { count: 1, resetTime: now + windowMs };
      this.rateLimitMap.set(clientIp, tracker);
    } else {
      tracker.count++;
    }

    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - tracker.count).toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(tracker.resetTime / 1000).toString());

    if (tracker.count > maxRequests) {
      GatewayTelemetry.totalErrors++;
      GatewayTelemetry.statusCodes['4xx']++;
      this.logger.warn(`Rate limit exceeded for IP: ${clientIp} on ${req.method} ${req.url}`);
      return res.status(HttpStatus.TOO_MANY_REQUESTS).json({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many requests. Please slow down and try again later.',
        error: 'Too Many Requests',
        requestId,
      });
    }

    // 4. Structured JSON Logging on response finish
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      GatewayTelemetry.totalDurationMs += duration;
      if (duration > 500) {
        GatewayTelemetry.slowRequestsCount++;
      }

      if (statusCode >= 500) {
        GatewayTelemetry.totalErrors++;
        GatewayTelemetry.statusCodes['5xx']++;
      } else if (statusCode >= 400) {
        GatewayTelemetry.totalErrors++;
        GatewayTelemetry.statusCodes['4xx']++;
      } else if (statusCode >= 300) {
        GatewayTelemetry.statusCodes['3xx']++;
      } else {
        GatewayTelemetry.statusCodes['2xx']++;
      }

      // Safe user extraction if available
      const user = (req as any).user;
      const safeUserId = user ? user.userId : 'anonymous';
      const safeRole = user ? user.role : 'public';

      // Log structured JSON
      const logEntry = {
        timestamp: new Date().toISOString(),
        requestId,
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode,
        durationMs: duration,
        userId: safeUserId,
        role: safeRole,
      };

      if (statusCode >= 500) {
        this.logger.error(JSON.stringify(logEntry));
      } else if (statusCode >= 400) {
        this.logger.warn(JSON.stringify(logEntry));
      } else {
        this.logger.log(JSON.stringify(logEntry));
      }
    });

    next();
  }
}
