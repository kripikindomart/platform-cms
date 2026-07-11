import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { hash, compare } from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RedisService } from '../../core/cache/redis.service';
import { AuditService } from '../../core/audit/audit.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  LoginResponseDto,
  RegisterResponseDto,
  MessageResponseDto,
} from './dto/auth-response.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly bcryptRounds: number;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {
    this.bcryptRounds = 12;
  }

  /**
   * Register new user
   */
  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    // Check if email already exists
    const existingUser = await this.usersService.findByEmail(dto.email);
    
    if (existingUser) {
      throw new BadRequestException({
        code: 'EMAIL_EXISTS',
        message: 'Email sudah terdaftar',
        errors: [{ field: 'email', message: 'Email sudah digunakan' }],
      });
    }

    // Hash password
    const passwordHash = await hash(dto.password, this.bcryptRounds);

    // Create user
    const user = await this.usersService.create({
      email: dto.email,
      password_hash: passwordHash,
      name: dto.name,
      phone: dto.phone,
      is_active: true,
      is_verified: false,
    });

    this.logger.log(`User registered: ${user.email} (ID: ${user.id})`);

    // Audit log
    await this.auditService.logAuth({
      userId: user.id,
      action: 'register',
      email: user.email,
      description: `User ${user.email} registered successfully`,
    });

    return new RegisterResponseDto(user);
  }

  /**
   * Login user
   */
  async login(
    dto: LoginDto,
    ipAddress: string,
    userAgent: string,
    tenantId: number,
  ): Promise<LoginResponseDto> {
    // Find user by email
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      this.logger.warn(`Failed login attempt for email: ${dto.email}`);
      
      // Audit failed login
      // TODO: Fix audit FK constraint issue with tenant schema
      // await this.auditService.logAuth({
      //   action: 'login_failed',
      //   email: dto.email,
      //   ipAddress,
      //   userAgent,
      //   description: `Failed login attempt for ${dto.email}`,
      // });
      
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Email atau password salah',
      });
    }

    // Check if user is active
    if (!user.is_active) {
      throw new UnauthorizedException({
        code: 'USER_INACTIVE',
        message: 'Akun tidak aktif. Hubungi administrator.',
      });
    }

    // Verify password
    const isPasswordValid = await compare(dto.password, user.password_hash);

    if (!isPasswordValid) {
      this.logger.warn(`Failed login attempt for user: ${user.id}`);
      
      // Audit failed login
      // TODO: Fix audit FK constraint issue with tenant schema
      // await this.auditService.logAuth({
      //   userId: user.id,
      //   action: 'login_failed',
      //   email: user.email,
      //   ipAddress,
      //   userAgent,
      //   description: `Failed login attempt - invalid password for ${user.email}`,
      // });
      
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Email atau password salah',
      });
    }

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId,
    };

    const token = this.jwtService.sign(payload);

    // Create session in Redis
    await this.createSession(user.id, token, ipAddress, userAgent);

    // Update last login
    await this.usersService.updateLastLogin(user.id, ipAddress);

    this.logger.log(`User logged in: ${user.email} (ID: ${user.id})`);

    // Audit successful login
    // TODO: Fix audit FK constraint issue with tenant schema
    // await this.auditService.logAuth({
    //   userId: user.id,
    //   action: 'login',
    //   email: user.email,
    //   ipAddress,
    //   userAgent,
    //   description: `User ${user.email} logged in successfully`,
    // });

    return new LoginResponseDto(token, user);
  }

  /**
   * Logout user
   */
  async logout(userId: number, token: string): Promise<MessageResponseDto> {
    // Add token to blacklist
    await this.blacklistToken(token);

    // Delete session
    await this.deleteSession(userId, token);

    this.logger.log(`User logged out: ${userId}`);

    // Audit logout
    await this.auditService.logAuth({
      userId,
      action: 'logout',
      description: `User logged out`,
    });

    return new MessageResponseDto('Logout berhasil');
  }

  /**
   * Change password
   */
  async changePassword(
    userId: number,
    dto: ChangePasswordDto,
  ): Promise<MessageResponseDto> {
    // Get user
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException({
        code: 'USER_NOT_FOUND',
        message: 'User tidak ditemukan',
      });
    }

    // Verify old password
    const isOldPasswordValid = await compare(
      dto.old_password,
      user.password_hash,
    );

    if (!isOldPasswordValid) {
      throw new BadRequestException({
        code: 'INVALID_OLD_PASSWORD',
        message: 'Password lama tidak valid',
      });
    }

    // Hash new password
    const newPasswordHash = await hash(dto.new_password, this.bcryptRounds);

    // Update password
    await this.usersService.updatePassword(userId, newPasswordHash, userId);

    this.logger.log(`Password changed for user: ${userId}`);

    // Audit password change
    await this.auditService.logAuth({
      userId,
      action: 'password_change',
      description: `User changed password`,
    });

    return new MessageResponseDto('Password berhasil diubah');
  }

  /**
   * Verify if token is blacklisted
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklisted = await this.redisService.get(`blacklist:${token}`);
    return blacklisted !== null;
  }

  /**
   * Create session in Redis
   */
  private async createSession(
    userId: number,
    token: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<void> {
    const sessionKey = `session:${userId}:${Date.now()}`;
    const sessionData = {
      userId,
      token,
      ipAddress,
      userAgent,
      createdAt: new Date().toISOString(),
    };

    // Store session with 24h TTL
    await this.redisService.set(
      sessionKey,
      JSON.stringify(sessionData),
      86400,
    );
  }

  /**
   * Delete session from Redis
   */
  private async deleteSession(_userId: number, _token: string): Promise<void> {
    // Note: In production, you might want to store session ID in JWT
    // For now, we'll just blacklist the token
    this.logger.debug(`Session deleted for user: ${_userId}`);
  }

  /**
   * Add token to blacklist
   */
  private async blacklistToken(token: string): Promise<void> {
    // Blacklist token for 24h (same as token expiry)
    await this.redisService.set(`blacklist:${token}`, '1', 86400);
  }
}
