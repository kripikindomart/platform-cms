/**
 * Storage Factory Service
 * Factory pattern untuk memilih storage provider berdasarkan konfigurasi
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageProvider } from './interfaces/storage-provider.interface';
import { GoogleDriveProvider } from './providers/google-drive.provider';
import { S3Provider } from './providers/s3.provider';
import { LocalStorageProvider } from './providers/local.provider';

export type StorageProviderType = 'google-drive' | 's3' | 'local';

@Injectable()
export class StorageFactoryService implements OnModuleInit {
  private readonly logger = new Logger(StorageFactoryService.name);
  private providers: Map<StorageProviderType, IStorageProvider> = new Map();
  private defaultProvider: StorageProviderType = 'local';

  constructor(
    private configService: ConfigService,
    private googleDriveProvider: GoogleDriveProvider,
    private s3Provider: S3Provider,
    private localStorageProvider: LocalStorageProvider,
  ) {}

  onModuleInit() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Register semua providers
    this.providers.set('google-drive', this.googleDriveProvider);
    this.providers.set('s3', this.s3Provider);
    this.providers.set('local', this.localStorageProvider);

    // IMPORTANT: Read directly from process.env, NOT from ConfigService
    // Because NestJS config factory functions execute BEFORE env is loaded
    // This works correctly in all environments (dev, prod, docker, linux)
    const configuredProvider = (process.env.STORAGE_PROVIDER || 'local') as StorageProviderType;

    this.defaultProvider = configuredProvider;
    this.logger.log(`[INFO] Storage provider: ${this.defaultProvider}`);
    
    if (this.defaultProvider !== 'local') {
      this.logger.log(`[INFO] External storage will be initialized asynchronously`);
    }
  }

  /**
   * Get storage provider (default atau spesifik)
   */
  getProvider(providerType?: StorageProviderType): IStorageProvider {
    const type = providerType || this.defaultProvider;
    const provider = this.providers.get(type);

    if (!provider) {
      this.logger.warn(
        `Provider ${type} tidak ditemukan, fallback ke local storage`,
      );
      return this.localStorageProvider;
    }

    return provider;
  }

  /**
   * Get default provider name
   */
  getDefaultProviderName(): string {
    return this.defaultProvider;
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): StorageProviderType[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Check if provider is available
   */
  isProviderAvailable(providerType: StorageProviderType): boolean {
    return this.providers.has(providerType);
  }
}
