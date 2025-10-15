/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useCallback, useEffect } from 'react';

interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isReady: boolean;
  isBuffering: boolean;
  isMuted: boolean;
  volume: number;
  buffered: number;
  hasEnded: boolean;
}

interface UseVimeoPlayerOptions {
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  quality?: '360p' | '540p' | '720p' | '1080p' | '1440p' | '2160p' | 'auto';
  hash?: string; // Hash para videos privados de Vimeo
}

export function useVimeoPlayer(videoId: string, options: UseVimeoPlayerOptions = {}) {
  const {
    autoPlay = true,
    muted = true,
    loop = false,
    quality = 'auto',
    hash
  } = options;

  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: autoPlay,
    currentTime: 0,
    duration: 0,
    isReady: false,
    isBuffering: false,
    isMuted: muted,
    volume: 1,
    buffered: 0,
    hasEnded: false
  });

  const playerRef = useRef<any>(null);
  const isDraggingRef = useRef(false);
  const animationRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef(0);
  const previousVolumeRef = useRef(1); // Guardar el volumen antes de mutear
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // RequestAnimationFrame para animaciones fluidas - solo cuando se está arrastrando
  const updateProgress = useCallback(async () => {
    if (!playerRef.current || !isDraggingRef.current) {
      if (isDraggingRef.current) {
        animationRef.current = requestAnimationFrame(updateProgress);
      }
      return;
    }

    // Update current time when dragging to keep the ball moving smoothly
    try {
      const currentTime = await playerRef.current.getCurrentTime();
      setPlayerState(prev => {
        // Only update if the time has actually changed to avoid unnecessary re-renders
        if (Math.abs(prev.currentTime - currentTime) > 0.01) {
          return { ...prev, currentTime };
        }
        return prev;
      });
    } catch (error) {
      // Ignore errors, player might not be ready yet
    }

    animationRef.current = requestAnimationFrame(updateProgress);
  }, []);

  // Inicializar el player
  useEffect(() => {
    if (!videoId) return;

    let mounted = true;

    const initializePlayerWithElement = async (element: HTMLElement) => {
      if (!mounted) return;

      try {
        console.log(`[VimeoPlayer] Initializing player for video ${videoId}${hash ? ' with hash' : ''}`);
        const { default: Player } = await import('@vimeo/player');
        
        const playerOptions: any = {
          width: 640,
          height: 360,
          autoplay: autoPlay,
          muted: muted,
          loop: loop,
          responsive: true,
          title: false,
          byline: false,
          portrait: false,
          background: true,
          playsinline: true,
          color: '000000',
          controls: false
        };

        // If hash is provided (private video), use URL instead of ID
        if (hash) {
          playerOptions.url = `https://player.vimeo.com/video/${videoId}?h=${hash}`;
          console.log(`[VimeoPlayer] Using URL with hash: ${playerOptions.url}`);
        } else {
          playerOptions.id = parseInt(videoId);
          console.log(`[VimeoPlayer] Using video ID: ${playerOptions.id}`);
        }

        // Add quality if specified
        if (quality !== 'auto') {
          playerOptions.quality = quality;
        }

        console.log(`[VimeoPlayer] Creating Vimeo Player with options:`, playerOptions);
        const vimeoPlayer = new Player(element, playerOptions);
        console.log(`[VimeoPlayer] Vimeo Player created successfully`);

        playerRef.current = vimeoPlayer;

        // Event listeners
        vimeoPlayer.on('ready' as any, async () => {
          if (!mounted) return;
          console.log(`[VimeoPlayer] Player ready for video ${videoId}`);
          
          // Try to get duration when ready
          try {
            const duration = await vimeoPlayer.getDuration();
            console.log('[VimeoPlayer] Got duration from ready event:', duration);
            setPlayerState(prev => ({ ...prev, duration, isReady: true }));
          } catch (error) {
            console.log('[VimeoPlayer] Could not get duration on ready:', error);
            setPlayerState(prev => ({ ...prev, isReady: true }));
          }
        });

        vimeoPlayer.on('play' as any, async () => {
          if (!mounted) return;
          console.log(`[VimeoPlayer] Playing video ${videoId}`);
          
          // Try to get duration when playing starts
          try {
            const duration = await vimeoPlayer.getDuration();
            console.log('[VimeoPlayer] Got duration from play event:', duration);
            setPlayerState(prev => ({ ...prev, duration, isPlaying: true, isReady: true, hasEnded: false }));
          } catch (error) {
            console.log('[VimeoPlayer] Could not get duration on play:', error);
            setPlayerState(prev => ({ ...prev, isPlaying: true, isReady: true, hasEnded: false }));
          }
        });

        vimeoPlayer.on('pause' as any, () => {
          if (!mounted) return;
          console.log(`[VimeoPlayer] Paused video ${videoId}`);
          setPlayerState(prev => ({ ...prev, isPlaying: false }));
        });

        vimeoPlayer.on('ended' as any, () => {
          if (!mounted) return;
          console.log(`[VimeoPlayer] Video ended ${videoId}`);
          setPlayerState(prev => ({ ...prev, isPlaying: false, hasEnded: true }));
        });

        vimeoPlayer.on('error' as any, (error: any) => {
          if (!mounted) return;
          console.error(`[VimeoPlayer] Error with video ${videoId}:`, error);
          // Set ready to true to prevent infinite loading
          setPlayerState(prev => ({ ...prev, isReady: true, isBuffering: false }));
        });

        vimeoPlayer.on('timeupdate' as any, (...args: unknown[]) => {
          if (!mounted) return;
          console.log('[VimeoPlayer] timeupdate event:', args);
          const data = args[0] as { seconds: number };
          
          // Only throttle when actively dragging, not during normal playback
          const now = Date.now();
          if (isDraggingRef.current && now - lastUpdateTimeRef.current < 16) { // ~60fps
            return;
          }
          
          lastUpdateTimeRef.current = now;
          console.log('[VimeoPlayer] Updating currentTime to:', data.seconds);
          setPlayerState(prev => ({ ...prev, currentTime: data.seconds }));
        });

        vimeoPlayer.on('loaded' as any, (...args: unknown[]) => {
          if (!mounted) return;
          console.log('[VimeoPlayer] loaded event:', args);
          const data = args[0] as { duration: number };
          console.log('[VimeoPlayer] Setting duration from loaded event:', data.duration);
          // Si tenemos la duración, el video está listo
          setPlayerState(prev => ({ ...prev, duration: data.duration, isReady: true }));
        });

        vimeoPlayer.on('loadeddata' as any, () => {
          if (!mounted) return;
          console.log(`[VimeoPlayer] Loaded data for video ${videoId}`);
          setPlayerState(prev => ({ ...prev, isReady: true }));
        });

        vimeoPlayer.on('waiting' as any, () => {
          if (!mounted) return;
          setPlayerState(prev => ({ ...prev, isBuffering: true }));
        });

        vimeoPlayer.on('playing' as any, () => {
          if (!mounted) return;
          // El video está reproduciéndose activamente, está ready
          setPlayerState(prev => ({ ...prev, isBuffering: false, isReady: true }));
        });

        // Buffer tracking
        vimeoPlayer.on('bufferend' as any, () => {
          if (!mounted) return;
          vimeoPlayer.getBuffered().then((buffered) => {
            if (!mounted) return;
            if (buffered.length > 0) {
              const lastRange = buffered[buffered.length - 1];
              const bufferedEnd = lastRange.end;
              const duration = playerState.duration || 1; // Evitar división por 0
              setPlayerState(prev => ({ 
                ...prev, 
                buffered: (bufferedEnd / duration) * 100 
              }));
            }
          }).catch(() => {
            // Ignorar errores de buffer
          });
        });

        vimeoPlayer.on('volumechange' as any, (...args: unknown[]) => {
          if (!mounted) return;
          const data = args[0] as { volume: number };
          setPlayerState(prev => ({ 
            ...prev, 
            volume: data.volume,
            isMuted: data.volume === 0 
          }));
        });

      } catch (error) {
        console.error(`[VimeoPlayer] Error initializing Vimeo player for video ${videoId}:`, error);
        if (mounted) {
          // Set ready to true to prevent infinite loading
          setPlayerState(prev => ({ ...prev, isReady: true, isBuffering: false }));
        }
      }
    };

    const initializePlayer = async () => {
      // Wait for DOM element to be available
      const elementId = `vimeo_${videoId}`;
      
      const waitForElement = (retries = 0): Promise<HTMLElement | null> => {
        return new Promise((resolve) => {
          const element = document.getElementById(elementId);
          if (element) {
            console.log(`[VimeoPlayer] Element ${elementId} found on retry ${retries}`);
            resolve(element);
          } else if (retries < 30) { // Max 30 retries (3 seconds total)
            setTimeout(() => {
              waitForElement(retries + 1).then(resolve);
            }, 100);
          } else {
            console.error(`[VimeoPlayer] Element ${elementId} not found after ${retries} retries`);
            // Set ready state to true even if player fails to load, to prevent infinite loading
            if (mounted) {
              setPlayerState(prev => ({ ...prev, isReady: true, isBuffering: false }));
            }
            resolve(null);
          }
        });
      };

      const element = await waitForElement();
      if (element && mounted) {
        await initializePlayerWithElement(element);
      } else if (!element && mounted) {
        console.error(`[VimeoPlayer] Failed to initialize player for video ${videoId}`);
      }
    };

    initializePlayer();

    return () => {
      mounted = false;
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
        timeUpdateIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, autoPlay, muted, loop, quality, hash]);

  // RequestAnimationFrame loop - solo cuando se está arrastrando
  useEffect(() => {
    if (isDraggingRef.current) {
      animationRef.current = requestAnimationFrame(updateProgress);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [updateProgress]);

  // Fallback time update using setInterval when playing
  useEffect(() => {
    if (playerState.isPlaying && playerState.isReady && playerRef.current) {
      console.log('[VimeoPlayer] Starting time update interval');
      timeUpdateIntervalRef.current = setInterval(async () => {
        if (!playerRef.current || !playerState.isPlaying) return;
        
        try {
          const currentTime = await playerRef.current.getCurrentTime();
          console.log('[VimeoPlayer] Interval update - currentTime:', currentTime);
          setPlayerState(prev => {
            if (Math.abs(prev.currentTime - currentTime) > 0.1) {
              return { ...prev, currentTime };
            }
            return prev;
          });
        } catch (error) {
          console.error('[VimeoPlayer] Error getting current time:', error);
        }
      }, 100); // Update every 100ms
    } else {
      if (timeUpdateIntervalRef.current) {
        console.log('[VimeoPlayer] Clearing time update interval');
        clearInterval(timeUpdateIntervalRef.current);
        timeUpdateIntervalRef.current = null;
      }
    }

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
        timeUpdateIntervalRef.current = null;
      }
    };
  }, [playerState.isPlaying, playerState.isReady]);

  // Try to get duration if it's still undefined
  useEffect(() => {
    if (playerState.isReady && !playerState.duration && playerRef.current) {
      console.log('[VimeoPlayer] Trying to get duration because it\'s undefined');
      const tryGetDuration = async () => {
        try {
          const duration = await playerRef.current.getDuration();
          console.log('[VimeoPlayer] Successfully got duration:', duration);
          setPlayerState(prev => ({ ...prev, duration }));
        } catch (error) {
          console.log('[VimeoPlayer] Could not get duration:', error);
        }
      };
      
      // Try immediately and then after a short delay
      tryGetDuration();
      setTimeout(tryGetDuration, 1000);
    }
  }, [playerState.isReady, playerState.duration]);

  // Métodos del player
  const handlePlayPause = useCallback(async () => {
    if (!playerRef.current) return;
    
    try {
      if (playerState.isPlaying) {
        await playerRef.current.pause();
      } else {
        await playerRef.current.play();
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  }, [playerState.isPlaying]);

  const handleSeek = useCallback(async (time: number) => {
    if (!playerRef.current) return;
    
    try {
      await playerRef.current.setCurrentTime?.(time);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  }, []);

  const handleVolumeChange = useCallback(async (volume: number) => {
    if (!playerRef.current) return;
    
    try {
      await playerRef.current.setVolume(volume);
      // Guardar el volumen si no es 0 (para restaurar después del mute)
      if (volume > 0) {
        previousVolumeRef.current = volume;
      }
      setPlayerState(prev => ({ 
        ...prev, 
        volume,
        isMuted: volume === 0 
      }));
    } catch (error) {
      console.error('Error changing volume:', error);
    }
  }, []);

  const handleMuteToggle = useCallback(async () => {
    if (!playerRef.current) return;
    
    try {
      if (playerState.isMuted) {
        // Restaurar el volumen anterior
        const volumeToRestore = previousVolumeRef.current > 0 ? previousVolumeRef.current : 1;
        await playerRef.current.setVolume(volumeToRestore);
        setPlayerState(prev => ({ ...prev, isMuted: false, volume: volumeToRestore }));
      } else {
        // Guardar el volumen actual antes de mutear
        if (playerState.volume > 0) {
          previousVolumeRef.current = playerState.volume;
        }
        await playerRef.current.setVolume(0);
        setPlayerState(prev => ({ ...prev, isMuted: true, volume: 0 }));
      }
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  }, [playerState.isMuted, playerState.volume]);

  const handleReplay = useCallback(async () => {
    if (!playerRef.current) return;
    
    try {
      await playerRef.current.setCurrentTime(0);
      await playerRef.current.play();
      setPlayerState(prev => ({ ...prev, hasEnded: false, isPlaying: true, currentTime: 0 }));
    } catch (error) {
      console.error('Error replaying video:', error);
    }
  }, []);

  // Timeline dragging methods
  const startDragging = useCallback(() => {
    isDraggingRef.current = true;
    // Start the animation loop for smooth dragging
    if (!animationRef.current) {
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  }, [updateProgress]);

  const stopDragging = useCallback(() => {
    isDraggingRef.current = false;
    // Stop the animation loop
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const isDragging = useCallback(() => {
    return isDraggingRef.current;
  }, []);

  return {
    playerState,
    playerRef,
    handlePlayPause,
    handleSeek,
    handleVolumeChange,
    handleMuteToggle,
    handleReplay,
    startDragging,
    stopDragging,
    isDragging
  };
}

