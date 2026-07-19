import { Controller, Get, Put, Body, Headers, UnauthorizedException, Param, Query, Post, Patch, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserPreferencesService, UserPreferenceDto } from './user-preferences.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/schema/public/users.schema';
import { UserTenantsResponseDto } from './dto/user-tenants-response.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CaslGuard } from '@/core/casl/casl.guard';
import { CheckPolicies } from '@/common/decorators/check-policies.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userPreferencesService: UserPreferencesService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Get current user profile
   * GET /api/users/me
   * IMPORTANT: Must be defined BEFORE :id route to avoid route collision
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      is_active: user.is_active,
    };
  }

  /**
   * Get current user's tenants
   * GET /api/users/my-tenants
   * 
   * Note: This endpoint does NOT require X-Tenant-Slug header
   * because it queries ALL tenants user has access to
   */
  @Get('my-tenants')
  @Public() // Skip both tenant guard and normal JWT guard
  async getMyTenants(@Headers('authorization') auth?: string): Promise<UserTenantsResponseDto> {
    // Manual JWT validation without tenant context
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = auth.split(' ')[1];
    
    try {
      const payload = this.jwtService.verify(token) as { sub: number; email: string; tenantId: number };
      const userId = payload.sub;
      
      if (!userId) {
        throw new UnauthorizedException('Invalid token');
      }
      
      return this.usersService.getUserTenants(userId);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Get all users with pagination
   * GET /api/users?page=1&limit=10&search=&includeDeleted=false
   */
  @Get()
  @UseGuards(JwtAuthGuard, CaslGuard)
  @CheckPolicies((ability) => ability.can('read', 'users'))
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const includeDeletedBool = includeDeleted === 'true';
    
    return this.usersService.findAll({
      page: pageNum,
      limit: limitNum,
      search,
      includeDeleted: includeDeletedBool,
    });
  }

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, CaslGuard)
  @CheckPolicies((ability) => ability.can('read', 'users'))
  async findById(@Param('id') id: string) {
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      throw new UnauthorizedException({
        code: 'INVALID_USER_ID',
        message: 'ID pengguna tidak valid',
      });
    }
    
    const user = await this.usersService.findById(userId);
    
    if (!user) {
      throw new UnauthorizedException({
        code: 'USER_NOT_FOUND',
        message: 'User tidak ditemukan',
      });
    }
    
    // Enrich with tenant data
    try {
      const tenantsData = await this.usersService.getUserTenants(userId);
      return {
        ...user,
        tenants: tenantsData.tenants || [],
      };
    } catch (error) {
      // If getting tenants fails, return user without tenants
      return {
        ...user,
        tenants: [],
      };
    }
  }

  /**
   * Activate user
   * PATCH /api/users/:id/activate
   */
  @Patch(':id/activate')
  @UseGuards(JwtAuthGuard, CaslGuard)
  @CheckPolicies((ability) => ability.can('update', 'users'))
  async activate(@Param('id') id: string, @CurrentUser() user: User) {
    await this.usersService.activate(parseInt(id), user.id);
    return { message: 'User activated successfully' };
  }

  /**
   * Deactivate user
   * PATCH /api/users/:id/deactivate
   */
  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard, CaslGuard)
  @CheckPolicies((ability) => ability.can('update', 'users'))
  async deactivate(@Param('id') id: string, @CurrentUser() user: User) {
    await this.usersService.deactivate(parseInt(id), user.id);
    return { message: 'User deactivated successfully' };
  }

  /**
   * Soft delete user
   * DELETE /api/users/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, CaslGuard)
  @CheckPolicies((ability) => ability.can('delete', 'users'))
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    await this.usersService.softDelete(parseInt(id), user.id);
    return { message: 'User deleted successfully' };
  }

  /**
   * Hard delete user (permanent)
   * DELETE /api/users/:id/hard
   */
  @Delete(':id/hard')
  @UseGuards(JwtAuthGuard, CaslGuard)
  @CheckPolicies((ability) => ability.can('delete', 'users'))
  async hardDelete(@Param('id') id: string) {
    await this.usersService.hardDelete(parseInt(id));
    return { message: 'User permanently deleted' };
  }

  /**
   * Bulk activate users
   * POST /api/users/bulk/activate
   */
  @Post('bulk/activate')
  @UseGuards(JwtAuthGuard, CaslGuard)
  @CheckPolicies((ability) => ability.can('update', 'users'))
  async bulkActivate(@Body('ids') ids: number[], @CurrentUser() user: User) {
    await this.usersService.bulkActivate(ids, user.id);
    return { message: `${ids.length} users activated successfully` };
  }

  /**
   * Bulk deactivate users
   * POST /api/users/bulk/deactivate
   */
  @Post('bulk/deactivate')
  @UseGuards(JwtAuthGuard, CaslGuard)
  @CheckPolicies((ability) => ability.can('update', 'users'))
  async bulkDeactivate(@Body('ids') ids: number[], @CurrentUser() user: User) {
    await this.usersService.bulkDeactivate(ids, user.id);
    return { message: `${ids.length} users deactivated successfully` };
  }

  /**
   * Bulk soft delete users
   * POST /api/users/bulk/delete
   */
  @Post('bulk/delete')
  @UseGuards(JwtAuthGuard, CaslGuard)
  @CheckPolicies((ability) => ability.can('delete', 'users'))
  async bulkDelete(@Body('ids') ids: number[], @CurrentUser() user: User) {
    await this.usersService.bulkSoftDelete(ids, user.id);
    return { message: `${ids.length} users deleted successfully` };
  }

  /**
   * Restore soft deleted user
   * PATCH /api/users/:id/restore
   */
  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard, CaslGuard)
  @CheckPolicies((ability) => ability.can('delete', 'users'))
  async restore(@Param('id') id: string) {
    await this.usersService.restore(parseInt(id));
    return { message: 'User restored successfully' };
  }

  /**
   * Bulk restore users
   * POST /api/users/bulk/restore
   */
  @Post('bulk/restore')
  @UseGuards(JwtAuthGuard, CaslGuard)
  @CheckPolicies((ability) => ability.can('delete', 'users'))
  async bulkRestore(@Body('ids') ids: number[]) {
    await this.usersService.bulkRestore(ids);
    return { message: `${ids.length} users restored successfully` };
  }

  /**
   * Get current user's preferences
   * GET /api/users/me/preferences
   */
  @Get('me/preferences')
  async getMyPreferences(@CurrentUser() user: User) {
    return this.userPreferencesService.getPreferences(user.id);
  }

  /**
   * Update current user's preferences
   * PUT /api/users/me/preferences
   */
  @Put('me/preferences')
  async updateMyPreferences(
    @CurrentUser() user: User,
    @Body() dto: UserPreferenceDto,
  ) {
    return this.userPreferencesService.updatePreferences(user.id, dto);
  }

  /**
   * Get user preferences by user ID (Admin only)
   * GET /api/users/:userId/preferences
   */
  @Get(':userId/preferences')
  async getUserPreferences(@Param('userId') userId: string) {
    return this.userPreferencesService.getPreferences(parseInt(userId));
  }

  /**
   * Update user preferences by user ID (Admin only)
   * PUT /api/users/:userId/preferences
   */
  @Put(':userId/preferences')
  async updateUserPreferences(
    @Param('userId') userId: string,
    @Body() dto: UserPreferenceDto,
  ) {
    return this.userPreferencesService.updatePreferences(parseInt(userId), dto);
  }

  /**
   * Get user's accessible tenants by user ID (Admin only)
   * GET /api/users/:userId/tenants
   */
  @Get(':userId/tenants')
  async getUserTenantsByUserId(@Param('userId') userId: string) {
    return this.usersService.getUserTenants(parseInt(userId));
  }
}
