import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configs } from './config';
import { validateEnv } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './core/cache/redis.module';
import { HealthModule } from './health/health.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
      envFilePath: '.env',
      validate: validateEnv,
    }),
    CommonModule,
    DatabaseModule,
    RedisModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
