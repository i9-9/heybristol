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
    buffered: 0
  });

  const playerRef = useRef<any>(null);
  const isDraggingRef = useRef(false);
  const animationRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef(0);

  // RequestAnimationFrame para animaciones fluidas
  const updateProgress = useCallback(() => {
    if (!playerRef.current || isDraggingRef.current) {
      animationRef.current = requestAnimationFrame(updateProgress);
      return;
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
        vimeoPlayer.on('ready' as any, () => {
          if (!mounted) return;
          console.log(`[VimeoPlayer] Player ready for video ${videoId}`);
          setPlayerState(prev => ({ ...prev, isReady: true }));
        });

        vimeoPlayer.on('play' as any, () => {
          if (!mounted) return;
          console.log(`[VimeoPlayer] Playing video ${videoId}`);
          setPlayerState(prev => ({ ...prev, isPlaying: true }));
        });

        vimeoPlayer.on('pause' as any, () => {
          if (!mounted) return;
          console.log(`[VimeoPlayer] Paused video ${videoId}`);
          setPlayerState(prev => ({ ...prev, isPlaying: false }));
        });

        vimeoPlayer.on('error' as any, (error: any) => {
          if (!mounted) return;
          console.error(`[VimeoPlayer] Error with video ${videoId}:`, error);
          // Set ready to true to prevent infinite loading
          setPlayerState(prev => ({ ...prev, isReady: true, isBuffering: false }));
        });

        vimeoPlayer.on('timeupdate' as any, (...args: unknown[]) => {
          if (!mounted) return;
          const data = args[0] as { seconds: number };
          
          // Throttle updates when dragging to prevent stuttering
          const now = Date.now();
          if (isDraggingRef.current && now - lastUpdateTimeRef.current < 50) {
            return;
          }
          
          lastUpdateTimeRef.current = now;
          setPlayerState(prev => ({ ...prev, currentTime: data.seconds }));
        });

        vimeoPlayer.on('loaded' as any, (...args: unknown[]) => {
          if (!mounted) return;
          const data = args[0] as { duration: number };
          setPlayerState(prev => ({ ...prev, duration: data.duration }));
        });

        vimeoPlayer.on('waiting' as any, () => {
          if (!mounted) return;
          setPlayerState(prev => ({ ...prev, isBuffering: true }));
        });

        vimeoPlayer.on('canplay' as any, () => {
          if (!mounted) return;
          setPlayerState(prev => ({ ...prev, isBuffering: false }));
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, autoPlay, muted, loop, quality, hash]);

  // RequestAnimationFrame loop
  useEffect(() => {
    if (playerState.isPlaying && playerState.isReady) {
      animationRef.current = requestAnimationFrame(updateProgress);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [playerState.isPlaying, playerState.isReady, updateProgress]);

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
        await playerRef.current.setVolume(playerState.volume);
        setPlayerState(prev => ({ ...prev, isMuted: false }));
      } else {
        await playerRef.current.setVolume(0);
        setPlayerState(prev => ({ ...prev, isMuted: true }));
      }
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  }, [playerState.isMuted, playerState.volume]);

  // Timeline dragging methods
  const startDragging = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  const stopDragging = useCallback(() => {
    isDraggingRef.current = false;
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
    startDragging,
    stopDragging,
    isDragging
  };
}

