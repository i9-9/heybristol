"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [videoSequence, setVideoSequence] = useState<number[]>([]);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const isMobile = useIsMobile();
  
  // Ref para evitar múltiples llamadas al handleVideoEnded
  const isHandlingVideoEnd = useRef(false);
  const vimeoPlayerRef = useRef<unknown>(null);

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

  const generateRandomSequence = useCallback((totalVideos: number) => {
    const indices = Array.from({ length: totalVideos }, (_, i) => i);
    
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    return indices;
  }, []);

  const loadVideoAtIndex = useCallback((index: number) => {
    if (!allHeroVideos || allHeroVideos.length === 0) return;
    
    setIsTransitioning(true);
    setIsVideoLoaded(false);
    
    const video = allHeroVideos[index];
    setHeroVideo(video);
    
    const bestSource = getBestVideoSource(video, isMobile);
    
    if (bestSource) {
      if (bestSource.type === 'vimeo') {
        setIsVimeoVideo(true);
        setVideoSource(bestSource.src);
      } else {
        setIsVimeoVideo(false);
        setVideoSource(bestSource.src);
      }
    } else {
      const fallbackFormat = detectVideoSupport();
      setVideoSource(fallbackFormat);
      setIsVimeoVideo(false);
    }
    
    // Finalizar transición inmediatamente
    setIsTransitioning(false);
    setIsVideoLoaded(true);
  }, [allHeroVideos, isMobile]);

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
    
    setSequenceIndex(prev => prev + 1);
    return nextVideoIndex;
  }, [allHeroVideos, videoSequence, sequenceIndex, generateRandomSequence]);


  const handleVideoEnded = useCallback(() => {
    // Prevenir múltiples ejecuciones
    if (isHandlingVideoEnd.current) {
      return;
    }

    if (!allHeroVideos || allHeroVideos.length <= 1) {
      return;
    }
    
    isHandlingVideoEnd.current = true;
    
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
  }, [allHeroVideos, getNextVideoInSequence, loadVideoAtIndex]);

  const toggleAudio = () => {
    if (!audioRef.current || !audioTrack) return;
    
    if (isMuted) {
      setIsMuted(false);
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    } else {
      setIsMuted(true);
      audioRef.current.pause();
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

  const toggleFullscreen = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      if (!isFullscreen) {
        // Entrar a pantalla completa
        if (videoRef.current.requestFullscreen) {
          await videoRef.current.requestFullscreen();
        } else if ((videoRef.current as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
          await (videoRef.current as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
        } else if ((videoRef.current as unknown as { msRequestFullscreen?: () => Promise<void> }).msRequestFullscreen) {
          await (videoRef.current as unknown as { msRequestFullscreen: () => Promise<void> }).msRequestFullscreen();
        }
      } else {
        // Salir de pantalla completa
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as unknown as { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
          await (document as unknown as { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
        } else if ((document as unknown as { msExitFullscreen?: () => Promise<void> }).msExitFullscreen) {
          await (document as unknown as { msExitFullscreen: () => Promise<void> }).msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  }, [isFullscreen]);

  // Configurar Vimeo player cuando sea necesario
  useEffect(() => {
    if (isVimeoVideo && videoSource && !isTransitioning) {
      // Configurar el player de Vimeo con la API
      const setupVimeoPlayer = () => {
        const iframe = document.querySelector('iframe[src*="vimeo"]') as HTMLIFrameElement;
        const VimeoPlayer = (window as { Vimeo?: { Player: new (iframe: HTMLIFrameElement) => unknown } }).Vimeo;
        
        if (iframe && VimeoPlayer) {
          const player = new VimeoPlayer.Player(iframe);
          vimeoPlayerRef.current = player;
          
          // Configurar eventos del player
          if (player && typeof player === 'object' && 'on' in player) {
            (player as { on: (event: string, callback: () => void) => void }).on('ended', () => {
              handleVideoEnded();
            });
            
            if ('play' in player) {
              (player as { play: () => Promise<unknown> }).play().catch((error: unknown) => {
                console.error('Error playing Vimeo video:', error);
              });
            }
          }
        }
      };

      // Cargar script de Vimeo si no está disponible
      const VimeoPlayer = (window as { Vimeo?: unknown }).Vimeo;
      if (!VimeoPlayer) {
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
        } else {
          const fallbackAudio = await getRandomAudioTrack();
          if (fallbackAudio) {
            setAudioTrack(fallbackAudio);
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
  }, [allHeroVideos, fixedAudioTrack, isMobile, loadVideoAtIndex, generateRandomSequence]);

  // Manejar cambios de pantalla completa y orientación
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
        (document as { msFullscreenElement?: Element }).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    const handleOrientationChange = () => {
      // En móvil, cuando cambia la orientación, intentar entrar a pantalla completa automáticamente
      if (isMobile && videoRef.current && !isFullscreen) {
        // Pequeño delay para que el navegador procese el cambio de orientación
        setTimeout(() => {
          toggleFullscreen();
        }, 100);
      }
    };

    // Event listeners para pantalla completa
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    // Event listener para cambios de orientación (solo en móvil)
    if (isMobile) {
      window.addEventListener('orientationchange', handleOrientationChange);
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
      if (isMobile) {
        window.removeEventListener('orientationchange', handleOrientationChange);
      }
    };
  }, [isMobile, isFullscreen, toggleFullscreen]);

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
            className="absolute inset-0 w-screen h-screen object-cover md:top-0 md:left-1/2 md:transform md:-translate-x-1/2 md:w-auto md:h-full md:min-w-full md:min-h-full cursor-pointer"
            autoPlay
            muted
            playsInline
            preload="auto"
            controls={isMobile}
            key={videoSource} // Forzar re-render cuando cambia el source
            style={{
              opacity: isVideoLoaded && !isTransitioning ? 1 : 0,
              transition: "opacity 0.8s ease-in-out"
            }}
            onLoadedData={() => setIsVideoLoaded(true)}
            onCanPlay={() => setIsVideoLoaded(true)}
            onEnded={handleVideoEnded}
            onClick={isMobile ? toggleFullscreen : undefined}
            onError={(e) => {
              console.error('Error en video:', e);
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
              onLoad={() => setIsVideoLoaded(true)}
              onError={() => {
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

      {/* Botones de control */}
      <div className="absolute bottom-4 right-4 md:bottom-6 md:right-8 z-10 flex gap-2">
        {/* Botón de pantalla completa (solo en móvil) */}
        {isMobile && (
          <button
            onClick={toggleFullscreen}
            className="w-12 h-12 transition-all duration-200 bg-white/10 backdrop-blur-md hover:bg-white/20 shadow-lg flex items-center justify-center cursor-pointer"
            aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullscreen ? (
              <Minimize className="w-6 h-6 text-white" />
            ) : (
              <Maximize className="w-6 h-6 text-white" />
            )}
          </button>
        )}
        
        {/* Botón de audio */}
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