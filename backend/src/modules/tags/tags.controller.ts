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
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { QueryTagDto } from './dto/query-tag.dto';
import { TagResponseDto } from './dto/tag-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CaslGuard } from '../../core/casl/casl.guard';
import { CheckPolicies } from '../../common/decorators/check-policies.decorator';

@ApiTags('tags')
@Controller('tags')
@UseGuards(JwtAuthGuard, CaslGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @CheckPolicies((ability) => ability.can('read', 'tags'))
  @ApiOperation({ summary: 'Get all tags with pagination, filtering, sorting' })
  @ApiResponse({ status: 200, description: 'Paginated list of tags' })
  async findAll(@Query() query: QueryTagDto) {
    return this.tagsService.findAll(query);
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can('read', 'tags'))
  @ApiOperation({ summary: 'Get tag by ID' })
  @ApiResponse({ status: 200, description: 'Tag found', type: TagResponseDto })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<TagResponseDto> {
    return this.tagsService.findById(id);
  }

  @Post()
  @CheckPolicies((ability) => ability.can('create', 'tags'))
  @ApiOperation({ summary: 'Create new tag' })
  @ApiResponse({ status: 201, description: 'Tag created', type: TagResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() dto: CreateTagDto): Promise<TagResponseDto> {
    return this.tagsService.create(dto);
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can('update', 'tags'))
  @ApiOperation({ summary: 'Update tag' })
  @ApiResponse({ status: 200, description: 'Tag updated', type: TagResponseDto })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTagDto,
  ): Promise<TagResponseDto> {
    return this.tagsService.update(id, dto);
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can('delete', 'tags'))
  @ApiOperation({ summary: 'Delete tag' })
  @ApiResponse({ status: 200, description: 'Tag deleted' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.tagsService.softDelete(id);
  }
}
