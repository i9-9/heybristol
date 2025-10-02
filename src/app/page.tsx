"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Mail } from "lucide-react";
import BristolLogo from "@/components/BristolLogo";

export default function Home() {
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  
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

  const handleUserInteraction = () => {
    setUserInteracted(true);
    // Try to play the video after user interaction
    if (videoRef.current && videoRef.current.paused) {
      videoRef.current.play().catch(console.error);
    }
  };

  useEffect(() => {
    // Detectar iOS devices
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Detectar el mejor formato para el navegador
    const bestFormat = detectVideoSupport();
    setVideoSource(bestFormat);

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
            webkit-playsinline="true"
            x5-playsinline="true"
            x5-video-player-type="h5"
            x5-video-player-fullscreen="false"
            style={{
              opacity: isVideoLoaded ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out',
            }}
            onLoadedData={() => setIsVideoLoaded(true)}
            onCanPlay={() => setIsVideoLoaded(true)}
            onClick={isIOS ? handleUserInteraction : undefined}
            onTouchStart={isIOS ? handleUserInteraction : undefined}
            onError={() => {
              console.log('Error cargando video, intentando fallback...');
              // Si falla WebM, intentar MP4
              if (videoSource.includes('.webm')) {
                setVideoSource('/videos/under_construction_optimized.mp4');
              }
              setIsVideoLoaded(true);
            }}
          >
            <source src={videoSource} type={videoSource.includes('.webm') ? 'video/webm' : 'video/mp4'} />
            Tu navegador no soporta el elemento de video.
          </video>
        )}
        
        {/* iOS-specific play button overlay when video is paused */}
        {isIOS && !userInteracted && isVideoLoaded && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer z-30"
            onClick={handleUserInteraction}
          >
            <div className="w-20 h-20 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
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