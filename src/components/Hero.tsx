"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";
import LogoMain from "@/components/LogoMain";
import { getBestVideoSource, getRandomAudioTrack, type HeroVideo, type AudioTrack } from "@/lib/contentful";

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

interface HeroProps {
  allHeroVideos?: HeroVideo[];
  fixedAudioTrack?: AudioTrack | null;
}

export default function Hero({ allHeroVideos, fixedAudioTrack }: HeroProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const [heroVideo, setHeroVideo] = useState<HeroVideo | null>(null);
  const [audioTrack, setAudioTrack] = useState<AudioTrack | null>(null);
  const [isVimeoVideo, setIsVimeoVideo] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [videoSequence, setVideoSequence] = useState<number[]>([]);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const isMobile = useIsMobile();
  
  // Ref para evitar múltiples llamadas al handleVideoEnded
  const isHandlingVideoEnd = useRef(false);
  const vimeoPlayerRef = useRef<any>(null);

  const detectVideoSupport = () => {
    const video = document.createElement("video");
    if (video.canPlayType('video/webm; codecs="vp9"').replace(/no/, "")) {
      return "/videos/under_construction.webm";
    }
    if (video.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/no/, "")) {
      return "/videos/under_construction_optimized.mp4";
    }
    return "/videos/under_construction_optimized.mp4";
  };

  const generateRandomSequence = (totalVideos: number) => {
    const indices = Array.from({ length: totalVideos }, (_, i) => i);
    
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    console.log('🎲 Nueva secuencia generada:', indices);
    return indices;
  };

  const getNextVideoInSequence = useCallback(() => {
    if (!allHeroVideos || allHeroVideos.length === 0) return 0;
    if (allHeroVideos.length === 1) return 0;
    
    // Si no hay secuencia o hemos llegado al final, generar una nueva
    if (videoSequence.length === 0 || sequenceIndex >= videoSequence.length) {
      const newSequence = generateRandomSequence(allHeroVideos.length);
      setVideoSequence(newSequence);
      setSequenceIndex(1); // Empezamos en 1 porque vamos a usar el índice 0
      return newSequence[0];
    }
    
    const nextVideoIndex = videoSequence[sequenceIndex];
    console.log(`🎬 Secuencia: [${videoSequence.join(', ')}], posición: ${sequenceIndex}, siguiente: ${nextVideoIndex}`);
    
    setSequenceIndex(prev => prev + 1);
    return nextVideoIndex;
  }, [allHeroVideos, videoSequence, sequenceIndex]);

  const handleVideoEnded = useCallback(() => {
    // Prevenir múltiples ejecuciones
    if (isHandlingVideoEnd.current) {
      console.log('🎬 Ya procesando fin de video, ignorando...');
      return;
    }

    if (!allHeroVideos || allHeroVideos.length <= 1) {
      console.log('🎬 Solo hay un video o ninguno, no rotando');
      return;
    }
    
    isHandlingVideoEnd.current = true;
    console.log('🎬 Video terminó, cambiando al siguiente en la secuencia...');
    
    // Resetear el video actual
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
    
    const nextIndex = getNextVideoInSequence();
    loadVideoAtIndex(nextIndex);
    
    // Resetear el flag después de un tiempo
    setTimeout(() => {
      isHandlingVideoEnd.current = false;
    }, 1000);
  }, [allHeroVideos, getNextVideoInSequence]);

  const loadVideoAtIndex = useCallback((index: number) => {
    if (!allHeroVideos || allHeroVideos.length === 0) return;
    
    console.log(`🎬 Iniciando carga de video ${index + 1}/${allHeroVideos.length}`);
    
    setIsTransitioning(true);
    setIsVideoLoaded(false);
    setCurrentVideoIndex(index);
    
    const video = allHeroVideos[index];
    setHeroVideo(video);
    
    const bestSource = getBestVideoSource(video, isMobile);
    
    if (bestSource) {
      if (bestSource.type === 'vimeo') {
        setIsVimeoVideo(true);
        setVideoSource(bestSource.src);
        console.log('🎬 Cargando video de Vimeo:', video.title);
      } else {
        setIsVimeoVideo(false);
        setVideoSource(bestSource.src);
        console.log('🎬 Cargando video directo:', video.title);
      }
    } else {
      console.log('🎬 Fallback a video local');
      const fallbackFormat = detectVideoSupport();
      setVideoSource(fallbackFormat);
      setIsVimeoVideo(false);
    }
    
    // Finalizar transición
    setTimeout(() => {
      setIsTransitioning(false);
      setIsVideoLoaded(true);
      console.log('🎬 Transición completada para:', video.title);
    }, 500);
  }, [allHeroVideos, isMobile]);

  const toggleAudio = () => {
    if (!audioRef.current || !audioTrack) return;
    
    if (isMuted) {
      setIsMuted(false);
      audioRef.current.volume = 0.5;
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

  // Configurar Vimeo player cuando sea necesario
  useEffect(() => {
    if (isVimeoVideo && videoSource && !isTransitioning) {
      // Configurar el player de Vimeo con la API
      const setupVimeoPlayer = () => {
        const iframe = document.querySelector('iframe[src*="vimeo"]') as HTMLIFrameElement;
        if (iframe && (window as any).Vimeo) {
          const player = new (window as any).Vimeo.Player(iframe);
          vimeoPlayerRef.current = player;
          
          player.on('ended', () => {
            console.log('🎬 Video de Vimeo terminó');
            handleVideoEnded();
          });
          
          player.play().catch((error: any) => {
            console.error('Error playing Vimeo video:', error);
          });
        }
      };

      // Cargar script de Vimeo si no está disponible
      if (!(window as any).Vimeo) {
        const script = document.createElement('script');
        script.src = 'https://player.vimeo.com/api/player.js';
        script.onload = setupVimeoPlayer;
        document.head.appendChild(script);
      } else {
        setupVimeoPlayer();
      }
    }
  }, [isVimeoVideo, videoSource, isTransitioning, handleVideoEnded]);

  // Cargar contenido inicial
  useEffect(() => {
    const loadHeroContent = async () => {
      try {
        if (allHeroVideos && allHeroVideos.length > 0) {
          const initialSequence = generateRandomSequence(allHeroVideos.length);
          setVideoSequence(initialSequence);
          setSequenceIndex(1); // Empezar en 1 porque usaremos el 0
          
          loadVideoAtIndex(initialSequence[0]);
        } else {
          const fallbackFormat = detectVideoSupport();
          setVideoSource(fallbackFormat);
          setIsVimeoVideo(false);
          setIsVideoLoaded(true);
        }

        if (fixedAudioTrack) {
          setAudioTrack(fixedAudioTrack);
          console.log('🎵 Audio track fijo cargado:', fixedAudioTrack.title);
        } else {
          const fallbackAudio = await getRandomAudioTrack();
          if (fallbackAudio) {
            setAudioTrack(fallbackAudio);
            console.log('🎵 Audio track fallback cargado:', fallbackAudio.title);
          }
        }

      } catch (error) {
        console.error('Error loading hero content from Contentful:', error);
        const fallbackFormat = detectVideoSupport();
        setVideoSource(fallbackFormat);
        setIsVimeoVideo(false);
        setIsVideoLoaded(true);
      }
    };

    loadHeroContent();
  }, [allHeroVideos, fixedAudioTrack, isMobile, loadVideoAtIndex]);

  return (
    <section className="relative z-10 h-screen">
      {/* Audio track independiente */}
      {audioTrack && (
        <audio
          ref={audioRef}
          loop={true}
          preload="auto"
          style={{ display: 'none' }}
        >
          <source
            src={`https:${audioTrack.audioFile.fields.file.url}`}
            type={audioTrack.audioFile.fields.file.contentType}
          />
        </audio>
      )}

      {/* Video de fondo */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-black pointer-events-none z-0">
        {videoSource && !isVimeoVideo && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-screen h-screen object-cover md:top-0 md:left-1/2 md:transform md:-translate-x-1/2 md:w-auto md:h-full md:min-w-full md:min-h-full"
            autoPlay
            muted
            playsInline
            preload="auto"
            key={videoSource} // Forzar re-render cuando cambia el source
            style={{
              opacity: isVideoLoaded && !isTransitioning ? 1 : 0,
              transition: "opacity 0.8s ease-in-out"
            }}
            onLoadedData={() => {
              console.log('🎬 Video cargado (loadedData)');
              setIsVideoLoaded(true);
            }}
            onCanPlay={() => {
              console.log('🎬 Video listo para reproducir (canPlay)');
              setIsVideoLoaded(true);
            }}
            onEnded={handleVideoEnded}
            onError={(e) => {
              console.error('🎬 Error en video:', e);
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
              opacity: isVideoLoaded && !isTransitioning ? 1 : 0,
              transition: "opacity 0.8s ease-in-out",
            }}
          >
            <iframe
              className="w-full h-full"
              src={`${videoSource}&autoplay=1&loop=0&muted=1`}
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
              onLoad={() => {
                console.log('🎬 Iframe de Vimeo cargado');
                setIsVideoLoaded(true);
              }}
              onError={() => {
                console.log('🎬 Error en Vimeo, fallback a video local');
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

      {/* Botones centrados */}
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

      {/* Botón de audio */}
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
    </section>
  );
}