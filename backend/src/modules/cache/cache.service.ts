import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ENV } from '../../config/environment';

interface CacheEntry<T> {
  value: T;
  expiresAt: number | null; // null = never expires
}

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private memoryStore = new Map<string, CacheEntry<any>>();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isRedisConnected = false;

  private hitsCount = 0;
  private missesCount = 0;

  async onModuleInit() {
    if (ENV.REDIS_URL) {
      this.logger.log(`Configured REDIS_URL detected. Initializing cache with graceful fallback resilience.`);
      this.isRedisConnected = false; 
    } else {
      this.logger.log('Running high-performance resilient in-memory Cache layer.');
    }

    // Run garbage collection every 60 seconds for expired keys
    this.cleanupInterval = setInterval(() => {
      this.evictExpiredKeys();
    }, 60000);
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  /**
   * Get cached item by key
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const entry = this.memoryStore.get(key);
      if (!entry) {
        this.missesCount++;
        return null;
      }

      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        this.memoryStore.delete(key);
        this.missesCount++;
        return null;
      }

      this.hitsCount++;
      return entry.value as T;
    } catch (err) {
      this.logger.warn(`Cache get failed for key: ${key}. Gracefully returning null.`);
      this.missesCount++;
      return null;
    }
  }

  /**
   * Set cached item with TTL in seconds
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
      this.memoryStore.set(key, { value, expiresAt });
    } catch (err) {
      this.logger.warn(`Cache set failed for key: ${key}. Continuing without cache.`);
    }
  }

  /**
   * Check if a key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    const item = await this.get(key);
    return item !== null;
  }

  /**
   * Get an item or compute and cache it if not present
   */
  async getOrSet<T>(key: string, factoryFn: () => Promise<T>, ttlSeconds = 120): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await factoryFn();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }

  /**
   * Delete specific key
   */
  async del(key: string): Promise<void> {
    try {
      this.memoryStore.delete(key);
    } catch (err) {
      this.logger.warn(`Cache del failed for key: ${key}`);
    }
  }

  /**
   * Alias for del
   */
  async delete(key: string): Promise<void> {
    return this.del(key);
  }

  /**
   * Delete keys matching a prefix or wildcard pattern (e.g., "project:*" or "dashboard:123:*")
   */
  async delPattern(pattern: string): Promise<number> {
    try {
      let count = 0;
      const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      for (const key of this.memoryStore.keys()) {
        if (regexPattern.test(key)) {
          this.memoryStore.delete(key);
          count++;
        }
      }
      return count;
    } catch (err) {
      this.logger.warn(`Cache delPattern failed for pattern: ${pattern}`);
      return 0;
    }
  }

  /**
   * Alias for delPattern
   */
  async deletePattern(pattern: string): Promise<number> {
    return this.delPattern(pattern);
  }

  /**
   * Flush all cache entries
   */
  async flushAll(): Promise<void> {
    this.memoryStore.clear();
  }

  /**
   * Health status check & telemetry
   */
  isHealthy(): {
    status: 'healthy' | 'fallback_in_memory';
    connected: boolean;
    keysCount: number;
    hits: number;
    misses: number;
    hitRatio: string;
  } {
    const total = this.hitsCount + this.missesCount;
    const ratio = total > 0 ? `${Math.round((this.hitsCount / total) * 100)}%` : '100%';
    return {
      status: this.isRedisConnected ? 'healthy' : 'fallback_in_memory',
      connected: this.isRedisConnected,
      keysCount: this.memoryStore.size,
      hits: this.hitsCount,
      misses: this.missesCount,
      hitRatio: ratio,
    };
  }

  private evictExpiredKeys() {
    const now = Date.now();
    for (const [key, entry] of this.memoryStore.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.memoryStore.delete(key);
      }
    }
  }
}
