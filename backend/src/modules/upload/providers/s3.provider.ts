/**
 * AWS S3 Storage Provider
 * Upload files ke Amazon S3 atau S3-compatible storage (MinIO, DigitalOcean Spaces, dll)
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import {
  IStorageProvider,
  UploadOptions,
  UploadResult,
} from '../interfaces/storage-provider.interface';

@Injectable()
export class S3Provider implements IStorageProvider {
  private readonly logger = new Logger(S3Provider.name);
  private s3Client: S3Client | undefined;
  private bucket: string = '';
  private region: string = '';
  private publicUrl: string = '';

  constructor(private configService: ConfigService) {
    this.initializeS3();
  }

  private async initializeS3() {
    try {
      const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
      const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');
      const region = this.configService.get('AWS_REGION') || 'us-east-1';
      const endpoint = this.configService.get('AWS_S3_ENDPOINT'); // For S3-compatible storage
      const bucket = this.configService.get('AWS_S3_BUCKET');
      const publicUrl = this.configService.get('AWS_S3_PUBLIC_URL');

      if (!accessKeyId || !secretAccessKey || !bucket) {
        this.logger.warn('S3 credentials tidak lengkap. Provider tidak aktif.');
        return;
      }

      this.s3Client = new S3Client({
        region: region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
        ...(endpoint && { endpoint }), // Custom endpoint untuk MinIO, DigitalOcean Spaces, dll
      });

      this.bucket = bucket;
      this.region = region;
      this.publicUrl = publicUrl || `https://${bucket}.s3.${region}.amazonaws.com`;

      this.logger.log('S3 provider berhasil diinisialisasi');
    } catch (error) {
      this.logger.error('Gagal inisialisasi S3 provider:', error);
    }
  }

  getName(): string {
    return 's3';
  }

  async upload(options: UploadOptions): Promise<UploadResult> {
    if (!this.s3Client) {
      throw new Error('S3 provider belum diinisialisasi');
    }

    try {
      // Generate unique key
      const timestamp = Date.now();
      const sanitizedName = options.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const folder = options.folder || 'general';
      const key = `${folder}/${timestamp}-${sanitizedName}`;

      // Upload ke S3
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: options.buffer,
        ContentType: options.mimetype,
        ACL: 'public-read', // Public access
        Metadata: options.metadata,
      });

      await this.s3Client.send(command);

      // Public URL
      const publicUrl = `${this.publicUrl}/${key}`;

      this.logger.log(`File uploaded ke S3: ${key}`);

      return {
        url: publicUrl,
        fileId: key,
        filename: sanitizedName,
        size: options.buffer.length,
        mimetype: options.mimetype,
        provider: this.getName(),
        metadata: {
          bucket: this.bucket,
          region: this.region,
          key: key,
        },
      };
    } catch (error) {
      this.logger.error('Gagal upload ke S3:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Upload ke S3 gagal: ${errorMessage}`);
    }
  }

  async delete(fileId: string): Promise<boolean> {
    if (!this.s3Client) {
      throw new Error('S3 provider belum diinisialisasi');
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: fileId,
      });

      await this.s3Client.send(command);
      this.logger.log(`File dihapus dari S3: ${fileId}`);
      return true;
    } catch (error) {
      this.logger.error('Gagal hapus file dari S3:', error);
      return false;
    }
  }

  async getPublicUrl(fileId: string): Promise<string> {
    return `${this.publicUrl}/${fileId}`;
  }

  async exists(fileId: string): Promise<boolean> {
    if (!this.s3Client) {
      return false;
    }

    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: fileId,
      });

      await this.s3Client.send(command);
      return true;
    } catch {
      return false;
    }
  }
}
