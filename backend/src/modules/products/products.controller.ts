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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CaslGuard } from '../../core/casl/casl.guard';
import { CheckPolicies } from '../../common/decorators/check-policies.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Action, Subjects } from '../../core/casl/casl-ability.factory';

@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard, CaslGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @CheckPolicies((ability) => ability.can('read', 'products'))
  @ApiOperation({ summary: 'Get all products with pagination, filtering, sorting' })
  @ApiResponse({ status: 200, description: 'Paginated list of products' })
  async findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can('read', 'products'))
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product found', type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<ProductResponseDto> {
    return this.productsService.findById(id);
  }

  @Post()
  @CheckPolicies((ability) => ability.can('create', 'products'))
  @ApiOperation({ summary: 'Create new product' })
  @ApiResponse({ status: 201, description: 'Product created', type: ProductResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(
    @Body() dto: CreateProductDto,
    @CurrentUser() user: any,
  ): Promise<ProductResponseDto> {
    return this.productsService.create(dto, user.id);
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can('update', 'products'))
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({ status: 200, description: 'Product updated', type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: any,
  ): Promise<ProductResponseDto> {
    return this.productsService.update(id, dto, user.id);
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can('delete', 'products'))
  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any): Promise<void> {
    await this.productsService.delete(id);
  }
}
