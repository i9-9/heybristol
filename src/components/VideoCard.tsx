"use client";

import Link from "next/link";
import type { VideoItem } from "@/lib/types";
import { formatVideoDisplayTitle, generateVideoSlug } from "@/lib/types";
import VideoPlayer from "./VideoPlayer";

interface VideoCardProps {
  video: VideoItem;
  directorSlug: string;
  loadIndex?: number;
  className?: string;
}

export default function VideoCard({ video, directorSlug, loadIndex = 0, className = "" }: VideoCardProps) {
  const videoSlug = generateVideoSlug(video.title);
  const videoUrl = `/directors/${directorSlug}/${videoSlug}`;

  return (
    <Link
      href={videoUrl}
      className={`relative w-full h-80 md:aspect-video md:h-auto bg-black overflow-hidden cursor-pointer group block ${className}`}
    >
      <VideoPlayer
        video={video}
        className="w-full h-full"
        autoPlay={false}
        loop={true}
        muted={true}
        loadIndex={loadIndex}
        variant="minimal"
        allowVideoClick={false}
      />

      {/* Overlay con título */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 md:bg-black/60 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 z-10">
        <span className="text-white text-center px-3 font-medium uppercase text-sm md:text-base">
          {formatVideoDisplayTitle(video)}
        </span>
      </div>
    </Link>
  );
}
