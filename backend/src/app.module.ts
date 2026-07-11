import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
import { CliMetadataModule } from './core/cli-metadata/cli-metadata.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TagsModule } from './modules/tags/tags.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { PassportModule } from '@nestjs/passport';
import { ProductsModule } from './modules/products/products.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
      envFilePath: '.env',
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 900000, // 15 minutes in milliseconds
        limit: 100, // 100 requests per 15 minutes
      },
    ]),
    // Make PassportModule available globally
    PassportModule.register({ defaultStrategy: 'jwt' }),
    CommonModule,
    DatabaseModule,
    RedisModule,
    HealthModule,
    TenantsModule,
    UsersModule,
    AuthModule, // AuthModule must be imported AFTER UsersModule
    CaslModule,
    PermissionsModule,
    RolesModule,
    CliMetadataModule,
    CategoriesModule,
    TagsModule,
    ProductsModule
  ],
  controllers: [],
  providers: [
    // Global Throttler Guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global JWT Auth Guard (applied to all routes unless @Public())
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        // Public routes yang tidak butuh tenant
        { path: 'api/auth/login', method: RequestMethod.POST },
        { path: 'api/auth/register', method: RequestMethod.POST },
        { path: 'api/health', method: RequestMethod.GET },
        { path: 'api-docs', method: RequestMethod.ALL },
        { path: 'api-docs/(.*)', method: RequestMethod.ALL },
      )
      .forRoutes('*'); // Apply to all other routes
  }
}
