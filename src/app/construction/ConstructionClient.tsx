"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, VolumeX, Mail } from "lucide-react";
import BristolLogo from "@/components/BristolLogo";
import { getBestVideoSource, getRandomAudioTrack, type HeroVideo, type AudioTrack } from "@/lib/contentful";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isMobile;
}

interface ConstructionClientProps {
  allHeroVideos?: HeroVideo[];
  fixedAudioTrack?: AudioTrack | null;
}

export default function ConstructionClient({ allHeroVideos, fixedAudioTrack }: ConstructionClientProps) {
  const [isMuted, setIsMuted] = useState(true);
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
  const isHandlingVideoEnd = useRef(false);
  const vimeoPlayerRef = useRef<unknown>(null);
  const isMobile = useIsMobile();

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
      setVideoSource(null);
      setIsVimeoVideo(false);
    }

    setIsTransitioning(false);
  }, [allHeroVideos, isMobile]);

  const getNextVideoInSequence = useCallback(() => {
    if (!allHeroVideos || allHeroVideos.length === 0) return 0;
    if (allHeroVideos.length === 1) return 0;

    if (videoSequence.length === 0 || sequenceIndex >= videoSequence.length) {
      const newSequence = generateRandomSequence(allHeroVideos.length);
      setVideoSequence(newSequence);
      setSequenceIndex(1);
      return newSequence[0];
    }

    const nextVideoIndex = videoSequence[sequenceIndex];
    setSequenceIndex(prev => prev + 1);
    return nextVideoIndex;
  }, [allHeroVideos, videoSequence, sequenceIndex, generateRandomSequence]);

  const handleVideoEnded = useCallback(() => {
    if (isHandlingVideoEnd.current) return;
    if (!allHeroVideos || allHeroVideos.length <= 1) return;

    isHandlingVideoEnd.current = true;

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }

    const nextIndex = getNextVideoInSequence();
    loadVideoAtIndex(nextIndex);

    setTimeout(() => {
      isHandlingVideoEnd.current = false;
    }, 1000);
  }, [allHeroVideos, getNextVideoInSequence, loadVideoAtIndex]);

  const toggleAudio = () => {
    if (!audioRef.current || !audioTrack) return;

    if (isMuted) {
      setIsMuted(false);
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(console.error);
    } else {
      setIsMuted(true);
      audioRef.current.pause();
    }
  };

  const openEmail = () => {
    window.location.href = 'mailto:hey@heybristol.com';
  };

  const handleUserInteraction = () => {
    setUserInteracted(true);
    if (videoRef.current && videoRef.current.paused) {
      videoRef.current.play().catch(console.error);
    }
    if (audioRef.current && !isMuted) {
      audioRef.current.load();
      audioRef.current.play().catch(console.error);
    }
  };

  // Setup Vimeo player
  useEffect(() => {
    if (isVimeoVideo && videoSource && !isTransitioning) {
      const setupVimeoPlayer = () => {
        const iframe = document.querySelector('iframe[src*="vimeo"]') as HTMLIFrameElement;
        const VimeoPlayer = (window as { Vimeo?: { Player: new (iframe: HTMLIFrameElement) => unknown } }).Vimeo;

        if (iframe && VimeoPlayer) {
          const player = new VimeoPlayer.Player(iframe);
          vimeoPlayerRef.current = player;

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

      const VimeoScript = (window as { Vimeo?: unknown }).Vimeo;
      if (!VimeoScript) {
        const script = document.createElement('script');
        script.src = 'https://player.vimeo.com/api/player.js';
        script.onload = setupVimeoPlayer;
        document.head.appendChild(script);
      } else {
        setupVimeoPlayer();
      }
    }
  }, [isVimeoVideo, videoSource, isTransitioning, handleVideoEnded]);

  // Load initial content
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    const loadContent = async () => {
      try {
        if (allHeroVideos && allHeroVideos.length > 0) {
          const initialSequence = generateRandomSequence(allHeroVideos.length);
          setVideoSequence(initialSequence);
          setSequenceIndex(1);
          loadVideoAtIndex(initialSequence[0]);
        }

        if (fixedAudioTrack) {
          setAudioTrack(fixedAudioTrack);
        } else {
          const fallbackAudio = await getRandomAudioTrack();
          if (fallbackAudio) setAudioTrack(fallbackAudio);
        }
      } catch (error) {
        console.error('Error loading construction content:', error);
      }
    };

    loadContent();
  }, [allHeroVideos, fixedAudioTrack, isMobile, loadVideoAtIndex, generateRandomSequence]);

  return (
    <>
      {/* Audio track */}
      {audioTrack && (
        <audio ref={audioRef} loop preload="none" style={{ display: 'none' }}>
          <source
            src={`https:${audioTrack.audioFile.fields.file.url}`}
            type={audioTrack.audioFile.fields.file.contentType}
          />
        </audio>
      )}

      {/* Video de fondo a pantalla completa */}
      <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black">
        {videoSource && !isVimeoVideo && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-screen h-screen object-cover md:top-0 md:left-1/2 md:transform md:-translate-x-1/2 md:w-auto md:h-full md:min-w-full md:min-h-full"
            autoPlay
            muted
            playsInline
            preload="metadata"
            controls={false}
            webkit-playsinline="true"
            x5-playsinline="true"
            x5-video-player-type="h5"
            x5-video-player-fullscreen="false"
            key={videoSource}
            style={{
              opacity: !isTransitioning ? 1 : 0,
              transition: "opacity 0.3s ease-in-out"
            }}
            onClick={isIOS ? handleUserInteraction : undefined}
            onTouchStart={isIOS ? handleUserInteraction : undefined}
            onEnded={handleVideoEnded}
            onError={(e) => {
              console.error('Error en video:', e);
            }}
          >
            <source
              src={videoSource}
              type={videoSource.includes(".webm") ? "video/webm" : "video/mp4"}
            />
          </video>
        )}

        {videoSource && isVimeoVideo && (
          <div
            className="absolute inset-0 w-screen h-screen"
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
              title={heroVideo?.title || "Construction Video"}
              frameBorder="0"
              onLoad={() => {}}
              onError={() => {
                setIsVimeoVideo(false);
                setVideoSource(null);
              }}
            />
          </div>
        )}

        {/* iOS play button overlay */}
        {isIOS && !userInteracted && !isVimeoVideo && videoSource && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer z-30"
            onClick={handleUserInteraction}
          >
            <div className="w-20 h-20 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Logo y botón de email centrados */}
      <div className="fixed inset-0 z-40 pointer-events-none" style={{ paddingTop: '6vh' }}>
        <div className="mx-app h-full flex flex-col items-center justify-center gap-6 md:gap-8">
          <div className="w-[40.8vw] max-w-[340px] min-w-[204px] h-auto">
            <BristolLogo />
          </div>

          <button
            onClick={openEmail}
            className="bg-white/10 backdrop-blur-md hover:bg-white/20 px-6 py-3 transition-all duration-300 shadow-lg flex items-center pointer-events-auto cursor-pointer"
          >
            <Mail className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Botón de audio inferior derecha */}
      <div className="fixed bottom-4 inset-x-0 z-50 pointer-events-none">
        <div className="mx-app flex justify-end pointer-events-auto">
          <button
            onClick={toggleAudio}
            className="w-14 h-14 transition-all duration-200 bg-white/10 backdrop-blur-md hover:bg-white/20 shadow-lg flex items-center justify-center touch-manipulation cursor-pointer"
            aria-label={isMuted ? "Activar audio" : "Silenciar audio"}
          >
            {isMuted ? (
              <VolumeX className="w-6 h-6 text-white" />
            ) : (
              <Volume2 className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}
