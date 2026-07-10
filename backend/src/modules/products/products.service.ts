import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { AuditService } from '../../core/audit/audit.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Find all products
   */
  async findAll(query?: any): Promise<ProductResponseDto[]> {
    const items = await this.productsRepository.findAll();
    return items.map((item) => this.toResponseDto(item));
  }

  /**
   * Find product by ID
   */
  async findById(id: number): Promise<ProductResponseDto> {
    const item = await this.productsRepository.findById(id);

    if (!item) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.toResponseDto(item);
  }

  /**
   * Create new product
   */
  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    const item = await this.productsRepository.create({
      ...dto,
      created_by: 1, // TODO: Get from current user
      updated_by: 1, // TODO: Get from current user
    });

    await this.auditService.logCrud({
      action: 'create',
      resource: 'products',
      resourceId: item.id,
      newValues: dto as unknown as Record<string, unknown>,
    });

    return this.toResponseDto(item);
  }

  /**
   * Update product
   */
  async update(id: number, dto: UpdateProductDto): Promise<ProductResponseDto> {
    // Check if exists
    await this.findById(id);

    const item = await this.productsRepository.update(id, {
      ...dto,
      updated_by: 1, // TODO: Get from current user
    });

    await this.auditService.logCrud({
      action: 'update',
      resource: 'products',
      resourceId: id,
      newValues: dto as unknown as Record<string, unknown>,
    });

    return this.toResponseDto(item);
  }

  /**
   * Soft delete product
   */
  async softDelete(id: number): Promise<void> {
    // Check if exists
    await this.findById(id);

    await this.productsRepository.softDelete(id, 1); // TODO: Get from current user

    await this.auditService.logCrud({
      action: 'delete',
      resource: 'products',
      resourceId: id,
    });
  }

  /**
   * Restore soft deleted product
   */
  async restore(id: number): Promise<ProductResponseDto> {
    const item = await this.productsRepository.restore(id);

    await this.auditService.logCrud({
      action: 'restore',
      resource: 'products',
      resourceId: id,
    });

    return this.toResponseDto(item);
  }

  /**
   * Convert entity to response DTO
   */
  private toResponseDto(item: any): ProductResponseDto {
    return {
      id: item.id,
      // TODO: Add other fields
      created_at: item.created_at,
      updated_at: item.updated_at,
      deleted_at: item.deleted_at,
    };
  }
}
