import type { MetadataRoute } from 'next';
import { getDirectorBySlug, getDirectorSlugs } from '@/lib/directors-api';
import { generateVideoSlug } from '@/lib/types';
import { SITE_URL } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/construction/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/firmas/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  try {
    const slugs = await getDirectorSlugs();
    const directorRoutes: MetadataRoute.Sitemap = [];
    const videoRoutes: MetadataRoute.Sitemap = [];

    for (const slug of slugs) {
      directorRoutes.push({
        url: `${SITE_URL}/directors/${slug}/`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });

      const director = await getDirectorBySlug(slug);
      if (!director?.videos) continue;

      for (const video of director.videos) {
        videoRoutes.push({
          url: `${SITE_URL}/directors/${slug}/${generateVideoSlug(video.title)}/`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
    }

    return [...staticRoutes, ...directorRoutes, ...videoRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticRoutes;
  }
}
