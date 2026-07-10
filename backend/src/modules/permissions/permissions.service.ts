import { Injectable, BadRequestException } from '@nestjs/common';
import { PermissionsRepository, PermissionWithSlug } from './permissions.repository';

@Injectable()
export class PermissionsService {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  /**
   * Get all permissions
   */
  async findAll(): Promise<PermissionWithSlug[]> {
    return this.permissionsRepository.findAll();
  }

  /**
   * Get permission by ID
   */
  async findById(id: number): Promise<PermissionWithSlug | null> {
    return this.permissionsRepository.findById(id);
  }

  /**
   * Get permission by slug
   */
  async findBySlug(slug: string): Promise<PermissionWithSlug | null> {
    return this.permissionsRepository.findBySlug(slug);
  }

  /**
   * Get permissions by resource
   */
  async findByResource(resource: string): Promise<PermissionWithSlug[]> {
    return this.permissionsRepository.findByResource(resource);
  }

  /**
   * Get user permissions (computed from roles)
   */
  async getUserPermissions(userId: number): Promise<PermissionWithSlug[]> {
    return this.permissionsRepository.getUserPermissions(userId);
  }

  /**
   * Validate permission format
   */
  validatePermissionFormat(slug: string): void {
    if (!this.permissionsRepository.isValidPermissionFormat(slug)) {
      throw new BadRequestException({
        code: 'INVALID_PERMISSION_FORMAT',
        message: 'Format permission tidak valid. Gunakan format: {resource}.{action}',
        errors: [
          {
            field: 'slug',
            message: 'Permission harus dalam format {resource}.{action}, contoh: users.create',
          },
        ],
      });
    }
  }

  /**
   * Check if user has specific permission
   */
  async userHasPermission(userId: number, permissionSlug: string): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return userPermissions.some((p) => p.slug === permissionSlug);
  }

  /**
   * Check if user has any of the permissions
   */
  async userHasAnyPermission(userId: number, permissionSlugs: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    const userPermissionSlugs = new Set(userPermissions.map((p) => p.slug));
    return permissionSlugs.some((slug) => userPermissionSlugs.has(slug));
  }

  /**
   * Check if user has all permissions
   */
  async userHasAllPermissions(userId: number, permissionSlugs: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    const userPermissionSlugs = new Set(userPermissions.map((p) => p.slug));
    return permissionSlugs.every((slug) => userPermissionSlugs.has(slug));
  }
}
