/**
 * Google Drive Storage Provider
 * Upload files ke Google Drive menggunakan Service Account
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import {
  IStorageProvider,
  UploadOptions,
  UploadResult,
} from '../interfaces/storage-provider.interface';

@Injectable()
export class GoogleDriveProvider implements IStorageProvider, OnModuleInit {
  private readonly logger = new Logger(GoogleDriveProvider.name);
  private drive: any;
  private folderId: string | undefined;
  private initPromise: Promise<void>;

  constructor(private configService: ConfigService) {
    // Start initialization immediately but don't wait
    this.initPromise = this.initializeDrive();
  }

  async onModuleInit() {
    // Ensure initialization completes during module init
    await this.initPromise;
  }

  private async initializeDrive(): Promise<void> {
    try {
      let credentials: any;
      let auth: any;
      
      // IMPORTANT: Access env directly because NestJS config may not be loaded yet
      const credentialsString = process.env.GOOGLE_DRIVE_CREDENTIALS;
      const credentialsPath = process.env.GOOGLE_DRIVE_CREDENTIALS_PATH;
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
      
      // OAuth2 credentials (for personal Gmail)
      const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
      const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

      // Try OAuth2 first (for personal Gmail)
      if (clientId && clientSecret && refreshToken) {
        try {
          this.logger.log('Using OAuth2 credentials...');
          
          const oauth2Client = new google.auth.OAuth2(
            clientId,
            clientSecret,
            'http://localhost:3333/oauth2callback', // Redirect URI for refresh
          );

          oauth2Client.setCredentials({
            refresh_token: refreshToken,
          });

          auth = oauth2Client;
          this.logger.log('[OK] OAuth2 credentials configured');
        } catch (error: any) {
          this.logger.error(`[ERROR] OAuth2 setup failed: ${error?.message}`);
        }
      }

      // Fallback to Service Account (for Google Workspace)
      if (!auth) {
        // Try loading from file first, then from env variable
        if (credentialsPath) {
          try {
            const fullPath = path.resolve(process.cwd(), credentialsPath);
            this.logger.log(`Trying to load credentials from: ${fullPath}`);
            
            const fileContent = fs.readFileSync(fullPath, 'utf8');
            credentials = JSON.parse(fileContent);
            
            this.logger.log(`[OK] Service Account credentials loaded from file: ${credentialsPath}`);
          } catch (error: any) {
            this.logger.error(`[ERROR] Gagal load credentials dari file: ${error?.message}`);
            this.logger.error(`Error stack: ${error?.stack}`);
          }
        }

        // Fallback to env variable
        if (!credentials && credentialsString) {
          try {
            credentials = JSON.parse(credentialsString);
            this.logger.log('Service Account credentials loaded from environment variable');
          } catch (error: any) {
            this.logger.error(`Gagal parse credentials dari env: ${error?.message}`);
          }
        }

        if (!credentials) {
          this.logger.warn(
            'Google Drive credentials tidak ditemukan. Provider tidak aktif.',
          );
          return;
        }

        auth = new google.auth.GoogleAuth({
          credentials: credentials,
          scopes: ['https://www.googleapis.com/auth/drive.file'],
        });
      }

      if (!auth) {
        this.logger.warn('No valid authentication method found');
        return;
      }

      this.drive = google.drive({ version: 'v3', auth });
      this.folderId = folderId;

      this.logger.log('[SUCCESS] Google Drive provider berhasil diinisialisasi');
      this.logger.log(`Folder ID: ${folderId || 'none (will use root)'}`);
      
      // Test connection
      await this.testConnection();
    } catch (error: any) {
      this.logger.error('[FATAL] Gagal inisialisasi Google Drive provider:', error);
      this.logger.error(`Error message: ${error?.message}`);
      this.logger.error(`Error stack: ${error?.stack}`);
    }
  }

  /**
   * Test connection to Google Drive
   */
  private async testConnection(): Promise<void> {
    if (!this.drive) {
      this.logger.warn('Drive client not initialized, skipping connection test');
      return;
    }

    try {
      this.logger.log('[TEST] Testing Google Drive connection...');
      
      // Try to get info about the user/service account
      const aboutResponse = await this.drive.about.get({
        fields: 'user, storageQuota',
      });
      
      this.logger.log('[TEST SUCCESS] Connected to Google Drive');
      this.logger.log(`Service Account: ${aboutResponse.data.user?.emailAddress || 'unknown'}`);
      
      // If folder ID specified, try to access it
      if (this.folderId) {
        try {
          const folderResponse = await this.drive.files.get({
            fileId: this.folderId,
            fields: 'id, name, mimeType',
          });
          
          this.logger.log(`[TEST SUCCESS] Folder accessible: ${folderResponse.data.name} (${this.folderId})`);
        } catch (folderError: any) {
          this.logger.error(`[TEST WARNING] Cannot access folder ${this.folderId}: ${folderError?.message}`);
          this.logger.error('Pastikan folder sudah di-share ke service account email');
        }
      }
    } catch (error: any) {
      this.logger.error('[TEST FAILED] Google Drive connection test failed:', error?.message);
      this.logger.error('Possible causes:');
      this.logger.error('- Invalid credentials');
      this.logger.error('- Google Drive API not enabled');
      this.logger.error('- Network connectivity issues');
      
      // Clear drive to prevent usage
      this.drive = undefined;
    }
  }

  getName(): string {
    return 'google-drive';
  }

  async upload(options: UploadOptions): Promise<UploadResult> {
    if (!this.drive) {
      throw new Error('Google Drive provider belum diinisialisasi');
    }

    try {
      // Convert buffer ke stream
      const stream = Readable.from(options.buffer);

      // Metadata file
      const fileMetadata: any = {
        name: options.originalname,
        // Try to use folder if accessible, otherwise skip
        ...(options.folder && { parents: [options.folder] }),
        ...(this.folderId && !options.folder && { parents: [this.folderId] }),
      };

      // Upload file
      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: {
          mimeType: options.mimetype,
          body: stream,
        },
        fields: 'id, name, size, mimeType, webViewLink, webContentLink',
      });

      const file = response.data;

      // Set file sebagai public (anyone with link can view)
      await this.drive.permissions.create({
        fileId: file.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      // Get public URL
      const publicUrl = `https://drive.google.com/uc?export=view&id=${file.id}`;

      this.logger.log(`File uploaded ke Google Drive: ${file.name} (${file.id})`);

      return {
        url: publicUrl,
        fileId: file.id,
        filename: file.name,
        size: parseInt(file.size || '0'),
        mimetype: file.mimeType,
        provider: this.getName(),
        metadata: {
          webViewLink: file.webViewLink,
          webContentLink: file.webContentLink,
        },
      };
    } catch (error) {
      this.logger.error('Gagal upload ke Google Drive:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Upload ke Google Drive gagal: ${errorMessage}`);
    }
  }

  async delete(fileId: string): Promise<boolean> {
    if (!this.drive) {
      throw new Error('Google Drive provider belum diinisialisasi');
    }

    try {
      await this.drive.files.delete({
        fileId: fileId,
      });

      this.logger.log(`File dihapus dari Google Drive: ${fileId}`);
      return true;
    } catch (error) {
      this.logger.error('Gagal hapus file dari Google Drive:', error);
      return false;
    }
  }

  async getPublicUrl(fileId: string): Promise<string> {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  async exists(fileId: string): Promise<boolean> {
    if (!this.drive) {
      return false;
    }

    try {
      await this.drive.files.get({
        fileId: fileId,
        fields: 'id',
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Test if Google Drive is ready and accessible
   */
  async isReady(): Promise<{ ready: boolean; message: string; details?: any }> {
    if (!this.drive) {
      return {
        ready: false,
        message: 'Google Drive provider belum diinisialisasi',
      };
    }

    try {
      const aboutResponse = await this.drive.about.get({
        fields: 'user, storageQuota',
      });

      const details: any = {
        serviceAccount: aboutResponse.data.user?.emailAddress,
        storageUsed: aboutResponse.data.storageQuota?.usage,
        storageLimit: aboutResponse.data.storageQuota?.limit,
      };

      if (this.folderId) {
        try {
          const folderResponse = await this.drive.files.get({
            fileId: this.folderId,
            fields: 'id, name, mimeType, capabilities',
          });

          details.folder = {
            id: this.folderId,
            name: folderResponse.data.name,
            canAddChildren: folderResponse.data.capabilities?.canAddChildren,
          };
        } catch (error: any) {
          details.folderError = error?.message;
        }
      }

      return {
        ready: true,
        message: 'Google Drive siap digunakan',
        details,
      };
    } catch (error: any) {
      return {
        ready: false,
        message: `Google Drive tidak dapat diakses: ${error?.message}`,
      };
    }
  }
}
