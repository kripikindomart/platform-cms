import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CaslGuard } from '@/core/casl/casl.guard';
import { CheckPolicies } from '@/common/decorators/check-policies.decorator';

@Controller('permissions')
@UseGuards(JwtAuthGuard, CaslGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  /**
   * Get all permissions with optional pagination and filtering
   * GET /api/permissions?page=1&limit=10&resource=users
   */
  @Get()
  @CheckPolicies((ability) => ability.can('read', 'permissions'))
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '100',
    @Query('resource') resource?: string,
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 100;
    
    // Get all permissions (no pagination in service yet)
    const permissions = await this.permissionsService.findAll();
    
    // Filter by resource if provided
    const filtered = resource 
      ? permissions.filter((p: any) => p.resource === resource)
      : permissions;
    
    // Return paginated format
    return {
      data: filtered,
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(filtered.length / limitNum),
    };
  }
}
