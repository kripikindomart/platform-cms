import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

/**
 * DTO for updating product
 * All fields from Create DTO are optional
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {}
