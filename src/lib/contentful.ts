import { createClient } from 'contentful';
import { withCache } from './cache';

// Advanced caching system
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

class AdvancedCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private hitCount = 0;
  private missCount = 0;

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0
    };
    this.cache.set(key, entry);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.missCount++;
      return null;
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }

    entry.hits++;
    this.hitCount++;
    return entry.data as T;
  }

  getStats() {
    const total = this.hitCount + this.missCount;
    return {
      hitRate: total > 0 ? Math.round((this.hitCount / total) * 10000) / 100 : 0,
      totalRequests: total,
      cacheSize: this.cache.size
    };
  }

  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }
}

const advancedCache = new AdvancedCache();

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
    order: number;
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

export interface AudioTrack {
  id: string;
  title: string;
  audioFile: { 
    sys: { id: string };
    fields: { file: { url: string; contentType: string } };
  };
}

export interface EditorialVideo {
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

// Función interna con cache avanzado
async function _getDirectorsFromContentful() {
  try {
    const cacheKey = 'directors-all';
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Try cache first
    const cached = advancedCache.get(cacheKey);
    if (cached) {
      console.log('🎯 Cache HIT for directors');
      return cached;
    }

    console.log('🔄 Cache MISS for directors - fetching from Contentful');
    
    const response = await client.getEntries({
      content_type: 'director',
      order: ['fields.order'], // Ordenar por el campo order
      include: 2, // Include referenced entries (videos)
      // In development, don't filter by published status to include unpublished entries
      ...(isDevelopment ? {} : { 'sys.publishedAt[exists]': true })
    } as Parameters<typeof client.getEntries>[0]);

    const directors = response.items.map((item: unknown) => {
      const director = item as { fields: { name: string; slug: string; order: number; videos?: unknown[] } };
      return {
        name: director.fields.name,
        slug: director.fields.slug,
        order: director.fields.order,
        videos: (director.fields.videos?.map((video: unknown) => {
          const directorVideo = video as { 
            fields?: { id: string; title: string; client: string; vimeoId: string; thumbnailId?: string; order: number };
            sys?: { publishedAt?: string; publishedVersion?: number };
          };
          // Skip videos that don't have fields (unlinked references)
          if (!directorVideo || !directorVideo.fields) {
            return null;
          }
          // Contentful Delivery API should automatically filter unpublished entries
          // Only filter if we're in development and explicitly see it's unpublished
          // In production, trust Contentful's filtering
          if (isDevelopment && directorVideo.sys && !directorVideo.sys.publishedAt && !directorVideo.sys.publishedVersion) {
            return null;
          }
          return {
            id: directorVideo.fields.id,
            title: directorVideo.fields.title,
            client: directorVideo.fields.client,
            vimeoId: directorVideo.fields.vimeoId,
            thumbnailId: directorVideo.fields.thumbnailId,
            order: directorVideo.fields.order,
          };
        }).filter(v => v !== null) ?? []) as Array<{ id: string; title: string; client: string; vimeoId: string; thumbnailId?: string; order: number }>,
      };
    });

    // Cache with different TTL based on environment
    const ttl = isDevelopment ? 30 * 1000 : 5 * 60 * 1000;
    advancedCache.set(cacheKey, directors, ttl);
    
    console.log(`✅ Directors fetched and cached (TTL: ${ttl/1000}s)`);
    return directors;
  } catch (error) {
    console.error('Error fetching directors from Contentful:', error);
    return [];
  }
}

// Función con cache
export const getDirectorsFromContentful = withCache(
  _getDirectorsFromContentful,
  () => 'directors-all',
  process.env.NODE_ENV === 'development' ? 30 * 1000 : 5 * 60 * 1000 // 30 segundos en desarrollo, 5 minutos en producción
);

// Export cache statistics for monitoring
export function getCacheStats() {
  return advancedCache.getStats();
}

// Export function to clear cache (useful for development)
export function clearContentfulCache() {
  advancedCache.clear();
  console.log('🗑️  Contentful cache cleared');
}

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

