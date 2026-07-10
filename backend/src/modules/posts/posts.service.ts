import { Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { AuditService } from '../../core/audit/audit.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Find all posts
   */
  async findAll(query?: any): Promise<PostResponseDto[]> {
    const items = await this.postsRepository.findAll();
    return items.map((item) => this.toResponseDto(item));
  }

  /**
   * Find post by ID
   */
  async findById(id: number): Promise<PostResponseDto> {
    const item = await this.postsRepository.findById(id);

    if (!item) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return this.toResponseDto(item);
  }

  /**
   * Create new post
   */
  async create(dto: CreatePostDto): Promise<PostResponseDto> {
    const item = await this.postsRepository.create({
      ...dto,
      created_by: 1, // TODO: Get from current user
      updated_by: 1, // TODO: Get from current user
    });

    await this.auditService.logCrud({
      action: 'create',
      resource: 'posts',
      resourceId: item.id,
      newValues: dto as unknown as Record<string, unknown>,
    });

    return this.toResponseDto(item);
  }

  /**
   * Update post
   */
  async update(id: number, dto: UpdatePostDto): Promise<PostResponseDto> {
    // Check if exists
    await this.findById(id);

    const item = await this.postsRepository.update(id, {
      ...dto,
      updated_by: 1, // TODO: Get from current user
    });

    await this.auditService.logCrud({
      action: 'update',
      resource: 'posts',
      resourceId: id,
      newValues: dto as unknown as Record<string, unknown>,
    });

    return this.toResponseDto(item);
  }

  /**
   * Soft delete post
   */
  async softDelete(id: number): Promise<void> {
    // Check if exists
    await this.findById(id);

    await this.postsRepository.softDelete(id, 1); // TODO: Get from current user

    await this.auditService.logCrud({
      action: 'delete',
      resource: 'posts',
      resourceId: id,
    });
  }

  /**
   * Restore soft deleted post
   */
  async restore(id: number): Promise<PostResponseDto> {
    const item = await this.postsRepository.restore(id);

    await this.auditService.logCrud({
      action: 'restore',
      resource: 'posts',
      resourceId: id,
    });

    return this.toResponseDto(item);
  }

  /**
   * Convert entity to response DTO
   */
  private toResponseDto(item: any): PostResponseDto {
    return {
      id: item.id,
      title: item.title,
      slug: item.slug,
      content: item.content,
      status: item.status,
      published_at: item.published_at,
      created_at: item.created_at,
      updated_at: item.updated_at,
      deleted_at: item.deleted_at,
    };
  }
}
