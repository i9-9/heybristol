import { NextResponse } from 'next/server';
import { getVimeoVideoMetadata } from '@/lib/vimeo-metadata';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: 'Invalid video id' }, { status: 400 });
  }

  const metadata = await getVimeoVideoMetadata(id);

  return NextResponse.json(metadata, {
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
    },
  });
}
