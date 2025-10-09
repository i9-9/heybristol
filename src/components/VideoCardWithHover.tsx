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
  const [showPreview, setShowPreview] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const videoSlug = generateVideoSlug(video.title);
  const videoUrl = `/directors/${directorSlug}/${videoSlug}`;
  
  // Thumbnail estático del video principal
  const mainThumbnailUrl = video.id ? `https://vumbnail.com/${video.id}.jpg` : '';
  
  // URL del iframe para el preview/loop (thumbnailId)
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
      quality: '360p', // Calidad más baja para carga más rápida
      speed: '1', // Velocidad normal
    });
    
    return `https://player.vimeo.com/video/${video.thumbnailId}?${params.toString()}`;
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    // Solo mostrar preview si hay thumbnailId
    if (video.thumbnailId) {
      // Delay reducido para respuesta más rápida
      hoverTimeoutRef.current = setTimeout(() => {
        setShowPreview(true);
      }, 150);
    }
  };

  const handleMouseLeave = () => {
    setShowPreview(false);
    setIframeLoaded(false);
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const previewUrl = getPreviewUrl();

  return (
    <Link
      href={videoUrl}
      className={`relative w-full h-80 md:aspect-video md:h-auto bg-black overflow-hidden cursor-pointer group block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail estático (siempre visible cuando no hay hover o no hay preview) */}
      {mainThumbnailUrl && (
        <div 
          className={`absolute inset-0 transition-opacity duration-300 ${
            showPreview && iframeLoaded ? 'opacity-0' : 'opacity-100'
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

      {/* Preview video (thumbnailId) - solo se carga en hover */}
      {showPreview && previewUrl && (
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
            onLoad={() => setIframeLoaded(true)}
            style={{
              backgroundColor: '#000000',
              border: 'none',
              outline: 'none',
              pointerEvents: 'none', // Evita interacción con el iframe
            }}
          />
        </div>
      )}

      {/* Overlay con título - siempre visible en mobile, en desktop solo en hover */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 md:bg-black/60 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
        <span className="text-white text-center px-3 font-medium uppercase text-sm md:text-base">
          {video.tags && video.tags.length > 1 ? `${video.tags[0]} | ${video.tags[1]}` : video.title}
        </span>
      </div>
    </Link>
  );
}

