import { getDirectorBySlug, getVideosAsVideoItems } from "@/lib/directors-api";
import { notFound } from "next/navigation";
import DirectorClient from "@/app/directors/[slug]/DirectorClient";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Configurar ISR - se regenera cada hora o cuando hay cambios
export const revalidate = 3600; // 1 hora

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


