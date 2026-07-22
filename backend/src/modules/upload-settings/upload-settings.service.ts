import { Injectable, NotFoundException, Logger, ConflictException } from '@nestjs/common';
import { UploadSettingsRepository } from './upload-settings.repository';
import { CreateUploadSettingDto } from './dto/create-upload-setting.dto';
import { UpdateUploadSettingDto } from './dto/update-upload-setting.dto';
import { QueryUploadSettingDto } from './dto/query-upload-setting.dto';
import { UploadSettingResponseDto } from './dto/upload-setting-response.dto';
import { AuditService } from '../../core/audit/audit.service';
import { FileCategory, GoogleDriveUrlFormat, FileTypeClassifier } from '../upload/enums/url-format.enum';

@Injectable()
export class UploadSettingsService {
  private readonly logger = new Logger(UploadSettingsService.name);
  private settingsCache: Map<FileCategory, GoogleDriveUrlFormat> = new Map();

  constructor(
    private readonly uploadSettingsRepository: UploadSettingsRepository,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Find all upload-settings with pagination, filtering, sorting
   */
  async findAll(query: QueryUploadSettingDto): Promise<{
    data: UploadSettingResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const result = await this.uploadSettingsRepository.findAllWithQuery(query);
    return {
      ...result,
      data: result.data.map((item) => this.toResponseDto(item)),
      totalPages: Math.ceil(result.total / result.limit),
    };
  }

  /**
   * Find upload-setting by ID
   */
  async findById(id: number): Promise<UploadSettingResponseDto> {
    const item = await this.uploadSettingsRepository.findById(id);

    if (!item) {
      throw new NotFoundException(`UploadSetting with ID ${id} not found`);
    }

    return this.toResponseDto(item);
  }

  /**
   * Create new upload-setting
   */
  async create(dto: CreateUploadSettingDto, userId: number): Promise<UploadSettingResponseDto> {
    // Check if setting already exists for this category
    const existing = await this.uploadSettingsRepository.findByCategory(dto.category);
    if (existing) {
      throw new ConflictException(
        `Setting untuk category "${dto.category}" sudah ada. Gunakan update untuk mengubah setting.`,
      );
    }

    // BaseRepository.create() handles audit fields (created_by, updated_by, timestamps)
    const item = await this.uploadSettingsRepository.create(this.prepareDataForDb(dto), userId);

    // Clear cache for this category
    this.settingsCache.delete(dto.category);

    await this.auditService.logCrud({
      action: 'create',
      resource: 'upload-settings',
      resourceId: item.id,
      newValues: dto as unknown as Record<string, unknown>,
    });

    this.logger.log(`Upload setting created for category: ${dto.category}`);

    return this.toResponseDto(item);
  }

  /**
   * Update upload-setting
   */
  async update(
    id: number,
    dto: UpdateUploadSettingDto,
    userId: number,
  ): Promise<UploadSettingResponseDto> {
    // Check if exists
    const existing = await this.findById(id);

    // BaseRepository.update() handles audit fields (updated_by, updated_at)
    const item = await this.uploadSettingsRepository.update(id, this.prepareDataForDb(dto), userId);

    // Clear cache for this category
    this.settingsCache.delete(existing.category as FileCategory);

    await this.auditService.logCrud({
      action: 'update',
      resource: 'upload-settings',
      resourceId: id,
      newValues: dto as unknown as Record<string, unknown>,
    });

    this.logger.log(`Upload setting updated for category: ${existing.category}`);

    return this.toResponseDto(item);
  }

  /**
   * Soft delete upload-setting
   */
  async delete(id: number, userId: number): Promise<void> {
    // Check if exists
    await this.findById(id);

    // BaseRepository.softDelete() handles soft delete fields
    await this.uploadSettingsRepository.softDelete(id, userId);

    await this.auditService.logCrud({
      action: 'delete',
      resource: 'upload-settings',
      resourceId: id,
    });
  }

  /**
   * Restore soft deleted upload-setting
   */
  async restore(id: number): Promise<UploadSettingResponseDto> {
    await this.uploadSettingsRepository.restore(id);

    // Fetch restored item
    const item = await this.uploadSettingsRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`UploadSetting with ID ${id} not found after restore`);
    }

    await this.auditService.logCrud({
      action: 'restore',
      resource: 'upload-settings',
      resourceId: id,
    });

    return this.toResponseDto(item);
  }

  /**
   * Get URL format for a file based on its mimetype
   * This is the main method used by upload service
   */
  async getFormatForFile(mimetype: string): Promise<GoogleDriveUrlFormat> {
    const category = FileTypeClassifier.classify(mimetype);

    // Check cache first
    if (this.settingsCache.has(category)) {
      return this.settingsCache.get(category)!;
    }

    // Get from database
    const setting = await this.uploadSettingsRepository.findByCategory(category);

    if (setting && setting.is_active) {
      this.settingsCache.set(category, setting.url_format as GoogleDriveUrlFormat);
      return setting.url_format as GoogleDriveUrlFormat;
    }

    // Fallback to default
    const defaultFormat = FileTypeClassifier.getDefaultFormat(category);
    this.logger.log(
      `No active setting found for category ${category}, using default: ${defaultFormat}`,
    );
    return defaultFormat;
  }

  /**
   * Find setting by category
   */
  async findByCategory(category: FileCategory): Promise<UploadSettingResponseDto | null> {
    const setting = await this.uploadSettingsRepository.findByCategory(category);
    if (!setting) {
      return null;
    }
    return this.toResponseDto(setting);
  }

  /**
   * Seed default settings for all file categories
   */
  async seedDefaultSettings(): Promise<void> {
    const defaults: Array<{ category: FileCategory; url_format: GoogleDriveUrlFormat }> = [
      { category: FileCategory.IMAGE, url_format: GoogleDriveUrlFormat.DIRECT_VIEW },
      { category: FileCategory.DOCUMENT, url_format: GoogleDriveUrlFormat.DOWNLOAD },
      { category: FileCategory.VIDEO, url_format: GoogleDriveUrlFormat.EMBED_VIEW },
      { category: FileCategory.AUDIO, url_format: GoogleDriveUrlFormat.EMBED_VIEW },
      { category: FileCategory.OTHER, url_format: GoogleDriveUrlFormat.DOWNLOAD },
    ];

    for (const setting of defaults) {
      // Check if already exists
      const existing = await this.uploadSettingsRepository.findByCategory(setting.category);
      if (!existing) {
        await this.uploadSettingsRepository.upsertSetting(
          setting.category,
          setting.url_format,
          200, // default thumbnail size
          true, // is_active
        );
        this.logger.log(`Seeded default setting for category: ${setting.category}`);
      }
    }

    // Clear cache after seeding
    this.settingsCache.clear();
  }

  /**
   * Clear settings cache
   */
  clearCache(): void {
    this.settingsCache.clear();
    this.logger.log('Upload settings cache cleared');
  }

  /**
   * Convert entity to response DTO
   */
  private toResponseDto(item: any): UploadSettingResponseDto {
    return {
      id: item.id,
      category: item.category ?? undefined,
      url_format: item.url_format ?? undefined,
      thumbnail_size: item.thumbnail_size ?? undefined,
      is_active: item.is_active ?? undefined,
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

    return data;
  }
}
