import { createClient } from 'contentful';
import { withCache } from './cache';

export interface ContentfulDirectorVideo {
  contentTypeId: 'directorVideo';
  fields: {
    id: string;
    title: string;
    client: string;
    vimeoId: string;
    thumbnailId?: string;
    order: number;
  };
}

export interface ContentfulDirector {
  contentTypeId: 'director';
  fields: {
    name: string;
    slug: string;
    videos: ContentfulDirectorVideo[];
  };
}

export interface ContentfulHeroVideo {
  contentTypeId: 'heroVideo';
  fields: {
    id: string;
    title: string;
    description?: string;
    webmVideo?: { 
      sys: { id: string };
      fields: { file: { url: string; contentType: string } };
    };
    mp4Video?: { 
      sys: { id: string };
      fields: { file: { url: string; contentType: string } };
    };
    mobileVideo?: { 
      sys: { id: string };
      fields: { file: { url: string; contentType: string } };
    };
    vimeoId?: string;
    order: number;
  };
}

export interface HeroVideo {
  id: string;
  title: string;
  description?: string;
  webmVideo?: { 
    sys: { id: string };
    fields: { file: { url: string; contentType: string } };
  };
  mp4Video?: { 
    sys: { id: string };
    fields: { file: { url: string; contentType: string } };
  };
  mobileVideo?: { 
    sys: { id: string };
    fields: { file: { url: string; contentType: string } };
  };
  vimeoId?: string;
  order: number;
}

export interface VideoSource {
  src: string;
  type: 'webm' | 'mp4' | 'vimeo';
}

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID || process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN!,
});

// Función interna sin cache
async function _getDirectorsFromContentful() {
  try {
    const response = await client.getEntries({
      content_type: 'director',
      include: 2, // Include referenced entries (videos)
    });

    return response.items.map((item: unknown) => {
      const director = item as { fields: { name: string; slug: string; videos?: unknown[] } };
      return {
        name: director.fields.name,
        slug: director.fields.slug,
        videos: director.fields.videos?.map((video: unknown) => {
          const directorVideo = video as { fields: { id: string; title: string; client: string; vimeoId: string; thumbnailId?: string; order: number } };
          return {
            id: directorVideo.fields.id,
            title: directorVideo.fields.title,
            client: directorVideo.fields.client,
            vimeoId: directorVideo.fields.vimeoId,
            thumbnailId: directorVideo.fields.thumbnailId,
            order: directorVideo.fields.order,
          };
        }) || [],
      };
    });
  } catch (error) {
    console.error('Error fetching directors from Contentful:', error);
    return [];
  }
}

// Función con cache
export const getDirectorsFromContentful = withCache(
  _getDirectorsFromContentful,
  () => 'directors-all',
  5 * 60 * 1000 // 5 minutos
);

async function _getDirectorBySlugFromContentful(slug: string) {
  try {
    const response = await client.getEntries({
      content_type: 'director',
      'fields.slug': slug,
      include: 2,
    });

    if (response.items.length === 0) {
      return null;
    }

    const item = response.items[0] as unknown as { fields: { name: string; slug: string; videos?: unknown[] } };
    return {
      name: item.fields.name,
      slug: item.fields.slug,
      videos: item.fields.videos?.map((video: unknown) => {
        const directorVideo = video as { fields: { id: string; title: string; client: string; vimeoId: string; thumbnailId?: string; order: number } };
        return {
          id: directorVideo.fields.id,
          title: directorVideo.fields.title,
          client: directorVideo.fields.client,
          vimeoId: directorVideo.fields.vimeoId,
          thumbnailId: directorVideo.fields.thumbnailId,
          order: directorVideo.fields.order,
        };
      }) || [],
    };
  } catch (error) {
    console.error('Error fetching director from Contentful:', error);
    return null;
  }
}

export const getDirectorBySlugFromContentful = withCache(
  _getDirectorBySlugFromContentful,
  (slug: string) => `director-${slug}`,
  5 * 60 * 1000 // 5 minutos
);

