"use client";

import Image from "next/image";
import LogoB from "@/components/LogoB";
import { useState, useRef, useCallback, useEffect } from "react";
import type { VideoItem } from "@/lib/types";
import { useRouter } from "next/navigation";
import CustomVimeoPlayer from "@/components/CustomVimeoPlayer";
import VideoCardWithHover from "@/components/VideoCardWithHover";

interface DirectorClientProps {
  director: { name: string; slug: string };
  videos: VideoItem[];
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

// Mapping completo de clases
const SPAN_CLASSES: Record<number, string> = {
  12: 'col-span-12',
  11: 'col-span-11',
  10: 'col-span-10',
  9: 'col-span-9',
  8: 'col-span-8',
  7: 'col-span-7',
  6: 'col-span-6',
  5: 'col-span-5',
  4: 'col-span-4',
};

const START_CLASSES: Record<number, string> = {
  1: 'col-start-1',
  2: 'col-start-2',
  3: 'col-start-3',
  4: 'col-start-4',
  5: 'col-start-5',
};

// Función para generar un número pseudo-aleatorio basado en un string (slug)
function seededRandom(seed: string, index: number): number {
  let hash = 0;
  const str = seed + index.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Genera un patrón único para cada director basado en su slug
function generateDirectorPattern(directorSlug: string) {
  const patterns = [];
  
  // Generamos 12 layouts únicos para este director
  for (let i = 0; i < 12; i++) {
    const rand = seededRandom(directorSlug, i);
    
    // Decide si es full o half
    const isFull = rand % 3 === 0; // ~33% full width
    
    if (isFull) {
      // Video full width con offset variable
      const span = 8 + (rand % 4); // 8, 9, 10, 11
      const start = 1 + (rand % 5); // 1, 2, 3, 4, 5
      patterns.push({
        name: `full-${i}`,
        videos: 1,
        spans: [span],
        starts: [start]
      });
    } else {
      // Dos videos con MUCHA MÁS variación asimétrica
      const sizeVariant = rand % 4;
      let firstSpan, secondSpan;
      
      switch(sizeVariant) {
        case 0:
          firstSpan = 7;
          secondSpan = 5;
          break;
        case 1:
          firstSpan = 5;
          secondSpan = 7;
          break;
        case 2:
          firstSpan = 6;
          secondSpan = 6;
          break;
        case 3:
          firstSpan = 8;
          secondSpan = 4; // Muy asimétrico
          break;
        default:
          firstSpan = 6;
          secondSpan = 5;
      }
      
      const start = 1 + (rand % 5); // 1, 2, 3, 4, 5
      const secondStart = start + firstSpan;
      
      patterns.push({
        name: `half-${i}`,
        videos: 2,
        spans: [firstSpan, secondSpan],
        starts: [start, secondStart]
      });
    }
  }
  
  return patterns;
}

function groupVideosByLayouts(videos: VideoItem[], patterns: Array<{
  name: string;
  videos: number;
  spans: number[];
  starts: number[];
}>) {
  const groups: { 
    layout: {
      name: string;
      videos: number;
      spans: number[];
      starts: number[];
    }, 
    videos: VideoItem[] 
  }[] = [];
  let currentIndex = 0;
  let patternIndex = 0;

  while (currentIndex < videos.length) {
    const pattern = patterns[patternIndex % patterns.length];
    const videosInGroup = videos.slice(currentIndex, currentIndex + pattern.videos);
    
    if (videosInGroup.length > 0) {
      groups.push({
        layout: pattern,
        videos: videosInGroup
      });
    }
    
    currentIndex += pattern.videos;
    patternIndex++;
  }

  return groups;
}


export default function DirectorClient({ director, videos }: DirectorClientProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const isMobile = useIsMobile();
  const isIOS = useIsIOS();
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  const handleMouseEnter = useCallback(() => {
    if (isMobile) return; // Solo en desktop
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
    if (isMobile) return; // Solo en desktop
    setIsHovered(false);
    setShowControls(false);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  }, [isMobile]);

  const handleMouseMove = useCallback(() => {
    if (isMobile) return; // Solo en desktop
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

  const handleBackToVideos = useCallback(() => {
    setSelectedVideo(null);
  }, []);

  // Genera un patrón único para este director
  const directorPattern = generateDirectorPattern(director.slug);
  const videoGroups = groupVideosByLayouts(videos, directorPattern);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const handlePreviousVideo = useCallback(() => {
    if (!selectedVideo) return;
    
    const currentIndex = videos.findIndex(v => v.id === selectedVideo.id);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : videos.length - 1;
    setSelectedVideo(videos[previousIndex]);
  }, [selectedVideo, videos]);

  const handleNextVideo = useCallback(() => {
    if (!selectedVideo) return;
    
    const currentIndex = videos.findIndex(v => v.id === selectedVideo.id);
    const nextIndex = currentIndex < videos.length - 1 ? currentIndex + 1 : 0;
    setSelectedVideo(videos[nextIndex]);
  }, [selectedVideo, videos]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedVideo) return;
      
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePreviousVideo();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNextVideo();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        handleBackToVideos();
      }
    };

    if (selectedVideo) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedVideo, videos, handleNextVideo, handlePreviousVideo, handleBackToVideos]);

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
            router.push('/');
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
                  setTimeout(scrollToHero, 200);
                }
              };
              scrollToHero();
            }, 300);
          }}
          className="w-10 md:w-24 h-auto text-white hover:opacity-80 transition-opacity cursor-pointer"
        >
          <LogoB />
        </button>
      </div>

      {!selectedVideo && (
        <div className="absolute bottom-6 left-6 z-50">
          <button
            onClick={() => {
              router.push('/');
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
            className="flex flex-col items-start space-y-2 text-white cursor-pointer"
          >
            <Image 
              src="/images/icons/arrow.png" 
              alt="Arrow Left" 
              width={32} 
              height={32} 
              className="w-8 h-8 rotate-180 hover:opacity-80 transition-opacity" 
            />
            <span className="font-ordinary text-sm md:text-xl uppercase leading-tight text-left whitespace-nowrap">
              BACK TO DIRECTORS
            </span>
          </button>
        </div>
      )}

      <div className="flex flex-col items-start justify-start h-full px-6 pt-[150px] md:pt-[150px] overflow-y-auto">
        {!selectedVideo ? (
          <>
            <h1 className="uppercase text-4xl md:text-7xl font-hagrid tracking-tight font-bold text-white mb-8 md:mb-16 pl-6 md:pl-0 pb-10!">{director.name}</h1>

            <div className="hidden md:block h-16"></div>

            {videos.length > 0 && (
              <div className="w-full px-6 md:px-0 max-w-sm md:max-w-7xl mx-auto pb-8">
                <div className="flex flex-col gap-2 md:gap-[0.694vw]">
                  {videoGroups.map((group, groupIndex) => (
                    <div 
                      key={groupIndex}
                      className={`grid ${
                        isMobile 
                          ? 'grid-cols-1' 
                          : 'grid-cols-12'
                      } gap-2 md:gap-[0.694vw]`}
                    >
                      {group.videos.map((video, videoIndex) => {
                        const spanClass = isMobile 
                          ? 'col-span-1' 
                          : SPAN_CLASSES[group.layout.spans[videoIndex]];
                        
                        const startClass = isMobile
                          ? ''
                          : START_CLASSES[group.layout.starts[videoIndex]];
                        
                        return (
                          <VideoCardWithHover
                            key={video.id}
                            video={video}
                            directorSlug={director.slug}
                            loadIndex={groupIndex * 2 + videoIndex}
                            className={`${spanClass} ${startClass}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {videos.length === 0 && (
              <p className="text-white/80 text-lg">No hay videos disponibles.</p>
            )}
          </>
        ) : (
          <>
            <div className="absolute top-6 right-6 z-20">
              <h2 className="uppercase font-hagrid text-xl md:text-2xl font-bold text-white text-right">
                {director.name}
              </h2>
            </div>

            <div 
              ref={videoContainerRef}
              className={`w-full max-w-5xl mx-auto mt-8 md:-mt-4 animate-fadeIn px-4 md:px-0 video-container-mobile mobile-video-selected ${
                isFullscreen ? 'fixed inset-0 z-50 bg-black flex items-center justify-center' : ''
              }`}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
            >
              <div className={`aspect-video w-full bg-black overflow-hidden rounded-lg video-aspect-mobile ${
                isFullscreen ? 'w-full h-full max-w-none max-h-none rounded-none' : ''
              }`}>
                <CustomVimeoPlayer
                  video={selectedVideo}
                  className="w-full h-full"
                  autoPlay={true}
                  loop={false}
                  muted={true}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onMouseMove={handleMouseMove}
                  showControls={showControls}
                  onFullscreenToggle={toggleFullscreen}
                  isFullscreen={isFullscreen}
                  isMobile={isMobile}
                  quality={director.slug === 'ali-ali' ? '2160p' : 'auto'}
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

                <div className="absolute bottom-6 left-6 z-10">
                  <button
                    onClick={handleBackToVideos}
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
        )}
      </div>

      {!isFullscreen && (
        <div className="absolute bottom-6 right-6 z-10">
        <button onClick={() => {
          router.push('/');
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
