#!/usr/bin/env tsx

import { createClient } from 'contentful';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Contentful client (same as in the app)
const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID || process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN!,
});

async function diagnoseContentfulIntegration() {
  console.log('🔍 Contentful Integration Diagnosis');
  console.log('===================================');
  
  try {
    // 1. Check environment variables
    console.log('\n📊 Environment Variables:');
    console.log(`  - NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`  - NEXT_PUBLIC_USE_CONTENTFUL: ${process.env.NEXT_PUBLIC_USE_CONTENTFUL}`);
    console.log(`  - NEXT_PUBLIC_CONTENTFUL_SPACE_ID: ${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}`);
    console.log(`  - NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN: ${process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN?.substring(0, 10)}...`);
    console.log(`  - CONTENTFUL_SPACE_ID: ${process.env.CONTENTFUL_SPACE_ID}`);
    console.log(`  - CONTENTFUL_ACCESS_TOKEN: ${process.env.CONTENTFUL_ACCESS_TOKEN?.substring(0, 10)}...`);
    
    // 2. Check if Contentful is enabled
    const USE_CONTENTFUL = process.env.NEXT_PUBLIC_USE_CONTENTFUL === 'true';
    console.log(`\n🔧 Contentful Integration Status:`);
    console.log(`  - USE_CONTENTFUL: ${USE_CONTENTFUL}`);
    
    if (!USE_CONTENTFUL) {
      console.log('  ❌ Contentful is DISABLED - app will use local data');
      return;
    }
    
    // 3. Test Contentful connection
    console.log('\n🔌 Testing Contentful Connection...');
    const space = await client.getSpace();
    console.log(`  ✅ Connected to space: ${space.name} (${space.sys.id})`);
    
    // 4. Test directors query (exactly as the app does)
    console.log('\n🎬 Testing Directors Query...');
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    const response = await client.getEntries({
      content_type: 'director',
      order: ['fields.order'],
      include: 2,
      ...(isDevelopment ? {} : { 'sys.publishedAt[exists]': true })
    });
    
    console.log(`  📊 Query Results:`);
    console.log(`    - Total items: ${response.items.length}`);
    console.log(`    - Total available: ${response.total}`);
    console.log(`    - Skip: ${response.skip}`);
    console.log(`    - Limit: ${response.limit}`);
    console.log(`    - Development mode: ${isDevelopment}`);
    
    // 5. Analyze directors
    const publishedDirectors = response.items.filter((item: any) => item.sys.publishedAt);
    const unpublishedDirectors = response.items.filter((item: any) => !item.sys.publishedAt);
    
    console.log(`\n📋 Directors Analysis:`);
    console.log(`  - Published: ${publishedDirectors.length}`);
    console.log(`  - Unpublished: ${unpublishedDirectors.length}`);
    
    console.log(`\n📝 Directors List:`);
    response.items.forEach((item: any, index: number) => {
      const director = item.fields;
      const videos = director.videos || [];
      const publishedStatus = item.sys.publishedAt ? '✅ Published' : '⚠️  Unpublished';
      
      console.log(`  ${index + 1}. ${director.name} (${director.slug})`);
      console.log(`     Order: ${director.order}`);
      console.log(`     Videos: ${videos.length}`);
      console.log(`     Status: ${publishedStatus}`);
      console.log(`     ID: ${item.sys.id}`);
    });
    
    // 6. Test videos query
    console.log(`\n🎥 Testing Videos Query...`);
    const videosResponse = await client.getEntries({
      content_type: 'directorVideo',
      limit: 1000
    });
    
    const publishedVideos = videosResponse.items.filter((item: any) => item.sys.publishedAt);
    const unpublishedVideos = videosResponse.items.filter((item: any) => !item.sys.publishedAt);
    
    console.log(`  📊 Video Results:`);
    console.log(`    - Total videos: ${videosResponse.items.length}`);
    console.log(`    - Published: ${publishedVideos.length}`);
    console.log(`    - Unpublished: ${unpublishedVideos.length}`);
    
    // 7. Check for potential issues
    console.log(`\n⚠️  Potential Issues:`);
    
    if (unpublishedDirectors.length > 0 && !isDevelopment) {
      console.log(`  - ${unpublishedDirectors.length} directors are unpublished (won't show in production)`);
    }
    
    if (response.total > response.items.length) {
      console.log(`  - Query limit reached: ${response.items.length}/${response.total} items returned`);
    }
    
    if (publishedDirectors.length === 0 && unpublishedDirectors.length > 0) {
      console.log(`  - All directors are unpublished - this might be a cache issue`);
    }
    
    // 8. Recommendations
    console.log(`\n💡 Recommendations:`);
    
    if (isDevelopment && unpublishedDirectors.length > 0) {
      console.log(`  ✅ Development mode is correctly including unpublished entries`);
    }
    
    if (publishedDirectors.length === 0) {
      console.log(`  🔧 Consider running: npm run sync-contentful-directors`);
    }
    
    if (response.total > response.items.length) {
      console.log(`  🔧 Consider increasing query limit or implementing pagination`);
    }
    
    console.log(`\n✅ Diagnosis completed!`);
    
  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Expected parameter accessToken')) {
        console.log('\n💡 Fix: Check your CONTENTFUL_ACCESS_TOKEN environment variable');
      } else if (error.message.includes('Space not found')) {
        console.log('\n💡 Fix: Check your CONTENTFUL_SPACE_ID environment variable');
      } else if (error.message.includes('Unauthorized')) {
        console.log('\n💡 Fix: Check your CONTENTFUL_ACCESS_TOKEN permissions');
      }
    }
  }
}

// Run the diagnosis
if (require.main === module) {
  diagnoseContentfulIntegration().catch(console.error);
}

export { diagnoseContentfulIntegration };
