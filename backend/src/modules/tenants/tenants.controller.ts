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
}
