"use server"

import getVimeoVideosByDirector from "@/lib/getVimeoVideosByDirector";
import type { VideoItem } from "@/lib/types";

interface Props {
  directorName: string;
}

export default async function DirectorServer({ directorName }: Props) {
  try {
    const videos: VideoItem[] = await getVimeoVideosByDirector(directorName);
    return videos;
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
}
