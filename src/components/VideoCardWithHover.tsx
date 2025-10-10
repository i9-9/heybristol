"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { VideoItem } from "@/lib/types";
import { generateVideoSlug } from "@/lib/types";

interface VideoCardWithHoverProps {
  video: VideoItem;
  directorSlug: string;
  loadIndex?: number;
  className?: string;
}

export default function VideoCardWithHover({ 
  video, 
  directorSlug, 
  loadIndex = 0, 
  className = "" 
}: VideoCardWithHoverProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const videoSlug = generateVideoSlug(video.title);
  const videoUrl = `/directors/${directorSlug}/${videoSlug}`;
  
  // Thumbnail estático del video principal (fallback si no hay thumbnailId)
  const mainThumbnailUrl = video.id ? `https://vumbnail.com/${video.id}.jpg` : '';
  
  // URL del iframe para el preview/loop (thumbnailId) - SIEMPRE activo
  const getPreviewUrl = () => {
    if (!video.thumbnailId) return null;
    
    const params = new URLSearchParams({
      title: '0',
      byline: '0',
      portrait: '0',
      background: '1',
      autoplay: '1',
      loop: '1',
      muted: '1',
      dnt: '1',
      controls: '0',
      keyboard: '0',
      pip: '0',
      playsinline: '1',
      color: '000000',
      quality: '360p',
      speed: '1',
    });
    
    return `https://player.vimeo.com/video/${video.thumbnailId}?${params.toString()}`;
  };

  const previewUrl = getPreviewUrl();

  // Escuchar mensaje del player de Vimeo para saber cuando está listo
  useEffect(() => {
    if (!previewUrl) return;

    const handleMessage = (event: MessageEvent) => {
      // Verificar que el mensaje viene de Vimeo
      if (!event.origin.includes('vimeo.com')) return;
      
      try {
        const data = JSON.parse(event.data);
        
        // Cuando el player está listo o empieza a reproducir
        if (data.event === 'ready' || data.event === 'play' || data.event === 'playing') {
          setIframeLoaded(true);
        }
      } catch (e) {
        // Ignorar errores de parsing
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Timeout de seguridad: ocultar spinner después de 3 segundos de todos modos
    const timeout = setTimeout(() => {
      setIframeLoaded(true);
    }, 3000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeout);
    };
  }, [previewUrl]);

  return (
    <Link
      href={videoUrl}
      className={`relative w-full h-80 md:aspect-video md:h-auto bg-black overflow-hidden cursor-pointer group block ${className}`}
    >
      {/* Thumbnail estático (fallback - solo visible mientras carga el iframe o si no hay thumbnailId) */}
      {mainThumbnailUrl && (
        <div 
          className={`absolute inset-0 transition-opacity duration-300 ${
            previewUrl && iframeLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <Image
            src={mainThumbnailUrl}
            alt={video.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={loadIndex < 3}
          />
        </div>
      )}

      {/* Preview video (thumbnailId) - SIEMPRE cargado y reproduciéndose */}
      {previewUrl && (
        <div 
          className={`absolute inset-0 transition-opacity duration-300 ${
            iframeLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <iframe
            ref={iframeRef}
            src={previewUrl}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            title={`${video.title} preview`}
            frameBorder="0"
            loading="eager"
            style={{
              backgroundColor: '#000000',
              border: 'none',
              outline: 'none',
              pointerEvents: 'none',
            }}
          />
        </div>
      )}

      {/* Loading spinner - visible mientras carga el video (arriba a la derecha) */}
      {!iframeLoaded && previewUrl && (
        <div className="absolute top-4 right-4 z-10 pointer-events-none">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Overlay con cliente y título - solo visible en hover */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
        <span className="text-white text-center px-3 font-medium uppercase text-sm md:text-base">
          {video.tags && video.tags.length > 1 ? `${video.tags[0]} | ${video.tags[1]}` : video.title}
        </span>
      </div>
    </Link>
  );
}

