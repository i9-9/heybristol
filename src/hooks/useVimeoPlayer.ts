import { useState, useRef, useCallback, useEffect } from 'react';

interface VimeoPlayerInstance {
  destroy(): void;
  play(): Promise<void>;
  pause(): Promise<void>;
  setCurrentTime(time: number): Promise<void>;
  setVolume(volume: number): Promise<void>;
  getBuffered(): Promise<number[][]>;
  on(event: string, callback: (...args: unknown[]) => void): void;
}

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
}

export function useVimeoPlayer(videoId: string, options: UseVimeoPlayerOptions = {}) {
  const {
    autoPlay = true,
    muted = true,
    loop = false
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

  const playerRef = useRef<VimeoPlayerInstance | null>(null);
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

    const initializePlayer = async () => {
      try {
        const { default: Player } = await import('@vimeo/player');
        
        if (!mounted) return;

        const vimeoPlayer = new Player(`vimeo_${videoId}`, {
          id: parseInt(videoId),
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
        });

        playerRef.current = vimeoPlayer;

        // Event listeners
        vimeoPlayer.on('ready', () => {
          if (!mounted) return;
          setPlayerState(prev => ({ ...prev, isReady: true }));
        });

        vimeoPlayer.on('play', () => {
          if (!mounted) return;
          setPlayerState(prev => ({ ...prev, isPlaying: true }));
        });

        vimeoPlayer.on('pause', () => {
          if (!mounted) return;
          setPlayerState(prev => ({ ...prev, isPlaying: false }));
        });

        vimeoPlayer.on('timeupdate', (...args: unknown[]) => {
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

        vimeoPlayer.on('loaded', (...args: unknown[]) => {
          if (!mounted) return;
          const data = args[0] as { duration: number };
          setPlayerState(prev => ({ ...prev, duration: data.duration }));
        });

        vimeoPlayer.on('waiting', () => {
          if (!mounted) return;
          setPlayerState(prev => ({ ...prev, isBuffering: true }));
        });

        vimeoPlayer.on('canplay', () => {
          if (!mounted) return;
          setPlayerState(prev => ({ ...prev, isBuffering: false }));
        });

        // Buffer tracking
        vimeoPlayer.on('bufferend', () => {
          if (!mounted) return;
          vimeoPlayer.getBuffered().then((buffered) => {
            if (!mounted) return;
            if (buffered.length > 0) {
              const bufferedEnd = buffered[buffered.length - 1][1];
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

        vimeoPlayer.on('volumechange', (...args: unknown[]) => {
          if (!mounted) return;
          const data = args[0] as { volume: number };
          setPlayerState(prev => ({ 
            ...prev, 
            volume: data.volume,
            isMuted: data.volume === 0 
          }));
        });

      } catch (error) {
        console.error('Error initializing Vimeo player:', error);
        if (mounted) {
          setPlayerState(prev => ({ ...prev, isReady: true }));
        }
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
  }, [videoId, autoPlay, muted, loop, playerState.duration]);

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