export async function getVideosFromContentful() {
  try {
    const response = await client.getEntries({
      content_type: 'directorVideo',
    });

    return response.items.map((item: unknown) => {
      const video = item as { fields: { id: string; title: string; client: string; vimeoId: string; thumbnailId?: string; order: number } };
      return {
        id: video.fields.id,
        title: video.fields.title,
        client: video.fields.client,
        vimeoId: video.fields.vimeoId,
        thumbnailId: video.fields.thumbnailId,
        order: video.fields.order,
      };
    });
  } catch (error) {
    console.error('Error fetching videos from Contentful:', error);
    return [];
  }
}

// Función interna sin cache para hero videos
async function _getHeroVideosFromContentful(): Promise<HeroVideo[]> {
  try {
    const response = await client.getEntries({
      content_type: 'heroVideo',
      order: ['fields.order'],
      include: 2, // Include referenced assets
    });

    return response.items.map((item: unknown) => {
      const heroVideo = item as { 
        fields: { 
          id: string; 
          title: string; 
          description?: string; 
          webmVideo?: { 
            sys: { id: string };
            fields: { file: { url: string; contentType: string } };
          }; 
          mp4Video?: { 
            sys: { id: string };
            fields: { file: { url: string; contentType: string } };
          }; 
          mobileVideo?: { 
            sys: { id: string };
            fields: { file: { url: string; contentType: string } };
          }; 
          vimeoId?: string; 
          order: number 
        } 
      };
      return {
        id: heroVideo.fields.id,
        title: heroVideo.fields.title,
        description: heroVideo.fields.description,
        webmVideo: heroVideo.fields.webmVideo,
        mp4Video: heroVideo.fields.mp4Video,
        mobileVideo: heroVideo.fields.mobileVideo,
        vimeoId: heroVideo.fields.vimeoId,
        order: heroVideo.fields.order,
      };
    });
  } catch (error) {
    console.error('Error fetching hero videos from Contentful:', error);
    return [];
  }
}

// Función con cache para hero videos
export const getHeroVideosFromContentful = withCache(
  _getHeroVideosFromContentful,
  () => 'hero-videos-all',
  5 * 60 * 1000 // 5 minutos
);

// Función para obtener un video hero aleatorio
export async function getRandomHeroVideo(): Promise<HeroVideo | null> {
  try {
    const heroVideos = await getHeroVideosFromContentful();
    
    if (heroVideos.length === 0) {
      return null;
    }
    
    // Seleccionar un video aleatorio
    const randomIndex = Math.floor(Math.random() * heroVideos.length);
    return heroVideos[randomIndex];
  } catch (error) {
    console.error('Error getting random hero video:', error);
    return null;
  }
}

// Función para obtener la mejor fuente de video
export function getBestVideoSource(heroVideo: HeroVideo, isMobile: boolean = false): VideoSource | null {
  // Prioridad: WebM > MP4 > Vimeo
  
  // Detectar soporte de WebM
  const video = document.createElement('video');
  const supportsWebM = video.canPlayType('video/webm; codecs="vp9"').replace(/no/, '') !== '';
  
  // En móvil, usar mobileVideo si está disponible
  if (isMobile && heroVideo.mobileVideo) {
    return {
      src: `https:${heroVideo.mobileVideo.fields.file.url}`,
      type: heroVideo.mobileVideo.fields.file.contentType.includes('webm') ? 'webm' : 'mp4'
    };
  }
  
  // Prioridad 1: WebM (si es soportado)
  if (supportsWebM && heroVideo.webmVideo) {
    return {
      src: `https:${heroVideo.webmVideo.fields.file.url}`,
      type: 'webm'
    };
  }
  
  // Prioridad 2: MP4
  if (heroVideo.mp4Video) {
    return {
      src: `https:${heroVideo.mp4Video.fields.file.url}`,
      type: 'mp4'
    };
  }
  
  // Prioridad 3: Vimeo
  if (heroVideo.vimeoId) {
    return {
      src: `https://player.vimeo.com/video/${heroVideo.vimeoId}?autoplay=1&loop=1&muted=1&controls=0&background=1&quality=1080p&responsive=1&dnt=1`,
      type: 'vimeo'
    };
  }
  
  return null;
}
