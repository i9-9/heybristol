interface VimeoMetadata {
  hash: string | null;
  thumbnailUrl: string | null;
}

const metadataCache = new Map<string, VimeoMetadata>();

function pickThumbnailUrl(sizes?: Array<{ width?: number; link?: string }>): string | null {
  if (!sizes?.length) return null;

  const sorted = [...sizes].sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  const preferred = sorted.find((s) => (s.width ?? 0) >= 640 && s.link);
  return preferred?.link ?? sorted[0]?.link ?? null;
}

/** Resolves private hash + thumbnail via Vimeo API (server-only). */
export async function getVimeoVideoMetadata(vimeoId: string): Promise<{
  hash?: string;
  thumbnailUrl?: string;
}> {
  if (!vimeoId) return {};

  const cached = metadataCache.get(vimeoId);
  if (cached) {
    return {
      hash: cached.hash || undefined,
      thumbnailUrl: cached.thumbnailUrl || undefined,
    };
  }

  const token = process.env.VIMEO_TOKEN;
  if (!token) return {};

  try {
    const response = await fetch(`https://api.vimeo.com/videos/${vimeoId}`, {
      headers: { Authorization: `bearer ${token}` },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      metadataCache.set(vimeoId, { hash: null, thumbnailUrl: null });
      return {};
    }

    const data = (await response.json()) as {
      player_embed_url?: string;
      pictures?: { sizes?: Array<{ width?: number; link?: string }> };
    };

    const hashMatch = data.player_embed_url?.match(/[?&]h=([^&]+)/);
    const metadata: VimeoMetadata = {
      hash: hashMatch?.[1] ?? null,
      thumbnailUrl: pickThumbnailUrl(data.pictures?.sizes),
    };

    metadataCache.set(vimeoId, metadata);

    return {
      hash: metadata.hash || undefined,
      thumbnailUrl: metadata.thumbnailUrl || undefined,
    };
  } catch {
    metadataCache.set(vimeoId, { hash: null, thumbnailUrl: null });
    return {};
  }
}

/** @deprecated Use getVimeoVideoMetadata */
export async function getVimeoPrivateHash(vimeoId: string): Promise<string | undefined> {
  const { hash } = await getVimeoVideoMetadata(vimeoId);
  return hash;
}
