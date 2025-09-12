export interface VimeoApiResponse {
    data: VimeoApiVideo[];
}

export interface VimeoApiVideo {
    uri: string;
    name: string;
    link: string;
    description?: string;
    pictures?: {
        sizes?: Array<{
            link?: string;
            width?: number;
            height?: number;
            }>;
            }
    tags?: Array<{name: string}>;
    duration?: number;    
}

export interface VideoItem {
    id: string;
    title: string;
    description?: string;
    pageUrl?: string;
    embedUrl: string;
    thumb?: string | null;
    thumbnailId?: string; // ID del video de thumbnail/preview
    hash?: string; // Hash para videos privados de Vimeo
    width?: number;
    height?: number;
    duration?: number;
    tags?: string[];
}

// Utility function to generate video slugs
export function generateVideoSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim();
}