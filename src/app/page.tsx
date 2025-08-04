"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Mail } from "lucide-react";
import BristolLogo from "@/components/BristolLogo";

export default function Home() {
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleAudio = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      } else {
        videoRef.current.muted = true;
        setIsMuted(true);
      }
    }
  };

  const openEmail = () => {
    window.location.href = 'mailto:hey@heybristol.com';
  };

  useEffect(() => {
    // Timer de seguridad - ocultar loading después de 3 segundos máximo
    setTimeout(() => {
      setIsVideoLoaded(true);
    }, 3000);

    // Precargar el video inmediatamente
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.preload = 'auto';
      // Intentar cargar el video inmediatamente
      videoElement.load();
    }
  }, []);

  return (
    <>
      {/* Video en pantalla completa */}
      <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black">
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
            transition: 'opacity 0.8s ease-in-out',
          }}
          onLoadedData={() => setIsVideoLoaded(true)}
          onCanPlay={() => setIsVideoLoaded(true)}
          onError={() => setIsVideoLoaded(true)}
        >
          {/* WebM para navegadores modernos (mejor compresión) */}
          <source src="/videos/under_construction.webm" type="video/webm" />
          {/* MP4 optimizado para compatibilidad general */}
          <source src="/videos/under_construction_optimized.mp4" type="video/mp4" />
          {/* MP4 móvil para conexiones lentas */}
          <source src="/videos/under_construction_mobile.mp4" type="video/mp4" media="(max-width: 768px)" />
          Tu navegador no soporta el elemento de video.
        </video>
      </div>
      
      {/* Logo y botón de email centrados */}
      <div className="fixed inset-0 flex flex-col items-center justify-center z-40 pointer-events-none gap-6 md:gap-8" style={{ paddingTop: '6vh' }}>
        <div className="w-[40.8vw] max-w-[340px] min-w-[204px] h-auto">
          <BristolLogo />
        </div>
        
        {/* Botón del email */}
        <button
          onClick={openEmail}
          className="bg-white/10 backdrop-blur-md hover:bg-white/20 px-6 py-3 rounded-lg transition-all duration-300 shadow-lg flex items-center pointer-events-auto cursor-pointer"
        >
          <Mail className="w-5 h-5 text-white" />
        </button>
      </div>
      
      {/* Botón de audio en la esquina inferior derecha */}
      <button
        onClick={toggleAudio}
        className="fixed bottom-4 right-8 md:bottom-6 md:right-8 w-14 h-14 rounded-lg transition-all duration-200 bg-white/10 backdrop-blur-md hover:bg-white/20 shadow-lg flex items-center justify-center z-50 touch-manipulation cursor-pointer"
        style={{ zIndex: 9999 }}
        aria-label={isMuted ? "Activar audio" : "Silenciar audio"}
      >
        {isMuted ? (
          <VolumeX className="w-6 h-6 text-white" />
        ) : (
          <Volume2 className="w-6 h-6 text-white" />
        )}
      </button>
    </>
  );
}