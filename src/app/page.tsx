"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Mail } from "lucide-react";
import BristolLogo from "@/components/BristolLogo";


export default async function Home() {
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoSource, setVideoSource] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Detectar soporte de formatos de video
  const detectVideoSupport = () => {
    const video = document.createElement('video');
    
    // Verificar soporte de WebM
    if (video.canPlayType('video/webm; codecs="vp9"').replace(/no/, '')) {
      return '/videos/under_construction.webm';
    }
    
    // Verificar soporte de MP4
    if (video.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/no/, '')) {
      return '/videos/under_construction_optimized.mp4';
    }
    
    // Fallback a MP4
    return '/videos/under_construction_optimized.mp4';
  };

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
    // Usar MP4 directamente para evitar problemas de compatibilidad
    setVideoSource('/videos/under_construction_optimized.mp4');

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
        {videoSource && (
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
          >
            <source src={videoSource} type="video/mp4" />
            Tu navegador no soporta el elemento de video.
          </video>
        )}
      </div>
      
      {/* Logo y botón de email centrados (con márgenes de layout) */}
      <div className="fixed inset-0 z-40 pointer-events-none" style={{ paddingTop: '6vh' }}>
        <div className="mx-app h-full flex flex-col items-center justify-center gap-6 md:gap-8">
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
      </div>
      
      {/* Botón de audio inferior derecha (respeta márgenes de layout) */}
      <div className="fixed bottom-4 inset-x-0 z-50 pointer-events-none" style={{ zIndex: 9999 }}>
        <div className="mx-app flex justify-end pointer-events-auto">
          <button
            onClick={toggleAudio}
            className="w-14 h-14 rounded-lg transition-all duration-200 bg-white/10 backdrop-blur-md hover:bg-white/20 shadow-lg flex items-center justify-center touch-manipulation cursor-pointer"
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