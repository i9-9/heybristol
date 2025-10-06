'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import type { VideoItem } from '@/lib/types';
import type { VimeoPlayer } from '@/lib/vimeo-types';

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
  const playerRef = useRef<VimeoPlayer | null>(null);
  const isDraggingRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isClient, setIsClient] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [hasShownInitialTimeline, setHasShownInitialTimeline] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isMouseOverVideo, setIsMouseOverVideo] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isBuffering, setIsBuffering] = useState(false);

  // Ensure component only renders on client side to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize Vimeo Player using existing pattern
  useEffect(() => {
    if (!isClient || !video?.id) return;

    let mounted = true;

    const setupPlayer = async () => {
      try {
        // Cargar script de Vimeo si no está disponible
        if (!window.Vimeo) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://player.vimeo.com/api/player.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Vimeo script'));
            document.head.appendChild(script);
          });
        }

        if (!mounted || !iframeRef.current) return;

        await new Promise(resolve => setTimeout(resolve, 1000));

        if (!mounted) return;

        const VimeoPlayerClass = window.Vimeo!.Player;
        const vimeoPlayer = new VimeoPlayerClass(iframeRef.current);
        
        if (!mounted) {
          try {
            vimeoPlayer.destroy();
          } catch {
            // Ignore cleanup errors
          }
          return;
        }
        
        playerRef.current = vimeoPlayer;

        vimeoPlayer.on('loaded', () => {
          if (!mounted) return;
          setIsPlayerReady(true);
          setIsBuffering(false);
          if (vimeoPlayer.getDuration) {
            vimeoPlayer.getDuration().then(setDuration);
          }
        });

        vimeoPlayer.on('play', () => {
          if (!mounted) return;
          setIsPlaying(true);
          setIsBuffering(false);
        });

        vimeoPlayer.on('pause', () => {
          if (!mounted) return;
          setIsPlaying(false);
        });

        vimeoPlayer.on('timeupdate', (...args: unknown[]) => {
          if (!mounted) return;
          const data = args[0] as { seconds: number };
          setCurrentTime(data.seconds);
        });

        vimeoPlayer.on('waiting', () => {
          if (!mounted) return;
          setIsBuffering(true);
        });

        vimeoPlayer.on('playing', () => {
          if (!mounted) return;
          setIsBuffering(false);
        });

        vimeoPlayer.on('error', (...args: unknown[]) => {
          const error = args[0] as Error;
          console.error('Player error:', error);
        });

      } catch (error) {
        console.error('Error setting up Vimeo player:', error);
      }
    };

    setupPlayer();

    return () => {
      mounted = false;
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, [isClient, video?.id]);

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
    if (isPlayerReady && !hasShownInitialTimeline) {
      setShowTimeline(true);
      setHasShownInitialTimeline(true);
    }
  }, [isPlayerReady, hasShownInitialTimeline]);

  const handlePlayPause = useCallback(async () => {
    if (!playerRef.current) return;
    
    try {
      if (isPlaying) {
        await playerRef.current.pause();
      } else {
        await playerRef.current.play();
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  }, [isPlaying]);

  const handleMuteToggle = useCallback(async () => {
    if (!playerRef.current) return;
    
    try {
      if (isMuted) {
        await playerRef.current.setVolume(volume);
        setIsMuted(false);
      } else {
        await playerRef.current.setVolume(0);
        setIsMuted(true);
      }
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  }, [isMuted, volume]);

  const handleVolumeChange = useCallback(async (newVolume: number) => {
    if (!playerRef.current) return;
    
    try {
      setVolume(newVolume);
      if (!isMuted) {
        await playerRef.current.setVolume(newVolume);
      }
    } catch (error) {
      console.error('Error changing volume:', error);
    }
  }, [isMuted]);

  const handleTimelineMouseDown = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  const handleTimelineMouseUp = useCallback(async (event: React.MouseEvent) => {
    if (!playerRef.current || !isDraggingRef.current) return;
    
    isDraggingRef.current = false;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    try {
      if (playerRef.current.setCurrentTime) {
        await playerRef.current.setCurrentTime(newTime);
      }
    } catch (error) {
      console.error('Error seeking:', error);
    }
  }, [duration]);

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
                {isBuffering ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isPlaying ? (
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
                {isMuted ? (
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
              {!isMuted && (
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer volume-slider"
                    style={{
                      background: `linear-gradient(to right, #ffffff 0%, #ffffff ${volume * 100}%, rgba(255,255,255,0.3) ${volume * 100}%, rgba(255,255,255,0.3) 100%)`
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
              <div
                className="w-full h-1 bg-white/30 rounded-full cursor-pointer relative"
                onMouseDown={handleTimelineMouseDown}
                onMouseUp={handleTimelineMouseUp}
              >
                <div 
                  className="h-full bg-white rounded-full transition-all duration-100"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
                <div 
                  className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg transition-all duration-100"
                  style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Time Display */}
            <div className="flex justify-between items-center text-white text-sm">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {!isPlayerReady && (
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
