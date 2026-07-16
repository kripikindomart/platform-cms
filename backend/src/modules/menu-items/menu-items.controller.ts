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
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { QueryMenuItemDto } from './dto/query-menu-item.dto';
import { MenuItemResponseDto } from './dto/menu-item-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CaslGuard } from '../../core/casl/casl.guard';
import { CheckPolicies } from '../../common/decorators/check-policies.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Action, Subjects } from '../../core/casl/casl-ability.factory';

@ApiTags('menu-items')
@Controller('menu-items')
@UseGuards(JwtAuthGuard, CaslGuard)
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Get()
  @CheckPolicies((ability) => ability.can('read', 'menu-items'))
  @ApiOperation({ summary: 'Get all menu-items with pagination, filtering, sorting' })
  @ApiResponse({ status: 200, description: 'Paginated list of menu-items' })
  async findAll(@Query() query: QueryMenuItemDto) {
    return this.menuItemsService.findAll(query);
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can('read', 'menu-items'))
  @ApiOperation({ summary: 'Get menu-item by ID' })
  @ApiResponse({ status: 200, description: 'MenuItem found', type: MenuItemResponseDto })
  @ApiResponse({ status: 404, description: 'MenuItem not found' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<MenuItemResponseDto> {
    return this.menuItemsService.findById(id);
  }

  @Post()
  @CheckPolicies((ability) => ability.can('create', 'menu-items'))
  @ApiOperation({ summary: 'Create new menu-item' })
  @ApiResponse({ status: 201, description: 'MenuItem created', type: MenuItemResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(
    @Body() dto: CreateMenuItemDto,
    @CurrentUser() user: any,
  ): Promise<MenuItemResponseDto> {
    return this.menuItemsService.create(dto, user.id);
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can('update', 'menu-items'))
  @ApiOperation({ summary: 'Update menu-item' })
  @ApiResponse({ status: 200, description: 'MenuItem updated', type: MenuItemResponseDto })
  @ApiResponse({ status: 404, description: 'MenuItem not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMenuItemDto,
    @CurrentUser() user: any,
  ): Promise<MenuItemResponseDto> {
    return this.menuItemsService.update(id, dto, user.id);
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can('delete', 'menu-items'))
  @ApiOperation({ summary: 'Delete menu-item' })
  @ApiResponse({ status: 200, description: 'MenuItem deleted' })
  @ApiResponse({ status: 404, description: 'MenuItem not found' })
  async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any): Promise<void> {
    await this.menuItemsService.delete(id, user.id);
  }
}
