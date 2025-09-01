"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import LogoMain from "@/components/LogoMain";
import { getRandomHeroVideo, getBestVideoSource, type HeroVideo } from "@/lib/contentful";

interface HeroProps {
  initialHeroVideo?: HeroVideo | null;
}

export default function Hero({ initialHeroVideo }: HeroProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const [heroVideo, setHeroVideo] = useState<HeroVideo | null>(null);
  const [isVimeoVideo, setIsVimeoVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const detectVideoSupport = () => {
    const video = document.createElement("video");
    if (video.canPlayType('video/webm; codecs="vp9"').replace(/no/, "")) {
      return "/videos/under_construction.webm";
    }
    if (
      video.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/no/, "")
    ) {
      return "/videos/under_construction_optimized.mp4";
    }
    return "/videos/under_construction_optimized.mp4";
  };

  const toggleAudio = () => {
    // Solo funciona con videos locales, no con Vimeo iframes
    if (isVimeoVideo) {
      console.log('Audio control not available for Vimeo videos');
      return;
    }
    
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  useEffect(() => {
    const loadHeroVideo = async () => {
      try {
        // Usar video inicial si está disponible (SSG), sino obtener uno aleatorio
        const randomVideo = initialHeroVideo || await getRandomHeroVideo();
        
        if (randomVideo) {
          setHeroVideo(randomVideo);
          
          // Detectar dispositivo móvil
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          
          // Obtener la mejor fuente de video
          const bestSource = getBestVideoSource(randomVideo, isMobile);
          
          if (bestSource) {
            if (bestSource.type === 'vimeo') {
              setIsVimeoVideo(true);
              setVideoSource(bestSource.src);
            } else {
              setIsVimeoVideo(false);
              setVideoSource(bestSource.src);
            }
          } else {
            // Fallback a video local si no hay fuente válida
            fallbackToLocal();
          }
        } else {
          // Fallback a video local si no hay videos en Contentful
          fallbackToLocal();
        }
      } catch (error) {
        console.error('Error loading hero video from Contentful:', error);
        // Fallback a video local en caso de error
        fallbackToLocal();
      }
    };

    const fallbackToLocal = () => {
      const bestFormat = detectVideoSupport();
      setVideoSource(bestFormat);
      setIsVimeoVideo(false);
    };

    loadHeroVideo();

    const timer = setTimeout(() => setIsVideoLoaded(true), 3000);

    return () => clearTimeout(timer);
  }, [initialHeroVideo]);

  return (
    <section className="relative z-10 h-screen">
      {/* Video de fondo dentro del hero */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-black pointer-events-none z-0">
        {videoSource && !isVimeoVideo && (
          <video
            ref={videoRef}
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-auto h-full min-w-full min-h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            style={{
              opacity: isVideoLoaded ? 1 : 0,
              transition: "opacity 0.8s ease-in-out",
            }}
            onLoadedData={() => setIsVideoLoaded(true)}
            onCanPlay={() => setIsVideoLoaded(true)}
            onError={() => {
              if (videoSource?.includes(".webm")) {
                const fallbackFormat = detectVideoSupport();
                setVideoSource(fallbackFormat);
              }
              setIsVideoLoaded(true);
            }}
          >
            <source
              src={videoSource}
              type={videoSource.includes(".webm") ? "video/webm" : "video/mp4"}
            />
            Tu navegador no soporta el elemento de video.
          </video>
        )}

        {videoSource && isVimeoVideo && (
          <div 
            className="absolute inset-0 w-full h-full"
            style={{
              opacity: isVideoLoaded ? 1 : 0,
              transition: "opacity 0.8s ease-in-out",
            }}
          >
            <iframe
              className="w-full h-full"
              src={videoSource}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                transform: "scale(1.1)",
                transformOrigin: "center center",
              }}
              allow="autoplay; fullscreen; picture-in-picture"
              title={heroVideo?.title || "Hero Video"}
              frameBorder="0"
              onLoad={() => setIsVideoLoaded(true)}
              onError={() => {
                // Fallback to local video if Vimeo fails
                const fallbackFormat = detectVideoSupport();
                setVideoSource(fallbackFormat);
                setIsVimeoVideo(false);
                setIsVideoLoaded(true);
              }}
            />
          </div>
        )}
      </div>

      {/* Logo centrado absoluto */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="w-[clamp(200px,4vw,4000px)] h-auto">
          <LogoMain />
        </div>
      </div>

      {/* Botones centrados, más abajo */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="w-full px-[20px] md:px-[50px] mt-[clamp(12rem,34vh,22rem)] flex justify-center gap-x-[clamp(8rem,45vw,16rem)] lg:gap-x-[clamp(52rem,40vw,56rem)] xl:gap-x-[clamp(44rem,38vw,64rem)] font-hagrid-text font-medium text-white text-[clamp(1rem,2.2vw,1.125rem)]">
          <button
            onClick={() => scrollToSection("directors")}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            DIRECTORS
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            CONTACT
          </button>
        </div>
      </div>

      {/* Botón de audio dentro del hero (abajo derecha) - Solo para videos locales */}
      {!isVimeoVideo && (
        <div className="absolute bottom-4 right-4 md:bottom-6 md:right-8 z-10">
          <button
            onClick={toggleAudio}
            className="w-12 h-12 md:w-14 md:h-14 transition-all duration-200 bg-white/10 backdrop-blur-md hover:bg-white/20 shadow-lg flex items-center justify-center cursor-pointer"
            aria-label={isMuted ? "Activar audio" : "Silenciar audio"}
          >
            {isMuted ? (
              <VolumeX className="w-6 h-6 text-white" />
            ) : (
              <Volume2 className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      )}

      {/* Año (arriba derecha) */}
      {/*       <div className="absolute top-4 right-4 md:top-6 md:right-8 z-10 pointer-events-none">
        <p className="font-ordinary text-white text-sm md:text-xl">2025©</p>
      </div> */}

      {/* Lema (abajo izquierda) */}
      {/*       <div className="absolute bottom-4 left-4 md:bottom-6 md:left-8 z-10 pointer-events-none">
        <p className="font-ordinary text-white text-sm md:text-xl leading-5 text-left">LATIN<br/>CREATIVE<br/>PRODUCTION</p>
      </div> */}
    </section>
  );
}
