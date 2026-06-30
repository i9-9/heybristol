'use client';

import Image from 'next/image';
import { useState, useRef, useCallback, useEffect, type ReactNode } from 'react';
import type { VideoItem } from '@/lib/types';
import { formatVideoDisplayTitle } from '@/lib/types';

interface VideoViewShellProps {
  director: { name: string; slug: string };
  selectedVideo: VideoItem;
  onPreviousVideo: () => void;
  onNextVideo: () => void;
  onBack: () => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  videoContainerClassName?: string;
  children: (ctx: {
    isFullscreen: boolean;
    toggleFullscreen: () => void;
    isMobile: boolean;
  }) => ReactNode;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}

function useIsIOS() {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));
  }, []);

  return isIOS;
}

export default function VideoViewShell({
  director,
  selectedVideo,
  onPreviousVideo,
  onNextVideo,
  onBack,
  onFullscreenChange,
  videoContainerClassName = 'mt-6 md:mt-2',
  children,
}: VideoViewShellProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();
  const isIOS = useIsIOS();
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onBack();
      } else if (event.shiftKey && event.key === 'ArrowLeft') {
        event.preventDefault();
        onPreviousVideo();
      } else if (event.shiftKey && event.key === 'ArrowRight') {
        event.preventDefault();
        onNextVideo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onPreviousVideo, onNextVideo, onBack]);

  const toggleFullscreen = useCallback(async () => {
    if (!videoContainerRef.current) return;

    try {
      if (!isFullscreen) {
        if (isIOS) {
          setIsFullscreen(true);
          document.body.style.overflow = 'hidden';
          if (isMobile && window.screen.orientation && 'lock' in window.screen.orientation) {
            try {
              await (window.screen.orientation as { lock: (orientation: string) => Promise<void> }).lock('landscape');
            } catch {
              // Orientation lock not supported
            }
          }
        } else if (videoContainerRef.current.requestFullscreen) {
          await videoContainerRef.current.requestFullscreen();
        } else if ((videoContainerRef.current as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
          await (videoContainerRef.current as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
        } else if ((videoContainerRef.current as unknown as { msRequestFullscreen?: () => Promise<void> }).msRequestFullscreen) {
          await (videoContainerRef.current as unknown as { msRequestFullscreen: () => Promise<void> }).msRequestFullscreen();
        }
      } else if (isIOS) {
        setIsFullscreen(false);
        document.body.style.overflow = 'auto';
        if (isMobile && window.screen.orientation && 'unlock' in window.screen.orientation) {
          try {
            (window.screen.orientation as unknown as { unlock: () => void }).unlock();
          } catch {
            // Orientation unlock not supported
          }
        }
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as unknown as { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
        await (document as unknown as { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
      } else if ((document as unknown as { msExitFullscreen?: () => Promise<void> }).msExitFullscreen) {
        await (document as unknown as { msExitFullscreen: () => Promise<void> }).msExitFullscreen();
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  }, [isFullscreen, isIOS, isMobile]);

  useEffect(() => {
    if (isIOS) return;

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
        (document as { msFullscreenElement?: Element }).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [isIOS]);

  useEffect(() => {
    onFullscreenChange?.(isFullscreen);
  }, [isFullscreen, onFullscreenChange]);

  return (
    <>
      <div className="absolute top-6 right-6 z-20">
        <h2 className="uppercase font-hagrid text-2xl md:text-2xl font-bold text-white text-right">
          {director.name}
        </h2>
      </div>

      <div
        ref={videoContainerRef}
        className={`w-full max-w-5xl mx-auto animate-fadeIn px-4 md:px-0 video-container-mobile mobile-video-selected ${videoContainerClassName} ${
          isFullscreen ? 'fixed inset-0 z-50 bg-black flex items-center justify-center' : ''
        }`}
      >
        <div
          className={`aspect-video w-full bg-black overflow-hidden rounded-lg video-aspect-mobile ${
            isFullscreen ? 'w-full h-full max-w-none max-h-none rounded-none' : ''
          }`}
        >
          {children({ isFullscreen, toggleFullscreen, isMobile })}
        </div>

        {!isFullscreen && (
          <>
            <div className="h-4 mobile-video-spacing" />
            <h3 className="text-white text-lg md:text-2xl font-medium text-center animate-slideUp uppercase px-2">
              {formatVideoDisplayTitle(selectedVideo)}
            </h3>
          </>
        )}
      </div>

      {!isFullscreen && (
        <>
          <div className="absolute left-6 top-[15%] md:top-1/2 transform -translate-y-1/2 z-20">
            <button
              type="button"
              onClick={onPreviousVideo}
              className="flex flex-col items-center space-y-2 text-white cursor-pointer hover:opacity-80 transition-opacity"
            >
              <Image
                src="/images/icons/arrow.png"
                alt="Previous Video"
                width={32}
                height={32}
                className="w-8 h-8 -rotate-135 transition-transform"
              />
            </button>
          </div>

          <div className="absolute right-6 top-[15%] md:top-1/2 transform -translate-y-1/2 z-20">
            <button
              type="button"
              onClick={onNextVideo}
              className="flex flex-col items-center space-y-2 text-white cursor-pointer hover:opacity-80 transition-opacity"
            >
              <Image
                src="/images/icons/arrow.png"
                alt="Next Video"
                width={32}
                height={32}
                className="w-8 h-8 transition-transform rotate-45"
              />
            </button>
          </div>

          <div className="absolute bottom-6 left-6 z-50">
            <button
              type="button"
              onClick={onBack}
              className="flex flex-col items-start space-y-2 text-white cursor-pointer hover:opacity-80 transition-opacity"
            >
              <Image
                src="/images/icons/arrow.png"
                alt="Back to Videos"
                width={32}
                height={32}
                className="w-8 h-8 rotate-180 hover:opacity-80 transition-opacity"
              />
              <span className="font-ordinary text-sm md:text-xl uppercase leading-tight text-left whitespace-nowrap">
                BACK TO {director.name}
              </span>
            </button>
          </div>
        </>
      )}
    </>
  );
}
