import { getDirectorBySlug, getVideosAsVideoItemsFromDirector } from "@/lib/directors-api";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DirectorClient from "@/app/directors/[slug]/DirectorClient";
import VimeoPreload from "@/components/VimeoPreload";
import { JsonLd } from "@/components/JsonLd";
import { buildPageMetadata, directorJsonLd, vimeoThumbnailUrl } from "@/lib/seo";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const director = await getDirectorBySlug(slug);

  if (!director) {
    return buildPageMetadata({
      title: 'Director not found',
      path: `/directors/${slug}/`,
      noIndex: true,
    });
  }

  const videoCount = director.videos.length;
  const featuredVideo = director.videos.find((v) => v.vimeoId);
  const featuredLabel = featuredVideo
    ? `${featuredVideo.title} (${featuredVideo.client})`
    : null;
  const description = featuredLabel
    ? `Explore ${director.name}'s portfolio at Bristol — ${videoCount} commercial ${videoCount === 1 ? 'film' : 'films'}, including ${featuredLabel}.`
    : `Explore ${director.name}'s portfolio at Bristol — ${videoCount} commercial ${videoCount === 1 ? 'film' : 'films'} spanning advertising and branded content.`;

  return buildPageMetadata({
    title: director.name,
    description,
    path: `/directors/${slug}/`,
    ...(featuredVideo && {
      image: vimeoThumbnailUrl(featuredVideo.vimeoId),
      imageAlt: `${director.name} — ${featuredVideo.title} for ${featuredVideo.client}`,
    }),
  });
}

// ISR - Incremental Static Regeneration
// Pages are statically generated but can be regenerated on-demand via webhooks
// or automatically after 1 hour if stale
export const revalidate = 3600; // 1 hour

// Generar rutas estáticas para todos los directores
export async function generateStaticParams() {
  try {
    // Obtener slugs de los directores
    const { getDirectorSlugs } = await import('@/lib/directors-api');
    const directorSlugs = await getDirectorSlugs();
    
    return directorSlugs.map((slug) => ({
      slug: slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}



export default async function DirectorPage({ params }: PageProps) {
  // Obtener slug de los params
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Generar datos estáticamente
  const director = await getDirectorBySlug(slug);
  if (!director) {
    notFound();
  }

  const videos = getVideosAsVideoItemsFromDirector(director);
  const featuredVideo = director.videos.find((v) => v.vimeoId);

  return (
    <>
      <JsonLd
        data={directorJsonLd({
          name: director.name,
          slug,
          videoCount: director.videos.length,
          featuredVideo: featuredVideo
            ? {
                title: featuredVideo.title,
                client: featuredVideo.client,
                vimeoId: featuredVideo.vimeoId,
              }
            : undefined,
        })}
      />
      <VimeoPreload />
      <DirectorClient director={{ ...director, slug }} videos={videos} />
    </>
  );
}


