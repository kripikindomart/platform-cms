/**
 * URL Format Enums & Helpers
 * Manages different Google Drive URL formats for various file types
 */

/**
 * Google Drive URL format types
 */
export enum GoogleDriveUrlFormat {
  DIRECT_VIEW = 'direct_view',        // For images: https://lh3.googleusercontent.com/d/{id}
  THUMBNAIL = 'thumbnail',             // For thumbnails: https://drive.google.com/thumbnail?id={id}&sz=w{size}
  DOWNLOAD = 'download',               // For documents: https://drive.google.com/uc?id={id}&export=download
  EMBED_VIEW = 'embed_view',           // For embed: https://drive.google.com/file/d/{id}/preview
}

/**
 * File category classification
 */
export enum FileCategory {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  OTHER = 'other',
}

/**
 * Helper class to generate Google Drive URLs based on format type
 */
export class UrlFormatHelper {
  /**
   * Generate Google Drive URL based on format type
   * @param fileId - Google Drive file ID
   * @param format - URL format type
   * @param options - Additional options (e.g., thumbnail size)
   * @returns Generated URL
   */
  static generateUrl(
    fileId: string,
    format: GoogleDriveUrlFormat,
    options?: { size?: number },
  ): string {
    switch (format) {
      case GoogleDriveUrlFormat.DIRECT_VIEW:
        return `https://lh3.googleusercontent.com/d/${fileId}`;

      case GoogleDriveUrlFormat.THUMBNAIL:
        const size = options?.size || 200;
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;

      case GoogleDriveUrlFormat.DOWNLOAD:
        return `https://drive.google.com/uc?id=${fileId}&export=download`;

      case GoogleDriveUrlFormat.EMBED_VIEW:
        return `https://drive.google.com/file/d/${fileId}/preview`;

      default:
        // Fallback to direct view
        return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }
}

/**
 * Helper class to classify file types based on mimetype
 */
export class FileTypeClassifier {
  private static readonly IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
  ];

  private static readonly DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'text/plain',
    'text/csv',
    'application/rtf',
  ];

  private static readonly VIDEO_TYPES = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-ms-wmv',
    'video/webm',
  ];

  private static readonly AUDIO_TYPES = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/webm',
    'audio/aac',
  ];

  /**
   * Classify file category based on mimetype
   * @param mimetype - MIME type of the file
   * @returns File category
   */
  static classify(mimetype: string): FileCategory {
    const lowerMimetype = mimetype.toLowerCase();

    // Check specific types first
    if (this.IMAGE_TYPES.includes(lowerMimetype)) {
      return FileCategory.IMAGE;
    }

    if (this.DOCUMENT_TYPES.includes(lowerMimetype)) {
      return FileCategory.DOCUMENT;
    }

    if (this.VIDEO_TYPES.includes(lowerMimetype)) {
      return FileCategory.VIDEO;
    }

    if (this.AUDIO_TYPES.includes(lowerMimetype)) {
      return FileCategory.AUDIO;
    }

    // Fallback to prefix matching
    if (lowerMimetype.startsWith('image/')) {
      return FileCategory.IMAGE;
    }

    if (lowerMimetype.startsWith('video/')) {
      return FileCategory.VIDEO;
    }

    if (lowerMimetype.startsWith('audio/')) {
      return FileCategory.AUDIO;
    }

    if (
      lowerMimetype.startsWith('application/') ||
      lowerMimetype.startsWith('text/')
    ) {
      return FileCategory.DOCUMENT;
    }

    // Default fallback
    return FileCategory.OTHER;
  }

  /**
   * Get default URL format for a file category
   * @param category - File category
   * @returns Default URL format
   */
  static getDefaultFormat(category: FileCategory): GoogleDriveUrlFormat {
    switch (category) {
      case FileCategory.IMAGE:
        return GoogleDriveUrlFormat.DIRECT_VIEW;
      case FileCategory.DOCUMENT:
        return GoogleDriveUrlFormat.DOWNLOAD;
      case FileCategory.VIDEO:
      case FileCategory.AUDIO:
        return GoogleDriveUrlFormat.EMBED_VIEW;
      case FileCategory.OTHER:
      default:
        return GoogleDriveUrlFormat.DOWNLOAD;
    }
  }
}
