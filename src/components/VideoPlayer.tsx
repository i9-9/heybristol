'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import type { VideoItem } from '@/lib/types';
import { useVimeoPlayer } from '@/hooks/useVimeoPlayer';

interface VideoPlayerProps {
  video: VideoItem;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  onFullscreenToggle?: () => void;
  isFullscreen?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onMouseMove?: () => void;
  showControls?: boolean;
}

export default function VideoPlayer({ 
  video, 
  className = "",
  autoPlay = true,
  loop = false,
  muted = true,
  onFullscreenToggle,
  isFullscreen = false,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
  showControls = false
}: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [hasShownInitialTimeline, setHasShownInitialTimeline] = useState(false);
  const [isMouseOverVideo, setIsMouseOverVideo] = useState(false);
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);

  // Usar el custom hook
  const {
    playerState,
    playerRef,
    handlePlayPause,
    handleSeek,
    handleVolumeChange,
    handleMuteToggle,
    startDragging,
    stopDragging,
    isDragging
  } = useVimeoPlayer(video?.id || '', {
    autoPlay,
    muted,
    loop
  });

  // Ensure component only renders on client side to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-hide controls logic
  useEffect(() => {
    if (showTimeline && !isMouseOverVideo) {
      autoHideTimerRef.current = setTimeout(() => {
        setShowTimeline(false);
      }, 3000);
      
      return () => {
        if (autoHideTimerRef.current) {
          clearTimeout(autoHideTimerRef.current);
          autoHideTimerRef.current = null;
        }
      };
    } else if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = null;
    }
  }, [showTimeline, isMouseOverVideo]);

  // Show timeline on initial interaction
  useEffect(() => {
    if (playerState.isReady && !hasShownInitialTimeline) {
      setShowTimeline(true);
      setHasShownInitialTimeline(true);
    }
  }, [playerState.isReady, hasShownInitialTimeline]);




  const handleTimelineMouseDown = useCallback((event: React.MouseEvent) => {
    startDragging();
    setIsDraggingTimeline(true);
    event.preventDefault();
  }, [startDragging]);

  const handleTimelineMouseMove = useCallback(async (event: React.MouseEvent) => {
    if (!isDragging() || !playerRef.current) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * playerState.duration;
    
    try {
      await handleSeek(newTime);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  }, [isDragging, handleSeek, playerState.duration]);

  const handleTimelineMouseUp = useCallback(async (event: React.MouseEvent) => {
    if (!playerRef.current || !isDragging()) return;
    
    stopDragging();
    setIsDraggingTimeline(false);
    
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * playerState.duration;
    
    try {
      await handleSeek(newTime);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  }, [isDragging, stopDragging, handleSeek, playerState.duration]);


  // Event listeners globales para mejor dragging
  useEffect(() => {
    const handleGlobalMouseMove = async (e: MouseEvent) => {
      if (!isDragging() || !playerRef.current) return;
      
      const timeline = document.querySelector('[data-timeline]');
      if (!timeline) return;
      
      const rect = timeline.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
      const newTime = percentage * playerState.duration;
      
      try {
        await handleSeek(newTime);
      } catch (error) {
        console.error('Error seeking:', error);
      }
    };

    const handleGlobalMouseUp = () => {
      stopDragging();
      setIsDraggingTimeline(false);
    };

    if (isDraggingTimeline) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDraggingTimeline, playerState.duration, isDragging, stopDragging, handleSeek]);

  const handleMouseEnter = useCallback(() => {
    setIsMouseOverVideo(true);
    setShowTimeline(true);
    onMouseEnter?.();
  }, [onMouseEnter]);

  const handleMouseLeave = useCallback(() => {
    setIsMouseOverVideo(false);
    onMouseLeave?.();
  }, [onMouseLeave]);

  const handleMouseMove = useCallback(() => {
    setShowTimeline(true);
    onMouseMove?.();
  }, [onMouseMove]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTimelineKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!playerRef.current) return;
    
    switch (e.key) {
      case ' ':
      case 'Enter':
        e.preventDefault();
        handlePlayPause();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        handleSeek(Math.max(0, playerState.currentTime - 5));
        break;
      case 'ArrowRight':
        e.preventDefault();
        handleSeek(Math.min(playerState.duration, playerState.currentTime + 5));
        break;
      case 'Home':
        e.preventDefault();
        handleSeek(0);
        break;
      case 'End':
        e.preventDefault();
        handleSeek(playerState.duration);
        break;
    }
  }, [playerState.currentTime, playerState.duration, handlePlayPause, handleSeek]);

  const getVimeoUrl = () => {
    if (!video?.id) return '';
    
    const params = new URLSearchParams({
      title: '0',
      byline: '0',
      portrait: '0',
      background: '1',
      autoplay: autoPlay ? '1' : '0',
      muted: muted ? '1' : '0',
      dnt: '1',
      api: '1',
      player_id: `vimeo_${video.id}`,
      rel: '0',
      playsinline: '1',
      color: '000000',
      controls: '0',
      keyboard: '0',
      pip: '0',
      loop: loop ? '1' : '0'
    });
    
    if (video.hash) {
      params.set('h', video.hash);
    }
    
    return `https://player.vimeo.com/video/${video.id}?${params.toString()}`;
  };

  if (!isClient) {
    return (
      <div className={`w-full h-full bg-black flex items-center justify-center ${className}`}>
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <div className="text-sm opacity-75">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ff0000;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .volume-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ff0000;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .volume-slider::-webkit-slider-track {
          background: transparent;
        }
        
        .volume-slider::-moz-range-track {
          background: transparent;
        }
      `}</style>
      <div 
        className={`relative w-full h-full bg-black group ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
      {/* Vimeo Player */}
      <iframe
        ref={iframeRef}
        src={getVimeoUrl()}
        className="w-full h-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />

      {/* Overlay Controls */}
      {(showTimeline || showControls) && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Top Controls */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-auto">
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePlayPause}
                className="w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
              >
                {playerState.isBuffering ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : playerState.isPlaying ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>

              <button
                onClick={handleMuteToggle}
                className="w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
              >
                {playerState.isMuted ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                )}
              </button>

              {/* Volume Slider */}
              {!playerState.isMuted && (
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={playerState.volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer volume-slider"
                    style={{
                      background: `linear-gradient(to right, #ffffff 0%, #ffffff ${playerState.volume * 100}%, rgba(255,255,255,0.3) ${playerState.volume * 100}%, rgba(255,255,255,0.3) 100%)`
                    }}
                  />
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            {onFullscreenToggle && (
              <button
                onClick={onFullscreenToggle}
                className="w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
              >
                {isFullscreen ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                  </svg>
                )}
              </button>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-4 left-4 right-4 pointer-events-auto">
            {/* Timeline */}
            <div className="mb-4">
              {/* Input range semántico para accesibilidad */}
              <input
                type="range"
                min="0"
                max={playerState.duration}
                value={playerState.currentTime}
                step="0.1"
                data-timeline
                onChange={(e) => {
                  const newTime = parseFloat(e.target.value);
                  handleSeek(newTime);
                }}
                onKeyDown={handleTimelineKeyDown}
                className="sr-only" // Visually hidden pero accesible
                aria-label="Video timeline"
                aria-valuemin={0}
                aria-valuemax={playerState.duration}
                aria-valuenow={playerState.currentTime}
                aria-valuetext={`${formatTime(playerState.currentTime)} of ${formatTime(playerState.duration)}`}
              />
              
              {/* Timeline visual */}
              <div
                className={`w-full h-2 bg-white/20 rounded-full cursor-pointer relative group transition-all duration-300 ${
                  isDraggingTimeline ? 'scale-y-125' : 'hover:scale-y-125'
                }`}
                onMouseDown={handleTimelineMouseDown}
                onMouseUp={handleTimelineMouseUp}
                onMouseMove={handleTimelineMouseMove}
                onMouseLeave={() => {
                  if (isDragging()) {
                    stopDragging();
                    setIsDraggingTimeline(false);
                  }
                }}
              >
                {/* Background track */}
                <div className="absolute inset-0 bg-white/10 rounded-full" />
                
                {/* Progress bar */}
                <div 
                  className={`h-full bg-gradient-to-r from-white/80 to-white rounded-full transition-all duration-200 ${
                    isDraggingTimeline ? 'shadow-lg shadow-white/30' : ''
                  }`}
                  style={{ width: `${playerState.duration > 0 ? (playerState.currentTime / playerState.duration) * 100 : 0}%` }}
                />
                
                {/* Buffer track */}
                <div 
                  className="absolute inset-0 bg-white/20 rounded-full"
                  style={{ width: `${playerState.buffered}%` }}
                />
                
                {/* Buffering indicator */}
                {playerState.isBuffering && (
                  <div 
                    className="absolute top-0 h-full bg-white/30 rounded-full animate-pulse"
                    style={{ width: `${playerState.duration > 0 ? Math.min(100, ((playerState.currentTime + 2) / playerState.duration) * 100) : 0}%` }}
                  />
                )}
                
                {/* Timeline handle */}
                <div 
                  className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-200 ${
                    isDraggingTimeline 
                      ? 'scale-125 shadow-xl shadow-white/50' 
                      : 'group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-white/30'
                  }`}
                  style={{ 
                    left: `${playerState.duration > 0 ? (playerState.currentTime / playerState.duration) * 100 : 0}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                
                {/* Hover preview */}
                <div className="absolute top-1/2 transform -translate-y-1/2 w-1 h-1 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" 
                     style={{ left: '50%', transform: 'translate(-50%, -50%)' }} />
              </div>
            </div>

            {/* Time Display */}
            <div className="flex justify-between items-center text-white text-sm">
              <span className="transition-all duration-200">{formatTime(playerState.currentTime)}</span>
              <span className="transition-all duration-200">{formatTime(playerState.duration)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {!playerState.isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <div className="text-sm opacity-75">Loading...</div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
