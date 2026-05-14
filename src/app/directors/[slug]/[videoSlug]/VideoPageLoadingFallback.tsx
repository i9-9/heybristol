import Image from 'next/image';
import LogoB from '@/components/LogoB';
import type { VideoItem } from '@/lib/types';
import { formatVideoDisplayTitle } from '@/lib/types';

interface VideoPageLoadingFallbackProps {
  director: { name: string; slug: string };
  video: VideoItem;
}

export default function VideoPageLoadingFallback({
  director,
  video,
}: VideoPageLoadingFallbackProps) {
  const posterUrl = video.thumb || (video.id ? `https://vumbnail.com/${video.id}.jpg` : null);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="absolute top-0 left-0 p-6 z-10">
        <div className="w-10 md:w-24 h-auto text-white opacity-80">
          <LogoB />
        </div>
      </div>

      <div className="flex flex-col items-center justify-start h-full px-6 pt-[140px] md:pt-[120px]">
        <div className="w-full max-w-6xl">
          <p className="text-white/70 text-sm uppercase tracking-wide mb-2">{director.name}</p>
          <h1 className="text-white text-xl md:text-2xl font-ordinary uppercase mb-6">
            {formatVideoDisplayTitle(video)}
          </h1>

          <div className="relative w-full aspect-video bg-black overflow-hidden rounded-sm">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={video.title}
                fill
                className="object-cover opacity-80"
                sizes="(max-width: 768px) 100vw, 80vw"
                priority
              />
            ) : null}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2" />
                <div className="text-sm opacity-75">Loading video…</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
