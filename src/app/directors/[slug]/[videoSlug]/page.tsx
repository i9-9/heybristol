import { notFound } from 'next/navigation';
import { getDirectorBySlug, getDirectorSlugs, getVideosAsVideoItems } from '@/lib/directors-api';
import { generateVideoSlug } from '@/lib/types';
import VideoPlayerPage from './VideoPlayerPage';

// ISR - Incremental Static Regeneration
// Pages are statically generated but can be regenerated on-demand via webhooks
// or automatically after 1 hour if stale
export const revalidate = 3600; // 1 hour

interface VideoPageProps {
  params: Promise<{
    slug: string;
    videoSlug: string;
  }>;
}

export async function generateStaticParams() {
  const directorSlugs = await getDirectorSlugs();
  const params: Array<{ slug: string; videoSlug: string }> = [];

  for (const slug of directorSlugs) {
    try {
      const director = await getDirectorBySlug(slug);
      if (director && director.videos) {
        for (const video of director.videos) {
          const videoSlug = generateVideoSlug(video.title);
          params.push({ slug, videoSlug });
        }
      }
    } catch (error) {
      console.error(`Error generating params for director ${slug}:`, error);
    }
  }

  return params;
}

export default async function VideoPage({ params }: VideoPageProps) {
  const resolvedParams = await params;
  const { slug, videoSlug } = resolvedParams;

  try {
    const director = await getDirectorBySlug(slug);
    
    if (!director) {
      notFound();
    }

    const videos = await getVideosAsVideoItems(director.name);
    
    if (!videos || videos.length === 0) {
      notFound();
    }

    const video = videos.find(v => 
      generateVideoSlug(v.title) === videoSlug
    );

    if (!video) {
      notFound();
    }

    return (
      <VideoPlayerPage 
        director={director} 
        videos={videos}
        selectedVideo={video}
      />
    );
  } catch (error) {
    console.error('Error loading video page:', error);
    notFound();
  }
}

