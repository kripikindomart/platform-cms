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
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { QueryMenuDto } from './dto/query-menu.dto';
import { MenuResponseDto } from './dto/menu-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CaslGuard } from '../../core/casl/casl.guard';
import { CheckPolicies } from '../../common/decorators/check-policies.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Action, Subjects } from '../../core/casl/casl-ability.factory';

@ApiTags('menuses')
@Controller('menuses')
@UseGuards(JwtAuthGuard, CaslGuard)
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get()
  @CheckPolicies((ability) => ability.can('read', 'menuses'))
  @ApiOperation({ summary: 'Get all menuses with pagination, filtering, sorting' })
  @ApiResponse({ status: 200, description: 'Paginated list of menuses' })
  async findAll(@Query() query: QueryMenuDto) {
    return this.menusService.findAll(query);
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can('read', 'menuses'))
  @ApiOperation({ summary: 'Get menu by ID' })
  @ApiResponse({ status: 200, description: 'Menu found', type: MenuResponseDto })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<MenuResponseDto> {
    return this.menusService.findById(id);
  }

  @Post()
  @CheckPolicies((ability) => ability.can('create', 'menuses'))
  @ApiOperation({ summary: 'Create new menu' })
  @ApiResponse({ status: 201, description: 'Menu created', type: MenuResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() dto: CreateMenuDto, @CurrentUser() user: any): Promise<MenuResponseDto> {
    return this.menusService.create(dto, user.id);
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can('update', 'menuses'))
  @ApiOperation({ summary: 'Update menu' })
  @ApiResponse({ status: 200, description: 'Menu updated', type: MenuResponseDto })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMenuDto,
    @CurrentUser() user: any,
  ): Promise<MenuResponseDto> {
    return this.menusService.update(id, dto, user.id);
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can('delete', 'menuses'))
  @ApiOperation({ summary: 'Delete menu' })
  @ApiResponse({ status: 200, description: 'Menu deleted' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any): Promise<void> {
    await this.menusService.delete(id, user.id);
  }
}
