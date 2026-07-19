import {
  Controller,
  Post,
  Patch,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, registerSchema } from './dto/register.dto';
import { LoginDto, loginSchema } from './dto/login.dto';
import {
  ChangePasswordDto,
  changePasswordSchema,
} from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/schema/public/users.schema';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { TenantContextService } from '../../common/context/tenant-context.service';

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Register new user
   * POST /api/auth/register
   * Rate limit: 5 requests per hour
   */
  @Post('register')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 requests per hour
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(new ZodValidationPipe(registerSchema)) dto: RegisterDto,
  ) {
    // Set tenant context (hardcoded for now, should come from subdomain/header)
    this.tenantContext.setTenant({
      id: 1,
      slug: 'tenant_1',
      name: 'Default Tenant',
      schemaName: 'tenant_1',
    });

    return this.authService.register(dto);
  }

  /**
   * Login user
   * POST /api/auth/login
   * Rate limit: 10 requests per minute
   * 
   * Login without tenant selection - user chooses tenant after authentication
   */
  @Post('login')
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) dto: LoginDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    return this.authService.login(dto, ipAddress, userAgent);
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: User, @Req() req: Request) {
    const token = req.get('authorization')?.replace('Bearer ', '') || '';
    return this.authService.logout(user.id, token);
  }

  /**
   * Change password
   * PATCH /api/auth/change-password
   */
  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(changePasswordSchema))
    dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, dto);
  }
}
