import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configs } from './config';
import { validateEnv } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './core/cache/redis.module';
import { HealthModule } from './health/health.module';
import { CommonModule } from './common/common.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CaslModule } from './core/casl/casl.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RolesModule } from './modules/roles/roles.module';

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
    TenantsModule,
    UsersModule,
    AuthModule,
    CaslModule,
    PermissionsModule,
    RolesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