    const item = response.items[0] as unknown as { fields: { name: string; slug: string; order: number; videos?: unknown[] } };
    return {
      name: item.fields.name,
      slug: item.fields.slug,
      order: item.fields.order,
      videos: (item.fields.videos?.map((video: unknown) => {
        const directorVideo = video as { 
          fields?: { id: string; title: string; client: string; vimeoId: string; thumbnailId?: string; order: number };
          sys?: { publishedAt?: string; publishedVersion?: number };
        };
        // Skip videos that don't have fields (unlinked references)
        if (!directorVideo || !directorVideo.fields) {
          return null;
        }
        // Contentful Delivery API should automatically filter unpublished entries
        // Only filter if we're in development and explicitly see it's unpublished
        const isDevelopment = process.env.NODE_ENV === 'development';
        if (isDevelopment && directorVideo.sys && !directorVideo.sys.publishedAt && !directorVideo.sys.publishedVersion) {
          return null;
        }
        return {
          id: directorVideo.fields.id,
          title: directorVideo.fields.title,
          client: directorVideo.fields.client,
          vimeoId: directorVideo.fields.vimeoId,
          thumbnailId: directorVideo.fields.thumbnailId,
          order: directorVideo.fields.order,
        };
      }).filter(v => v !== null) ?? []) as Array<{ id: string; title: string; client: string; vimeoId: string; thumbnailId?: string; order: number }>,
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
      order: ['fields.order'], // Ordenar por el campo order
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

// Función para obtener todos los videos hero (sin random)
export async function getAllHeroVideos(): Promise<HeroVideo[]> {
  try {
    return await getHeroVideosFromContentful();
  } catch (error) {
    console.error('Error getting all hero videos:', error);
    return [];
  }
}

// Función para obtener la mejor fuente de video
export function getBestVideoSource(heroVideo: HeroVideo, isMobile: boolean = false): VideoSource | null {
  // Prioridad: WebM > MP4 > Vimeo (NUNCA Vimeo en móvil)
  
  // Detectar soporte de WebM
  const video = document.createElement('video');
  const supportsWebM = video.canPlayType('video/webm; codecs="vp9"').replace(/no/, '') !== '';
  
  console.log('🔍 getBestVideoSource - isMobile:', isMobile, 'supportsWebM:', supportsWebM);
  console.log('🔍 Video fields:', {
    mobileVideo: !!heroVideo.mobileVideo,
    webmVideo: !!heroVideo.webmVideo,
    mp4Video: !!heroVideo.mp4Video,
    vimeoId: !!heroVideo.vimeoId
  });
  
  // En móvil, usar mobileVideo si está disponible, sino usar WebM normal
  if (isMobile) {
    if (heroVideo.mobileVideo) {
      console.log('📱 Usando mobileVideo');
      return {
        src: `https:${heroVideo.mobileVideo.fields.file.url}`,
        type: heroVideo.mobileVideo.fields.file.contentType.includes('webm') ? 'webm' : 'mp4'
      };
    }
    // Si no hay mobileVideo, usar WebM normal (mismo video que desktop)
    if (supportsWebM && heroVideo.webmVideo) {
      console.log('📱 Usando webmVideo en móvil');
      return {
        src: `https:${heroVideo.webmVideo.fields.file.url}`,
        type: 'webm'
      };
    }
    // Fallback a MP4 en móvil si no hay WebM
    if (heroVideo.mp4Video) {
      console.log('📱 Usando mp4Video en móvil');
      return {
        src: `https:${heroVideo.mp4Video.fields.file.url}`,
        type: 'mp4'
      };
    }
    // NUNCA usar Vimeo en móvil
    console.log('📱 No hay fuentes válidas para móvil');
    return null;
  }
  
  // Desktop: Prioridad 1: WebM (si es soportado)
  if (supportsWebM && heroVideo.webmVideo) {
    return {
      src: `https:${heroVideo.webmVideo.fields.file.url}`,
      type: 'webm'
    };
  }
  
  // Desktop: Prioridad 2: MP4
  if (heroVideo.mp4Video) {
    return {
      src: `https:${heroVideo.mp4Video.fields.file.url}`,
      type: 'mp4'
    };
  }
  
  // Desktop: Prioridad 3: Vimeo (solo en desktop)
  if (heroVideo.vimeoId) {
    return {
      src: `https://player.vimeo.com/video/${heroVideo.vimeoId}?autoplay=1&loop=1&muted=1&controls=0&background=1&quality=1080p&responsive=1&dnt=1`,
      type: 'vimeo'
    };
  }
  
  return null;
}

// Función interna para obtener audio tracks desde Contentful
async function _getAudioTracksFromContentful(): Promise<AudioTrack[]> {
  try {
    const entries = await client.getEntries({
      content_type: 'audioTrack'
    });

    return entries.items.map((audioTrack: unknown) => {
      const track = audioTrack as { 
        fields: { 
          id: string; 
          title: string; 
          audioFile: { 
            sys: { id: string };
            fields: { file: { url: string; contentType: string } };
          }; 
        } 
      };
      return {
        id: track.fields.id,
        title: track.fields.title,
        audioFile: track.fields.audioFile,
      };
    });
  } catch (error) {
    console.error('Error fetching audio tracks from Contentful:', error);
    return [];
  }
}

// Función con cache para audio tracks
export const getAudioTracksFromContentful = withCache(
  _getAudioTracksFromContentful,
  () => 'audio-tracks-all',
  5 * 60 * 1000 // 5 minutos
);

// Función para obtener un audio track aleatorio
export async function getRandomAudioTrack(): Promise<AudioTrack | null> {
  try {
    const audioTracks = await getAudioTracksFromContentful();
    
    if (audioTracks.length === 0) {
      return null;
    }
    
    // Seleccionar un track aleatorio
    const randomIndex = Math.floor(Math.random() * audioTracks.length);
    return audioTracks[randomIndex];
  } catch (error) {
    console.error('Error getting random audio track:', error);
    return null;
  }
}

// Función interna para obtener editorial videos desde Contentful
async function _getEditorialVideosFromContentful(): Promise<EditorialVideo[]> {
  try {
    const entries = await client.getEntries({
      content_type: 'editorialVideo',
      order: ['fields.order'] // Ordenar por el campo order
    });

    return entries.items.map((editorialVideo: unknown) => {
      const video = editorialVideo as { 
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
          order: number 
        } 
      };
      return {
        id: video.fields.id,
        title: video.fields.title,
        description: video.fields.description,
        webmVideo: video.fields.webmVideo,
        mp4Video: video.fields.mp4Video,
        mobileVideo: video.fields.mobileVideo,
        order: video.fields.order,
      };
    });
  } catch (error) {
    console.error('Error fetching editorial videos from Contentful:', error);
    return [];
  }
}

// Función con cache para editorial videos
export const getEditorialVideosFromContentful = withCache(
  _getEditorialVideosFromContentful,
  () => 'editorial-videos-all',
  5 * 60 * 1000 // 5 minutos
);
