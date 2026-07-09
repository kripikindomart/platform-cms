import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Logger } from '@nestjs/common';

export const REDIS_TOKEN = 'REDIS';

export const redisProvider = {
  provide: REDIS_TOKEN,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const logger = new Logger('RedisProvider');

    const client = new Redis({
      host: configService.get<string>('redis.host'),
      port: configService.get<number>('redis.port'),
      password: configService.get<string>('redis.password') || undefined,
      db: configService.get<number>('redis.db'),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        logger.warn(`Redis connection retry attempt ${times}, delay: ${delay}ms`);
        return delay;
      },
      maxRetriesPerRequest: configService.get<number>('redis.maxRetriesPerRequest'),
    });

    // Event handlers
    client.on('connect', () => {
      logger.log('✅ Redis connected successfully');
      logger.log(`🔗 Redis: ${configService.get<string>('redis.host')}:${configService.get<number>('redis.port')}`);
      logger.log(`📊 Database: ${configService.get<number>('redis.db')}`);
    });

    client.on('error', (err) => {
      logger.error(`❌ Redis connection error: ${err.message}`);
    });

    client.on('close', () => {
      logger.warn('⚠️  Redis connection closed');
    });

    client.on('reconnecting', () => {
      logger.log('🔄 Redis reconnecting...');
    });

    // Test connection
    try {
      await client.ping();
      logger.log('✅ Redis PING successful');
    } catch (error) {
      logger.error('❌ Redis PING failed:', error);
      // Don't throw, allow app to start without Redis
      logger.warn('⚠️  Application will start without Redis');
    }

    return client;
  },
};
