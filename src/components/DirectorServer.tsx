"use server"

import getVimeoVideosByDirector from "@/lib/getVimeoVideosByDirector";
import type { VideoItem } from "@/lib/types";

export default async function DirectorServer() {
  try {
    const videos: VideoItem[] = await getVimeoVideosByDirector();
    return videos;
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
}
