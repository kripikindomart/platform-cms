import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

/**
 * Custom JWT Authentication Guard
 * Does NOT use Passport - implements JWT verification directly
 * This avoids "Unknown authentication strategy" issues
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
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

      // Attach user payload to request
      // Note: Full user with roles will be loaded by individual services if needed
      (request as any)['user'] = {
        id: payload.sub,
        email: payload.email,
        tenantId: payload.tenantId,
      };

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

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
