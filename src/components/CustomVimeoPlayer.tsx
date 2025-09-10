"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { VideoItem } from "@/lib/types";

interface VimeoPlayer {
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  play: () => Promise<void>;
  pause: () => void;
  setMuted: (muted: boolean) => Promise<void>;
  getMuted: () => Promise<boolean>;
  getPaused: () => Promise<boolean>;
  setVolume: (volume: number) => Promise<void>;
  getVolume: () => Promise<number>;
  destroy: () => void;
}

interface CustomVimeoPlayerProps {
  video: VideoItem;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onMouseMove?: () => void;
  showControls?: boolean;
  onFullscreenToggle?: () => void;
  isFullscreen?: boolean;
  isMobile?: boolean;
}

export default function CustomVimeoPlayer({
  video,
  className = "",
  autoPlay = false,
  loop = false,
  muted = true,
  onPlay,
  onPause,
  onEnded,
  onMouseEnter: externalOnMouseEnter,
  onMouseLeave: externalOnMouseLeave,
  onMouseMove: externalOnMouseMove,
  showControls: externalShowControls,
  onFullscreenToggle,
  isFullscreen = false,
  isMobile = false
}: CustomVimeoPlayerProps) {
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<VimeoPlayer | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);


  // URL de Vimeo corregida
  const getVimeoUrl = useCallback(() => {
    if (!video?.id) return '';
    
    const params = new URLSearchParams({
      title: '0',
      byline: '0',
      portrait: '0',
      controls: '0',
      autoplay: autoPlay ? '1' : '0',
      loop: loop ? '1' : '0',
      muted: muted ? '1' : '0', // CORREGIDO: usar el valor real de muted
      dnt: '1',
      color: 'ffffff',
      background: '0',
      api: '1', // Habilitar API
      player_id: `vimeo_${video.id}` // ID único para el player
    });
    
    if (video.hash) {
      params.set('h', video.hash);
    }
    
    return `https://player.vimeo.com/video/${video.id}?${params.toString()}`;
  }, [video?.id, video?.hash, autoPlay, loop, muted]);

  const handleMuteToggle = useCallback(async () => {
    if (!playerRef.current) return;

    try {
      const currentMuted = await playerRef.current.getMuted();

      if (currentMuted) {
        await playerRef.current.setMuted(false);
        const volAfter = await playerRef.current.getVolume();
        if (volAfter === 0) {
          await playerRef.current.setVolume(1);
        }
      } else {
        await playerRef.current.setMuted(true);
      }

      await new Promise(r => setTimeout(r, 120));
      const finalMuted = await playerRef.current.getMuted();
      setIsMuted(finalMuted);

    } catch (err) {
      console.error('[VimeoPlayer] mute toggle error', err);
    }
  }, []);

  const handlePlayPause = useCallback(async () => {
    if (!playerRef.current) return;

    try {
      const isPaused = await playerRef.current.getPaused();
      
      if (isPaused) {
        await playerRef.current.play();
      } else {
        playerRef.current.pause();
      }
      
    } catch (error) {
      console.error('[VimeoPlayer] play/pause error:', error);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const setupPlayer = async () => {
      try {
        // Limpiar cualquier timeout previo
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current);
        }

        // Cargar script de Vimeo
        if (!(window as Window & { Vimeo?: { Player: new (element: HTMLIFrameElement) => VimeoPlayer } }).Vimeo) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://player.vimeo.com/api/player.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Vimeo script'));
            document.head.appendChild(script);
          });
        }

        if (!mountedRef.current || !iframeRef.current) return;

        // Esperar a que el iframe esté listo
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (!mountedRef.current) return;

        const VimeoPlayerClass = (window as unknown as Window & { Vimeo: { Player: new (element: HTMLIFrameElement) => VimeoPlayer } }).Vimeo.Player;
        const player = new VimeoPlayerClass(iframeRef.current);
        playerRef.current = player;

        player.on('loaded', async () => {
          if (!mountedRef.current) return;
          
          setIsBuffering(false);
          
          setTimeout(async () => {
            try {
              if (!mountedRef.current || !playerRef.current) return;
              
              const currentMuted = await playerRef.current.getMuted();
              if (currentMuted !== muted) {
                await playerRef.current.setMuted(muted);
                await new Promise(resolve => setTimeout(resolve, 100));
                const finalMuted = await playerRef.current.getMuted();
                setIsMuted(finalMuted);
              } else {
                setIsMuted(currentMuted);
              }
              
              const isPaused = await playerRef.current.getPaused();
              setIsPlaying(!isPaused);
              
            } catch (error) {
              console.error('[VimeoPlayer] initial setup error:', error);
            }
          }, 500);
        });

        player.on('play', () => {
          if (!mountedRef.current) return;
          setIsPlaying(true);
          setIsBuffering(false);
          onPlay?.();
        });

        player.on('pause', () => {
          if (!mountedRef.current) return;
          setIsPlaying(false);
          onPause?.();
        });

        player.on('ended', () => {
          if (!mountedRef.current) return;
          setIsPlaying(false);
          onEnded?.();
        });

        player.on('volumechange', async () => {
          if (!mountedRef.current || !playerRef.current) return;
          try {
            const actualMuted = await playerRef.current.getMuted();
            setIsMuted(actualMuted);
          } catch (e) {
            console.error('[VimeoPlayer] volume change error:', e);
          }
        });

        player.on('bufferstart', () => {
          if (!mountedRef.current) return;
          setIsBuffering(true);
        });

        player.on('bufferend', () => {
          if (!mountedRef.current) return;
          setIsBuffering(false);
        });

        player.on('error', (error: unknown) => {
          if (!mountedRef.current) return;
          console.error('[VimeoPlayer] player error:', error);
          setHasError(true);
        });

        // Timeout de respaldo - solo para casos extremos
        initTimeoutRef.current = setTimeout(() => {
          if (!mountedRef.current) return;
          // No forzar playerReady=true aquí
        }, 15000);

      } catch (error) {
        console.error('[VimeoPlayer] setup error:', error);
        setHasError(true);
      }
    };

    setupPlayer();

    return () => {
      mountedRef.current = false;
      
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.error('[VimeoPlayer] destroy error:', error);
        }
      }
    };
  }, [video.id, muted, onPlay, onPause, onEnded]); // Dependencias simplificadas

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    externalOnMouseEnter?.();
  }, [externalOnMouseEnter]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setShowControls(false);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    externalOnMouseLeave?.();
  }, [externalOnMouseLeave]);

  const handleMouseMove = useCallback(() => {
    if (isHovered) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    externalOnMouseMove?.();
  }, [isHovered, externalOnMouseMove]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    if (iframeRef.current) {
      iframeRef.current.src = getVimeoUrl();
    }
  }, [getVimeoUrl]);

  // Validación del video
  if (!video?.id) {
    return (
      <div className={`relative bg-gray-800 flex items-center justify-center ${className}`}>
        <div className="text-white text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <div className="text-sm opacity-75">Video no disponible</div>
        </div>
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div className={`relative bg-black overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 p-4">
          <div className="text-white text-center max-w-md">
            <div className="text-4xl mb-2">🎬</div>
            <div className="text-sm opacity-75 mb-4">{video.title}</div>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded text-sm transition-colors mb-4"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative bg-black overflow-hidden group ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <iframe
        ref={iframeRef}
        src={getVimeoUrl()}
        className="absolute inset-0 w-full h-full"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        title={video.title}
        frameBorder="0"
      />


      {/* Overlay de controles */}
      <div className={`absolute inset-0 transition-all duration-300 ${
        (externalShowControls !== undefined ? externalShowControls : showControls) ? 'opacity-100' : 'opacity-0'
      }`}>
        
        <div className="absolute bottom-4 left-4 flex space-x-2">
          {/* Play/Pause */}
          <button
            onClick={handlePlayPause}
            disabled={!playerRef.current}
            className={`w-12 h-12 transition-all duration-200 bg-white/10 backdrop-blur-md hover:bg-white/20 shadow-lg flex items-center justify-center rounded ${
              !playerRef.current ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
            }`}
            aria-label={isPlaying ? 'Pausar video' : 'Reproducir video'}
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

          {/* Mute/Unmute */}
          <button
            onClick={handleMuteToggle}
            disabled={!playerRef.current}
            className={`w-12 h-12 transition-all duration-200 bg-white/10 backdrop-blur-md hover:bg-white/20 shadow-lg flex items-center justify-center rounded relative group ${
              !playerRef.current ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
            }`}
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
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

          {/* Fullscreen */}
          {!isMobile && onFullscreenToggle && (
            <button
              onClick={onFullscreenToggle}
              className="w-12 h-12 transition-all duration-200 bg-white/10 backdrop-blur-md hover:bg-white/20 shadow-lg flex items-center justify-center cursor-pointer rounded hover:scale-105 group"
              aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
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

        {/* Indicador de buffering */}
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