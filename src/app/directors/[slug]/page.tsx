import { getDirectorBySlug, getVideosAsVideoItems } from "@/lib/directors-api";
import { notFound } from "next/navigation";
import DirectorClient from "@/app/directors/[slug]/DirectorClient";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
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

  const videos = await getVideosAsVideoItems(director.name);

  return <DirectorClient director={{ ...director, slug }} videos={videos} />;
}


