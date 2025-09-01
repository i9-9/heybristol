import { 
  getDirectorsFromContentful, 
  getDirectorBySlugFromContentful 
} from './contentful';
import { 
  directors as localDirectors, 
  getDirectorBySlug as getLocalDirectorBySlug,
  convertToVideoItem,
  Director,
  DirectorVideo
} from '../data/directors';
import type { VideoItem } from './types';

// Configuración para determinar la fuente de datos
const USE_CONTENTFUL = process.env.NEXT_PUBLIC_USE_CONTENTFUL === 'true';

/**
 * Obtiene todos los directores, ya sea de Contentful o datos locales
 */
export async function getDirectors(): Promise<Director[]> {
  if (USE_CONTENTFUL) {
    try {
      const contentfulDirectors = await getDirectorsFromContentful();
      return contentfulDirectors;
    } catch (error) {
      console.error('Error fetching from Contentful, falling back to local data:', error);
      return localDirectors;
    }
  }
  
  return localDirectors;
}

/**
 * Obtiene un director por slug, ya sea de Contentful o datos locales
 */
export async function getDirectorBySlug(slug: string): Promise<Director | null> {
  if (USE_CONTENTFUL) {
    try {
      const contentfulDirector = await getDirectorBySlugFromContentful(slug);
      return contentfulDirector;
    } catch (error) {
      console.error('Error fetching from Contentful, falling back to local data:', error);
      return getLocalDirectorBySlug(slug);
    }
  }
  
  return getLocalDirectorBySlug(slug);
}

/**
 * Obtiene los nombres de todos los directores
 */
export async function getDirectorNames(): Promise<string[]> {
  const directors = await getDirectors();
  return directors.map(d => d.name);
}

/**
 * Obtiene los slugs de todos los directores
 */
export async function getDirectorSlugs(): Promise<string[]> {
  const directors = await getDirectors();
  return directors.map(d => d.slug);
}

/**
 * Obtiene videos publicados por nombre de director
 */
export async function getPublishedVideosByDirectorName(directorName: string): Promise<DirectorVideo[]> {
  const directors = await getDirectors();
  const director = directors.find(d => d.name === directorName);
  return director ? director.videos.filter(v => !v.isPlaceholder && v.status === 'published') : [];
}

/**
 * Obtiene videos publicados por slug de director
 */
export async function getPublishedVideosByDirectorSlug(directorSlug: string): Promise<DirectorVideo[]> {
  const director = await getDirectorBySlug(directorSlug);
  return director ? director.videos.filter(v => !v.isPlaceholder && v.status === 'published') : [];
}

/**
 * Convierte videos de director a formato VideoItem para el UI
 */
export async function getVideosAsVideoItems(directorName: string): Promise<VideoItem[]> {
  const director = (await getDirectors()).find(d => d.name === directorName);
  if (!director) return [];
  
  const publishedVideos = director.videos.filter(v => !v.isPlaceholder && v.vimeoId);
  
  const videoItems = await Promise.all(
    publishedVideos.map(video => convertToVideoItem(video))
  );
  
  return videoItems;
}

/**
 * Obtiene estadísticas de la migración
 */
export async function getMigrationStats() {
  const localCount = localDirectors.length;
  const localVideosCount = localDirectors.reduce((total, director) => total + director.videos.length, 0);
  
  let contentfulCount = 0;
  let contentfulVideosCount = 0;
  
  if (USE_CONTENTFUL) {
    try {
      const contentfulDirectors = await getDirectorsFromContentful();
      contentfulCount = contentfulDirectors.length;
      contentfulVideosCount = contentfulDirectors.reduce((total, director) => total + director.videos.length, 0);
    } catch (error) {
      console.error('Error getting Contentful stats:', error);
    }
  }
  
  return {
    local: {
      directors: localCount,
      videos: localVideosCount
    },
    contentful: {
      directors: contentfulCount,
      videos: contentfulVideosCount
    },
    usingContentful: USE_CONTENTFUL
  };
}
