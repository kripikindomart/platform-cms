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
  Req,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ModuleGeneratorService } from './module-generator.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CaslGuard } from '../../core/casl/casl.guard';
import { CheckPolicies } from '../../common/decorators/check-policies.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  GenerateModuleDto,
  UpdateModuleDto,
  QueryModulesDto,
  ModuleResponseDto,
  ModuleDetailResponseDto,
} from './dto';

/**
 * Module Generator Controller
 * REST API endpoints untuk CRUD Builder UI
 * 
 * Endpoints:
 * - GET /api/module-generator - List all modules
 * - GET /api/module-generator/:id - Get module detail
 * - POST /api/module-generator - Generate new module
 * - PATCH /api/module-generator/:id - Update module metadata
 * - DELETE /api/module-generator/:id - Delete module
 */
@ApiTags('module-generator')
@Controller('module-generator')
@UseGuards(JwtAuthGuard, CaslGuard)
export class ModuleGeneratorController {
  constructor(private readonly service: ModuleGeneratorService) {}

  @Get()
  @CheckPolicies((ability) => ability.can('read', 'module_generator'))
  @ApiOperation({ summary: 'Get all generated modules dengan pagination' })
  @ApiResponse({ 
    status: 200, 
    description: 'Paginated list of generated modules',
    type: [ModuleResponseDto],
  })
  async findAll(@Query() query: QueryModulesDto) {
    return this.service.findAll(query);
  }

  @Get('validation-types')
  @CheckPolicies((ability) => ability.can('read', 'module_generator'))
  @ApiOperation({ summary: 'Get all validation types (master data)' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of validation types' 
  })
  async getValidationTypes() {
    return this.service.getValidationTypes();
  }

  @Get('validation-types/:fieldType')
  @CheckPolicies((ability) => ability.can('read', 'module_generator'))
  @ApiOperation({ summary: 'Get validation types for specific field type' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of applicable validation types' 
  })
  async getValidationTypesForFieldType(@Param('fieldType') fieldType: string) {
    return this.service.getValidationTypesForFieldType(fieldType);
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can('read', 'module_generator'))
  @ApiOperation({ summary: 'Get module detail by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Module detail dengan fields',
    type: ModuleDetailResponseDto,
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Module tidak ditemukan' 
  })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Post()
  @CheckPolicies((ability) => ability.can('create', 'module_generator'))
  @ApiOperation({ summary: 'Step 1: Create module schema (table definition only)' })
  @ApiResponse({ 
    status: 201, 
    description: 'Schema berhasil disimpan. Lanjutkan ke Form Builder.',
    type: ModuleDetailResponseDto,
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input atau module name sudah ada' 
  })
  async create(
    @Body() dto: GenerateModuleDto,
    @CurrentUser() user: any,
  ) {
    return this.service.create(dto, user.id);
  }

  @Post(':id/assign')
  @CheckPolicies((ability) => ability.can('create', 'module_generator'))
  @ApiOperation({ summary: 'Assign module to current tenant (generate code)' })
  @ApiResponse({ 
    status: 201, 
    description: 'Module berhasil di-assign ke tenant',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Module tidak ditemukan' 
  })
  async assignToTenant(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    // Tenant ID will be retrieved from TenantContextService inside service method
    return this.service.assignToCurrentTenant(id, user.id);
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can('update', 'module_generator'))
  @ApiOperation({ summary: 'Update module metadata' })
  @ApiResponse({ 
    status: 200, 
    description: 'Module metadata updated',
    type: ModuleDetailResponseDto,
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Module tidak ditemukan' 
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateModuleDto,
    @CurrentUser() user: any,
  ) {
    return this.service.update(id, dto, user.id);
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can('delete', 'module_generator'))
  @ApiOperation({ summary: 'Delete generated module (soft delete)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Module deleted successfully' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Module tidak ditemukan' 
  })
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.service.delete(id, user.id);
  }

  @Post('validate-name')
  @CheckPolicies((ability) => ability.can('read', 'module_generator'))
  @ApiOperation({ summary: 'Validate module name availability' })
  @ApiResponse({ 
    status: 200, 
    description: 'Validation result' 
  })
  async validateName(@Body() body: { moduleName: string }) {
    return this.service.validateModuleName(body.moduleName);
  }
}
