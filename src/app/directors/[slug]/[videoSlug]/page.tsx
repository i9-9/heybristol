import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getDirectorBySlug, getDirectorSlugs, getVideosAsVideoItemsFromDirector } from '@/lib/directors-api';
import { generateVideoSlug } from '@/lib/types';
import { buildPageMetadata, videoJsonLd, vimeoThumbnailUrl } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import VimeoPreload from '@/components/VimeoPreload';
import EnrichedVideoPlayerPage from './EnrichedVideoPlayerPage';
import VideoPageLoadingFallback from './VideoPageLoadingFallback';

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

export async function generateMetadata({ params }: VideoPageProps): Promise<Metadata> {
  const { slug, videoSlug } = await params;
  const director = await getDirectorBySlug(slug);

  if (!director) {
    return buildPageMetadata({
      title: 'Video not found',
      path: `/directors/${slug}/${videoSlug}/`,
      noIndex: true,
    });
  }

  const video = director.videos.find(
    (v) => generateVideoSlug(v.title) === videoSlug
  );

  if (!video) {
    return buildPageMetadata({
      title: 'Video not found',
      path: `/directors/${slug}/${videoSlug}/`,
      noIndex: true,
    });
  }

  const title = `${video.title} — ${video.client}`;
  const description = `Watch "${video.title}" for ${video.client}, directed by ${director.name} — a Bristol production.`;

  return buildPageMetadata({
    title,
    description,
    path: `/directors/${slug}/${videoSlug}/`,
    image: vimeoThumbnailUrl(video.vimeoId),
    imageAlt: `${video.title} — ${video.client} directed by ${director.name}`,
  });
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

    const videos = getVideosAsVideoItemsFromDirector(director);
    
    if (!videos || videos.length === 0) {
      notFound();
    }

    const directorVideo = director.videos.find(
      (v) => generateVideoSlug(v.title) === videoSlug
    );

    if (!directorVideo) {
      notFound();
    }

    const video = videos.find(v =>
      generateVideoSlug(v.title) === videoSlug
    );

    if (!video) {
      notFound();
    }

    return (
      <>
        <JsonLd
          data={videoJsonLd({
            title: `${directorVideo.title} — ${directorVideo.client}`,
            description: `Commercial film "${directorVideo.title}" for ${directorVideo.client}, directed by ${director.name}.`,
            directorName: director.name,
            vimeoId: directorVideo.vimeoId,
            path: `/directors/${slug}/${videoSlug}/`,
          })}
        />
        <VimeoPreload />
        <Suspense
          fallback={
            <VideoPageLoadingFallback director={director} video={video} />
          }
        >
          <EnrichedVideoPlayerPage
            director={director}
            videos={videos}
            video={video}
          />
        </Suspense>
      </>
    );
  } catch (error) {
    console.error('Error loading video page:', error);
    notFound();
  }
}

