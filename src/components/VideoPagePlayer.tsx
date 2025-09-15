"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { VideoItem } from "@/lib/types";

interface VideoPagePlayerProps {
  video: VideoItem;
  className?: string;
  onFullscreenToggle?: () => void;
  isFullscreen?: boolean;
  isMobile?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onMouseMove?: () => void;
  showControls?: boolean;
}

export default function VideoPagePlayer({
  video,
  className = "",
  onFullscreenToggle,
  isFullscreen = false,
  isMobile = false,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
  showControls = false
}: VideoPagePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [player, setPlayer] = useState<any>(null);
  const [shouldLoadIframe, setShouldLoadIframe] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getVimeoUrl = useCallback(() => {
    if (!video?.id) return '';
    
    const params = new URLSearchParams({
      title: '0',
      byline: '0',
      portrait: '0',
      background: '1',
      autoplay: '1',
      muted: '1',
      dnt: '1',
      api: '1',
      player_id: `vimeo_${video.id}`,
      rel: '0',
      playsinline: '1',
      color: '000000'
    });
    
    if (video.hash) {
      params.set('h', video.hash);
    }
    
    return `https://player.vimeo.com/video/${video.id}?${params.toString()}`;
  }, [video?.id, video?.hash]);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
          setShouldLoadIframe(true);
        }
      },
      { 
        threshold: [0.3],
        rootMargin: '100px'
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!shouldLoadIframe) return;

    let mounted = true;

    const setupPlayer = async () => {
      try {
        // Cargar script de Vimeo si no está disponible
        if (!(window as any).Vimeo) {
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

        const VimeoPlayerClass = (window as any).Vimeo.Player;
        const vimeoPlayer = new VimeoPlayerClass(iframeRef.current);
        
        if (!mounted) {
          try {
            vimeoPlayer.destroy();
          } catch (e) {
            // Ignore cleanup errors
          }
          return;
        }
        
        setPlayer(vimeoPlayer);

        vimeoPlayer.on('loaded', () => {
          if (!mounted) return;
          setIsBuffering(false);
          // Asegurar autoplay
          vimeoPlayer.play().catch((error: any) => {
            console.log('Autoplay prevented by browser:', error);
          });
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

        vimeoPlayer.on('ended', () => {
          if (!mounted) return;
          setIsPlaying(false);
        });

        vimeoPlayer.on('timeupdate', () => {
          if (!mounted) return;
          setIsBuffering(false);
        });

        vimeoPlayer.on('waiting', () => {
          if (!mounted) return;
          setIsBuffering(true);
        });

        vimeoPlayer.on('playing', () => {
          if (!mounted) return;
          setIsBuffering(false);
        });

      } catch (error) {
        console.error('Error setting up Vimeo player:', error);
      }
    };

    setupPlayer();

    return () => {
      mounted = false;
      if (player) {
        try {
          player.destroy();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [shouldLoadIframe, video.id]);

  const handlePlayPause = useCallback(async () => {
    if (!player) return;
    
    try {
      if (isPlaying) {
        await player.pause();
      } else {
        await player.play();
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  }, [player, isPlaying]);

  const handleMuteToggle = useCallback(async () => {
    if (!player) return;
    
    try {
      if (isMuted) {
        await player.setVolume(1);
        setIsMuted(false);
      } else {
        await player.setVolume(0);
        setIsMuted(true);
      }
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  }, [player, isMuted]);

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black overflow-hidden group ${className}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
    >
      {shouldLoadIframe && (
        <iframe
          ref={iframeRef}
          src={getVimeoUrl()}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          title={video.title}
          frameBorder="0"
          style={{
            backgroundColor: '#000000',
            border: 'none',
            outline: 'none'
          }}
        />
      )}

      <div className={`absolute inset-0 transition-all duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        
        <div className="absolute bottom-4 left-4 flex space-x-2">
          <button
            onClick={handlePlayPause}
            disabled={!player}
            className={`w-12 h-12 transition-all duration-200 bg-white/10 backdrop-blur-md hover:bg-white/20 shadow-lg flex items-center justify-center rounded ${
              !player ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
            }`}
          >
            {isBuffering ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isPlaying ? (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          <button
            onClick={handleMuteToggle}
            disabled={!player}
            className={`w-12 h-12 transition-all duration-200 bg-white/10 backdrop-blur-md hover:bg-white/20 shadow-lg flex items-center justify-center rounded ${
              !player ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
            }`}
          >
            {isMuted ? (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            )}
          </button>

          {!isMobile && onFullscreenToggle && (
            <button
              onClick={onFullscreenToggle}
              className="w-12 h-12 transition-all duration-200 bg-white/10 backdrop-blur-md hover:bg-white/20 shadow-lg flex items-center justify-center cursor-pointer rounded hover:scale-105"
            >
              {isFullscreen ? (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 16h3v3h2v-5H5v2zM3 11h5V5H6v3H3v3zM19 8h-3V5h-2v5h5V8zM16 13h3v3h-2v-3h-1v-2z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
              )}
            </button>
          )}
        </div>

        {isBuffering && (
          <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
            <div className="flex items-center space-x-3 text-white text-sm">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="font-medium">Buffering...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
