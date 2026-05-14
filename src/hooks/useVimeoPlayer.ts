/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useCallback, useEffect } from 'react';
import { preloadVimeoPlayer } from '@/lib/vimeo-preload';

interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isReady: boolean;
  hasPlaybackStarted: boolean;
  isBuffering: boolean;
  isMuted: boolean;
  volume: number;
  buffered: number;
  hasEnded: boolean;
  hasError: boolean;
}

interface UseVimeoPlayerOptions {
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  quality?: '360p' | '540p' | '720p' | '1080p' | '1440p' | '2160p' | 'auto';
  hash?: string; // Hash para videos privados de Vimeo
  enabled?: boolean;
}

export function useVimeoPlayer(videoId: string, options: UseVimeoPlayerOptions = {}) {
  const {
    autoPlay = true,
    muted = true,
    loop = false,
    quality = 'auto',
    hash,
    enabled = true
  } = options;

  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: autoPlay,
    currentTime: 0,
    duration: 0,
    isReady: false,
    hasPlaybackStarted: false,
    isBuffering: false,
    isMuted: muted,
    volume: 1,
    buffered: 0,
    hasEnded: false,
    hasError: false
  });

  const [reloadNonce, setReloadNonce] = useState(0);

  const playerRef = useRef<any>(null);
  const isDraggingRef = useRef(false);
  const previousVolumeRef = useRef(1);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clampTime = useCallback((time: number, duration: number) => {
    if (!duration || duration <= 0) return 0;
    return Math.max(0, Math.min(duration, time));
  }, []);

  // Inicializar el player
  useEffect(() => {
    if (!videoId || !enabled) return;

    let mounted = true;

    const resolvePlaybackHash = async (): Promise<string | undefined> => {
      if (hash) return hash;

      try {
        const response = await fetch(`/api/vimeo/${videoId}/`);
        if (!response.ok) return undefined;
        const data = (await response.json()) as { hash?: string };
        return data.hash;
      } catch {
        return undefined;
      }
    };

    const initializePlayerWithElement = async (
      element: HTMLElement,
      playbackHash?: string
    ) => {
      if (!mounted) return;

      try {
        const { default: Player } = await preloadVimeoPlayer();

        let target: HTMLElement = element;

        if (playbackHash) {
          // Private/unlisted videos: pre-built iframe avoids a failing oEmbed lookup.
          element.innerHTML = '';
          const iframe = document.createElement('iframe');
          const params = new URLSearchParams({
            h: playbackHash,
            autoplay: autoPlay ? '1' : '0',
            muted: muted ? '1' : '0',
            loop: loop ? '1' : '0',
            title: '0',
            byline: '0',
            portrait: '0',
            playsinline: '1',
            controls: '0',
            background: '0',
            color: '000000',
            app_id: '505477',
          });
          iframe.src = `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
          iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
          iframe.style.width = '100%';
          iframe.style.height = '100%';
          iframe.style.border = '0';
          element.appendChild(iframe);
          target = iframe;

          await new Promise<void>((resolve) => {
            iframe.addEventListener('load', () => resolve(), { once: true });
          });
        }

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
          background: false,
          playsinline: true,
          color: '000000',
          controls: false
        };

        if (!playbackHash) {
          playerOptions.id = parseInt(videoId);
        }

        if (quality !== 'auto') {
          playerOptions.quality = quality;
        }

        const vimeoPlayer = playbackHash
          ? new Player(target)
          : new Player(element, playerOptions);

        playerRef.current = vimeoPlayer;

        // Event listeners
        vimeoPlayer.on('ready' as any, async () => {
          if (!mounted) return;
          
          try {
            const duration = await vimeoPlayer.getDuration();
            setPlayerState(prev => ({ ...prev, duration, isReady: true }));
          } catch {
            setPlayerState(prev => ({ ...prev, isReady: true }));
          }
        });

        vimeoPlayer.on('play' as any, async () => {
          if (!mounted) return;
          
          try {
            const duration = await vimeoPlayer.getDuration();
            setPlayerState(prev => ({ ...prev, duration, isPlaying: true, isReady: true, hasEnded: false }));
          } catch {
            setPlayerState(prev => ({ ...prev, isPlaying: true, isReady: true, hasEnded: false }));
          }
        });

        vimeoPlayer.on('pause' as any, () => {
          if (!mounted) return;
          setPlayerState(prev => ({ ...prev, isPlaying: false }));
        });

        vimeoPlayer.on('ended' as any, () => {
          if (!mounted) return;
          setPlayerState(prev => ({ ...prev, isPlaying: false, hasEnded: true }));
        });

        vimeoPlayer.on('error' as any, () => {
          if (!mounted) return;
          if (playbackHash) {
            setPlayerState(prev => ({ ...prev, isReady: true, isBuffering: false }));
            return;
          }
          setPlayerState(prev => ({ ...prev, isReady: true, isBuffering: false, hasError: true }));
        });

        vimeoPlayer.on('timeupdate' as any, (...args: unknown[]) => {
          if (!mounted || isDraggingRef.current) return;
          const data = args[0] as { seconds: number };
          setPlayerState(prev => ({
            ...prev,
            currentTime: data.seconds,
            hasPlaybackStarted: prev.hasPlaybackStarted || data.seconds > 0.05,
          }));
        });

        vimeoPlayer.on('loaded' as any, (...args: unknown[]) => {
          if (!mounted) return;
          const data = args[0] as { duration: number };
          setPlayerState(prev => ({ ...prev, duration: data.duration, isReady: true }));
        });

        vimeoPlayer.on('loadeddata' as any, () => {
          if (!mounted) return;
          setPlayerState(prev => ({ ...prev, isReady: true }));
        });

        vimeoPlayer.on('waiting' as any, () => {
          if (!mounted) return;
          setPlayerState(prev => ({ ...prev, isBuffering: true }));
        });

        vimeoPlayer.on('playing' as any, () => {
          if (!mounted) return;
          setPlayerState(prev => ({
            ...prev,
            isBuffering: false,
            isReady: true,
            hasPlaybackStarted: true,
          }));
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
          setPlayerState(prev => ({ ...prev, isReady: true, isBuffering: false, hasError: true }));
        }
      }
    };

    const initializePlayer = async () => {
      const playbackHash = await resolvePlaybackHash();
      if (!mounted) return;

      // Wait for DOM element to be available
      const elementId = `vimeo_${videoId}`;
      
      const waitForElement = (retries = 0): Promise<HTMLElement | null> => {
        return new Promise((resolve) => {
          const element = document.getElementById(elementId);
          if (element) {
            resolve(element);
          } else if (retries < 30) {
            setTimeout(() => {
              waitForElement(retries + 1).then(resolve);
            }, 100);
          } else {
            if (mounted) {
              setPlayerState(prev => ({ ...prev, isReady: true, isBuffering: false, hasError: true }));
            }
            resolve(null);
          }
        });
      };

      const element = await waitForElement();
      if (element && mounted) {
        await initializePlayerWithElement(element, playbackHash);
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
  }, [videoId, autoPlay, muted, loop, quality, hash, reloadNonce, enabled]);

  // Fallback time update when Vimeo timeupdate events are sparse
  useEffect(() => {
    if (playerState.isPlaying && playerState.isReady && playerRef.current) {
      timeUpdateIntervalRef.current = setInterval(async () => {
        if (!playerRef.current || isDraggingRef.current) return;
        
        try {
          const currentTime = await playerRef.current.getCurrentTime();
          setPlayerState(prev => {
            if (Math.abs(prev.currentTime - currentTime) > 0.1) {
              return { ...prev, currentTime };
            }
            return prev;
          });
        } catch {
          // Player may be destroyed
        }
      }, 250);
    } else {
      if (timeUpdateIntervalRef.current) {
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
      const tryGetDuration = async () => {
        try {
          const duration = await playerRef.current.getDuration();
          setPlayerState(prev => ({ ...prev, duration }));
        } catch {
          // Duration not available yet
        }
      };
      
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
    
    const duration = playerState.duration;
    const clamped = clampTime(time, duration);

    setPlayerState(prev => ({
      ...prev,
      currentTime: clamped,
      hasEnded: duration > 0 && clamped >= duration - 0.25
    }));

    try {
      await playerRef.current.setCurrentTime(clamped);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  }, [playerState.duration, clampTime]);

  const pause = useCallback(async () => {
    if (!playerRef.current) return;
    try {
      await playerRef.current.pause();
    } catch (error) {
      console.error('Error pausing:', error);
    }
  }, []);

  const play = useCallback(async () => {
    if (!playerRef.current) return;
    try {
      await playerRef.current.play();
    } catch (error) {
      console.error('Error playing:', error);
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
  }, []);

  const stopDragging = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const isDragging = useCallback(() => {
    return isDraggingRef.current;
  }, []);

  const handleRetry = useCallback(() => {
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch {
        // Player may already be destroyed
      }
      playerRef.current = null;
    }
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }
    setPlayerState({
      isPlaying: autoPlay,
      currentTime: 0,
      duration: 0,
      isReady: false,
      hasPlaybackStarted: false,
      isBuffering: false,
      isMuted: muted,
      volume: 1,
      buffered: 0,
      hasEnded: false,
      hasError: false
    });
    setReloadNonce((n) => n + 1);
  }, [autoPlay, muted]);

  return {
    playerState,
    playerRef,
    handlePlayPause,
    handleSeek,
    handleVolumeChange,
    handleMuteToggle,
    handleReplay,
    handleRetry,
    pause,
    play,
    startDragging,
    stopDragging,
    isDragging
  };
}

