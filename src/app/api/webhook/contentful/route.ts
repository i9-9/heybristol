import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { clearContentfulCache } from '@/lib/contentful';

// Contentful webhook handler that triggers on-demand revalidation
// This endpoint receives webhooks from Contentful and handles revalidation directly
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json().catch(() => ({}));
    
    // Handle both single entry and array of entries (batch updates)
    const entries = Array.isArray(rawBody) ? rawBody : [rawBody];
    
    // Log webhook received for debugging
    console.log('📥 Contentful webhook received:', {
      entryCount: entries.length,
      entries: entries.map((e: any) => ({
        contentType: e?.sys?.contentType?.sys?.id,
        type: e?.sys?.type,
        hasFields: !!e?.fields
      }))
    });
    
    // Clear the Contentful cache to ensure fresh data on next request
    clearContentfulCache();
    
    const contentTypes = new Set<string>();
    const directorSlugs: string[] = [];
    
    // Process all entries
    for (const body of entries) {
      const contentType = body?.sys?.contentType?.sys?.id;
      if (contentType) {
        contentTypes.add(contentType);
        
        // Collect director slugs for specific page revalidation
        if (contentType === 'director' && body?.fields?.slug) {
          directorSlugs.push(body.fields.slug);
        }
      }
    }
    
    // Revalidate based on content types found
    const hasDirectorContent = Array.from(contentTypes).some(
      ct => ct === 'director' || ct === 'directorVideo' || ct === 'client'
    );
    const hasHeroContent = Array.from(contentTypes).some(
      ct => ct === 'heroVideo' || ct === 'editorialVideo' || ct === 'audioTrack'
    );
    
    if (hasDirectorContent) {
      // Revalidate home page (shows directors list via Directors component)
      revalidatePath('/', 'layout');
      
      // Revalidate specific director pages
      for (const slug of directorSlugs) {
        revalidatePath(`/directors/${slug}`, 'page');
      }
      
      // Revalidate all director pages (they might be affected by ordering changes)
      revalidatePath('/directors/[slug]', 'page');
      revalidatePath('/directors/[slug]/[videoSlug]', 'page');
      
      console.log(`✅ Revalidated paths for director content${directorSlugs.length > 0 ? ` (slugs: ${directorSlugs.join(', ')})` : ''}`);
    }
    
    if (hasHeroContent) {
      // Revalidate home page for hero/editorial content
      revalidatePath('/', 'page');
      console.log(`✅ Revalidated home page for hero content`);
    }
    
    if (!hasDirectorContent && !hasHeroContent && contentTypes.size > 0) {
      // Fallback: revalidate everything for unknown content types
      revalidatePath('/', 'layout');
      console.log('✅ Revalidated all paths (fallback for unknown content types)');
    }
    
    return NextResponse.json({
      message: 'Webhook received and revalidation triggered',
      revalidated: true,
      contentTypes: Array.from(contentTypes),
      directorSlugs,
      now: Date.now()
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { message: 'Error processing webhook', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

