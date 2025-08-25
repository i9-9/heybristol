
// lib/getVimeoVideos.ts
interface VimeoVideo {
    uri: string;
    name: string;
    link: string;
    description?: string;
    pictures: {
      sizes: { link: string }[];
    };
    tags?: { name: string }[];
  }
  
  export async function getVimeoVideos(director?: string): Promise<VimeoVideo[]> {
    const res = await fetch("https://api.vimeo.com/me/videos", {
      headers: {
        Authorization: `Bearer ${process.env.VIMEO_TOKEN}`,
      },
      next: { revalidate: 3600 },
    });
  
    if (!res.ok) {
      throw new Error("Error fetching Vimeo videos");
    }
  
    const data = await res.json();
  
    let videos: VimeoVideo[] = data.data;

    if (director) {
      const directorLower = director.toLowerCase();
      videos = videos.filter(video => {
        const inDescription = video.description?.toLowerCase().includes(directorLower) ?? false;
        const inTags = video.tags?.some(tag => tag.name.toLowerCase() === directorLower) ?? false;
        return inDescription || inTags;
      });
    }
  
    // Barajar aleatoriamente
    videos = videos.sort(() => Math.random() - 0.5);
  
    return videos;
  }
  