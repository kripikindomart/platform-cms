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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CaslGuard } from '../../core/casl/casl.guard';
import { CheckPolicies } from '../../common/decorators/check-policies.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Action, Subjects } from '../../core/casl/casl-ability.factory';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, CaslGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @CheckPolicies((ability) => ability.can('read', 'orders'))
  @ApiOperation({ summary: 'Get all orders with pagination, filtering, sorting' })
  @ApiResponse({ status: 200, description: 'Paginated list of orders' })
  async findAll(@Query() query: QueryOrderDto) {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can('read', 'orders'))
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order found', type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<OrderResponseDto> {
    return this.ordersService.findById(id);
  }

  @Post()
  @CheckPolicies((ability) => ability.can('create', 'orders'))
  @ApiOperation({ summary: 'Create new order' })
  @ApiResponse({ status: 201, description: 'Order created', type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() dto: CreateOrderDto, @CurrentUser() user: any): Promise<OrderResponseDto> {
    return this.ordersService.create(dto, user.id);
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can('update', 'orders'))
  @ApiOperation({ summary: 'Update order' })
  @ApiResponse({ status: 200, description: 'Order updated', type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderDto,
    @CurrentUser() user: any,
  ): Promise<OrderResponseDto> {
    return this.ordersService.update(id, dto, user.id);
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can('delete', 'orders'))
  @ApiOperation({ summary: 'Delete order' })
  @ApiResponse({ status: 200, description: 'Order deleted' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any): Promise<void> {
    await this.ordersService.delete(id, user.id);
  }
}
