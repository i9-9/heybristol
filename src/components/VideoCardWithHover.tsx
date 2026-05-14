"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { VideoItem } from "@/lib/types";
import { formatVideoDisplayTitle, generateVideoSlug } from "@/lib/types";

interface VideoCardWithHoverProps {
  video: VideoItem;
  directorSlug: string;
  loadIndex?: number;
  className?: string;
}

const PREVIEW_READY_EVENTS = new Set(['ready', 'play', 'playing', 'loaded']);

function getPreviewUrl(video: VideoItem): string | null {
  if (!video.thumbnailId) return null;

  const params = new URLSearchParams({
    api: '1',
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
}

export default function VideoCardWithHover({
  video,
  directorSlug,
  loadIndex = 0,
  className = "",
}: VideoCardWithHoverProps) {
  const [shouldLoadPreview, setShouldLoadPreview] = useState(loadIndex < 6);
  const [previewActive, setPreviewActive] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const readyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const videoSlug = generateVideoSlug(video.title);
  const videoUrl = `/directors/${directorSlug}/${videoSlug}`;
  const previewUrl = getPreviewUrl(video);

  const mainThumbnailUrl = video.thumb
    || (video.thumbnailId ? `https://vumbnail.com/${video.thumbnailId}.jpg` : '')
    || (!video.hash && video.id ? `https://vumbnail.com/${video.id}.jpg` : '');

  useEffect(() => {
    if (!previewUrl || shouldLoadPreview || !cardRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const delayMs = Math.min(Math.max(loadIndex - 6, 0) * 60, 360);
          loadTimeoutRef.current = setTimeout(() => {
            setShouldLoadPreview(true);
          }, delayMs);
          observer.disconnect();
        }
      },
      { rootMargin: '300px', threshold: 0.01 }
    );

    observer.observe(cardRef.current);
    return () => {
      observer.disconnect();
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    };
  }, [previewUrl, shouldLoadPreview, loadIndex]);

  useEffect(() => {
    if (!previewUrl || !shouldLoadPreview) return;

    setIsLoadingPreview(true);

    const markPreviewActive = () => {
      setPreviewActive(true);
      setIsLoadingPreview(false);
    };

    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes('vimeo.com')) return;

      try {
        const data = JSON.parse(event.data as string);
        if (PREVIEW_READY_EVENTS.has(data.event)) {
          markPreviewActive();
        }
      } catch {
        // Ignorar errores de parsing
      }
    };

    window.addEventListener('message', handleMessage);

    readyTimeoutRef.current = setTimeout(markPreviewActive, 3500);

    return () => {
      window.removeEventListener('message', handleMessage);
      if (readyTimeoutRef.current) clearTimeout(readyTimeoutRef.current);
    };
  }, [previewUrl, shouldLoadPreview]);

  const handleIframeLoad = () => {
    setPreviewActive(true);
    setIsLoadingPreview(false);
    if (readyTimeoutRef.current) {
      clearTimeout(readyTimeoutRef.current);
      readyTimeoutRef.current = null;
    }
  };

  return (
    <Link
      ref={cardRef}
      href={videoUrl}
      className={`relative w-full h-80 md:aspect-video md:h-auto bg-black overflow-hidden cursor-pointer group block ${className}`}
    >
      {mainThumbnailUrl && (
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            previewUrl && previewActive ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <Image
            src={mainThumbnailUrl}
            alt={video.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={loadIndex < 6}
          />
          {isLoadingPreview && (
            <div className="absolute top-4 right-4 pointer-events-none">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}

      {previewUrl && shouldLoadPreview && (
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            previewActive ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <iframe
            src={previewUrl}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            title={`${video.title} preview`}
            onLoad={handleIframeLoad}
            style={{
              backgroundColor: '#000000',
              border: 'none',
              outline: 'none',
              pointerEvents: 'none',
            }}
          />
        </div>
      )}

      {!mainThumbnailUrl && isLoadingPreview && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
        <span className="text-white text-center px-3 font-medium uppercase text-sm md:text-base">
          {formatVideoDisplayTitle(video)}
        </span>
      </div>
    </Link>
  );
}
