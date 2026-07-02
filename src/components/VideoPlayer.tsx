'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { VideoItem } from '@/lib/types';
import { useVimeoPlayer } from '@/hooks/useVimeoPlayer';
import { useIsMobile } from '@/hooks/useIsMobile';

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
  quality?: '360p' | '540p' | '720p' | '1080p' | '1440p' | '2160p' | 'auto';
  variant?: 'full' | 'minimal';
  loadIndex?: number;
  allowVideoClick?: boolean;
}

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest('button, input, [role="slider"], a, [data-player-control]')
  );
}

export default function VideoPlayer({
  video,
  className = '',
  autoPlay = true,
  loop = false,
  muted = true,
  onFullscreenToggle,
  isFullscreen = false,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
  showControls: externalShowControls = false,
  quality = 'auto',
  variant = 'full',
  loadIndex = 0,
  allowVideoClick
}: VideoPlayerProps) {
  const isFull = variant === 'full';
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const wasPlayingRef = useRef(false);
  const lastClickTimeRef = useRef(0);

  const [isClient, setIsClient] = useState(false);
  const [playerEnabled, setPlayerEnabled] = useState(isFull);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [hasShownInitialControls, setHasShownInitialControls] = useState(false);
  const [isPointerOver, setIsPointerOver] = useState(false);
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);
  const [scrubTime, setScrubTime] = useState<number | null>(null);
  const [tooltipTime, setTooltipTime] = useState<number | null>(null);
  const [tooltipPercent, setTooltipPercent] = useState(0);
  const [showUnmuteHint, setShowUnmuteHint] = useState(false);
  const [unmuteHintDismissed, setUnmuteHintDismissed] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);

  const {
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
  } = useVimeoPlayer(video?.id || '', {
    autoPlay,
    muted,
    loop,
    quality,
    hash: video?.hash,
    enabled: playerEnabled
  });

  const posterUrl = video?.thumb
    || (!video?.hash && video?.id ? `https://vumbnail.com/${video.id}.jpg` : '');
  const showPosterImage = Boolean(posterUrl) && !posterFailed;
  const showCover = showPosterImage && !playerState.hasPlaybackStarted && !playerState.hasError;
  const videoClickEnabled = allowVideoClick ?? isFull;

  useEffect(() => {
    setPosterFailed(false);
  }, [video?.id, posterUrl]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isFull || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
          const delayMs = Math.min(loadIndex * 80, 400);
          loadTimeoutRef.current = setTimeout(() => {
            setPlayerEnabled(true);
          }, delayMs);
        }
      },
      { threshold: [0.3], rootMargin: '100px' }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    };
  }, [isFull, loadIndex]);

  const clearAutoHideTimer = useCallback(() => {
    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = null;
    }
  }, []);

  const scheduleAutoHide = useCallback(() => {
    clearAutoHideTimer();
    if (isDraggingTimeline || !playerState.isPlaying) return;

    autoHideTimerRef.current = setTimeout(() => {
      if (!isPointerOver && !isDraggingTimeline) {
        setControlsVisible(false);
      }
    }, 3000);
  }, [clearAutoHideTimer, isDraggingTimeline, isPointerOver, playerState.isPlaying]);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    scheduleAutoHide();
  }, [scheduleAutoHide]);

  useEffect(() => {
    if (playerState.isReady && !hasShownInitialControls && !playerState.hasError && isFull) {
      setControlsVisible(true);
      setHasShownInitialControls(true);
      scheduleAutoHide();
    }
  }, [playerState.isReady, playerState.hasError, hasShownInitialControls, scheduleAutoHide]);

  useEffect(() => {
    if (controlsVisible) {
      scheduleAutoHide();
    } else {
      clearAutoHideTimer();
    }
    return clearAutoHideTimer;
  }, [controlsVisible, isPointerOver, isDraggingTimeline, playerState.isPlaying, scheduleAutoHide, clearAutoHideTimer]);

  useEffect(() => {
    if (playerState.isReady && playerState.isMuted && !unmuteHintDismissed && isFull) {
      setShowUnmuteHint(true);
    }
    if (!playerState.isMuted) {
      setShowUnmuteHint(false);
      setUnmuteHintDismissed(true);
    }
  }, [playerState.isReady, playerState.isMuted, unmuteHintDismissed]);

  useEffect(() => {
    const isEditableTarget = () => {
      const active = document.activeElement;
      return (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        active instanceof HTMLSelectElement ||
        active?.getAttribute('contenteditable') === 'true'
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!containerRef.current?.isConnected || isEditableTarget()) return;
      if (event.shiftKey) return;
      if (!isFull && event.key !== ' ') return;

      switch (event.key) {
        case ' ':
          event.preventDefault();
          void handlePlayPause();
          break;
        case 'ArrowLeft':
          if (!isFull) break;
          event.preventDefault();
          void handleSeek(Math.max(0, playerState.currentTime - 5));
          break;
        case 'ArrowRight':
          if (!isFull) break;
          event.preventDefault();
          void handleSeek(Math.min(playerState.duration, playerState.currentTime + 5));
          break;
        case 'Home':
          if (!isFull) break;
          event.preventDefault();
          void handleSeek(0);
          break;
        case 'End':
          if (!isFull) break;
          event.preventDefault();
          void handleSeek(playerState.duration);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause, handleSeek, playerState.currentTime, playerState.duration, isFull]);

  const displayTime = scrubTime ?? playerState.currentTime;
  const progressPercent = playerState.duration > 0
    ? (displayTime / playerState.duration) * 100
    : 0;

  const controlsActive = controlsVisible || externalShowControls || isDraggingTimeline;

  const getTimeFromClientX = useCallback((clientX: number) => {
    const el = timelineRef.current;
    if (!el || !playerState.duration) return 0;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return ratio * playerState.duration;
  }, [playerState.duration]);

  const getPercentFromClientX = useCallback((clientX: number) => {
    const el = timelineRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
  }, []);

  const updateTooltip = useCallback((clientX: number) => {
    if (!playerState.duration) return;
    setTooltipTime(getTimeFromClientX(clientX));
    setTooltipPercent(getPercentFromClientX(clientX));
  }, [playerState.duration, getTimeFromClientX, getPercentFromClientX]);

  const clearTooltip = useCallback(() => {
    if (!isDraggingTimeline) {
      setTooltipTime(null);
    }
  }, [isDraggingTimeline]);

  const finishScrub = useCallback(async (time: number) => {
    stopDragging();
    setIsDraggingTimeline(false);
    setScrubTime(null);
    setTooltipTime(null);
    await handleSeek(time);
    if (wasPlayingRef.current) {
      await play();
    }
    scheduleAutoHide();
  }, [stopDragging, handleSeek, play, scheduleAutoHide]);

  const handleTimelinePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!playerState.duration) return;

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);

    const time = getTimeFromClientX(event.clientX);
    wasPlayingRef.current = playerState.isPlaying;
    updateTooltip(event.clientX);
    revealControls();

    if (playerState.isPlaying) {
      void pause();
    }

    startDragging();
    setIsDraggingTimeline(true);
    setScrubTime(time);
  }, [playerState.duration, playerState.isPlaying, getTimeFromClientX, updateTooltip, revealControls, pause, startDragging]);

  const handleTimelinePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    updateTooltip(event.clientX);
    if (!isDragging()) return;
    setScrubTime(getTimeFromClientX(event.clientX));
  }, [isDragging, getTimeFromClientX, updateTooltip]);

  const handleTimelinePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging()) return;

    event.stopPropagation();

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    void finishScrub(getTimeFromClientX(event.clientX));
  }, [isDragging, getTimeFromClientX, finishScrub]);

  const handleTimelinePointerCancel = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging()) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    stopDragging();
    setIsDraggingTimeline(false);
    setScrubTime(null);
    setTooltipTime(null);

    if (wasPlayingRef.current) {
      void play();
    }
  }, [isDragging, stopDragging, play]);

  const handlePointerEnter = useCallback(() => {
    setIsPointerOver(true);
    revealControls();
    onMouseEnter?.();
  }, [revealControls, onMouseEnter]);

  const handlePointerLeave = useCallback(() => {
    setIsPointerOver(false);
    clearTooltip();
    onMouseLeave?.();
  }, [clearTooltip, onMouseLeave]);

  const handlePointerMove = useCallback(() => {
    if (!isMobile) {
      revealControls();
    }
    onMouseMove?.();
  }, [isMobile, revealControls, onMouseMove]);

  const handleVideoAreaClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!videoClickEnabled || isInteractiveTarget(event.target)) return;

    const now = Date.now();
    const isDoubleClick = now - lastClickTimeRef.current < 300;
    lastClickTimeRef.current = now;

    if (isDoubleClick && !isMobile && onFullscreenToggle) {
      onFullscreenToggle();
      return;
    }

    if (isMobile) {
      setControlsVisible((prev) => {
        const next = !prev;
        if (next) scheduleAutoHide();
        else clearAutoHideTimer();
        return next;
      });
      return;
    }

    void handlePlayPause();
  }, [isMobile, onFullscreenToggle, handlePlayPause, scheduleAutoHide, clearAutoHideTimer, videoClickEnabled]);

  const handleUnmuteHintClick = useCallback(() => {
    void handleVolumeChange(0.75);
    setShowUnmuteHint(false);
    setUnmuteHintDismissed(true);
  }, [handleVolumeChange]);

  const formatTime = (time: number | undefined) => {
    if (!time || isNaN(time)) return '0:00';
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
        void handlePlayPause();
        break;
    }
  }, [handlePlayPause, playerRef]);

  if (!isClient) {
    return (
      <div className={`w-full h-full bg-black flex items-center justify-center relative ${className}`}>
        {showPosterImage ? (
          <Image
            src={posterUrl}
            alt=""
            fill
            className="object-cover opacity-60"
            sizes="100vw"
            priority
            onError={() => setPosterFailed(true)}
          />
        ) : null}
        <div className="relative z-10 text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2" />
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
          background: var(--color-bristol-red);
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .volume-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--color-bristol-red);
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
        ref={containerRef}
        className={`relative w-full h-full bg-black group ${className} ${!videoClickEnabled ? 'pointer-events-none' : ''}`}
        onPointerEnter={isFull ? handlePointerEnter : undefined}
        onPointerLeave={isFull ? handlePointerLeave : undefined}
        onPointerMove={isFull ? handlePointerMove : undefined}
        onClick={videoClickEnabled ? handleVideoAreaClick : undefined}
      >
        {playerEnabled && (
          <div
            id={`vimeo_${video?.id}`}
            className="w-full h-full pointer-events-auto"
          />
        )}

        {showCover && (
          <div className="absolute inset-0 z-[5]">
            <Image
              src={posterUrl}
              alt={video.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 80vw"
              priority
              onError={() => setPosterFailed(true)}
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        )}

        <div
          className={`absolute inset-0 z-20 ${
            isFull
              ? `transition-opacity duration-200 ${controlsActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`
              : 'opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none'
          }`}
        >
          {isFull ? (
          <>
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-auto" data-player-control>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                aria-label={playerState.isPlaying ? 'Pausar video' : 'Reproducir video'}
                data-player-control
                onClick={(e) => {
                  e.stopPropagation();
                  void handlePlayPause();
                }}
                className="w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
              >
                {playerState.isBuffering ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : playerState.isPlaying ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                aria-label={playerState.isMuted ? 'Activar sonido' : 'Silenciar video'}
                data-player-control
                onClick={(e) => {
                  e.stopPropagation();
                  void handleMuteToggle();
                }}
                className="w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
              >
                {playerState.isMuted ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>

              {!playerState.isMuted && (
                <div className="flex items-center space-x-2" data-player-control>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={playerState.volume}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer volume-slider"
                    style={{
                      background: `linear-gradient(to right, #ffffff 0%, #ffffff ${playerState.volume * 100}%, rgba(255,255,255,0.3) ${playerState.volume * 100}%, rgba(255,255,255,0.3) 100%)`
                    }}
                  />
                </div>
              )}
            </div>

            {onFullscreenToggle && (
              <button
                type="button"
                aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                data-player-control
                onClick={(e) => {
                  e.stopPropagation();
                  onFullscreenToggle();
                }}
                className="w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
              >
                {isFullscreen ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                  </svg>
                )}
              </button>
            )}
          </div>

          <div className="absolute bottom-4 left-4 right-4 pointer-events-auto" data-player-control>
            <div className="mb-3">
              <input
                type="range"
                min={0}
                max={playerState.duration || 0}
                value={displayTime}
                step={0.1}
                onChange={(e) => {
                  const newTime = parseFloat(e.target.value);
                  void handleSeek(newTime);
                }}
                onKeyDown={handleTimelineKeyDown}
                className="sr-only"
                aria-label="Video timeline"
                aria-valuemin={0}
                aria-valuemax={playerState.duration}
                aria-valuenow={displayTime}
                aria-valuetext={`${formatTime(displayTime)} of ${formatTime(playerState.duration)}`}
              />

              <div
                ref={timelineRef}
                role="slider"
                aria-label="Video progress"
                aria-valuemin={0}
                aria-valuemax={playerState.duration}
                aria-valuenow={displayTime}
                aria-valuetext={`${formatTime(displayTime)} of ${formatTime(playerState.duration)}`}
                tabIndex={0}
                data-player-control
                className="relative py-3 -my-3 cursor-pointer select-none touch-none"
                style={{ touchAction: 'none' }}
                onPointerDown={handleTimelinePointerDown}
                onPointerMove={handleTimelinePointerMove}
                onPointerUp={handleTimelinePointerUp}
                onPointerCancel={handleTimelinePointerCancel}
                onPointerLeave={clearTooltip}
                onKeyDown={handleTimelineKeyDown}
              >
                {tooltipTime !== null && (
                  <div
                    className="absolute -top-8 z-10 px-2 py-0.5 rounded bg-black/80 text-white text-xs tabular-nums pointer-events-none -translate-x-1/2"
                    style={{ left: `${tooltipPercent}%` }}
                  >
                    {formatTime(tooltipTime)}
                  </div>
                )}

                <div className="relative h-1.5 rounded-full bg-white/15 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-white/25 rounded-full pointer-events-none"
                    style={{ width: `${Math.min(playerState.buffered, 100)}%` }}
                  />
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full pointer-events-none ${
                      isDraggingTimeline ? 'bg-white' : 'bg-white/90'
                    }`}
                    style={{
                      width: `${progressPercent}%`,
                      transition: isDraggingTimeline ? 'none' : 'width 0.1s linear'
                    }}
                  />
                </div>

                <div
                  className={`absolute top-1/2 rounded-full bg-white shadow-md pointer-events-none ${
                    isDraggingTimeline
                      ? 'w-4 h-4 shadow-lg shadow-white/40 scale-110'
                      : 'w-3 h-3 group-hover:w-4 group-hover:h-4'
                  }`}
                  style={{
                    left: `${progressPercent}%`,
                    transform: 'translate(-50%, -50%)',
                    transition: isDraggingTimeline
                      ? 'none'
                      : 'left 0.1s linear, width 0.15s ease, height 0.15s ease'
                  }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-white text-sm tabular-nums">
              <span>{formatTime(displayTime)}</span>
              <span className="text-white/60">{formatTime(playerState.duration)}</span>
            </div>
          </div>
          </>
          ) : (
            <div className="absolute bottom-4 left-4 flex space-x-2 pointer-events-auto">
              <button type="button" aria-label={playerState.isPlaying ? 'Pausar video' : 'Reproducir video'} data-player-control onClick={(e) => { e.stopPropagation(); void handlePlayPause(); }} className="w-12 h-12 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded flex items-center justify-center">
                {playerState.isBuffering ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : playerState.isPlaying ? (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                )}
              </button>
              <button type="button" aria-label={playerState.isMuted ? 'Activar sonido' : 'Silenciar video'} data-player-control onClick={(e) => { e.stopPropagation(); void handleMuteToggle(); }} className="w-12 h-12 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded flex items-center justify-center">
                {playerState.isMuted ? (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
                )}
              </button>
              {onFullscreenToggle && !isMobile && (
                <button type="button" aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'} data-player-control onClick={(e) => { e.stopPropagation(); onFullscreenToggle(); }} className="w-12 h-12 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" /></svg>
                </button>
              )}
            </div>
          )}
        </div>

        {showUnmuteHint && playerState.isReady && !playerState.hasError && isFull && (
          <button
            type="button"
            data-player-control
            onClick={(e) => {
              e.stopPropagation();
              handleUnmuteHintClick();
            }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-black/70 backdrop-blur-md text-white text-sm font-sans tracking-normal hover:bg-black/85 transition-colors pointer-events-auto"
          >
            Tap for sound
          </button>
        )}

        {playerState.hasEnded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
            <button
              type="button"
              data-player-control
              onClick={(e) => {
                e.stopPropagation();
                void handleReplay();
              }}
              className="group flex flex-col items-center space-y-4 cursor-pointer transition-all duration-300 hover:scale-105"
            >
              <div className="w-20 h-20 bg-white/10 group-hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 border-2 border-white/30 group-hover:border-white/50">
                <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="text-white text-xl font-medium uppercase tracking-wide">
                Play Again
              </span>
            </button>
          </div>
        )}

        {playerState.hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 px-6">
            <div className="text-center text-white max-w-sm">
              <p className="text-lg font-medium mb-2">Could not load video</p>
              <p className="text-sm text-white/60 mb-6">{video.title}</p>
              <button
                type="button"
                aria-label="Reintentar reproducción"
                data-player-control
                onClick={(e) => {
                  e.stopPropagation();
                  handleRetry();
                }}
                className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {!playerState.hasPlaybackStarted && !playerState.hasError && (
          <div className="absolute inset-0 flex items-center justify-center z-[15] pointer-events-none">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2" />
              <div className="text-sm opacity-75">Loading...</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
