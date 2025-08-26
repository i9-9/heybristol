import "server-only";
import type { VimeoApiResponse, VimeoApiVideo, VideoItem } from "./types"

function extractIdFromUri(uri: string): string{
    return uri.split("/").pop() || "";
}

function pickBestThumb(v: VimeoApiVideo) {
    const sizes = v.pictures?.sizes ?? [];
    if (sizes.length === 0) return { link: null, width: undefined, height: undefined};

    
    const best = sizes.reduce((max, s) => {
        const w = s.width ?? 0;
        const mw = max.width ?? 0;
        return w > mw ? s : max;
    }, sizes[0]!);

    const validLink = best.link && best.link.trim() !== "" ? best.link : null;
    
    return { link: validLink, width: best.width, height: best.height };
} 

export async function getVimeoVideosRaw(): Promise<VideoItem[]> {
    const token = process.env.VIMEO_TOKEN;
    if (!token){
        throw new Error("Falta el token en ENV");
    }
    
    const res = await fetch("https://api.vimeo.com/me/videos", {
        headers: {Authorization: `Bearer ${token}`},
        next: { revalidate: 7200 },
    });

    if(!res.ok) {
        const text = await res.text();
        throw new Error (`Vimeo error ${res.status}: ${text}`);
    }

    const json: VimeoApiResponse = await res.json();

    const items: VideoItem[] = (json.data ?? []).map((v) => {
        const id = extractIdFromUri(v.uri);
        const best = pickBestThumb(v);

        return {
                id,
                title: v.name,
                description: v.description,
                pageUrl: v.link,
                embedUrl: `https://player.vimeo.com/video/${id}`,
                thumb: best.link, // Ahora puede ser null pero nunca string vacío
                width: best.width,
                height: best.height,
                duration: v.duration,
                tags: v.tags?.map(t => t.name.toLowerCase()) ?? [],
            };
    })

    return items
}
