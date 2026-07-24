import { PartialType } from '@nestjs/swagger';
import { CreateNewsDto } from './create-news.dto';

/**
 * Update news DTO
 * All fields optional for partial updates
 * 
 * @generated
 */
export class UpdateNewsDto extends PartialType(CreateNewsDto) {}
