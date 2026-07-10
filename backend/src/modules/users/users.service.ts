import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { RolesRepository } from '../roles/roles.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '../../database/schema/tenant/users.schema';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rolesRepository: RolesRepository,
  ) {}

  /**
   * Create new user
   */
  async create(dto: CreateUserDto, createdBy?: number): Promise<User> {
    return this.usersRepository.create(dto, createdBy);
  }

  /**
   * Find user by ID
   */
  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  /**
   * Find user by ID with roles and permissions (for CASL)
   */
  async findByIdWithRoles(id: number): Promise<User | null> {
    const user = await this.usersRepository.findById(id);
    
    if (!user) {
      return null;
    }

    // Load user roles with permissions
    const roles = await this.rolesRepository.getUserRolesWithPermissions(id);
    
    // Attach roles to user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (user as any).roles = roles;

    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  /**
   * Update last login information
   */
  async updateLastLogin(userId: number, ipAddress: string): Promise<void> {
    await this.usersRepository.updateLastLogin(userId, ipAddress);
  }

  /**
   * Update user password
   */
  async updatePassword(
    userId: number,
    passwordHash: string,
    updatedBy: number,
  ): Promise<void> {
    const user = await this.findById(userId);
    
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User tidak ditemukan',
      });
    }

    await this.usersRepository.updatePassword(userId, passwordHash, updatedBy);
  }

  /**
   * Check if user exists by email
   */
  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }
}
