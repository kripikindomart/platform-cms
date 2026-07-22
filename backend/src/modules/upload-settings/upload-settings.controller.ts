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
import { UploadSettingsService } from './upload-settings.service';
import { CreateUploadSettingDto } from './dto/create-upload-setting.dto';
import { UpdateUploadSettingDto } from './dto/update-upload-setting.dto';
import { QueryUploadSettingDto } from './dto/query-upload-setting.dto';
import { UploadSettingResponseDto } from './dto/upload-setting-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CaslGuard } from '../../core/casl/casl.guard';
import { CheckPolicies } from '../../common/decorators/check-policies.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Action, Subjects } from '../../core/casl/casl-ability.factory';

@ApiTags('upload-settings')
@Controller('upload-settings')
@UseGuards(JwtAuthGuard, CaslGuard)
export class UploadSettingsController {
  constructor(private readonly uploadSettingsService: UploadSettingsService) {}

  @Get()
  @CheckPolicies((ability) => ability.can('read', 'upload-settings'))
  @ApiOperation({ summary: 'Get all upload-settings with pagination, filtering, sorting' })
  @ApiResponse({ status: 200, description: 'Paginated list of upload-settings' })
  async findAll(@Query() query: QueryUploadSettingDto) {
    return this.uploadSettingsService.findAll(query);
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can('read', 'upload-settings'))
  @ApiOperation({ summary: 'Get upload-setting by ID' })
  @ApiResponse({ status: 200, description: 'UploadSetting found', type: UploadSettingResponseDto })
  @ApiResponse({ status: 404, description: 'UploadSetting not found' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<UploadSettingResponseDto> {
    return this.uploadSettingsService.findById(id);
  }

  @Post()
  @CheckPolicies((ability) => ability.can('create', 'upload-settings'))
  @ApiOperation({ summary: 'Create new upload-setting' })
  @ApiResponse({
    status: 201,
    description: 'UploadSetting created',
    type: UploadSettingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(
    @Body() dto: CreateUploadSettingDto,
    @CurrentUser() user: any,
  ): Promise<UploadSettingResponseDto> {
    return this.uploadSettingsService.create(dto, user.id);
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can('update', 'upload-settings'))
  @ApiOperation({ summary: 'Update upload-setting' })
  @ApiResponse({
    status: 200,
    description: 'UploadSetting updated',
    type: UploadSettingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'UploadSetting not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUploadSettingDto,
    @CurrentUser() user: any,
  ): Promise<UploadSettingResponseDto> {
    return this.uploadSettingsService.update(id, dto, user.id);
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can('delete', 'upload-settings'))
  @ApiOperation({ summary: 'Delete upload-setting' })
  @ApiResponse({ status: 200, description: 'UploadSetting deleted' })
  @ApiResponse({ status: 404, description: 'UploadSetting not found' })
  async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any): Promise<void> {
    await this.uploadSettingsService.delete(id, user.id);
  }
}
