import { PartialType } from '@nestjs/swagger';
import { CreatePostDto } from './create-post.dto';

/**
 * DTO for updating post
 * All fields from Create DTO are optional
 */
export class UpdatePostDto extends PartialType(CreatePostDto) {}
