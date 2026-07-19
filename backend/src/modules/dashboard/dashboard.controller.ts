import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats' })
  async getStats(@CurrentUser() user: any) {
    return this.dashboardService.getStats(user);
  }

  @Get('recent-activity')
  @ApiOperation({ summary: 'Get recent activity logs' })
  @ApiResponse({ status: 200, description: 'Recent activity' })
  async getRecentActivity(
    @CurrentUser() user: any,
    @Query('limit') limit: number = 10,
  ) {
    return this.dashboardService.getRecentActivity(user, limit);
  }

  @Get('system-status')
  @ApiOperation({ summary: 'Get system status' })
  @ApiResponse({ status: 200, description: 'System status' })
  async getSystemStatus() {
    return this.dashboardService.getSystemStatus();
  }

  @Get('user-growth')
  @ApiOperation({ summary: 'Get user growth data' })
  @ApiResponse({ status: 200, description: 'User growth chart data' })
  async getUserGrowth(
    @CurrentUser() user: any,
    @Query('days') days: number = 7,
  ) {
    return this.dashboardService.getUserGrowth(user, days);
  }

  @Get('tenant-distribution')
  @ApiOperation({ summary: 'Get tenant distribution' })
  @ApiResponse({ status: 200, description: 'Tenant distribution' })
  async getTenantDistribution(@CurrentUser() user: any) {
    return this.dashboardService.getTenantDistribution(user);
  }
}
