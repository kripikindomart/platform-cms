import { Controller, Get, Inject } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { DRIZZLE_TOKEN } from '../database/drizzle.provider';
import { RedisService } from '../core/cache/redis.service';
import { Public } from '../common/decorators/public.decorator';
import { sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Controller('health')
@SkipThrottle() // No rate limiting on health check
export class HealthController {
  constructor(
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  @Public() // Public route (no JWT required)
  async check() {
    const timestamp = new Date().toISOString();

    // Check database
    let databaseStatus = 'disconnected';
    try {
      await this.db.execute(sql`SELECT 1 as status`);
      databaseStatus = 'connected';
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    // Check Redis
    let redisStatus = 'disconnected';
    try {
      await this.redisService.ping();
      redisStatus = 'connected';
    } catch (error) {
      console.error('Redis health check failed:', error);
    }

    const overallStatus =
      databaseStatus === 'connected' && redisStatus === 'connected'
        ? 'ok'
        : 'degraded';

    return {
      status: overallStatus,
      database: databaseStatus,
      redis: redisStatus,
      timestamp,
      service: 'Platform CMS API',
    };
  }
}
