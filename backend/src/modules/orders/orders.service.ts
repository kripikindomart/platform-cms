import { Injectable, NotFoundException } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { AuditService } from '../../core/audit/audit.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Find all orders with pagination, filtering, sorting
   */
  async findAll(query: QueryOrderDto): Promise<{
    data: OrderResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const result = await this.ordersRepository.findAllWithQuery(query);
    return {
      ...result,
      data: result.data.map((item) => this.toResponseDto(item)),
      totalPages: Math.ceil(result.total / result.limit),
    };
  }

  /**
   * Find order by ID
   */
  async findById(id: number): Promise<OrderResponseDto> {
    const item = await this.ordersRepository.findById(id);

    if (!item) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.toResponseDto(item);
  }

  /**
   * Create new order
   */
  async create(dto: CreateOrderDto, userId: number): Promise<OrderResponseDto> {
    // BaseRepository.create() handles audit fields (created_by, updated_by, timestamps)
    const item = await this.ordersRepository.create(this.prepareDataForDb(dto), userId);

    await this.auditService.logCrud({
      action: 'create',
      resource: 'orders',
      resourceId: item.id,
      newValues: dto as unknown as Record<string, unknown>,
    });

    return this.toResponseDto(item);
  }

  /**
   * Update order
   */
  async update(id: number, dto: UpdateOrderDto, userId: number): Promise<OrderResponseDto> {
    // Check if exists
    await this.findById(id);

    // BaseRepository.update() handles audit fields (updated_by, updated_at)
    const item = await this.ordersRepository.update(id, this.prepareDataForDb(dto), userId);

    await this.auditService.logCrud({
      action: 'update',
      resource: 'orders',
      resourceId: id,
      newValues: dto as unknown as Record<string, unknown>,
    });

    return this.toResponseDto(item);
  }

  /**
   * Soft delete order
   */
  async delete(id: number, userId: number): Promise<void> {
    // Check if exists
    await this.findById(id);

    // BaseRepository.softDelete() handles soft delete fields
    await this.ordersRepository.softDelete(id, userId);

    await this.auditService.logCrud({
      action: 'delete',
      resource: 'orders',
      resourceId: id,
    });
  }

  /**
   * Restore soft deleted order
   */
  async restore(id: number): Promise<OrderResponseDto> {
    await this.ordersRepository.restore(id);

    // Fetch restored item
    const item = await this.ordersRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Order with ID ${id} not found after restore`);
    }

    await this.auditService.logCrud({
      action: 'restore',
      resource: 'orders',
      resourceId: id,
    });

    return this.toResponseDto(item);
  }

  /**
   * Convert entity to response DTO
   */
  private toResponseDto(item: any): OrderResponseDto {
    return {
      id: item.id,
      customer_name: item.customer_name ?? undefined,
      total: item.total ?? undefined,
      order_date: item.order_date ?? undefined,
      status: item.status ?? undefined,
      created_at: item.created_at,
      updated_at: item.updated_at,
      deleted_at: item.deleted_at ?? undefined,
    };
  }

  /**
   * Prepare DTO data for database
   * Converts number fields to string for decimal/numeric types
   */
  private prepareDataForDb(dto: any): any {
    const data = { ...dto };

    // Convert decimal/numeric fields from number to string for Drizzle ORM
    if (data.total !== undefined && data.total !== null) {
      data.total = String(data.total);
    }

    return data;
  }
}
