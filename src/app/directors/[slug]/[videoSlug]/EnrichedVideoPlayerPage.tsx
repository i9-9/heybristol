import { enrichVideoForPlayback } from '@/lib/directors-api';
import type { VideoItem } from '@/lib/types';
import VideoPlayerPage from './VideoPlayerPage';

interface EnrichedVideoPlayerPageProps {
  director: { name: string; slug: string };
  videos: VideoItem[];
  video: VideoItem;
}

export default async function EnrichedVideoPlayerPage({
  director,
  videos,
  video,
}: EnrichedVideoPlayerPageProps) {
  const selectedVideo = await enrichVideoForPlayback(video);

  return (
    <VideoPlayerPage
      director={director}
      videos={videos}
      selectedVideo={selectedVideo}
    />
  );
}
