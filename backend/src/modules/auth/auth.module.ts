import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersModule } from '../users/users.module';
import { RedisModule } from '../../core/cache/redis.module';
import { CommonModule } from '../../common/common.module';
import { AuditModule } from '../../core/audit/audit.module';

@Global() // Make this module global so JwtStrategy is available everywhere
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '24h',
          algorithm: 'HS256',
        },
      }),
      inject: [ConfigService],
      global: true, // Make JwtModule available globally
    }),
    UsersModule,
    RedisModule,
    CommonModule,
    AuditModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard, JwtStrategy, PassportModule],
})
export class AuthModule {}
