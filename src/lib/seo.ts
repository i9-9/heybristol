import type { Metadata } from 'next';

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://heybristol.com';

export const SITE_NAME = 'Bristol';

export const DEFAULT_DESCRIPTION =
  'Bristol is a production company rooted in creativity, authenticity, and collaboration — reflecting a diverse range of voices and perspectives in commercial film and advertising.';

export const DEFAULT_KEYWORDS = [
  'Bristol',
  'production company',
  'film production',
  'commercial production',
  'advertising',
  'directors',
  'video production',
  'creative production',
];

export function absoluteUrl(path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized === '/') return `${SITE_URL}/`;
  return normalized.endsWith('/') ? `${SITE_URL}${normalized}` : `${SITE_URL}${normalized}/`;
}

export function vimeoThumbnailUrl(vimeoId: string): string {
  return `https://vumbnail.com/${vimeoId}.jpg`;
}

export function buildPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image = '/opengraph-image.svg',
  imageAlt = `${SITE_NAME} — Production Company`,
  noIndex = false,
}: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  imageAlt?: string;
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = image.startsWith('http') ? image : absoluteUrl(image);

  return {
    title,
    description,
    keywords: DEFAULT_KEYWORDS,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'es_AR',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    logo: absoluteUrl('/favicon.png'),
  };
}

export function directorJsonLd({
  name,
  slug,
  videoCount,
  featuredVideo,
}: {
  name: string;
  slug: string;
  videoCount: number;
  featuredVideo?: { title: string; client: string; vimeoId: string };
}) {
  const path = `/directors/${slug}/`;
  const description = `${name} — director at Bristol with ${videoCount} commercial ${videoCount === 1 ? 'film' : 'films'}.`;

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: `${name} | ${SITE_NAME}`,
    url: absoluteUrl(path),
    description,
    mainEntity: {
      '@type': 'Person',
      name,
      jobTitle: 'Film Director',
      worksFor: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
      },
      ...(featuredVideo && {
        image: vimeoThumbnailUrl(featuredVideo.vimeoId),
      }),
    },
  };
}

export function videoJsonLd({
  title,
  description,
  directorName,
  vimeoId,
  path,
}: {
  title: string;
  description: string;
  directorName: string;
  vimeoId: string;
  path: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: title,
    description,
    thumbnailUrl: vimeoThumbnailUrl(vimeoId),
    embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
    url: absoluteUrl(path),
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    creator: {
      '@type': 'Person',
      name: directorName,
    },
  };
}
