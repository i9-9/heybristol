"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";
import LogoMain from "@/components/LogoMain";
import { getBestVideoSource, getRandomAudioTrack, type HeroVideo, type AudioTrack } from "@/lib/contentful";
import { preloadVimeoPlayer } from "@/lib/vimeo-preload";
import { useIsMobile } from "@/hooks/useIsMobile";
import { scrollToSection } from "@/lib/scroll-to-hero";
import type Player from "@vimeo/player";

interface HeroProps {
  allHeroVideos?: HeroVideo[];
  fixedAudioTrack?: AudioTrack | null;
}

export default function Hero({ allHeroVideos, fixedAudioTrack }: HeroProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(true); // Start as loaded for faster rendering
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const [heroVideo, setHeroVideo] = useState<HeroVideo | null>(null);
  const [audioTrack, setAudioTrack] = useState<AudioTrack | null>(null);
  const [isVimeoVideo, setIsVimeoVideo] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [videoSequence, setVideoSequence] = useState<number[]>([]);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [isIOS, setIsIOS] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const isMobile = useIsMobile();
  
  // Ref para evitar múltiples llamadas al handleVideoEnded
  const isHandlingVideoEnd = useRef(false);
  const vimeoPlayerRef = useRef<Player | null>(null);

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

  // Configurar Vimeo player cuando sea necesario (via @vimeo/player npm package)
  useEffect(() => {
    if (!isVimeoVideo || !videoSource || isTransitioning) return;

    let cancelled = false;
    let player: Player | null = null;

    const setupVimeoPlayer = async () => {
      try {
        const iframe = document.querySelector('iframe[src*="vimeo"]') as HTMLIFrameElement | null;
        if (!iframe || cancelled) return;

        const { default: PlayerCtor } = await preloadVimeoPlayer();
        if (cancelled) return;

        player = new PlayerCtor(iframe);
        vimeoPlayerRef.current = player;

        player.on('ended', handleVideoEnded);
        await player.play();
      } catch (error) {
        console.error('Error setting up Vimeo hero player:', error);
      }
    };

    void setupVimeoPlayer();

    return () => {
      cancelled = true;
      if (player) {
        player.off('ended', handleVideoEnded);
        void player.destroy();
      }
      vimeoPlayerRef.current = null;
    };
  }, [isVimeoVideo, videoSource, isTransitioning, handleVideoEnded]);

  const handleUserInteraction = () => {
    setUserInteracted(true);
    // Try to play the video after user interaction
    if (videoRef.current && videoRef.current.paused) {
      videoRef.current.play().catch(console.error);
    }
    // Load audio only when user interacts (optimized)
    if (audioRef.current && !isMuted) {
      audioRef.current.load();
      audioRef.current.play().catch(console.error);
    }
  };

  // Cargar contenido inicial
  useEffect(() => {
    // Detectar iOS devices
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

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


  return (
    <section id="hero" className="relative z-10 h-dvh">
      {/* Audio track independiente */}
      {audioTrack && (
        <audio
          ref={audioRef}
          loop={true}
          preload="auto"
          style={{ display: 'none' }}
        >
          <source
            src={audioTrack.audioFile.fields.file.url.startsWith('//') ? `https:${audioTrack.audioFile.fields.file.url}` : audioTrack.audioFile.fields.file.url}
            type={audioTrack.audioFile.fields.file.contentType}
          />
        </audio>
      )}

      {/* Video de fondo */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-black pointer-events-none z-0">
        {videoSource && !isVimeoVideo && (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 w-screen h-screen object-cover md:top-0 md:left-1/2 md:transform md:-translate-x-1/2 md:w-auto md:h-full md:min-w-full md:min-h-full"
              autoPlay
              muted
              playsInline
              preload="auto"
              controls={false}
              disablePictureInPicture
              disableRemotePlayback
              webkit-playsinline="true"
              x5-playsinline="true"
              x5-video-player-type="h5"
              x5-video-player-fullscreen="false"
              key={videoSource}
              style={{
                opacity: !isTransitioning ? 1 : 0,
                transition: "opacity 0.3s ease-in-out",
                pointerEvents: 'none',
                WebkitMaskImage: '-webkit-radial-gradient(white, black)',
              }}
              onLoadedData={() => setIsVideoLoaded(true)}
              onCanPlay={() => setIsVideoLoaded(true)}
              onClick={isIOS ? handleUserInteraction : undefined}
              onTouchStart={isIOS ? handleUserInteraction : undefined}
              onEnded={handleVideoEnded}
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
            
            {/* Transparent overlay to block native controls and play button */}
            <div 
              className="absolute inset-0 z-5 bg-transparent"
              style={{ 
                pointerEvents: isIOS && !userInteracted ? 'auto' : 'none',
                touchAction: 'none',
                WebkitTapHighlightColor: 'transparent',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none',
              }}
              onClick={(e) => {
                if (isIOS && !userInteracted) {
                  handleUserInteraction();
                }
                e.preventDefault();
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                if (isIOS && !userInteracted) {
                  handleUserInteraction();
                }
                e.preventDefault();
                e.stopPropagation();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />
          </>
        )}

        {videoSource && isVimeoVideo && (
          <div 
            className="absolute inset-0 w-screen h-screen md:w-full md:h-full"
            style={{
              opacity: !isTransitioning ? 1 : 0,
              transition: "opacity 0.3s ease-in-out",
            }}
          >
            <iframe
              className="w-full h-full"
              src={`${videoSource}&autoplay=1&loop=0&muted=1&playsinline=1&controls=0&keyboard=0&pip=0`}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                transform: "scale(1.1)",
                transformOrigin: "center center",
              }}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope"
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
            type="button"
            aria-label="Ir a directores"
            onClick={() => scrollToSection("directors")}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            DIRECTORS
          </button>
          <button
            type="button"
            aria-label="Ir a contacto"
            onClick={() => scrollToSection("contact")}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            CONTACT
          </button>
        </div>
      </div>

      {/* Botones de control */}
      <div className="absolute bottom-4 right-4 md:bottom-6 md:right-8 z-10 flex gap-2">
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