import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
  Scope,
} from '@nestjs/common';
import { CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';
import { UsersService } from '@/modules/users/users.service';
import { RedisService } from '@/core/cache/redis.service';

/**
 * Custom JWT Authentication Guard
 * Does NOT use Passport - implements JWT verification directly
 * This avoids "Unknown authentication strategy" issues
 * 
 * REQUEST-scoped to work with tenant context
 */
@Injectable({ scope: Scope.REQUEST })
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private usersService: UsersService,
    private redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException({
        code: 'NO_TOKEN',
        message: 'Token tidak ditemukan',
      });
    }

    try {
      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // Check if token is blacklisted
      const blacklisted = await this.redisService.get(`blacklist:${token}`);
      if (blacklisted) {
        throw new UnauthorizedException({
          code: 'TOKEN_BLACKLISTED',
          message: 'Token tidak valid',
        });
      }

      // Check if this is a tenant-free endpoint
      const skipRoleLoading = this.shouldSkipRoleLoading(request);

      let user: any;

      if (skipRoleLoading) {
        // For /users/me and /users/me/preferences - load basic user info only
        // No tenant context needed, no roles needed
        user = await this.usersService.findById(payload.sub);
      } else {
        // For all other endpoints - load full user with roles and permissions for CASL
        // Tenant context must be set by TenantGuard before this
        user = await this.usersService.findByIdWithRoles(payload.sub);
      }

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

      // Attach full user to request
      (request as any)['user'] = user;

      // Store token in request for logout/blacklist checks
      (request as any)['token'] = token;

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`JWT verification failed: ${errorMessage}`);
      throw new UnauthorizedException({
        code: 'INVALID_TOKEN',
        message: 'Token tidak valid atau sudah kadaluarsa',
      });
    }
  }

  /**
   * Check if we should skip role loading for this endpoint
   * These endpoints don't need tenant context or roles
   */
  private shouldSkipRoleLoading(request: Request): boolean {
    const skipRoutes = [
      '/api/users/me',
      '/api/users/me/preferences',
      '/users/me',
      '/users/me/preferences',
    ];

    return skipRoutes.some(route => 
      request.url === route || 
      request.path === route ||
      request.url.startsWith(route) || 
      request.path.startsWith(route)
    );
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
