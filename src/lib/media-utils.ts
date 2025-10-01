import { mediaStorage, MediaUploadOptions, MediaUploadResult } from './storage';
import { MediaMetadata } from './types';
import imageCompression from 'browser-image-compression';

export interface MediaValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: MediaValidationError[];
}

export class MediaUtils {
  static validateFile(file: File, options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
    requireImage?: boolean;
    requireVideo?: boolean;
  } = {}): ValidationResult {
    const {
      maxSizeMB = 50,
      allowedTypes,
      requireImage = false,
      requireVideo = false
    } = options;

    const errors: MediaValidationError[] = [];

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      errors.push({
        field: 'size',
        message: `File size exceeds ${maxSizeMB}MB limit`
      });
    }

    // Check file type
    const isImage = mediaStorage.isImageType(file.type);
    const isVideo = mediaStorage.isVideoType(file.type);

    if (!isImage && !isVideo) {
      errors.push({
        field: 'type',
        message: 'Unsupported file type'
      });
    }

    if (requireImage && !isImage) {
      errors.push({
        field: 'type',
        message: 'Image file required'
      });
    }

    if (requireVideo && !isVideo) {
      errors.push({
        field: 'type',
        message: 'Video file required'
      });
    }

    if (allowedTypes && !allowedTypes.includes(file.type)) {
      errors.push({
        field: 'type',
        message: 'File type not allowed'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (minutes < 60) {
      return `${minutes}m ${remainingSeconds}s`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  }

  static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  static isDataUrl(url: string): boolean {
    return url.startsWith('data:');
  }

  static isStorageUrl(url: string): boolean {
    return url.includes('firebasestorage.googleapis.com') ||
           url.includes('storage.googleapis.com');
  }

  static getMediaTypeFromUrl(url: string): 'image' | 'video' | 'unknown' {
    const extension = this.getFileExtension(url);
    const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    const videoExtensions = ['mp4', 'webm', 'mov', 'avi'];

    if (imageExtensions.includes(extension)) return 'image';
    if (videoExtensions.includes(extension)) return 'video';
    return 'unknown';
  }

  static async optimizeImage(
    file: File,
    options: {
      maxSizeMB?: number;
      maxWidthOrHeight?: number;
      quality?: number;
    } = {}
  ): Promise<File> {
    const {
      maxSizeMB = 1,
      maxWidthOrHeight = 1920,
      quality = 0.8
    } = options;

    try {
      const compressionOptions = {
        maxSizeMB,
        maxWidthOrHeight,
        useWebWorker: true,
        fileType: 'image/jpeg',
        quality
      };

      return await imageCompression(file, compressionOptions);
    } catch (error) {
      console.warn('Image optimization failed:', error);
      return file;
    }
  }

  static generateThumbnail(
    file: File,
    size: { width: number; height: number } = { width: 150, height: 150 }
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Calculate aspect ratio
          const aspectRatio = img.width / img.height;
          let targetWidth = size.width;
          let targetHeight = size.height;

          if (aspectRatio > 1) {
            targetHeight = size.width / aspectRatio;
          } else {
            targetWidth = size.height * aspectRatio;
          }

          canvas.width = targetWidth;
          canvas.height = targetHeight;

          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(dataUrl);
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
      } else {
        reject(new Error('Thumbnail generation only supports images'));
      }
    });
  }

  static async uploadCampaignMedia(
    file: File,
    campaignId: string,
    options: MediaUploadOptions = {}
  ): Promise<MediaUploadResult> {
    try {
      const validation = this.validateFile(file, {
        maxSizeMB: file.type.startsWith('image/') ? 10 : 100
      });

      if (!validation.isValid) {
        throw new Error(validation.errors.map(e => e.message).join(', '));
      }

      return await mediaStorage.uploadMedia(file, campaignId, options);
    } catch (error) {
      console.error('Media upload failed:', error);
      throw error;
    }
  }

  static getMediaMetadataFromUpload(result: MediaUploadResult): MediaMetadata {
    return {
      name: result.metadata.name,
      size: result.metadata.size,
      type: result.metadata.type,
      lastModified: result.metadata.lastModified,
      dimensions: result.metadata.customMetadata?.dimensions,
      duration: result.metadata.customMetadata?.duration ?
        parseInt(result.metadata.customMetadata.duration) : undefined,
      thumbnail: result.metadata.customMetadata?.thumbnail,
      originalName: result.metadata.customMetadata?.originalName
    };
  }

  static createUploadProgressTracker(): {
    onProgress: (progress: number) => void;
    getProgress: () => number;
  } {
    let progress = 0;

    return {
      onProgress: (newProgress: number) => {
        progress = newProgress;
      },
      getProgress: () => progress
    };
  }

  static async downloadMedia(url: string, filename: string): Promise<void> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  static getMediaDisplayInfo(campaign: {
    mediaURL?: string;
    mediaUrl?: string;
    mediaThumbnailUrl?: string;
    mediaMetadata?: MediaMetadata;
    mediaType: 'image' | 'video';
  }): {
    displayUrl: string;
    thumbnailUrl?: string;
    isDataUrl: boolean;
    isStorageUrl: boolean;
    dimensions?: string;
    duration?: string;
    fileSize?: string;
  } {
    const primaryUrl = campaign.mediaUrl || campaign.mediaURL || '';
    const thumbnailUrl = campaign.mediaThumbnailUrl || campaign.mediaMetadata?.thumbnail;

    return {
      displayUrl: primaryUrl,
      thumbnailUrl,
      isDataUrl: this.isDataUrl(primaryUrl),
      isStorageUrl: this.isStorageUrl(primaryUrl),
      dimensions: campaign.mediaMetadata?.dimensions,
      duration: campaign.mediaMetadata?.duration ?
        this.formatDuration(campaign.mediaMetadata.duration) : undefined,
      fileSize: campaign.mediaMetadata?.size ?
        this.formatFileSize(campaign.mediaMetadata.size) : undefined
    };
  }
}