import { Controller, Get, Inject } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../database/drizzle.provider';
import { sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase,
  ) {}

  @Get()
  async check() {
    try {
      // Test query
      await this.db.execute(sql`SELECT 1 as status`);

      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
        service: 'Platform CMS API',
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        service: 'Platform CMS API',
      };
    }
  }
}
