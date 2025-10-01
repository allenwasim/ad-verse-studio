import { storage } from './firebase';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  UploadMetadata,
  UploadTask,
  UploadResult,
  getMetadata
} from 'firebase/storage';
import imageCompression from 'browser-image-compression';

export interface MediaMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  customMetadata?: {
    duration?: string;
    dimensions?: string;
    thumbnail?: string;
    originalName?: string;
  };
}

export interface MediaUploadResult {
  downloadURL: string;
  storagePath: string;
  metadata: MediaMetadata;
  thumbnailURL?: string;
}

export interface MediaUploadOptions {
  onProgress?: (progress: number) => void;
  compressImages?: boolean;
  generateThumbnail?: boolean;
  maxSizeMB?: number;
}

export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_VIDEO_SIZE_MB = 100;

class MediaStorageService {
  private uploadTasks = new Map<string, UploadTask>();

  async uploadMedia(
    file: File,
    campaignId: string,
    options: MediaUploadOptions = {}
  ): Promise<MediaUploadResult> {
    const {
      onProgress,
      compressImages = true,
      generateThumbnail = true,
      maxSizeMB = MAX_IMAGE_SIZE_MB
    } = options;

    // Validate file type
    if (!this.isValidMediaType(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}`);
    }

    // Validate file size
    const maxSizeMBForType = file.type.startsWith('image/') ? MAX_IMAGE_SIZE_MB : MAX_VIDEO_SIZE_MB;
    if (file.size > maxSizeMBForType * 1024 * 1024) {
      throw new Error(`File size exceeds ${maxSizeMBForType}MB limit`);
    }

    let processedFile = file;
    let thumbnailBlob: Blob | null = null;

    // Process image files
    if (file.type.startsWith('image/') && compressImages) {
      try {
        const compressionOptions = {
          maxSizeMB: maxSizeMB,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: file.type
        };
        processedFile = await imageCompression(file, compressionOptions);
      } catch (error) {
        console.warn('Image compression failed, using original file:', error);
      }
    }

    // Generate thumbnail for videos
    if (file.type.startsWith('video/') && generateThumbnail) {
      try {
        thumbnailBlob = await this.generateVideoThumbnail(file);
      } catch (error) {
        console.warn('Video thumbnail generation failed:', error);
      }
    }

    // Generate unique file paths
    const timestamp = Date.now();
    const fileExtension = processedFile.name.split('.').pop() || '';
    const basePath = `campaign-media/${campaignId}`;
    const filePath = `${basePath}/${timestamp}.${fileExtension}`;
    const storageRef = ref(storage, filePath);

    // Prepare metadata
    const metadata: UploadMetadata = {
      contentType: processedFile.type,
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    };

    // Simple upload without resumable features to avoid API issues
    if (onProgress) {
      // Simulate progress for better UX
      onProgress(0);
    }

    const uploadResult = await uploadBytes(storageRef, processedFile, metadata);

    if (onProgress) {
      // Simulate completion
      setTimeout(() => onProgress(100), 100);
    }
    const downloadURL = await getDownloadURL(uploadResult.ref);

    // Get file metadata
    const fileMetadata = await getMetadata(uploadResult.ref);
    const mediaMetadata: MediaMetadata = {
      name: fileMetadata.name,
      size: fileMetadata.size,
      type: fileMetadata.contentType || file.type,
      lastModified: fileMetadata.updated ? new Date(fileMetadata.updated).getTime() : timestamp,
      customMetadata: {
        originalName: file.name,
        ...(fileMetadata.customMetadata || {})
      }
    };

    // Add dimensions for images
    if (processedFile.type.startsWith('image/')) {
      try {
        const dimensions = await this.getImageDimensions(processedFile);
        mediaMetadata.customMetadata!.dimensions = `${dimensions.width}x${dimensions.height}`;
      } catch (error) {
        console.warn('Failed to get image dimensions:', error);
      }
    }

    // Add duration for videos
    if (file.type.startsWith('video/')) {
      try {
        const duration = await this.getVideoDuration(file);
        mediaMetadata.customMetadata!.duration = Math.round(duration).toString();
      } catch (error) {
        console.warn('Failed to get video duration:', error);
      }
    }

    let thumbnailURL: string | undefined;

    // Upload thumbnail if generated
    if (thumbnailBlob) {
      try {
        const thumbnailPath = `${basePath}/thumbnails/${timestamp}.jpg`;
        const thumbnailRef = ref(storage, thumbnailPath);
        const thumbnailUploadResult = await uploadBytes(thumbnailRef, thumbnailBlob, {
          contentType: 'image/jpeg'
        });
        thumbnailURL = await getDownloadURL(thumbnailUploadResult.ref);
        mediaMetadata.customMetadata!.thumbnail = thumbnailURL;
      } catch (error) {
        console.warn('Failed to upload thumbnail:', error);
      }
    }

    // Clean up task tracking
    this.uploadTasks.delete(taskId);

    return {
      downloadURL,
      storagePath: filePath,
      metadata: mediaMetadata,
      thumbnailURL
    };
  }

  async deleteMedia(storagePath: string): Promise<void> {
    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Failed to delete media:', error);
      throw error;
    }
  }

  async getMediaURL(storagePath: string): Promise<string> {
    try {
      const storageRef = ref(storage, storagePath);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Failed to get media URL:', error);
      throw error;
    }
  }

  isValidMediaType(type: string): boolean {
    return SUPPORTED_IMAGE_TYPES.includes(type) || SUPPORTED_VIDEO_TYPES.includes(type);
  }

  isImageType(type: string): boolean {
    return SUPPORTED_IMAGE_TYPES.includes(type);
  }

  isVideoType(type: string): boolean {
    return SUPPORTED_VIDEO_TYPES.includes(type);
  }

  private async generateVideoThumbnail(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.preload = 'metadata';
      video.addEventListener('loadedmetadata', () => {
        // Seek to 1 second or 10% of the video, whichever is smaller
        video.currentTime = Math.min(1, video.duration * 0.1);
      });

      video.addEventListener('seeked', () => {
        try {
          canvas.width = 320;
          canvas.height = (320 / video.videoWidth) * video.videoHeight;

          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to generate thumbnail blob'));
              }
            }, 'image/jpeg', 0.8);
          } else {
            reject(new Error('Failed to get canvas context'));
          }
        } catch (error) {
          reject(error);
        }
      });

      video.addEventListener('error', () => {
        reject(new Error('Video loading failed'));
      });

      video.src = URL.createObjectURL(file);
    });
  }

  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      img.src = URL.createObjectURL(file);
    });
  }

  private async getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.addEventListener('loadedmetadata', () => {
        resolve(video.duration);
      });
      video.addEventListener('error', () => {
        reject(new Error('Failed to load video metadata'));
      });
      video.src = URL.createObjectURL(file);
    });
  }

  cancelUpload(taskId: string): boolean {
    const task = this.uploadTasks.get(taskId);
    if (task) {
      try {
        // UploadTask from uploadBytesResumable has a cancel method
        task.cancel();
        this.uploadTasks.delete(taskId);
        return true;
      } catch (error) {
        console.error('Failed to cancel upload:', error);
        this.uploadTasks.delete(taskId);
        return false;
      }
    }
    return false;
  }
}

export const mediaStorage = new MediaStorageService();