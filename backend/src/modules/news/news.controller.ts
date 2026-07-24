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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { QueryNewsDto } from './dto/query-news.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CaslGuard } from '@/core/casl/casl.guard';
import { CheckPolicies } from '@/common/decorators/check-policies.decorator';

/**
 * news Controller
 * Auto-generated CRUD controller
 * 
 * @generated
 */
@ApiTags('news')
@ApiBearerAuth()
@Controller('news')
@UseGuards(JwtAuthGuard, CaslGuard)
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  /**
   * Get all news
   */
  @Get()
  @ApiOperation({ summary: 'Get all news' })
  @CheckPolicies((ability) => ability.can('read', 'News'))
  async findAll(@Query() query: QueryNewsDto) {
    return this.newsService.findAll(query);
  }

  /**
   * Get news by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get news by ID' })
  @CheckPolicies((ability) => ability.can('read', 'News'))
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.findById(id);
  }

  /**
   * Create new news
   */
  @Post()
  @ApiOperation({ summary: 'Create new news' })
  @CheckPolicies((ability) => ability.can('create', 'News'))
  async create(@Body() dto: CreateNewsDto) {
    return this.newsService.create(dto);
  }

  /**
   * Update news
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update news' })
  @CheckPolicies((ability) => ability.can('update', 'News'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNewsDto,
  ) {
    return this.newsService.update(id, dto);
  }

  /**
   * Delete news
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete news' })
  @CheckPolicies((ability) => ability.can('delete', 'News'))
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.delete(id);
  }
}
