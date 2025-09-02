"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import LogoMain from "@/components/LogoMain";
import { getRandomHeroVideo, getBestVideoSource, getRandomAudioTrack, type HeroVideo, type AudioTrack } from "@/lib/contentful";

// Hook para detectar si es móvil
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Verificar en el mount
    checkIsMobile();

    // Escuchar cambios de tamaño
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}

interface HeroProps {
  initialHeroVideo?: HeroVideo | null;
  initialAudioTrack?: AudioTrack | null;
}

export default function Hero({ initialHeroVideo, initialAudioTrack }: HeroProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const [heroVideo, setHeroVideo] = useState<HeroVideo | null>(null);
  const [audioTrack, setAudioTrack] = useState<AudioTrack | null>(null);
  const [isVimeoVideo, setIsVimeoVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const isMobile = useIsMobile();

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
    if (!audioRef.current || !audioTrack) return;
    
    if (isMuted) {
      setIsMuted(false);
      audioRef.current.volume = audioTrack.volume || 0.5;
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
      console.log('🎵 Activando música:', audioTrack.title);
    } else {
      setIsMuted(true);
      audioRef.current.pause();
      console.log('🔇 Silenciando música');
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
    const loadHeroContent = async () => {
      try {
        // Cargar video
        const randomVideo = initialHeroVideo || await getRandomHeroVideo();
        
        if (randomVideo) {
          setHeroVideo(randomVideo);
          
          // Usar el hook para detectar móvil
          // const isMobile = window.innerWidth <= 768;
          
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

        // Cargar audio track
        const randomAudio = initialAudioTrack || await getRandomAudioTrack();
        if (randomAudio) {
          setAudioTrack(randomAudio);
          console.log('🎵 Audio track cargado:', randomAudio.title);
        }

      } catch (error) {
        console.error('Error loading hero content from Contentful:', error);
        // Fallback a video local en caso de error
        fallbackToLocal();
      }
    };

    const fallbackToLocal = () => {
      const bestFormat = detectVideoSupport();
      setVideoSource(bestFormat);
      setIsVimeoVideo(false);
    };

    loadHeroContent();

    const timer = setTimeout(() => setIsVideoLoaded(true), 3000);

    return () => clearTimeout(timer);
  }, [initialHeroVideo, initialAudioTrack, isMobile]);

  return (
    <section className="relative z-10 h-screen">
      {/* Audio track independiente */}
      {audioTrack && (
        <audio
          ref={audioRef}
          loop={audioTrack.loop}
          preload="auto"
          style={{ display: 'none' }}
        >
          <source
            src={`https:${audioTrack.audioFile.fields.file.url}`}
            type={audioTrack.audioFile.fields.file.contentType}
          />
        </audio>
      )}

      {/* Video de fondo dentro del hero */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-black pointer-events-none z-0">
        {videoSource && !isVimeoVideo && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-screen h-screen object-cover md:top-0 md:left-1/2 md:transform md:-translate-x-1/2 md:w-auto md:h-full md:min-w-full md:min-h-full"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            style={{
              opacity: isVideoLoaded ? 1 : 0,
              transition: "opacity 0.8s ease-in-out"
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
            className="absolute inset-0 w-screen h-screen md:w-full md:h-full"
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

      {/* Botón de audio dentro del hero (abajo derecha) - Para música independiente */}
      <div className="absolute bottom-4 right-4 md:bottom-6 md:right-8 z-10">
        <button
          onClick={toggleAudio}
          className="w-12 h-12 md:w-14 md:h-14 transition-all duration-200 bg-white/10 backdrop-blur-md hover:bg-white/20 shadow-lg flex items-center justify-center cursor-pointer"
          aria-label={isMuted ? "Activar música" : "Silenciar música"}
        >
          {isMuted ? (
            <VolumeX className="w-6 h-6 text-white" />
          ) : (
            <Volume2 className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

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
