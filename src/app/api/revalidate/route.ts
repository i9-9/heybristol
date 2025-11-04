import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { clearContentfulCache } from '@/lib/contentful';

// This route handles on-demand revalidation triggered by Contentful webhooks
// It allows immediate regeneration of pages when CMS content changes
export async function POST(request: NextRequest) {
  try {
    // Verify the request (optional but recommended)
    // You can add a secret token check here for security
    const authHeader = request.headers.get('authorization');
    const secret = process.env.REVALIDATE_SECRET;
    
    if (secret && authHeader !== `Bearer ${secret}`) {
      return NextResponse.json(
        { message: 'Invalid authorization' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    
    // Clear the Contentful cache to ensure fresh data on next request
    clearContentfulCache();
    
    // Determine which paths to revalidate based on the webhook payload
    // Contentful webhooks can have different structures:
    // - Entry webhook: body.sys.contentType.sys.id
    // - Metadata webhook: body.sys.contentType.sys.id (from test payload)
    const contentType = body?.sys?.contentType?.sys?.id;
    const entityType = body?.sys?.type;
    
    // Revalidate based on content type
    if (contentType === 'director' || contentType === 'directorVideo' || contentType === 'client') {
      // Revalidate home page (shows directors list via Directors component)
      revalidatePath('/', 'layout');
      
      // Revalidate specific director page if we have the slug
      if (body?.fields?.slug) {
        revalidatePath(`/directors/${body.fields.slug}`, 'page');
      }
      
      // Revalidate all director pages (they might be affected by ordering changes)
      revalidatePath('/directors/[slug]', 'page');
      revalidatePath('/directors/[slug]/[videoSlug]', 'page');
      
      console.log(`✅ Revalidated paths for ${contentType}${body?.fields?.slug ? ` (slug: ${body.fields.slug})` : ''}`);
    } else if (contentType === 'heroVideo' || contentType === 'editorialVideo' || contentType === 'audioTrack') {
      // Revalidate home page for hero/editorial content
      revalidatePath('/', 'page');
      console.log(`✅ Revalidated home page for ${contentType}`);
    } else {
      // Fallback: revalidate everything
      revalidatePath('/', 'layout');
      console.log('✅ Revalidated all paths (fallback)');
    }

    return NextResponse.json({ 
      revalidated: true, 
      now: Date.now(),
      contentType,
      entityType
    });
  } catch (error) {
    console.error('Error revalidating:', error);
    return NextResponse.json(
      { message: 'Error revalidating', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

