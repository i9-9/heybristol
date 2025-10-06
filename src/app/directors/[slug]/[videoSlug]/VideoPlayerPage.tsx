"use client";

import Image from "next/image";
import LogoB from "@/components/LogoB";
import { useState, useRef, useCallback, useEffect } from "react";
import type { VideoItem } from "@/lib/types";
import { useRouter, usePathname } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import { generateVideoSlug } from "@/lib/types";

interface VideoPlayerPageProps {
  director: { name: string; slug: string };
  videos: VideoItem[];
  selectedVideo: VideoItem;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}

function useIsIOS() {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);
  }, []);

  return isIOS;
}

export default function VideoPlayerPage({ 
  director, 
  videos, 
  selectedVideo
}: VideoPlayerPageProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const isIOS = useIsIOS();
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (isMobile) return;
    setIsHovered(true);
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (isMobile) return;
    setIsHovered(false);
    setShowControls(false);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  }, [isMobile]);

  const handleMouseMove = useCallback(() => {
    if (isMobile) return;
    if (isHovered) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isHovered, isMobile]);

  const handleBackToDirector = useCallback(() => {
    router.push(`/directors/${director.slug}`);
  }, [router, director.slug]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const handlePreviousVideo = useCallback(() => {
    const currentIndex = videos.findIndex(v => v.id === selectedVideo.id);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : videos.length - 1;
    const previousVideo = videos[previousIndex];
    const previousVideoSlug = generateVideoSlug(previousVideo.title);
    router.push(`/directors/${director.slug}/${previousVideoSlug}`);
  }, [selectedVideo.id, videos, director.slug, router]);

  const handleNextVideo = useCallback(() => {
    const currentIndex = videos.findIndex(v => v.id === selectedVideo.id);
    const nextIndex = currentIndex < videos.length - 1 ? currentIndex + 1 : 0;
    const nextVideo = videos[nextIndex];
    const nextVideoSlug = generateVideoSlug(nextVideo.title);
    router.push(`/directors/${director.slug}/${nextVideoSlug}`);
  }, [selectedVideo.id, videos, director.slug, router]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePreviousVideo();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNextVideo();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        handleBackToDirector();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handlePreviousVideo, handleNextVideo, handleBackToDirector]);

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
            } catch (e) {
              console.log('Could not lock orientation:', e);
            }
          }
        } else {
          if (videoContainerRef.current.requestFullscreen) {
            await videoContainerRef.current.requestFullscreen();
          } else if ((videoContainerRef.current as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
            await (videoContainerRef.current as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
          } else if ((videoContainerRef.current as unknown as { msRequestFullscreen?: () => Promise<void> }).msRequestFullscreen) {
            await (videoContainerRef.current as unknown as { msRequestFullscreen: () => Promise<void> }).msRequestFullscreen();
          }
        }
      } else {
        if (isIOS) {
          setIsFullscreen(false);
          document.body.style.overflow = 'auto';
          if (isMobile && window.screen.orientation && 'unlock' in window.screen.orientation) {
            try {
              (window.screen.orientation as unknown as { unlock: () => void }).unlock();
            } catch (e) {
              console.log('Could not unlock orientation:', e);
            }
          }
        } else {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if ((document as unknown as { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
            await (document as unknown as { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
          } else if ((document as unknown as { msExitFullscreen?: () => Promise<void> }).msExitFullscreen) {
            await (document as unknown as { msExitFullscreen: () => Promise<void> }).msExitFullscreen();
          }
        }
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

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="absolute top-0 left-0 p-6 z-10">
        <button 
          onClick={() => {
            const isDevPreview = pathname.startsWith('/devpreview') || pathname.includes('/directors/');
            router.push(isDevPreview ? '/devpreview' : '/');
            setTimeout(() => {
              const scrollToDirectors = () => {
                const directorsSection = document.getElementById('directors');
                if (directorsSection) {
                  directorsSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                  });
                } else {
                  setTimeout(scrollToDirectors, 200);
                }
              };
              scrollToDirectors();
            }, 300);
          }}
          className="w-10 md:w-24 h-auto text-white hover:opacity-80 transition-opacity cursor-pointer"
        >
          <LogoB />
        </button>
      </div>

      <div className="absolute top-6 right-6 z-20">
        <h2 className="uppercase font-hagrid text-xl md:text-2xl font-bold text-white text-right">
          {director.name}
        </h2>
      </div>

      <div className="flex flex-col items-center justify-start h-full px-6 pt-[140px] md:pt-[120px]">
        <div 
          ref={videoContainerRef}
          className={`w-full max-w-5xl mx-auto mt-6 md:mt-2 animate-fadeIn px-4 md:px-0 video-container-mobile mobile-video-selected ${
            isFullscreen ? 'fixed inset-0 z-50 bg-black flex items-center justify-center' : ''
          }`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
        >
        <div className={`aspect-video w-full bg-black overflow-hidden rounded-lg video-aspect-mobile ${
          isFullscreen ? 'w-full h-full max-w-none max-h-none rounded-none' : ''
        }`}>
          <VideoPlayer
            video={selectedVideo}
            className="w-full h-full"
            onFullscreenToggle={toggleFullscreen}
            isFullscreen={isFullscreen}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            showControls={showControls}
          />
        </div>
        
        {!isFullscreen && (
          <>
            <div className="h-4 mobile-video-spacing"></div>
            
            <h3 className="text-white text-lg md:text-2xl font-medium text-center animate-slideUp uppercase px-2">
              {selectedVideo.tags?.[0] || 'CLIENTE'} | {selectedVideo.title}
            </h3>
          </>
        )}
        
        </div>
      </div>
      
      {!isFullscreen && (
        <>
          <div className="absolute left-6 top-1/4 md:top-1/2 transform -translate-y-1/2 z-20">
            <button
              onClick={handlePreviousVideo}
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

          <div className="absolute right-6 top-1/4 md:top-1/2 transform -translate-y-1/2 z-20">
            <button
              onClick={handleNextVideo}
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
              onClick={handleBackToDirector}
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

      {!isFullscreen && (
        <div className="absolute bottom-6 right-6 z-10">
        <button onClick={() => {
          const isDevPreview = pathname.startsWith('/devpreview') || pathname.includes('/directors/');
          router.push(isDevPreview ? '/devpreview' : '/');
          setTimeout(() => {
            const scrollToHero = () => {
              const heroSection = document.querySelector('section');
              if (heroSection) {
                heroSection.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start',
                  inline: 'nearest'
                });
              } else {
                // Si no encuentra la sección, intentar de nuevo
                setTimeout(scrollToHero, 200);
              }
            };
            scrollToHero();
          }, 300);
        }} className="flex flex-col items-end space-y-2 text-white hover:opacity-80 cursor-pointer">
          <Image src="/images/icons/arrow.png" alt="Arrow Up" width={32} height={32} className="w-8 h-8" />
          <span className="font-ordinary text-sm md:text-xl uppercase leading-tight text-right whitespace-nowrap">
            BRISTOL
          </span>
        </button>
        </div>
      )}
    </div>
  );
}

