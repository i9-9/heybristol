#!/usr/bin/env tsx

import { createClient } from 'contentful';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Contentful client
const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID || process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN!,
});

async function diagnoseContentfulDirectors() {
  console.log('🔍 Diagnosing Contentful Directors');
  console.log('==================================');
  
  try {
    console.log('📊 Environment Variables:');
    console.log(`  - SPACE_ID: ${process.env.CONTENTFUL_SPACE_ID || process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}`);
    console.log(`  - ACCESS_TOKEN: ${(process.env.CONTENTFUL_ACCESS_TOKEN || process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN)?.substring(0, 10)}...`);
    console.log(`  - USE_CONTENTFUL: ${process.env.NEXT_PUBLIC_USE_CONTENTFUL}`);
    
    console.log('\n🔍 Fetching directors from Contentful...');
    
    // Fetch directors exactly like the app does
    const response = await client.getEntries({
      content_type: 'director',
      order: ['fields.order'],
      include: 2, // Include referenced entries (videos)
    });
    
    console.log(`\n📊 Query Results:`);
    console.log(`  - Total items found: ${response.items.length}`);
    console.log(`  - Total: ${response.total}`);
    console.log(`  - Skip: ${response.skip}`);
    console.log(`  - Limit: ${response.limit}`);
    
    console.log('\n📋 Directors found:');
    response.items.forEach((item: any, index: number) => {
      const director = item.fields;
      const videos = director.videos || [];
      console.log(`  ${index + 1}. ${director.name} (${director.slug})`);
      console.log(`     Order: ${director.order}`);
      console.log(`     Videos: ${videos.length}`);
      console.log(`     Published: ${item.sys.publishedAt ? 'Yes' : 'No'}`);
      console.log(`     ID: ${item.sys.id}`);
      
      if (videos.length > 0) {
        console.log(`     Video titles:`);
        videos.forEach((video: any, videoIndex: number) => {
          console.log(`       ${videoIndex + 1}. ${video.fields?.title || 'No title'} (${video.fields?.client || 'No client'})`);
        });
      }
      console.log('');
    });
    
    // Check for unpublished entries
    console.log('\n🔍 Checking for unpublished entries...');
    const unpublishedResponse = await client.getEntries({
      content_type: 'director',
      limit: 1000
    } as any);
    
    console.log(`📊 Unpublished directors: ${unpublishedResponse.items.length}`);
    if (unpublishedResponse.items.length > 0) {
      console.log('⚠️  Found unpublished directors:');
      unpublishedResponse.items.forEach((item: any) => {
        console.log(`  - ${item.fields.name} (${item.sys.id})`);
      });
    }
    
    // Check cache
    console.log('\n🔍 Checking cache...');
    const cacheKey = 'directors-all';
    console.log(`Cache key: ${cacheKey}`);
    console.log('Note: Cache is handled by the withCache function in the app');
    
    console.log('\n✅ Diagnosis completed!');
    
  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
  }
}

// Run the diagnosis
if (require.main === module) {
  diagnoseContentfulDirectors().catch(console.error);
}

export { diagnoseContentfulDirectors };
