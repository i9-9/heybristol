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

async function simulateAppDirectorsFetch() {
  console.log('🎭 Simulating App Directors Fetch');
  console.log('=================================');
  
  try {
    console.log('📊 Environment Variables:');
    console.log(`  - NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`  - SPACE_ID: ${process.env.CONTENTFUL_SPACE_ID || process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}`);
    console.log(`  - ACCESS_TOKEN: ${(process.env.CONTENTFUL_ACCESS_TOKEN || process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN)?.substring(0, 10)}...`);
    
    // Simulate exactly what the app does
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    console.log(`\n🔍 Fetching directors (isDevelopment: ${isDevelopment})...`);
    
    const response = await client.getEntries({
      content_type: 'director',
      order: ['fields.order'],
      include: 2,
      // In development, don't filter by published status to include unpublished entries
      ...(isDevelopment ? {} : { 'sys.publishedAt[exists]': true })
    });
    
    console.log(`\n📊 Query Results:`);
    console.log(`  - Total items found: ${response.items.length}`);
    console.log(`  - Total: ${response.total}`);
    
    const directors = response.items.map((item: any, index: number) => {
      const director = item.fields;
      const videos = director.videos || [];
      return {
        name: director.name,
        slug: director.slug,
        order: director.order,
        videos: videos.map((video: any) => ({
          id: video.fields?.id,
          title: video.fields?.title,
          client: video.fields?.client,
          vimeoId: video.fields?.vimeoId,
          thumbnailId: video.fields?.thumbnailId,
          order: video.fields?.order,
        }))
      };
    });
    
    console.log(`\n📋 Directors that the app will show:`);
    directors.forEach((director, index) => {
      console.log(`  ${index + 1}. ${director.name} (${director.slug})`);
      console.log(`     Order: ${director.order}`);
      console.log(`     Videos: ${director.videos.length}`);
      console.log(`     Published: ${response.items[index].sys.publishedAt ? 'Yes' : 'No'}`);
    });
    
    console.log(`\n✅ App simulation completed!`);
    console.log(`📊 Summary: ${directors.length} directors will be shown in the app`);
    
    return directors;
    
  } catch (error) {
    console.error('❌ Error during simulation:', error);
    return [];
  }
}

// Run the simulation
if (require.main === module) {
  simulateAppDirectorsFetch().catch(console.error);
}

export { simulateAppDirectorsFetch };
