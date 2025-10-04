"use client";

import Image from "next/image";
import LogoB from "@/components/LogoB";
import { useState, useRef, useCallback, useEffect } from "react";
import type { VideoItem } from "@/lib/types";
import { useRouter, usePathname } from "next/navigation";
import CustomVimeoPlayer from "@/components/CustomVimeoPlayer";

interface GridTestClientProps {
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

function groupVideosByLayouts(videos: VideoItem[], patterns: any[]) {
  const groups: { layout: any, videos: VideoItem[] }[] = [];
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

export default function GridTestClient({ director, videos }: GridTestClientProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const handleBackToVideos = useCallback(() => {
    setSelectedVideo(null);
  }, []);

  // Genera un patrón único para este director
  const directorPattern = generateDirectorPattern(director.slug);
  const videoGroups = groupVideosByLayouts(videos, directorPattern);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="absolute top-0 left-0 p-6 z-10">
        <button 
          onClick={() => {
            router.push('/devpreview');
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

      {!selectedVideo && (
        <div className="absolute bottom-6 left-6 z-50">
          <button
            onClick={() => {
              router.push('/devpreview');
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
            <h1 className="uppercase text-4xl md:text-7xl font-hagrid tracking-tight font-bold text-white mb-8 md:mb-16 pl-6 md:pl-0 pb-10">
              {director.name}
            </h1>

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
                          <div
                            key={video.id}
                            className={`relative ${spanClass} ${startClass} bg-black overflow-hidden cursor-pointer group aspect-video`}
                            onClick={() => setSelectedVideo(video)}
                          >
                            <CustomVimeoPlayer
                              video={video}
                              className="w-full h-full object-cover"
                              autoPlay={false}
                              loop={true}
                              muted={true}
                              loadIndex={groupIndex * 2 + videoIndex}
                            />
                            
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 md:bg-black/60 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 z-10">
                              <span className="text-white text-center px-3 font-medium uppercase text-sm md:text-base">
                                {video.tags?.[0] || 'CLIENTE'} | {video.title}
                              </span>
                            </div>
                          </div>
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

            <div className="w-full max-w-5xl mx-auto mt-8 md:-mt-4 animate-fadeIn px-4 md:px-0">
              <div className="aspect-video w-full bg-black overflow-hidden rounded-lg">
                <CustomVimeoPlayer
                  video={selectedVideo}
                  className="w-full h-full"
                  autoPlay={true}
                  loop={false}
                  muted={true}
                />
              </div>
              
              <div className="h-4"></div>
              
              <h3 className="text-white text-lg md:text-2xl font-medium text-center animate-slideUp uppercase px-2">
                {selectedVideo.tags?.[0] || 'CLIENTE'} | {selectedVideo.title}
              </h3>
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
                  BACK TO GRID
                </span>
              </button>
            </div>
          </>
        )}
      </div>

      <div className="absolute bottom-6 right-6 z-10">
        <button onClick={() => {
          router.push('/devpreview');
        }} className="flex flex-col items-end space-y-2 text-white hover:opacity-80 cursor-pointer">
          <Image src="/images/icons/arrow.png" alt="Arrow Up" width={32} height={32} className="w-8 h-8" />
          <span className="font-ordinary text-sm md:text-xl uppercase leading-tight text-right whitespace-nowrap">
            BRISTOL
          </span>
        </button>
      </div>
    </div>
  );
}