import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CaslGuard } from '@/core/casl/casl.guard';
import { CheckPolicies } from '@/common/decorators/check-policies.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { AppAbility } from '@/core/casl/casl-ability.factory';
import { CreateRoleDto, createRoleSchema } from './dto/create-role.dto';
import { UpdateRoleDto, updateRoleSchema } from './dto/update-role.dto';
import { AssignPermissionsDto, assignPermissionsSchema } from './dto/assign-permissions.dto';
import {
  RoleResponseDto,
  RoleWithPermissionsResponseDto,
  AssignPermissionsResponseDto,
  RemovePermissionResponseDto,
} from './dto/role-response.dto';

interface UserPayload {
  id: number;
  email: string;
}

@Controller('roles')
@UseGuards(JwtAuthGuard, CaslGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @CheckPolicies((ability: AppAbility) => ability.can('create', 'roles'))
  async create(@Body(new ZodValidationPipe(createRoleSchema)) dto: CreateRoleDto, @CurrentUser() user: UserPayload) {
    const role = await this.rolesService.create(dto, user.id);
    return new RoleResponseDto(role);
  }

  @Get()
  @CheckPolicies((ability: AppAbility) => ability.can('read', 'roles'))
  async findAll() {
    const roles = await this.rolesService.findAll();
    return roles.map((role) => new RoleResponseDto(role));
  }

  @Get('with-permissions')
  @CheckPolicies((ability: AppAbility) => ability.can('read', 'roles'))
  async findAllWithPermissions() {
    const roles = await this.rolesService.findAllWithPermissions();
    return roles.map((role) => new RoleWithPermissionsResponseDto(role));
  }

  @Get(':id')
  @CheckPolicies((ability: AppAbility) => ability.can('read', 'roles'))
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const role = await this.rolesService.findByIdWithPermissions(id);
    return new RoleWithPermissionsResponseDto(role);
  }

  @Patch(':id')
  @CheckPolicies((ability: AppAbility) => ability.can('update', 'roles'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateRoleSchema)) dto: UpdateRoleDto,
    @CurrentUser() user: UserPayload,
  ) {
    const role = await this.rolesService.update(id, dto, user.id);
    return new RoleResponseDto(role);
  }

  @Delete(':id')
  @CheckPolicies((ability: AppAbility) => ability.can('delete', 'roles'))
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserPayload) {
    await this.rolesService.remove(id, user.id);
    return {
      message: 'Role berhasil dihapus',
    };
  }

  @Post(':id/permissions')
  @CheckPolicies((ability: AppAbility) => ability.can('update', 'roles'))
  async assignPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(assignPermissionsSchema)) dto: AssignPermissionsDto,
    @CurrentUser() user: UserPayload,
  ) {
    const assignedCount = await this.rolesService.assignPermissions(id, dto, user.id);
    return new AssignPermissionsResponseDto(id, assignedCount);
  }

  @Delete(':id/permissions/:permissionId')
  @CheckPolicies((ability: AppAbility) => ability.can('update', 'roles'))
  async removePermission(@Param('id', ParseIntPipe) id: number, @Param('permissionId', ParseIntPipe) permissionId: number) {
    await this.rolesService.removePermission(id, permissionId);
    return new RemovePermissionResponseDto(id, permissionId);
  }
}
