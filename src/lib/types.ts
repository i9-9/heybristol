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
    width?: number;
    height?: number;
    duration?: number;
    tags?: string[];
}