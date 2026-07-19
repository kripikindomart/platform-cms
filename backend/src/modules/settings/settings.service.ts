import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SettingsRepository } from './settings.repository';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { QuerySettingDto } from './dto/query-setting.dto';
import { SettingResponseDto } from './dto/setting-response.dto';

/**
 * Settings Service
 * Manages global application settings (not tenant-specific)
 */
@Injectable()
export class SettingsService {
  constructor(
    private readonly settingsRepository: SettingsRepository,
  ) {}

  /**
   * Find all settings with pagination
   */
  async findAll(query: QuerySettingDto): Promise<{
    data: SettingResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const result = await this.settingsRepository.findAll(query);
    return {
      ...result,
      data: result.data.map((item) => this.toResponseDto(item)),
    };
  }

  /**
   * Find setting by ID
   */
  async findById(id: number): Promise<SettingResponseDto> {
    const item = await this.settingsRepository.findAll({ limit: 1000 });
    const found = item.data.find(s => s.id === id);

    if (!found) {
      throw new NotFoundException(`Setting dengan ID ${id} tidak ditemukan`);
    }

    return this.toResponseDto(found);
  }

  /**
   * Get storage settings
   */
  async getStorageSettings(): Promise<{
    provider: any;
    google_drive: any;
    s3: any;
    limits: any;
    folders: any;
  }> {
    const settings = await this.settingsRepository.findByCategory('storage');
    
    const result: any = {};
    settings.forEach(setting => {
      result[setting.key] = setting.value;
    });

    return {
      provider: result.provider || { active_provider: 'local' },
      google_drive: result.google_drive || {},
      s3: result.s3 || {},
      limits: result.limits || {},
      folders: result.folders || {},
    };
  }

  /**
   * Update storage settings
   */
  async updateStorageSettings(
    key: string,
    value: any,
    userId?: number
  ): Promise<SettingResponseDto> {
    const setting = await this.settingsRepository.upsert('storage', key, value, userId);
    return this.toResponseDto(setting);
  }

  /**
   * Get setting by category and key
   */
  async getByCategoryAndKey(category: string, key: string): Promise<any> {
    const setting = await this.settingsRepository.findByCategoryAndKey(category, key);
    if (!setting) {
      throw new NotFoundException(`Setting ${category}.${key} tidak ditemukan`);
    }
    return setting.value;
  }

  /**
   * Create new setting
   */
  async create(dto: CreateSettingDto, userId?: number): Promise<SettingResponseDto> {
    // Validate required fields
    if (!dto.category || !dto.key) {
      throw new BadRequestException('Category dan key wajib diisi');
    }

    // Check if setting already exists
    const existing = await this.settingsRepository.findByCategoryAndKey(
      dto.category,
      dto.key
    );

    if (existing) {
      throw new BadRequestException(
        `Setting ${dto.category}.${dto.key} sudah ada. Gunakan update endpoint.`
      );
    }

    const item = await this.settingsRepository.create({
      ...dto,
      updated_by: userId,
    });

    return this.toResponseDto(item);
  }

  /**
   * Update setting
   */
  async update(id: number, dto: UpdateSettingDto, userId?: number): Promise<SettingResponseDto> {
    const existing = await this.settingsRepository.findAll({ limit: 1000 });
    const found = existing.data.find(s => s.id === id);

    if (!found) {
      throw new NotFoundException(`Setting dengan ID ${id} tidak ditemukan`);
    }

    const updated = await this.settingsRepository.update(id, {
      ...dto,
      updated_by: userId,
    });

    return this.toResponseDto(updated!);
  }

  /**
   * Delete setting (use with caution - settings rarely deleted)
   */
  async delete(id: number): Promise<void> {
    const existing = await this.settingsRepository.findAll({ limit: 1000 });
    const found = existing.data.find(s => s.id === id);

    if (!found) {
      throw new NotFoundException(`Setting dengan ID ${id} tidak ditemukan`);
    }

    await this.settingsRepository.delete(id);
  }

  /**
   * Convert entity to response DTO
   */
  private toResponseDto(item: any): SettingResponseDto {
    return {
      id: item.id,
      category: item.category,
      key: item.key,
      value: item.value,
      description: item.description,
      is_encrypted: item.is_encrypted || false,
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  }
}
