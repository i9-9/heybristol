export async function getVimeoThumbnail(vimeoId: string): Promise<string | null> {
  try {
    const response = await fetch(`https://api.vimeo.com/videos/${vimeoId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.VIMEO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Vimeo API error: ${response.status}`);
    }

    const data = await response.json();
    const pictures = data.pictures;
    
    if (pictures && pictures.sizes && pictures.sizes.length > 0) {
      const sizes = pictures.sizes; 
      const preferredSizes = ['1280x720', '960x540', '640x360'];
      
      for (const size of preferredSizes) {
        const foundSize = sizes.find((s: any) => s.dimensions === size);
        if (foundSize && foundSize.link) {
          return foundSize.link;
        }
      }
      
      return sizes[0].link;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching thumbnail for video ${vimeoId}:`, error);
    return null;
  }
}

export async function getVimeoThumbnails(vimeoIds: string[]): Promise<Record<string, string | null>> {
  const thumbnails: Record<string, string | null> = {};
  
  const promises = vimeoIds.map(async (id) => {
    const thumbnail = await getVimeoThumbnail(id);
    return { id, thumbnail };
  });
  
  const results = await Promise.all(promises);
  
  results.forEach(({ id, thumbnail }) => {
    thumbnails[id] = thumbnail;
  });
  
  return thumbnails;
}
