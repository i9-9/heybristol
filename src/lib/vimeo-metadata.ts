import { unstable_cache } from 'next/cache';

interface VimeoMetadata {
  hash: string | null;
  thumbnailUrl: string | null;
}

function pickThumbnailUrl(sizes?: Array<{ width?: number; link?: string }>): string | null {
  if (!sizes?.length) return null;

  const sorted = [...sizes].sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  const preferred = sorted.find((s) => (s.width ?? 0) >= 640 && s.link);
  return preferred?.link ?? sorted[0]?.link ?? null;
}

async function fetchVimeoMetadata(vimeoId: string): Promise<VimeoMetadata> {
  const token = process.env.VIMEO_TOKEN;
  if (!token) {
    console.warn('[vimeo-metadata] VIMEO_TOKEN is not set — private videos will not resolve playback hash');
    return { hash: null, thumbnailUrl: null };
  }

  try {
    const response = await fetch(`https://api.vimeo.com/videos/${vimeoId}`, {
      headers: { Authorization: `bearer ${token}` },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return { hash: null, thumbnailUrl: null };
    }

    const data = (await response.json()) as {
      player_embed_url?: string;
      pictures?: { sizes?: Array<{ width?: number; link?: string }> };
    };

    const hashMatch = data.player_embed_url?.match(/[?&]h=([^&]+)/);
    return {
      hash: hashMatch?.[1] ?? null,
      thumbnailUrl: pickThumbnailUrl(data.pictures?.sizes),
    };
  } catch {
    return { hash: null, thumbnailUrl: null };
  }
}

const getCachedVimeoMetadata = (vimeoId: string) =>
  unstable_cache(
    async () => fetchVimeoMetadata(vimeoId),
    ['vimeo-video-metadata', vimeoId],
    { revalidate: 86400 }
  )();

/** Resolves private hash + HD thumbnail via Vimeo API (server-only, cached 24h). */
export async function getVimeoVideoMetadata(vimeoId: string): Promise<{
  hash?: string;
  thumbnailUrl?: string;
}> {
  if (!vimeoId) return {};

  const metadata = await getCachedVimeoMetadata(vimeoId);

  return {
    hash: metadata.hash || undefined,
    thumbnailUrl: metadata.thumbnailUrl || undefined,
  };
}

/** @deprecated Use getVimeoVideoMetadata */
export async function getVimeoPrivateHash(vimeoId: string): Promise<string | undefined> {
  const { hash } = await getVimeoVideoMetadata(vimeoId);
  return hash;
}
