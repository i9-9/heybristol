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
  const [playerReady, setPlayerReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<VimeoPlayer | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const readyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUserMuteAction = useRef(false); // Flag para evitar sincronizaciones no deseadas

  // Simplificar la URL de Vimeo
  const getVimeoUrl = () => {
    if (!video?.id) return '';
    const baseUrl = `https://player.vimeo.com/video/${video.id}`;
    const params = new URLSearchParams({
      title: '0',
      byline: '0',
      portrait: '0',
      autoplay: autoPlay ? '1' : '0',
      loop: loop ? '1' : '0',
      // No usar muted en URL para permitir control programático
      controls: '0',
      dnt: '1',
      quality: 'auto',
      color: 'ffffff',
      background: '0'
    });
    
    if (video.hash) {
      params.set('h', video.hash);
    }
    
    return `${baseUrl}?${params.toString()}`;
  };

  // Función para sincronizar el estado local con el reproductor
  const syncPlayerState = useCallback(async (forceSync = false) => {
    if (!playerRef.current || !playerReady) return;
    
    // No sincronizar mute si el usuario acaba de hacer una acción de mute
    if (!forceSync && isUserMuteAction.current) {
      console.log('🔄 Skipping mute sync - user action in progress');
      return;
    }
    
    try {
      const isPaused = await playerRef.current.getPaused();
      const currentMuted = await playerRef.current.getMuted();
      
      console.log('🔄 Syncing state - isPaused:', isPaused, 'isMuted:', currentMuted, 'forceSync:', forceSync);
      
      setIsPlaying(!isPaused);
      setIsMuted(currentMuted);
    } catch (error) {
      console.error('❌ Error syncing player state:', error);
    }
  }, [playerReady]);

  // Función de play/pause mejorada
  const handlePlayPause = async () => {
    console.log('🎮 Play/Pause clicked, playerReady:', playerReady);
    
    if (!playerRef.current || !playerReady) {
      console.log('❌ Player not ready or not available');
      return;
    }

    try {
      const isPaused = await playerRef.current.getPaused();
      console.log('📊 Current paused state:', isPaused);
      
      if (isPaused) {
        console.log('▶️ Playing...');
        await playerRef.current.play();
        // Actualizar estado local inmediatamente para mejor UX
        setIsPlaying(true);
      } else {
        console.log('⏸️ Pausing...');
        playerRef.current.pause();
        // Actualizar estado local inmediatamente para mejor UX
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('❌ Error in play/pause:', error);
      // En caso de error, intentar sincronizar el estado real
      await syncPlayerState(true);
    }
  };

  // Función de mute mejorada
  const handleMuteToggle = async () => {
    console.log('🔇 Mute toggle clicked, playerReady:', playerReady, 'current isMuted:', isMuted);
    
    if (!playerRef.current || !playerReady) {
      console.log('❌ Player not ready for mute toggle');
      return;
    }

    // Marcar que el usuario está haciendo una acción de mute
    isUserMuteAction.current = true;

    try {
      // Usar el estado local como referencia principal para evitar race conditions
      const newMuteState = !isMuted;
      console.log('🎯 Setting mute to:', newMuteState);
      
      // Actualizar estado local inmediatamente para mejor UX
      setIsMuted(newMuteState);
      
      // Aplicar el cambio en el reproductor
      await playerRef.current.setMuted(newMuteState);
      
      console.log('✅ Mute state updated to:', newMuteState);
      
      // Permitir sincronización después de un delay
      setTimeout(() => {
        isUserMuteAction.current = false;
        console.log('🔄 User mute action completed, sync enabled');
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error in mute toggle:', error);
      // Revertir el estado local en caso de error
      setIsMuted(!isMuted);
      // Resetear el flag
      isUserMuteAction.current = false;
    }
  };

  // Setup de Vimeo API simplificado
  useEffect(() => {
    let mounted = true;

    const setupVimeoAPI = async () => {
      try {
        console.log('🚀 Setting up Vimeo API...');
        
        // Cargar script de Vimeo si no existe
        if (!(window as unknown as { Vimeo?: unknown }).Vimeo) {
          console.log('📥 Loading Vimeo script...');
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://player.vimeo.com/api/player.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        if (!mounted || !iframeRef.current) return;

        // Esperar un poco para que el iframe cargue
        setTimeout(() => {
          if (!mounted || !iframeRef.current) return;

          try {
            console.log('🔗 Creating Vimeo Player...');
            const VimeoPlayerClass = (window as unknown as { Vimeo: { Player: new (iframe: HTMLIFrameElement) => VimeoPlayer } }).Vimeo.Player;
            const player = new VimeoPlayerClass(iframeRef.current);
            playerRef.current = player;

            // Eventos básicos
            player.on('ready', async () => {
              if (!mounted) return;
              console.log('✅ Player ready');
              setPlayerReady(true);
              setIsBuffering(false);
              
              // Configurar estado inicial de mute y sincronizar
              setTimeout(async () => {
                if (mounted && playerRef.current) {
                  try {
                    // Configurar el estado inicial de mute
                    await playerRef.current.setMuted(muted);
                    console.log('🔇 Initial mute state set to:', muted);
                    
                    // Sincronizar estado del reproductor
                    await syncPlayerState(true);
                  } catch (error) {
                    console.error('❌ Error setting initial mute state:', error);
                    // Sincronizar de todas formas
                    await syncPlayerState(true);
                  }
                }
              }, 100);
              
              // Limpiar timeout de respaldo
              if (readyTimeoutRef.current) {
                clearTimeout(readyTimeoutRef.current);
                readyTimeoutRef.current = null;
              }
            });

            // Agregar evento 'loaded' como respaldo
            player.on('loaded', async () => {
              if (!mounted) return;
              console.log('📥 Player loaded');
              setPlayerReady(true);
              setIsBuffering(false);
              
              // Configurar estado inicial de mute y sincronizar
              setTimeout(async () => {
                if (mounted && playerRef.current) {
                  try {
                    // Configurar el estado inicial de mute
                    await playerRef.current.setMuted(muted);
                    console.log('🔇 Initial mute state set to:', muted);
                    
                    // Sincronizar estado del reproductor
                    await syncPlayerState(true);
                  } catch (error) {
                    console.error('❌ Error setting initial mute state:', error);
                    // Sincronizar de todas formas
                    await syncPlayerState(true);
                  }
                }
              }, 100);
              
              // Limpiar timeout de respaldo
              if (readyTimeoutRef.current) {
                clearTimeout(readyTimeoutRef.current);
                readyTimeoutRef.current = null;
              }
            });

            player.on('play', () => {
              if (!mounted) return;
              console.log('▶️ Playing');
              setIsPlaying(true);
              setIsBuffering(false);
              onPlay?.();
            });

            player.on('pause', () => {
              if (!mounted) return;
              console.log('⏸️ Paused');
              setIsPlaying(false);
              onPause?.();
            });

            player.on('ended', () => {
              if (!mounted) return;
              console.log('🔚 Ended');
              setIsPlaying(false);
              onEnded?.();
            });

            player.on('bufferstart', () => {
              if (!mounted) return;
              console.log('⏳ Buffer start');
              setIsBuffering(true);
            });

            player.on('bufferend', () => {
              if (!mounted) return;
              console.log('✅ Buffer end');
              setIsBuffering(false);
            });

            player.on('error', (error: unknown) => {
              if (!mounted) return;
              console.error('❌ Player error:', error);
              setHasError(true);
            });

            // Agregar listener para detectar cambios de mute del reproductor
            // Esto puede ayudar a detectar cuando el navegador fuerza el mute
            player.on('volumechange', async () => {
              if (!mounted || isUserMuteAction.current) return;
              
              try {
                const currentMuted = await playerRef.current?.getMuted();
                console.log('🔊 Volume changed, current muted:', currentMuted);
                
                // Solo actualizar si no es una acción del usuario y el valor es válido
                if (currentMuted !== undefined && currentMuted !== isMuted) {
                  console.log('🔄 Updating mute state from volume change:', currentMuted);
                  setIsMuted(currentMuted);
                }
              } catch (error) {
                console.error('❌ Error handling volume change:', error);
              }
            });

            // Timeout de respaldo para marcar como ready
            readyTimeoutRef.current = setTimeout(() => {
              if (!mounted) return;
              console.log('⏰ Player ready timeout - forcing ready state');
              setPlayerReady(true);
            }, 3000);

          } catch (error) {
            console.error('❌ Error creating player:', error);
            setHasError(true);
          }
        }, 1000);

      } catch (error) {
        console.error('❌ Error loading Vimeo script:', error);
        setHasError(true);
      }
    };

    setupVimeoAPI();

    return () => {
      mounted = false;
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (readyTimeoutRef.current) {
        clearTimeout(readyTimeoutRef.current);
      }
    };
  }, [video.id, onPlay, onPause, onEnded, syncPlayerState, muted, isMuted]);

  // Efecto para sincronizar estado cuando el reproductor esté listo
  useEffect(() => {
    if (playerReady && playerRef.current) {
      // Sincronizar estado después de un breve delay para asegurar que el reproductor esté completamente inicializado
      const syncTimeout = setTimeout(() => {
        syncPlayerState(false);
      }, 200);
      
      return () => clearTimeout(syncTimeout);
    }
  }, [playerReady, video.id, syncPlayerState, isMuted]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    externalOnMouseEnter?.();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowControls(false);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    externalOnMouseLeave?.();
  };

  const handleMouseMove = () => {
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
  };

  const handleRetry = () => {
    setHasError(false);
    setPlayerReady(false);
    if (iframeRef.current) {
      iframeRef.current.src = getVimeoUrl();
    }
  };

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
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="text-white text-center">
            <div className="text-4xl mb-2">🎬</div>
            <div className="text-sm opacity-75 mb-4">{video.title}</div>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded text-sm transition-colors"
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
            disabled={!playerReady}
            className={`w-12 h-12 transition-all duration-200 bg-white/10 backdrop-blur-md hover:bg-white/20 shadow-lg flex items-center justify-center rounded ${
              !playerReady ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
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
            disabled={!playerReady}
            className={`w-12 h-12 transition-all duration-200 bg-white/10 backdrop-blur-md hover:bg-white/20 shadow-lg flex items-center justify-center rounded ${
              !playerReady ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
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
              className="w-12 h-12 transition-all duration-200 bg-white/10 backdrop-blur-md hover:bg-white/20 shadow-lg flex items-center justify-center cursor-pointer rounded"
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
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
            <div className="flex items-center space-x-2 text-white text-sm">
              <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
              <span>Buffering...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}