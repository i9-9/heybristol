"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import LogoMain from "@/components/LogoMain";

export default function Hero() {
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const toggleAudio = () => {
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
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  useEffect(() => {
    const bestFormat = detectVideoSupport();
    setVideoSource(bestFormat);

    const timer = setTimeout(() => setIsVideoLoaded(true), 3000);

    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.preload = "auto";
      videoElement.load();
    }
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative z-10 h-screen">
      {/* Video de fondo dentro del hero */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-black pointer-events-none z-0">
        {videoSource && (
          <video
            ref={videoRef}
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-auto h-full min-w-full min-h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            style={{ opacity: isVideoLoaded ? 1 : 0, transition: "opacity 0.8s ease-in-out" }}
            onLoadedData={() => setIsVideoLoaded(true)}
            onCanPlay={() => setIsVideoLoaded(true)}
            onError={() => {
              if (videoSource?.includes(".webm")) {
                setVideoSource("/videos/under_construction_optimized.mp4");
              }
              setIsVideoLoaded(true);
            }}
          >
            <source src={videoSource} type={videoSource.includes(".webm") ? "video/webm" : "video/mp4"} />
            Tu navegador no soporta el elemento de video.
          </video>
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
        <div className="w-full px-[20px] md:px-[50px] mt-[clamp(12rem,34vh,22rem)] flex justify-center gap-x-[clamp(6rem,42vw,9.25rem)] lg:gap-x-[clamp(24rem,24vw,24rem)] xl:gap-x-[clamp(16rem,22vw,28rem)] font-hagrid-text font-medium text-white text-[clamp(1rem,2.2vw,1.875rem)]">
          <button onClick={() => scrollToSection('directors')} className="cursor-pointer hover:opacity-80 transition-opacity">DIRECTORS</button>
          <button onClick={() => scrollToSection('contact')} className="cursor-pointer hover:opacity-80 transition-opacity">CONTACT</button>
        </div>
      </div>

      {/* Botón de audio dentro del hero (abajo derecha) */}
      <div className="absolute bottom-4 right-4 md:bottom-6 md:right-8 z-10">
        <button
          onClick={toggleAudio}
          className="w-12 h-12 md:w-14 md:h-14 rounded-lg transition-all duration-200 bg-white/10 backdrop-blur-md hover:bg-white/20 shadow-lg flex items-center justify-center"
          aria-label={isMuted ? "Activar audio" : "Silenciar audio"}
        >
          {isMuted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
        </button>
      </div>

      {/* Año (arriba derecha) */}
      <div className="absolute top-4 right-4 md:top-6 md:right-8 z-10 pointer-events-none">
        <p className="font-ordinary text-white text-sm md:text-xl">2025©</p>
      </div>

      {/* Lema (abajo izquierda) */}
      <div className="absolute bottom-4 left-4 md:bottom-6 md:left-8 z-10 pointer-events-none">
        <p className="font-ordinary text-white text-sm md:text-xl leading-5 text-left">LATIN<br/>CREATIVE<br/>PRODUCTION</p>
      </div>
    </section>
  );
}


