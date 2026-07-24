import { Injectable, NotFoundException } from '@nestjs/common';
import { NewsRepository } from './news.repository';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { QueryNewsDto } from './dto/query-news.dto';

/**
 * news Service
 * Auto-generated service for news
 * 
 * @generated
 */
@Injectable()
export class NewsService {
  constructor(
    private readonly newsRepository: NewsRepository,
  ) {}

  /**
   * Get all news dengan pagination
   */
  async findAll(query: QueryNewsDto) {
    return this.newsRepository.findAll(query);
  }

  /**
   * Get news by ID
   */
  async findById(id: number) {
    const item = await this.newsRepository.findById(id);
    
    if (!item) {
      throw new NotFoundException(`news dengan ID ${id} tidak ditemukan`);
    }
    
    return item;
  }

  /**
   * Create new news
   */
  async create(dto: CreateNewsDto) {
    return this.newsRepository.create(dto);
  }

  /**
   * Update news
   */
  async update(id: number, dto: UpdateNewsDto) {
    const existing = await this.findById(id);
    return this.newsRepository.update(id, dto);
  }

  /**
   * Delete news (soft delete)
   */
  async delete(id: number) {
    const existing = await this.findById(id);
    return this.newsRepository.softDelete(id);
  }
}
