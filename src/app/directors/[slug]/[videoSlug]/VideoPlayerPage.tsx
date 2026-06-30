"use client";

import Image from "next/image";
import LogoB from "@/components/LogoB";
import { useCallback, useState } from "react";
import type { VideoItem } from "@/lib/types";
import { useRouter } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import VideoViewShell from "@/components/VideoViewShell";
import { generateVideoSlug } from "@/lib/types";
import { preloadVimeoPlayer } from "@/lib/vimeo-preload";

void preloadVimeoPlayer();

interface VideoPlayerPageProps {
  director: { name: string; slug: string };
  videos: VideoItem[];
  selectedVideo: VideoItem;
}

function scrollToHero() {
  const heroSection = document.querySelector('section');
  if (heroSection) {
    heroSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    });
  } else {
    setTimeout(scrollToHero, 200);
  }
}

export default function VideoPlayerPage({
  director,
  videos,
  selectedVideo
}: VideoPlayerPageProps) {
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleBackToDirector = useCallback(() => {
    router.push(`/directors/${director.slug}`);
  }, [router, director.slug]);

  const handlePreviousVideo = useCallback(() => {
    const currentIndex = videos.findIndex(v => v.id === selectedVideo.id);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : videos.length - 1;
    const previousVideo = videos[previousIndex];
    router.push(`/directors/${director.slug}/${generateVideoSlug(previousVideo.title)}`);
  }, [selectedVideo.id, videos, director.slug, router]);

  const handleNextVideo = useCallback(() => {
    const currentIndex = videos.findIndex(v => v.id === selectedVideo.id);
    const nextIndex = currentIndex < videos.length - 1 ? currentIndex + 1 : 0;
    const nextVideo = videos[nextIndex];
    router.push(`/directors/${director.slug}/${generateVideoSlug(nextVideo.title)}`);
  }, [selectedVideo.id, videos, director.slug, router]);

  const handleGoHome = useCallback(() => {
    router.push('/');
    setTimeout(scrollToHero, 300);
  }, [router]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="absolute top-0 left-0 p-6 z-10">
        <button
          type="button"
          onClick={handleGoHome}
          className="w-10 md:w-24 h-auto text-white hover:opacity-80 transition-opacity cursor-pointer"
        >
          <LogoB />
        </button>
      </div>

      <div className="flex flex-col items-center justify-center h-full px-6">
        <VideoViewShell
          director={director}
          selectedVideo={selectedVideo}
          onPreviousVideo={handlePreviousVideo}
          onNextVideo={handleNextVideo}
          onBack={handleBackToDirector}
          onFullscreenChange={setIsFullscreen}
        >
          {({ isFullscreen, toggleFullscreen }) => (
            <VideoPlayer
              video={selectedVideo}
              className="w-full h-full"
              onFullscreenToggle={toggleFullscreen}
              isFullscreen={isFullscreen}
              quality="auto"
            />
          )}
        </VideoViewShell>
      </div>

      {!isFullscreen && (
        <div className="absolute bottom-6 right-6 z-10">
        <button
          type="button"
          onClick={handleGoHome}
          className="flex flex-col items-end space-y-2 text-white hover:opacity-80 cursor-pointer"
        >
          <Image src="/images/icons/arrow.png" alt="Arrow Up" width={32} height={32} className="w-8 h-8" />
          <span className="font-ordinary text-sm md:text-xl uppercase leading-tight text-right whitespace-nowrap">
            BRISTOL
          </span>
        </button>
        </div>
      )}
    </div>
  );
}
