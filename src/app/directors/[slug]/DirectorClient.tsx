"use client";

import Image from "next/image";
import LogoB from "@/components/LogoB";
import { useState, useEffect } from "react";
import type { VideoItem } from "@/lib/types";
import { useRouter } from "next/navigation";
import VideoCardWithHover from "@/components/VideoCardWithHover";

interface DirectorClientProps {
  director: { name: string; slug: string };
  videos: VideoItem[];
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}

const SPAN_CLASSES: Record<number, string> = {
  12: 'col-span-12',
  11: 'col-span-11',
  10: 'col-span-10',
  9: 'col-span-9',
  8: 'col-span-8',
  7: 'col-span-7',
  6: 'col-span-6',
  5: 'col-span-5',
  4: 'col-span-4',
};

const START_CLASSES: Record<number, string> = {
  1: 'col-start-1',
  2: 'col-start-2',
  3: 'col-start-3',
  4: 'col-start-4',
  5: 'col-start-5',
};

function seededRandom(seed: string, index: number): number {
  let hash = 0;
  const str = seed + index.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function generateDirectorPattern(directorSlug: string) {
  const patterns = [];

  for (let i = 0; i < 12; i++) {
    const rand = seededRandom(directorSlug, i);
    const isFull = rand % 3 === 0;

    if (isFull) {
      const span = 8 + (rand % 4);
      const start = 1 + (rand % 5);
      patterns.push({
        name: `full-${i}`,
        videos: 1,
        spans: [span],
        starts: [start],
      });
    } else {
      const sizeVariant = rand % 4;
      let firstSpan: number;
      let secondSpan: number;

      switch (sizeVariant) {
        case 0:
          firstSpan = 7;
          secondSpan = 5;
          break;
        case 1:
          firstSpan = 5;
          secondSpan = 7;
          break;
        case 2:
          firstSpan = 6;
          secondSpan = 6;
          break;
        case 3:
          firstSpan = 8;
          secondSpan = 4;
          break;
        default:
          firstSpan = 6;
          secondSpan = 5;
      }

      const start = 1 + (rand % 5);
      const secondStart = start + firstSpan;

      patterns.push({
        name: `half-${i}`,
        videos: 2,
        spans: [firstSpan, secondSpan],
        starts: [start, secondStart],
      });
    }
  }

  return patterns;
}

function groupVideosByLayouts(videos: VideoItem[], patterns: Array<{
  name: string;
  videos: number;
  spans: number[];
  starts: number[];
}>) {
  const groups: {
    layout: {
      name: string;
      videos: number;
      spans: number[];
      starts: number[];
    };
    videos: VideoItem[];
  }[] = [];
  let currentIndex = 0;
  let patternIndex = 0;

  while (currentIndex < videos.length) {
    const pattern = patterns[patternIndex % patterns.length];
    const videosInGroup = videos.slice(currentIndex, currentIndex + pattern.videos);

    if (videosInGroup.length > 0) {
      groups.push({
        layout: pattern,
        videos: videosInGroup,
      });
    }

    currentIndex += pattern.videos;
    patternIndex++;
  }

  return groups;
}

export default function DirectorClient({ director, videos }: DirectorClientProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const directorPattern = generateDirectorPattern(director.slug);
  const videoGroups = groupVideosByLayouts(videos, directorPattern);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="absolute top-0 left-0 p-6 z-10">
        <button
          onClick={() => {
            router.push('/');
            setTimeout(() => {
              const scrollToHero = () => {
                const heroSection = document.querySelector('section');
                if (heroSection) {
                  heroSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest',
                  });
                } else {
                  setTimeout(scrollToHero, 200);
                }
              };
              scrollToHero();
            }, 300);
          }}
          className="w-10 md:w-24 h-auto text-white hover:opacity-80 transition-opacity cursor-pointer"
        >
          <LogoB />
        </button>
      </div>

      <div className="absolute bottom-6 left-6 z-50">
        <button
          onClick={() => {
            router.push('/');
            setTimeout(() => {
              const scrollToDirectors = () => {
                const directorsSection = document.getElementById('directors');
                if (directorsSection) {
                  directorsSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest',
                  });
                } else {
                  setTimeout(scrollToDirectors, 200);
                }
              };
              scrollToDirectors();
            }, 300);
          }}
          className="flex flex-col items-start space-y-2 text-white cursor-pointer"
        >
          <Image
            src="/images/icons/arrow.png"
            alt="Arrow Left"
            width={32}
            height={32}
            className="w-8 h-8 rotate-180 hover:opacity-80 transition-opacity"
          />
          <span className="font-ordinary text-sm md:text-xl uppercase leading-tight text-left whitespace-nowrap">
            BACK TO DIRECTORS
          </span>
        </button>
      </div>

      <div className="flex flex-col items-start justify-start h-full px-6 pt-[150px] md:pt-[150px] overflow-y-auto">
        <h1 className="uppercase text-4xl md:text-7xl font-hagrid tracking-tight font-bold text-white mb-8 md:mb-16 pl-6 md:pl-0 pb-10!">
          {director.name}
        </h1>

        <div className="hidden md:block h-16" />

        {videos.length > 0 && (
          <div className="w-full px-6 md:px-0 max-w-sm md:max-w-7xl mx-auto pb-8">
            <div className="flex flex-col gap-2 md:gap-[0.694vw]">
              {videoGroups.map((group, groupIndex) => (
                <div
                  key={groupIndex}
                  className={`grid ${
                    isMobile ? 'grid-cols-1' : 'grid-cols-12'
                  } gap-2 md:gap-[0.694vw]`}
                >
                  {group.videos.map((video, videoIndex) => {
                    const spanClass = isMobile
                      ? 'col-span-1'
                      : SPAN_CLASSES[group.layout.spans[videoIndex]];

                    const startClass = isMobile
                      ? ''
                      : START_CLASSES[group.layout.starts[videoIndex]];

                    return (
                      <VideoCardWithHover
                        key={video.id}
                        video={video}
                        directorSlug={director.slug}
                        loadIndex={groupIndex * 2 + videoIndex}
                        className={`${spanClass} ${startClass}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {videos.length === 0 && (
          <p className="text-white/80 text-lg">No hay videos disponibles.</p>
        )}
      </div>

      <div className="absolute bottom-6 right-6 z-10">
        <button
          onClick={() => {
            router.push('/');
            setTimeout(() => {
              const scrollToHero = () => {
                const heroSection = document.querySelector('section');
                if (heroSection) {
                  heroSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest',
                  });
                } else {
                  setTimeout(scrollToHero, 200);
                }
              };
              scrollToHero();
            }, 300);
          }}
          className="flex flex-col items-end space-y-2 text-white hover:opacity-80 cursor-pointer"
        >
          <Image src="/images/icons/arrow.png" alt="Arrow Up" width={32} height={32} className="w-8 h-8" />
          <span className="font-ordinary text-sm md:text-xl uppercase leading-tight text-right whitespace-nowrap">
            BRISTOL
          </span>
        </button>
      </div>
    </div>
  );
}
