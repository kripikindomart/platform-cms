import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { RolesRepository, Role } from './roles.repository';
import { PermissionsRepository } from '@/modules/permissions/permissions.repository';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';

@Injectable()
export class RolesService {
  constructor(
    private readonly rolesRepository: RolesRepository,
    private readonly permissionsRepository: PermissionsRepository,
  ) {}

  /**
   * Create new role
   */
  async create(dto: CreateRoleDto, userId: number): Promise<Role> {
    // Check if name (slug) already exists
    const existing = await this.rolesRepository.findBySlug(dto.name);
    if (existing) {
      throw new ConflictException({
        code: 'ROLE_NAME_EXISTS',
        message: 'Nama role sudah digunakan',
        errors: [{ field: 'name', message: 'Nama sudah digunakan' }],
      });
    }

    // Create role
    const role = await this.rolesRepository.create({
      name: dto.name,
      display_name: dto.display_name,
      description: dto.description || null,
      is_system: dto.is_system || false,
      is_active: true,
      created_by: userId,
      created_at: new Date(),
      updated_at: new Date(),
      updated_by: null,
      deleted_at: null,
      deleted_by: null,
    });

    return role;
  }

  /**
   * Get all roles
   */
  async findAll(): Promise<Role[]> {
    return this.rolesRepository.findAll();
  }

  /**
   * Get all roles with permissions
   */
  async findAllWithPermissions(): Promise<Role[]> {
    return this.rolesRepository.findAllWithPermissions();
  }

  /**
   * Get role by ID
   */
  async findById(id: number): Promise<Role> {
    const role = await this.rolesRepository.findById(id);

    if (!role) {
      throw new NotFoundException({
        code: 'ROLE_NOT_FOUND',
        message: 'Role tidak ditemukan',
      });
    }

    return role;
  }

  /**
   * Get role by ID with permissions
   */
  async findByIdWithPermissions(id: number): Promise<Role> {
    const role = await this.rolesRepository.findByIdWithPermissions(id);

    if (!role) {
      throw new NotFoundException({
        code: 'ROLE_NOT_FOUND',
        message: 'Role tidak ditemukan',
      });
    }

    return role;
  }

  /**
   * Get role by slug
   */
  async findBySlug(slug: string): Promise<Role> {
    const role = await this.rolesRepository.findBySlug(slug);

    if (!role) {
      throw new NotFoundException({
        code: 'ROLE_NOT_FOUND',
        message: 'Role tidak ditemukan',
      });
    }

    return role;
  }

  /**
   * Update role
   */
  async update(id: number, dto: UpdateRoleDto, userId: number): Promise<Role> {
    const role = await this.findById(id);

    // Prevent updating system roles
    if (role.is_system) {
      throw new BadRequestException({
        code: 'CANNOT_UPDATE_SYSTEM_ROLE',
        message: 'Role sistem tidak dapat diubah',
      });
    }

    const updated = await this.rolesRepository.update(
      id,
      {
        ...dto,
        updated_by: userId,
        updated_at: new Date(),
      },
      userId,
    );

    return updated;
  }

  /**
   * Soft delete role
   */
  async remove(id: number, userId: number): Promise<void> {
    const role = await this.findById(id);

    // Prevent deleting system roles
    if (role.is_system) {
      throw new BadRequestException({
        code: 'CANNOT_DELETE_SYSTEM_ROLE',
        message: 'Role sistem tidak dapat dihapus',
      });
    }

    await this.rolesRepository.softDelete(id, userId);
  }

  /**
   * Assign permissions to role
   */
  async assignPermissions(roleId: number, dto: AssignPermissionsDto, userId: number): Promise<number> {
    // Verify role exists
    await this.findById(roleId);

    // Verify all permissions exist
    const permissions = await this.permissionsRepository.findByIds(dto.permission_ids);

    if (permissions.length !== dto.permission_ids.length) {
      const foundIds = new Set(permissions.map((p) => p.id));
      const missingIds = dto.permission_ids.filter((id) => !foundIds.has(id));

      throw new NotFoundException({
        code: 'PERMISSIONS_NOT_FOUND',
        message: 'Beberapa permission tidak ditemukan',
        errors: [
          {
            field: 'permission_ids',
            message: `Permission ID tidak ditemukan: ${missingIds.join(', ')}`,
          },
        ],
      });
    }

    // Assign permissions
    const assignedCount = await this.rolesRepository.assignPermissions(roleId, dto.permission_ids, userId);

    return assignedCount;
  }

  /**
   * Remove permission from role
   */
  async removePermission(roleId: number, permissionId: number): Promise<void> {
    // Verify role exists
    await this.findById(roleId);

    // Verify permission exists
    const permission = await this.permissionsRepository.findById(permissionId);
    if (!permission) {
      throw new NotFoundException({
        code: 'PERMISSION_NOT_FOUND',
        message: 'Permission tidak ditemukan',
      });
    }

    // Remove permission
    const removed = await this.rolesRepository.removePermission(roleId, permissionId);

    if (!removed) {
      throw new NotFoundException({
        code: 'ROLE_PERMISSION_NOT_FOUND',
        message: 'Role tidak memiliki permission ini',
      });
    }
  }

  /**
   * Get user roles with permissions (for CASL)
   */
  async getUserRolesWithPermissions(userId: number): Promise<Role[]> {
    return this.rolesRepository.getUserRolesWithPermissions(userId);
  }
}
