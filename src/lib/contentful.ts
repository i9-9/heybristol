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
    isPlaceholder: boolean;
    status: 'published' | 'pending' | 'draft';
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

const client = createClient({
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!,
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN!,
});

// Función interna sin cache
async function _getDirectorsFromContentful() {
  try {
    const response = await client.getEntries({
      content_type: 'director',
      include: 2, // Include referenced entries (videos)
    });

    return response.items.map((item: any) => ({
      name: item.fields.name,
      slug: item.fields.slug,
      videos: item.fields.videos?.map((video: any) => ({
        id: video.fields.id,
        title: video.fields.title,
        client: video.fields.client,
        vimeoId: video.fields.vimeoId,
        thumbnailId: video.fields.thumbnailId,
        order: video.fields.order,
        isPlaceholder: video.fields.isPlaceholder || false,
        status: video.fields.status || 'published',
      })) || [],
    }));
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

    const item = response.items[0] as any;
    return {
      name: item.fields.name,
      slug: item.fields.slug,
      videos: item.fields.videos?.map((video: any) => ({
        id: video.fields.id,
        title: video.fields.title,
        client: video.fields.client,
        vimeoId: video.fields.vimeoId,
        thumbnailId: video.fields.thumbnailId,
        order: video.fields.order,
        isPlaceholder: video.fields.isPlaceholder || false,
        status: video.fields.status || 'published',
      })) || [],
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

    return response.items.map((item: any) => ({
      id: item.fields.id,
      title: item.fields.title,
      client: item.fields.client,
      vimeoId: item.fields.vimeoId,
      thumbnailId: item.fields.thumbnailId,
      order: item.fields.order,
      isPlaceholder: item.fields.isPlaceholder || false,
      status: item.fields.status || 'published',
    }));
  } catch (error) {
    console.error('Error fetching videos from Contentful:', error);
    return [];
  }
}
