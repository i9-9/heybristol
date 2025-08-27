
import { getVimeoVideosRaw } from "./getVimeoVideosRaw"
import type { VideoItem } from "./types"

export default async function getVimeoVideosByDirector(): Promise<VideoItem[]> {
    const allVideos = await getVimeoVideosRaw()

    // TEMPORAL: Desactivado filtrado para debugging
    // Retornar todos los videos sin importar el director
    return allVideos;

    // Código original comentado:
    // if (!director) return allVideos;
    // const normalized = director.toLowerCase();
    // return allVideos.filter(v => 
    //     v.tags?.includes(normalized)
    // );
}