import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  /**
   * Find all products with pagination, filtering, sorting
   */
  async findAll(query: QueryProductDto): Promise<{
    data: ProductResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const result = await this.productsRepository.findAllWithQuery(query);
    return {
      ...result,
      data: result.data.map((item) => this.toResponseDto(item)),
      totalPages: Math.ceil(result.total / result.limit),
    };
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
  async create(dto: CreateProductDto, userId: number): Promise<ProductResponseDto> {
    // BaseRepository.create() handles audit fields (created_by, updated_by, timestamps)
    const item = await this.productsRepository.create(this.prepareDataForDb(dto), userId);

    return this.toResponseDto(item);
  }

  /**
   * Update product
   */
  async update(id: number, dto: UpdateProductDto, userId: number): Promise<ProductResponseDto> {
    // Check if exists
    await this.findById(id);

    // BaseRepository.update() handles audit fields (updated_by, updated_at)
    const item = await this.productsRepository.update(id, this.prepareDataForDb(dto), userId);

    return this.toResponseDto(item);
  }

  /**
   * Delete product
   */
  async delete(id: number): Promise<void> {
    // Check if exists
    await this.findById(id);

    await this.productsRepository.hardDelete(id);
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
    };
  }

  /**
   * Prepare DTO data for database
   * Converts number fields to string for decimal/numeric types
   */
  private prepareDataForDb(dto: any): any {
    const data = { ...dto };

    return data;
  }
}
