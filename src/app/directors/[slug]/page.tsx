"use client";

import Image from "next/image";
import LogoB from "@/components/LogoB";
import { useEffect, useState, use } from "react";
import { useInView } from "react-intersection-observer";
import { getDirectorBySlug, getVideosAsVideoItems } from "@/data/directors";
import type { VideoItem } from "@/lib/types";
import { notFound, useRouter } from "next/navigation";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
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
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-white text-center px-3 font-medium uppercase">
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

export default function DirectorPage({ params }: PageProps) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Obtener datos del director usando React.use() para Next.js 15
  const { slug } = use(params);
  const director = getDirectorBySlug(slug);
  
  if (!director) {
    notFound();
  }

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const videosData = await getVideosAsVideoItems(director.name);
        setVideos(videosData);
      } catch (error) {
        console.error('Error getting videos:', error);
        setError('Error al cargar los videos');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVideos();
  }, [director.name]);

  const handleVideoSelect = (video: VideoItem) => {
    setSelectedVideo(video);
  };

  const handleBackToVideos = () => {
    setSelectedVideo(null);
  };

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



      {/* Contenido */}
      <div className="flex flex-col items-start justify-start h-full px-6 pt-[150px] md:pt-[150px] overflow-y-auto">
        {!selectedVideo ? (
          // Layout original: lista de videos - IDÉNTICO al modal
          <>
            <h1 className="uppercase text-4xl md:text-7xl font-hagrid tracking-tight font-bold text-white mb-8 md:mb-16 pl-6 md:pl-0 pb-10!">{director.name}</h1>

            {/* Espaciador para desktop */}
            <div className="hidden md:block h-16"></div>

            {/* Estados */}
            {isLoading && (
              <div className="grid grid-cols-3 gap-6 w-full">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="aspect-video w-full bg-white/10 animate-pulse" />
                ))}
              </div>
            )}

            {!isLoading && error && (
              <p className="text-white/80 text-lg">Hubo un problema al cargar los videos.</p>
            )}

            {!isLoading && !error && videos.length === 0 && (
              <p className="text-white/80 text-lg">No hay videos disponibles.</p>
            )}

            {/* Grid de videos con lazy loading - IDÉNTICO al modal */}
            {!isLoading && !error && videos.length > 0 && (
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
            <div className="w-full max-w-5xl mx-auto -mt-4 animate-fadeIn">
              <div className="aspect-video w-full bg-black overflow-hidden">
                <iframe
                  src={selectedVideo.embedUrl}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  title={selectedVideo.title}
                />
              </div>
              
              {/* Espaciador para crear distancia */}
              <div className="h-4"></div>
              
              {/* Título del video debajo */}
              <h3 className="text-white text-xl md:text-2xl font-medium text-center animate-slideUp uppercase">
                {selectedVideo.tags?.[0] || 'CLIENTE'} | {selectedVideo.title}
              </h3>
              
            </div>
            
            {/* Botón de volver en esquina inferior izquierda */}
            <div className="absolute bottom-6 left-6 z-10">
              <button
                onClick={handleBackToVideos}
                className="flex flex-col items-start space-y-2 text-white cursor-pointer"
              >
                <Image 
                  src="/images/icons/arrow.png" 
                  alt="Arrow Left" 
                  width={32} 
                  height={32} 
                  className="w-8 h-8 rotate-180 hover:opacity-80 transition-opacity" 
                />
                <span className="font-ordinary text-sm md:text-xl uppercase leading-tight text-left">
                  BACK TO<br />
                  {director.name}
                </span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Esquinas - IDÉNTICAS al modal */}

      <div className="absolute bottom-6 right-6 z-10">
        <button onClick={() => {
          // Navegar al home
          router.push('/');
        }} className="flex flex-col items-end space-y-2 text-white hover:opacity-80 cursor-pointer">
          <Image src="/images/icons/arrow.png" alt="Arrow Up" width={32} height={32} className="w-8 h-8" />
          <span className="font-ordinary text-sm md:text-xl">BRISTOL</span>
        </button>
      </div>
    </div>
  );
}


