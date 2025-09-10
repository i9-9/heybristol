"use client";

import Image from "next/image";
import LogoB from "@/components/LogoB";
import { useState, useRef, useCallback, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import type { VideoItem } from "@/lib/types";
import { useRouter } from "next/navigation";
import CustomVimeoPlayer from "@/components/CustomVimeoPlayer";

interface DirectorClientProps {
  director: { name: string };
  videos: VideoItem[];
}

// Hook para detectar si es móvil
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

// Hook para detectar iOS
function useIsIOS() {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);
  }, []);

  return isIOS;
}

// Componente para el card de video con lazy loading - IDÉNTICO al modal
function VideoCard({ video, onClick }: { video: VideoItem; onClick: () => void }) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
    setIsLoadingVideo(false);
  };

  const handleVideoError = () => {
    setIsLoadingVideo(false);
    // Fallback a imagen si falla el video
  };

  // Construir URL de thumbnail estático de Vimeo
  const getThumbnailUrl = (thumbnailId: string) => {
    return `https://i.vimeocdn.com/video/${thumbnailId}_640.jpg`;
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
      className="relative group block overflow-hidden cursor-pointer"
    >
      <div className="w-full h-80 md:aspect-video md:h-auto bg-black overflow-hidden">
        {/* Imagen estática de thumbnail - siempre visible */}
        <Image
          src={getThumbnailUrl(video.thumbnailId || video.id)}
          alt={video.title}
          width={640}
          height={360}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isVideoLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Spinner de carga - solo cuando se está cargando el video */}
        {inView && isLoadingVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        )}

        {/* Iframe de Vimeo - solo cuando está en viewport y cargado */}
        {inView && (
          <iframe
            src={`https://player.vimeo.com/video/${video.thumbnailId || video.id}?h=hash&title=0&byline=0&portrait=0&autoplay=1&loop=1&muted=1&controls=0&background=1&dnt=1`}
            className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
              isVideoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            allow="autoplay; fullscreen; picture-in-picture"
            title={video.title}
            frameBorder="0"
            onLoad={handleVideoLoad}
            onError={handleVideoError}
            style={{ display: isVideoLoaded ? 'block' : 'none' }}
          />
        )}
      </div>
      
      {/* Overlay con título */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 md:bg-black/60 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 mobile-video-overlay">
        <span className="text-white text-center px-3 font-medium uppercase text-sm md:text-base mobile-video-title">
          {video.tags?.[0] || 'CLIENTE'} | {video.title}
        </span>
      </div>

      {/* Indicador de carga inicial */}
      {inView && !isVideoLoaded && !isLoadingVideo && (
        <div 
          className="absolute inset-0 bg-black/40 flex items-center justify-center"
          onTransitionEnd={() => setIsLoadingVideo(true)}
        >
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );
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

  const handleVideoSelect = (video: VideoItem) => {
    setSelectedVideo(video);
  };

  // Funciones para manejar la visibilidad de controles (solo desktop)
  const handleMouseEnter = useCallback(() => {
    if (isMobile) return; // Solo en desktop
    setIsHovered(true);
    setShowControls(true);
    // Limpiar timeout si existe
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    // Crear timeout para ocultar controles después de 3 segundos de inactividad
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (isMobile) return; // Solo en desktop
    setIsHovered(false);
    setShowControls(false);
    // Limpiar timeout si existe
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  }, [isMobile]);

  const handleMouseMove = useCallback(() => {
    if (isMobile) return; // Solo en desktop
    // Solo mostrar controles si el mouse está sobre el contenedor
    if (isHovered) {
      setShowControls(true);
      // Limpiar timeout anterior si existe
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      // Crear nuevo timeout para ocultar controles después de 3 segundos de inactividad
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isHovered, isMobile]);

  const handleBackToVideos = useCallback(() => {
    setSelectedVideo(null);
  }, []);

  // Cleanup del timeout al desmontar
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Navegación entre videos
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

  // Navegación con teclado
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
        // En iOS, usar pseudo-fullscreen ya que el fullscreen nativo no funciona con iframes
        if (isIOS) {
          setIsFullscreen(true);
          // Ocultar la barra de estado en iOS
          document.body.style.overflow = 'hidden';
          // Forzar orientación landscape en iPhone
          if (isMobile && window.screen.orientation && 'lock' in window.screen.orientation) {
            try {
              await (window.screen.orientation as { lock: (orientation: string) => Promise<void> }).lock('landscape');
            } catch (e) {
              console.log('Could not lock orientation:', e);
            }
          }
        } else {
          // En otros dispositivos, usar fullscreen nativo
          if (videoContainerRef.current.requestFullscreen) {
            await videoContainerRef.current.requestFullscreen();
          } else if ((videoContainerRef.current as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
            await (videoContainerRef.current as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
          } else if ((videoContainerRef.current as unknown as { msRequestFullscreen?: () => Promise<void> }).msRequestFullscreen) {
            await (videoContainerRef.current as unknown as { msRequestFullscreen: () => Promise<void> }).msRequestFullscreen();
          }
        }
      } else {
        // Salir de pantalla completa
        if (isIOS) {
          setIsFullscreen(false);
          document.body.style.overflow = 'auto';
          // Restaurar orientación
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

  // Manejar cambios de pantalla completa (solo para dispositivos no iOS)
  useEffect(() => {
    if (isIOS) return; // No necesitamos escuchar eventos de fullscreen en iOS

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
      {/* Logo */}
      <div className="absolute top-0 left-0 p-6 z-10">
        <button 
          onClick={() => {
            // Navegar al home y luego scroll a la sección Directors
            router.push('/');
            setTimeout(() => {
              const directorsSection = document.getElementById('directors');
              if (directorsSection) {
                directorsSection.scrollIntoView({ behavior: 'smooth' });
              }
            }, 100);
          }}
          className="w-10 md:w-24 h-auto text-white hover:opacity-80 transition-opacity cursor-pointer"
        >
          <LogoB />
        </button>
      </div>

      {/* Botón de volver a DIRECTORS - esquina inferior izquierda, solo cuando no hay video seleccionado */}
      {!selectedVideo && (
        <div className="absolute bottom-6 left-6 z-10">
          <button
            onClick={() => {
              router.push('/');
              setTimeout(() => {
                const directorsSection = document.getElementById('directors');
                if (directorsSection) {
                  directorsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }, 100);
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

      {/* Contenido */}
      <div className="flex flex-col items-start justify-start h-full px-6 pt-[150px] md:pt-[150px] overflow-y-auto">
        {!selectedVideo ? (
          // Layout original: lista de videos - IDÉNTICO al modal
          <>
            <h1 className="uppercase text-4xl md:text-7xl font-hagrid tracking-tight font-bold text-white mb-8 md:mb-16 pl-6 md:pl-0 pb-10!">{director.name}</h1>

            {/* Espaciador para desktop */}
            <div className="hidden md:block h-16"></div>

            {/* Grid de videos con lazy loading - IDÉNTICO al modal */}
            {videos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 w-full px-6 md:px-0 max-w-sm md:max-w-none mx-auto md:mx-0 pb-8">
                {videos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onClick={() => handleVideoSelect(video)}
                  />
                ))}
              </div>
            )}

            {videos.length === 0 && (
              <p className="text-white/80 text-lg">No hay videos disponibles.</p>
            )}
          </>
        ) : (
          // Layout del video seleccionado - IDÉNTICO al modal
          <>
            {/* Nombre del director arriba a la derecha, más pequeño */}
            <div className="absolute top-6 right-6 z-20">
              <h2 className="uppercase font-hagrid text-xl md:text-2xl font-bold text-white text-right">
                {director.name}
              </h2>
            </div>

            {/* Video grande centrado */}
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
                />
              </div>
              
              {/* Espaciador para crear distancia - solo cuando no está en pantalla completa */}
              {!isFullscreen && (
                <>
                  <div className="h-4 mobile-video-spacing"></div>
                  
                  {/* Título del video debajo */}
                  <h3 className="text-white text-lg md:text-2xl font-medium text-center animate-slideUp uppercase px-2">
                    {selectedVideo.tags?.[0] || 'CLIENTE'} | {selectedVideo.title}
                  </h3>
                </>
              )}
              
            </div>
            
            {/* Flechas de navegación a los lados del video */}
            {!isFullscreen && (
              <>
                {/* Flecha izquierda - Anterior video */}
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

                {/* Flecha derecha - Siguiente video */}
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

                {/* Botón de volver - Esquina inferior izquierda */}
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

      {/* Esquinas - IDÉNTICAS al modal - solo cuando no está en pantalla completa */}
      {!isFullscreen && (
        <div className="absolute bottom-6 right-6 z-10">
        <button onClick={() => {
          // Navegar al home
          router.push('/');
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
