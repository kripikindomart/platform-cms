import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { TenantContextService } from '../../../common/context/tenant-context.service';
import { RedisService } from '../../../core/cache/redis.service';
import { User } from '../../../database/schema/tenant/users.schema';

/**
 * JWT payload structure
 */
export interface JwtPayload {
  sub: number; // User ID
  email: string;
  tenantId: number;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly tenantContext: TenantContextService,
    private readonly redisService: RedisService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
      passReqToCallback: true, // Pass request to validate method
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async validate(req: any, payload: JwtPayload): Promise<User> {
    // Extract token from request
    const authHeader = req.headers?.authorization;
    const token = authHeader ? authHeader.replace('Bearer ', '') : '';

    // Check if token is blacklisted
    if (token) {
      const blacklisted = await this.redisService.get(`blacklist:${token}`);
      if (blacklisted) {
        throw new UnauthorizedException({
          code: 'TOKEN_BLACKLISTED',
          message: 'Token tidak valid',
        });
      }
    }

    // Load user from database WITH roles and permissions for CASL
    // Tenant context sudah di-set oleh TenantMiddleware sebelum sampai sini
    const user = await this.usersService.findByIdWithRoles(payload.sub);

    if (!user) {
      throw new UnauthorizedException({
        code: 'USER_NOT_FOUND',
        message: 'User tidak ditemukan',
      });
    }

    if (!user.is_active) {
      throw new UnauthorizedException({
        code: 'USER_INACTIVE',
        message: 'Akun tidak aktif',
      });
    }

    // Return user (will be attached to request.user)
    return user;
  }
}
