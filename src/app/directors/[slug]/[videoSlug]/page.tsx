import { notFound } from 'next/navigation';
import { getDirectorBySlug, getDirectorSlugs, getVideosAsVideoItems } from '@/lib/directors-api';
import { generateVideoSlug } from '@/lib/types';
import VideoPlayerPage from './VideoPlayerPage';

interface VideoPageProps {
  params: {
    slug: string;
    videoSlug: string;
  };
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

    // Get videos as VideoItems (this handles Contentful properly)
    const videos = await getVideosAsVideoItems(director.name);
    
    if (!videos || videos.length === 0) {
      notFound();
    }

    // Find the video by matching the slug
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
        currentVideoSlug={videoSlug}
      />
    );
  } catch (error) {
    console.error('Error loading video page:', error);
    notFound();
  }
}

