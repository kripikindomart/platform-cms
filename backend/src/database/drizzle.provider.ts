import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

export const DRIZZLE_TOKEN = 'DRIZZLE';

export const drizzleProvider = {
  provide: DRIZZLE_TOKEN,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const logger = new Logger('DatabaseProvider');

    const pool = new Pool({
      host: configService.get<string>('database.host'),
      port: configService.get<number>('database.port'),
      database: configService.get<string>('database.database'),
      user: configService.get<string>('database.user'),
      password: configService.get<string>('database.password'),
      ssl: configService.get<boolean>('database.ssl')
        ? { rejectUnauthorized: false }
        : false,
      max: configService.get<number>('database.maxConnections'),
      idleTimeoutMillis: configService.get<number>('database.idleTimeoutMillis'),
      connectionTimeoutMillis: configService.get<number>('database.connectionTimeoutMillis'),
    });

    // Test connection
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      logger.log('✅ Database connected successfully');
      logger.log(`📊 Database: ${configService.get<string>('database.database')}`);
      logger.log(`🏠 Host: ${configService.get<string>('database.host')}:${configService.get<number>('database.port')}`);
      client.release();
    } catch (error) {
      logger.error('❌ Database connection failed:', error);
      throw error;
    }

    // Handle pool errors
    pool.on('error', (err) => {
      logger.error('Unexpected database error:', err);
    });

    return drizzle(pool);
  },
};
