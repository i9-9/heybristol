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
import { compareDirectorsBySurname } from './director-sort';
import { getVimeoVideoMetadata } from './vimeo-metadata';

const USE_CONTENTFUL = process.env.NEXT_PUBLIC_USE_CONTENTFUL === 'true';

function sortVideosByOrder(videos: DirectorVideo[]): DirectorVideo[] {
  return [...videos].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function getDirectors(): Promise<Director[]> {
  if (USE_CONTENTFUL) {
    try {
      const contentfulDirectors = await getDirectorsFromContentful();
      return (contentfulDirectors as Director[]).map((d) => ({
        ...d,
        videos: sortVideosByOrder(d.videos),
      }));
    } catch (error) {
      console.error('Error fetching from Contentful, falling back to local data:', error);
      return localDirectors.map((d) => ({
        ...d,
        videos: sortVideosByOrder(d.videos),
      }));
    }
  }

  return localDirectors.map((d) => ({
    ...d,
    videos: sortVideosByOrder(d.videos),
  }));
}

export async function getDirectorBySlug(slug: string): Promise<Director | null> {
  if (USE_CONTENTFUL) {
    try {
      const contentfulDirector = await getDirectorBySlugFromContentful(slug);
      if (contentfulDirector) {
        return {
          ...contentfulDirector,
          videos: sortVideosByOrder(contentfulDirector.videos),
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching from Contentful, falling back to local data:', error);
      const local = getLocalDirectorBySlug(slug);
      return local ? { ...local, videos: sortVideosByOrder(local.videos) } : null;
    }
  }

  const local = getLocalDirectorBySlug(slug);
  return local ? { ...local, videos: sortVideosByOrder(local.videos) } : null;
}

export async function getDirectorNames(): Promise<string[]> {
  const directors = await getDirectors();
  return [...directors].sort(compareDirectorsBySurname).map((d) => d.name);
}

export async function getDirectorSlugs(): Promise<string[]> {
  const directors = await getDirectors();
  return [...directors].sort(compareDirectorsBySurname).map((d) => d.slug);
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
    publishedVideos.map(async (video) => {
      const item = await convertToVideoItem(video);
      if (!video.vimeoId) return item;

      const needsHash = !item.hash;
      const needsThumb = !item.thumb;
      if (!needsHash && !needsThumb) return item;

      const meta = await getVimeoVideoMetadata(video.vimeoId);
      return {
        ...item,
        hash: item.hash || meta.hash,
        thumb: item.thumb || meta.thumbnailUrl || item.thumb,
      };
    })
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
      contentfulCount = (contentfulDirectors as Director[]).length;
      contentfulVideosCount = (contentfulDirectors as Director[]).reduce((total, director) => total + director.videos.length, 0);
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
