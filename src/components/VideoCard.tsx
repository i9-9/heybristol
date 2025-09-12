"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import type { VideoItem } from "@/lib/types";
import { generateVideoSlug } from "@/lib/types";

interface VideoCardProps {
  video: VideoItem;
  directorSlug: string;
}

export default function VideoCard({ video, directorSlug }: VideoCardProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  // URL del thumbnail de Vimeo
  const getThumbnailUrl = (id: string) => {
    return `https://i.vimeocdn.com/video/${id}_640.jpg`;
  };

  const videoSlug = generateVideoSlug(video.title);
  const videoUrl = `/directors/${directorSlug}/${videoSlug}`;

  return (
    <Link
      href={videoUrl}
      ref={ref}
      className="relative w-full h-80 md:aspect-video md:h-auto bg-black overflow-hidden cursor-pointer group block"
    >
      {/* Thumbnail visible hasta que el iframe cargue */}
      <Image
        src={getThumbnailUrl(video.thumbnailId || video.id)}
        alt={video.title}
        fill
        className={`object-cover transition-opacity duration-500 ${
          isVideoLoaded ? "opacity-0" : "opacity-100"
        }`}
        style={{ zIndex: 2 }}
      />

      {/* Iframe de Vimeo */}
      {inView && (
        <iframe
          src={`https://player.vimeo.com/video/${video.id}?autoplay=1&muted=1&background=1&loop=1&title=0&byline=0&portrait=0&dnt=1&color=ffffff`}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={video.title}
          onLoad={() => setIsVideoLoaded(true)}
        />
      )}

      {/* Overlay con título */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 md:bg-black/60 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-white text-center px-3 font-medium uppercase text-sm md:text-base">
          {video.tags?.[0] || 'CLIENTE'} | {video.title}
        </span>
      </div>
    </Link>
  );
}
