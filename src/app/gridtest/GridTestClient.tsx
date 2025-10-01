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

// Función para determinar el tamaño de cada card en el grid
function getCardSize(index: number): string {
  // Patrón irregular inspirado en alitwotimes.com
  const pattern = [
    'col-span-1 row-span-1',     // 0: normal
    'col-span-2 row-span-1',     // 1: ancho
    'col-span-1 row-span-2',     // 2: alto
    'col-span-1 row-span-1',     // 3: normal
    'col-span-1 row-span-1',     // 4: normal
    'col-span-2 row-span-2',     // 5: grande
    'col-span-1 row-span-1',     // 6: normal
    'col-span-1 row-span-2',     // 7: alto
    'col-span-2 row-span-1',     // 8: ancho
    'col-span-1 row-span-1',     // 9: normal
    'col-span-1 row-span-1',     // 10: normal
    'col-span-1 row-span-2',     // 11: alto
  ];
  
  return pattern[index % pattern.length];
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
              <div className="w-full px-6 md:px-0 max-w-sm md:max-w-5xl mx-auto md:mx-0 pb-8">
                {/* Grid irregular - Mobile: stack normal, Desktop: máximo 2 por fila */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 auto-rows-[300px]">
                  {videos.map((video, index) => {
                    const sizeClass = isMobile ? 'col-span-1 row-span-1' : getCardSize(index);
                    
                    return (
                      <div
                        key={video.id}
                        className={`relative ${sizeClass} bg-black overflow-hidden cursor-pointer group`}
                        onClick={() => setSelectedVideo(video)}
                      >
                        <CustomVimeoPlayer
                          video={video}
                          className="w-full h-full object-cover"
                          autoPlay={false}
                          loop={true}
                          muted={true}
                          loadIndex={index}
                        />
                        
                        {/* Overlay con título */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 md:bg-black/60 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 z-10">
                          <span className="text-white text-center px-3 font-medium uppercase text-sm md:text-base">
                            {video.tags?.[0] || 'CLIENTE'} | {video.title}
                          </span>
                        </div>
                      </div>
                    );
                  })}
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

