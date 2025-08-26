"use client";

import Image from "next/image";
import LogoB from "@/components/LogoB";
import { useEffect, useState, useRef } from "react";
import type { VideoItem } from "@/lib/types";

interface DirectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  directorName: string;
  videos: VideoItem[];
  loading?: boolean;
  error?: string | null;
}

export default function DirectorModal({
  isOpen,
  onClose,
  directorName,
  videos,
  loading = false,
  error = null,
}: DirectorModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setIsAnimating(true);
      setTimeout(() => setShowContent(true), 200);
    } else {
      setIsClosing(true);
      setShowContent(false);
      setTimeout(() => {
        setIsAnimating(false);
        setIsClosing(false);
      }, 500);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setShowContent(false);
    // Wait for content fade to complete, then start modal animation
    setTimeout(() => {
      if (modalRef.current) {
        modalRef.current.style.transform = "scale(0.95) translateY(20px)";
        modalRef.current.style.opacity = "0";
      }
      // Wait for modal animation to complete before calling onClose
      setTimeout(() => {
        onClose();
      }, 500);
    }, 300);
  };

  const handleVideoSelect = (video: VideoItem) => {
    setSelectedVideo(video);
  };

  const handleBackToVideos = () => {
    setSelectedVideo(null);
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <div
      ref={modalRef}
      className={`fixed inset-0 z-50 bg-black transition-all duration-500 ease-in-out`}
      style={{
        transform: isClosing ? "scale(0.95) translateY(20px)" : "scale(1) translateY(0)",
        opacity: isClosing ? 0 : 1,
      }}
    >
      {/* Logo */}
      <div
        className={`absolute top-0 left-0 p-6 z-10 transition-all duration-300 ease-in-out ${
          showContent && !isClosing ? "opacity-100" : "opacity-0 translate-x-8 translate-y-8"
        }`}
      >
        <div className="w-10 md:w-24 h-auto text-white">
          <LogoB />
        </div>
      </div>

      {/* Botón back */}
      <div
        className={`absolute top-6 left-1/2 transform -translate-x-1/2 z-10 transition-all duration-500 ease-in-out ${
          showContent && !isClosing ? "opacity-100" : "opacity-0 translate-x-8 translate-y-8"
        }`}
      >
        <button onClick={handleClose} className="flex items-center space-x-2 text-white hover:opacity-80">
          <span className="font-raleway text-sm md:text-base font-light">DIRECTORS</span>
        </button>
      </div>

      {/* Contenido */}
      <div
        className={`flex flex-col items-start justify-center h-full px-6 transition-all duration-500 ease-in-out ${
          showContent && !isClosing ? "opacity-100" : "opacity-0 translate-x-12 translate-y-12"
        }`}
      >
        {!selectedVideo ? (
          // Layout original: lista de videos
          <>
            <h1 className="text-4xl md:text-7xl font-tusker font-bold text-white mb-8 md:mb-16 pl-6 md:pl-0">{directorName}</h1>

            {/* Espaciador para desktop */}
            <div className="hidden md:block h-16"></div>

            {/* Estados */}
            {loading && (
              <div className="grid grid-cols-3 gap-6 w-full">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="aspect-video w-full  bg-white/10 animate-pulse" />
                ))}
              </div>
            )}

            {!loading && error && (
              <p className="text-white/80 text-lg">Hubo un problema al cargar los videos.</p>
            )}

            {!loading && !error && videos.length === 0 && (
              <p className="text-white/80 text-lg">No hay videos disponibles.</p>
            )}

            {/* Grid de videos */}
            {!loading && !error && videos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 w-full px-6 md:px-0 max-w-sm md:max-w-none mx-auto md:mx-0">
                {videos.slice(0, 3).map((video) => (
                  <button
                    key={video.id}
                    onClick={() => handleVideoSelect(video)}
                    className="relative group block overflow-hidden cursor-pointer"
                  >
                    {video.thumb ? (
                      <Image
                        src={video.thumb}
                        alt={video.title}
                        width={800}
                        height={450}
                        className="w-full aspect-video object-cover"
                      />
                    ) : (
                      <div className="w-full aspect-video bg-gray-800 flex items-center justify-center">
                        <span className="text-white text-center px-3">No thumbnail</span>
                      </div>
                    )}
                    {/* Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-white text-center px-3">{video.title}</span>
                </div>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          // Layout del video seleccionado
          <>
            {/* Nombre del director arriba a la derecha, más pequeño */}
            <div className="absolute top-6 right-6 z-20">
              <h2 className="text-xl md:text-2xl font-tusker font-bold text-white text-right">
                {directorName}
              </h2>
            </div>

            {/* Video grande centrado */}
            <div className="w-full max-w-5xl mx-auto mt-20 animate-fadeIn">
              <div className="aspect-video w-full bg-black overflow-hidden">
                <iframe
                  src={selectedVideo.embedUrl}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  title={selectedVideo.title}
                />
              </div>
              
              {/* Espaciador para crear distancia */}
              <div className="h-4"></div>
              
              {/* Título del video debajo */}
              <h3 className="text-white text-xl md:text-2xl font-medium text-center animate-slideUp">
                {selectedVideo.title}
              </h3>
              
              {/* Botón para volver a la lista */}
              <div className="flex justify-center mt-8 animate-slideUp">
                <button
                  onClick={handleBackToVideos}
                  className="flex items-center space-x-2 text-white hover:opacity-80 transition-opacity px-4 py-2 border border-white/30 rounded-lg"
                >
                  <span className="font-raleway text-sm">← Volver a videos de {directorName}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Esquinas */}
      <div
        className={`absolute bottom-6 left-6 z-10 transition-all duration-500 ease-in-out ${
          showContent && !isClosing ? "opacity-100" : "opacity-0 translate-x-8 translate-y-8"
        }`}
      >
        <p className="font-ordinary text-white text-sm md:text-xl leading-3 md:leading-4">
          LATIN
          <br />
          CREATIVE
          <br />
          PRODUCTION
        </p>
      </div>

      <div
        className={`absolute bottom-6 right-6 z-10 transition-all duration-500 ease-in-out ${
          showContent && !isClosing ? "opacity-100" : "opacity-0 translate-x-8 translate-y-8"
        }`}
      >
        <button onClick={handleClose} className="flex flex-col items-end space-y-2 text-white hover:opacity-80 cursor-pointer">
          <Image src="/images/icons/arrow.png" alt="Arrow Up" width={32} height={32} className="w-8 h-8" />
          <span className="font-ordinary text-sm md:text-xl">BRISTOL</span>
        </button>
      </div>
    </div>
  );
}
