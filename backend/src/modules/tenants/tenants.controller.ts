import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  ConflictException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { QueryTenantDto } from './dto/query-tenant.dto';
import { TenantResponseDto } from './dto/tenant-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CaslGuard } from '../../core/casl/casl.guard';
import { CheckPolicies } from '../../common/decorators/check-policies.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard, CaslGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current tenant information' })
  @ApiResponse({ status: 200, description: 'Current tenant info', type: TenantResponseDto })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async getCurrentTenant(@CurrentUser() user: any): Promise<{ tenant: TenantResponseDto }> {
    const tenant = await this.tenantsService.findById(user.tenantId);
    return { tenant };
  }

  @Get('by-slug/:slug')
  @ApiOperation({ summary: 'Get tenant by slug' })
  @ApiResponse({ status: 200, description: 'Tenant found', type: TenantResponseDto })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async findBySlug(@Param('slug') slug: string): Promise<TenantResponseDto> {
    const tenant = await this.tenantsService.findBySlug(slug);
    
    if (!tenant) {
      throw new ConflictException({
        code: 'TENANT_NOT_FOUND',
        message: `Tenant dengan slug ${slug} tidak ditemukan`,
      });
    }
    
    return tenant;
  }

  @Get()
  @CheckPolicies((ability) => ability.can('read', 'tenants'))
  @ApiOperation({ summary: 'Get all tenants with pagination, filtering, sorting' })
  @ApiResponse({ status: 200, description: 'Paginated list of tenants' })
  async findAll(@Query() query: QueryTenantDto) {
    return this.tenantsService.findAll(query);
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can('read', 'tenants'))
  @ApiOperation({ summary: 'Get tenant by ID' })
  @ApiResponse({ status: 200, description: 'Tenant found', type: TenantResponseDto })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<TenantResponseDto> {
    return this.tenantsService.findById(id);
  }

  @Get(':id/details')
  @CheckPolicies((ability) => ability.can('read', 'tenants'))
  @ApiOperation({ summary: 'Get tenant details with statistics' })
  @ApiResponse({ status: 200, description: 'Tenant details with stats' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async getTenantDetails(@Param('id', ParseIntPipe) id: number) {
    return this.tenantsService.getTenantDetails(id);
  }

  @Get(':id/users')
  @CheckPolicies((ability) => ability.can('read', 'tenants'))
  @ApiOperation({ summary: 'Get users belonging to tenant' })
  @ApiResponse({ status: 200, description: 'List of tenant users' })
  async getTenantUsers(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.tenantsService.getTenantUsers(id, page, limit, search);
  }

  @Get(':id/modules')
  @CheckPolicies((ability) => ability.can('read', 'tenants'))
  @ApiOperation({ summary: 'Get modules registered for tenant' })
  @ApiResponse({ status: 200, description: 'List of tenant modules' })
  async getTenantModules(@Param('id', ParseIntPipe) id: number) {
    return this.tenantsService.getTenantModules(id);
  }

  @Delete(':id/users/:userId')
  @CheckPolicies((ability) => ability.can('update', 'tenants'))
  @ApiOperation({ summary: 'Remove user from tenant (deactivate in this tenant only)' })
  @ApiResponse({ status: 200, description: 'User removed from tenant' })
  async removeUserFromTenant(
    @Param('id', ParseIntPipe) tenantId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: any,
  ) {
    return this.tenantsService.removeUserFromTenant(tenantId, userId, user.id);
  }

  @Post(':id/users/:userId/restore')
  @CheckPolicies((ability) => ability.can('update', 'tenants'))
  @ApiOperation({ summary: 'Restore user to tenant (reactivate in this tenant)' })
  @ApiResponse({ status: 200, description: 'User restored to tenant' })
  async restoreUserToTenant(
    @Param('id', ParseIntPipe) tenantId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: any,
  ) {
    return this.tenantsService.restoreUserToTenant(tenantId, userId, user.id);
  }

  @Post()
  @CheckPolicies((ability) => ability.can('create', 'tenants'))
  @ApiOperation({ summary: 'Create new tenant' })
  @ApiResponse({ status: 201, description: 'Tenant created', type: TenantResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(
    @Body() dto: CreateTenantDto,
    @CurrentUser() user: any,
  ): Promise<TenantResponseDto> {
    return this.tenantsService.create(dto, user.id);
  }

  @Post('provision')
  @CheckPolicies((ability) => ability.can('create', 'tenants'))
  @ApiOperation({ summary: 'Provision new tenant with full setup (schema + tables + seed)' })
  @ApiResponse({ status: 201, description: 'Tenant provisioned successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async provision(
    @Body() dto: CreateTenantDto,
  ) {
    return this.tenantsService.provisionTenant(dto);
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can('update', 'tenants'))
  @ApiOperation({ summary: 'Update tenant' })
  @ApiResponse({ status: 200, description: 'Tenant updated', type: TenantResponseDto })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTenantDto,
    @CurrentUser() user: any,
  ): Promise<TenantResponseDto> {
    return this.tenantsService.update(id, dto, user.id);
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can('delete', 'tenants'))
  @ApiOperation({ summary: 'Soft delete tenant' })
  @ApiResponse({ status: 200, description: 'Tenant deleted' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any): Promise<void> {
    await this.tenantsService.delete(id, user.id);
  }

  @Post(':id/restore')
  @CheckPolicies((ability) => ability.can('update', 'tenants'))
  @ApiOperation({ summary: 'Restore soft deleted tenant' })
  @ApiResponse({ status: 200, description: 'Tenant restored', type: TenantResponseDto })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async restore(@Param('id', ParseIntPipe) id: number): Promise<TenantResponseDto> {
    return this.tenantsService.restore(id);
  }

  @Delete(':id/hard')
  @CheckPolicies((ability) => ability.can('delete', 'tenants'))
  @ApiOperation({ summary: 'Permanently delete tenant' })
  @ApiResponse({ status: 200, description: 'Tenant permanently deleted' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async hardDelete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.tenantsService.hardDelete(id);
  }

  @Post(':id/assign-user')
  @CheckPolicies((ability) => ability.can('update', 'tenants'))
  @ApiOperation({ summary: 'Assign user to tenant with role' })
  @ApiResponse({ status: 200, description: 'User assigned successfully' })
  @ApiResponse({ status: 404, description: 'Tenant or user not found' })
  async assignUser(
    @Param('id', ParseIntPipe) tenantId: number,
    @Body() body: { userId: number; roleName: string },
    @CurrentUser() user: any,
  ) {
    return this.tenantsService.assignUserToTenant(
      tenantId,
      body.userId,
      body.roleName,
      user.id,
    );
  }

  @Post(':id/users/bulk-add')
  @CheckPolicies((ability) => ability.can('update', 'tenants'))
  @ApiOperation({ summary: 'Bulk add users to tenant' })
  @ApiResponse({ status: 200, description: 'Users added successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async bulkAddUsers(
    @Param('id', ParseIntPipe) tenantId: number,
    @Body() body: { user_ids: number[]; default_role_id?: number },
    @CurrentUser() user: any,
  ) {
    return this.tenantsService.bulkAddUsers(
      tenantId,
      body.user_ids,
      body.default_role_id,
      user.id,
    );
  }

  @Post(':id/modules/:moduleId/enable')
  @CheckPolicies((ability) => ability.can('update', 'tenants'))
  @ApiOperation({ summary: 'Enable module for tenant' })
  @ApiResponse({ status: 200, description: 'Module enabled successfully' })
  async enableModule(
    @Param('id', ParseIntPipe) tenantId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @CurrentUser() user: any,
  ) {
    return this.tenantsService.enableModule(tenantId, moduleId, user.id);
  }

  @Post(':id/modules/:moduleId/disable')
  @CheckPolicies((ability) => ability.can('update', 'tenants'))
  @ApiOperation({ summary: 'Disable module for tenant' })
  @ApiResponse({ status: 200, description: 'Module disabled successfully' })
  async disableModule(
    @Param('id', ParseIntPipe) tenantId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @CurrentUser() user: any,
  ) {
    return this.tenantsService.disableModule(tenantId, moduleId, user.id);
  }
}
