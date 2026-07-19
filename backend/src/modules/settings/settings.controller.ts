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
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { QuerySettingDto } from './dto/query-setting.dto';
import { SettingResponseDto } from './dto/setting-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CaslGuard } from '../../core/casl/casl.guard';
import { CheckPolicies } from '../../common/decorators/check-policies.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Action, Subjects } from '../../core/casl/casl-ability.factory';

@ApiTags('settings')
@Controller('settings')
@UseGuards(JwtAuthGuard, CaslGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @CheckPolicies((ability) => ability.can('read', 'settings'))
  @ApiOperation({ summary: 'Get all settings with pagination, filtering, sorting' })
  @ApiResponse({ status: 200, description: 'Paginated list of settings' })
  async findAll(@Query() query: QuerySettingDto) {
    return this.settingsService.findAll(query);
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can('read', 'settings'))
  @ApiOperation({ summary: 'Get setting by ID' })
  @ApiResponse({ status: 200, description: 'Setting found', type: SettingResponseDto })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<SettingResponseDto> {
    return this.settingsService.findById(id);
  }

  @Post()
  @CheckPolicies((ability) => ability.can('create', 'settings'))
  @ApiOperation({ summary: 'Create new setting' })
  @ApiResponse({ status: 201, description: 'Setting created', type: SettingResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(
    @Body() dto: CreateSettingDto,
    @CurrentUser() user: any,
  ): Promise<SettingResponseDto> {
    return this.settingsService.create(dto, user.id);
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can('update', 'settings'))
  @ApiOperation({ summary: 'Update setting' })
  @ApiResponse({ status: 200, description: 'Setting updated', type: SettingResponseDto })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSettingDto,
    @CurrentUser() user: any,
  ): Promise<SettingResponseDto> {
    return this.settingsService.update(id, dto, user.id);
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can('delete', 'settings'))
  @ApiOperation({ summary: 'Delete setting' })
  @ApiResponse({ status: 200, description: 'Setting deleted' })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any): Promise<void> {
    await this.settingsService.delete(id);
  }
}
