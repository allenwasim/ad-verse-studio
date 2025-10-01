'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import {
  Upload,
  X,
  Image as ImageIcon,
  Video,
  FileVideo,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaUtils, ValidationResult } from '@/lib/media-utils';
import { MediaUploadResult } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface MediaUploadProps {
  onMediaUploaded: (result: MediaUploadResult) => void;
  onMediaRemoved: () => void;
  campaignId: string;
  acceptedTypes?: 'image' | 'video' | 'both';
  maxFileSizeMB?: number;
  disabled?: boolean;
  className?: string;
  initialMedia?: {
    url: string;
    type: 'image' | 'video';
    metadata?: any;
  };
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error?: string;
  uploadedMedia?: MediaUploadResult;
}

export function MediaUpload({
  onMediaUploaded,
  onMediaRemoved,
  campaignId,
  acceptedTypes = 'both',
  maxFileSizeMB = 50,
  disabled = false,
  className,
  initialMedia
}: MediaUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{
    url: string;
    type: 'image' | 'video';
    name?: string;
  } | null>(initialMedia ? {
    url: initialMedia.url,
    type: initialMedia.type,
    name: initialMedia.metadata?.originalName
  } : null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const { toast } = useToast();

  useEffect(() => {
    if (initialMedia) {
      setPreviewMedia({
        url: initialMedia.url,
        type: initialMedia.type,
        name: initialMedia.metadata?.originalName
      });
    }
  }, [initialMedia]);

  const getAcceptedFileTypes = useCallback(() => {
    switch (acceptedTypes) {
      case 'image':
        return 'image/jpeg,image/png,image/webp';
      case 'video':
        return 'video/mp4,video/webm,video/quicktime';
      case 'both':
        return 'image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime';
      default:
        return '*';
    }
  }, [acceptedTypes]);

  const validateFile = useCallback((file: File): ValidationResult => {
    const options: any = {
      maxSizeMB: maxFileSizeMB
    };

    if (acceptedTypes === 'image') {
      options.requireImage = true;
    } else if (acceptedTypes === 'video') {
      options.requireVideo = true;
    }

    return MediaUtils.validateFile(file, options);
  }, [acceptedTypes, maxFileSizeMB]);

  const handleFileSelect = useCallback(async (file: File) => {
    if (disabled || !campaignId) return;

    const validation = validateFile(file);
    if (!validation.isValid) {
      const errorMessage = validation.errors.map(e => e.message).join(', ');
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: errorMessage
      });
      return;
    }

    setUploadState({ isUploading: true, progress: 0 });

    try {
      const result = await MediaUtils.uploadCampaignMedia(
        file,
        campaignId,
        {
          onProgress: (progress) => {
            setUploadState(prev => ({ ...prev, progress }));
          },
          compressImages: true,
          generateThumbnail: file.type.startsWith('video/')
        }
      );

      const isImage = file.type.startsWith('image/');
      setPreviewMedia({
        url: result.downloadURL,
        type: isImage ? 'image' : 'video',
        name: file.name
      });

      setUploadState({
        isUploading: false,
        progress: 100,
        uploadedMedia: result
      });

      onMediaUploaded(result);

      toast({
        title: 'Upload Successful',
        description: `${isImage ? 'Image' : 'Video'} uploaded successfully`
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadState({
        isUploading: false,
        progress: 0,
        error: errorMessage
      });

      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: errorMessage
      });
    }
  }, [disabled, campaignId, validateFile, toast, onMediaUploaded]);

  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (disabled) return;

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [disabled, handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current++;

    if (event.dataTransfer.items && event.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current--;

    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleClick = useCallback(() => {
    if (!disabled && !uploadState.isUploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, uploadState.isUploading]);

  const handleRemoveMedia = useCallback(() => {
    setPreviewMedia(null);
    setUploadState({ isUploading: false, progress: 0 });
    onMediaRemoved();

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    toast({
      title: 'Media Removed',
      description: 'Media has been removed from the campaign'
    });
  }, [onMediaRemoved, toast]);

  const renderUploadArea = () => {
    if (previewMedia) {
      return (
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="relative group">
              {previewMedia.type === 'image' ? (
                <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
                  <img
                    src={previewMedia.url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveMedia}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
                  <video
                    src={previewMedia.url}
                    className="w-full h-full object-cover"
                    controls
                    muted
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveMedia}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              )}
              <div className="mt-2 text-sm text-muted-foreground text-center">
                {previewMedia.name || 'Media uploaded'}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragging && "border-primary bg-primary/5",
          uploadState.error && "border-destructive bg-destructive/5",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            {uploadState.isUploading ? (
              <div className="flex flex-col items-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="text-sm font-medium">Uploading...</div>
                <Progress value={uploadState.progress} className="w-32 h-2" />
                <div className="text-xs text-muted-foreground">
                  {uploadState.progress}%
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-3">
                  {acceptedTypes === 'image' ? (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  ) : acceptedTypes === 'video' ? (
                    <Video className="h-8 w-8 text-muted-foreground" />
                  ) : (
                    <FileVideo className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium">
                    {isDragging ? 'Drop file here' : 'Upload media'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {acceptedTypes === 'image' && 'Images only (JPEG, PNG, WebP)'}
                    {acceptedTypes === 'video' && 'Videos only (MP4, WebM, MOV)'}
                    {acceptedTypes === 'both' && 'Images and videos'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Max size: {maxFileSizeMB}MB
                  </div>
                </div>
                <Button variant="outline" size="sm" disabled={disabled}>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </>
            )}

            {uploadState.error && (
              <div className="flex items-center space-x-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{uploadState.error}</span>
              </div>
            )}

            {uploadState.uploadedMedia && (
              <div className="flex items-center space-x-2 text-green-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                <span>Upload complete</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {renderUploadArea()}
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptedFileTypes()}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}