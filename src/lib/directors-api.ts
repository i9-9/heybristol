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

const USE_CONTENTFUL = process.env.NEXT_PUBLIC_USE_CONTENTFUL === 'true';

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

export async function getDirectorNames(): Promise<string[]> {
  const directors = await getDirectors();
  return directors
    .sort((a, b) => {
      const namePartsA = a.name.split(' ');
      const namePartsB = b.name.split(' ');
      const lastNameA = namePartsA.length >= 2 ? namePartsA[1] : namePartsA[0] || '';
      const lastNameB = namePartsB.length >= 2 ? namePartsB[1] : namePartsB[0] || '';
      return lastNameA.localeCompare(lastNameB);
    })
    .map(d => d.name);
}

export async function getDirectorSlugs(): Promise<string[]> {
  const directors = await getDirectors();
  return directors
    .sort((a, b) => {
      const namePartsA = a.name.split(' ');
      const namePartsB = b.name.split(' ');
      const lastNameA = namePartsA.length >= 2 ? namePartsA[1] : namePartsA[0] || '';
      const lastNameB = namePartsB.length >= 2 ? namePartsB[1] : namePartsB[0] || '';
      return lastNameA.localeCompare(lastNameB);
    })
    .map(d => d.slug);
}

export async function getPublishedVideosByDirectorName(directorName: string): Promise<DirectorVideo[]> {
  const directors = await getDirectors();
  const director = directors.find(d => d.name === directorName);
  return director ? director.videos.filter(v => v.vimeoId) : [];
}

export async function getPublishedVideosByDirectorSlug(directorSlug: string): Promise<DirectorVideo[]> {
  const director = await getDirectorBySlug(directorSlug);
  return director ? director.videos.filter(v => v.vimeoId) : [];
}

export async function getVideosAsVideoItems(directorName: string): Promise<VideoItem[]> {
  const director = (await getDirectors()).find(d => d.name === directorName);
  if (!director) return [];
  
  const publishedVideos = director.videos.filter(v => v.vimeoId);
  
  const videoItems = await Promise.all(
    publishedVideos.map(video => convertToVideoItem(video))
  );
  
  return videoItems;
}

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
