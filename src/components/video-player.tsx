'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaUtils } from '@/lib/media-utils';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  width?: number | string;
  height?: number | string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  showControls?: boolean;
  compact?: boolean;
}

export function VideoPlayer({
  src,
  poster,
  className,
  controls = true,
  autoPlay = false,
  muted = false,
  loop = false,
  width = '100%',
  height = 'auto',
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
  showControls = true,
  compact = false
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(muted ? 0 : 1);
  const [isMuted, setIsMuted] = useState(muted);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControlsOverlay, setShowControlsOverlay] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);

  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime, video.duration);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
      if (showControls) {
        hideControlsOverlay();
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
      if (showControls) {
        showControlsOverlayNow();
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
      if (!loop) {
        showControlsOverlayNow();
      }
    };

    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('volumechange', handleVolumeChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('volumechange', handleVolumeChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [onTimeUpdate, onPlay, onPause, onEnded, loop, showControls]);

  const hideControlsOverlay = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControlsOverlay(false);
    }, 3000);
  };

  const showControlsOverlayNow = () => {
    setShowControlsOverlay(true);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = (parseFloat(event.target.value) / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(event.target.value) / 100;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercentage = volume * 100;

  const renderControls = () => {
    if (compact) {
      return (
        <div className="flex items-center space-x-2 p-2 bg-black/80 text-white">
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePlay}
            className="h-8 w-8 p-0 text-white hover:bg-white/20"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <div className="text-xs">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      );
    }

    return (
      <div className={cn(
        "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent",
        "transition-opacity duration-300",
        showControls || !isPlaying ? "opacity-100" : "opacity-0"
      )}>
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
          {/* Progress bar */}
          <div className="flex items-center space-x-2">
            <Progress value={progressPercentage} className="flex-1 h-1" />
            <div className="text-xs text-white min-w-[80px] text-right">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => skip(-10)}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={togglePlay}
                className="h-10 w-10 p-0 text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => skip(10)}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                <SkipForward className="h-4 w-4" />
              </Button>

              {/* Volume control */}
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <div className="w-20">
                  <Progress value={volumePercentage} className="h-1" />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Playback speed */}
              <select
                value={playbackRate}
                onChange={(e) => {
                  const rate = parseFloat(e.target.value);
                  setPlaybackRate(rate);
                  if (videoRef.current) {
                    videoRef.current.playbackRate = rate;
                  }
                }}
                className="bg-black/50 text-white text-xs px-2 py-1 rounded border border-white/20"
              >
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (compact) {
    return (
      <div className={cn("relative bg-black rounded-lg overflow-hidden", className)}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          playsInline
          className="w-full h-full"
          style={{ width, height }}
        />
        {controls && renderControls()}
      </div>
    );
  }

  return (
    <Card className={cn("relative overflow-hidden bg-black", className)}>
      <CardContent className="p-0">
        <div
          className="relative"
          style={{ width, height }}
          onMouseMove={showControlsOverlayNow}
          onMouseLeave={hideControlsOverlay}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}

          <video
            ref={videoRef}
            src={src}
            poster={poster}
            autoPlay={autoPlay}
            muted={muted}
            loop={loop}
            playsInline
            className="w-full h-full object-contain"
            style={{ width, height }}
            onClick={togglePlay}
          />

          {/* Play button overlay when paused */}
          {!isPlaying && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Button
                variant="ghost"
                size="lg"
                onClick={togglePlay}
                className="h-16 w-16 p-0 bg-black/50 text-white hover:bg-black/70 pointer-events-auto"
              >
                <Play className="h-8 w-8" />
              </Button>
            </div>
          )}

          {controls && renderControls()}
        </div>
      </CardContent>
    </Card>
  );
}