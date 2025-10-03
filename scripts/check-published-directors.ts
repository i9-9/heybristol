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

async function checkPublishedDirectors() {
  console.log('🔍 Checking Published Directors');
  console.log('===============================');
  
  try {
    console.log('📊 Environment Variables:');
    console.log(`  - SPACE_ID: ${process.env.CONTENTFUL_SPACE_ID || process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}`);
    console.log(`  - ACCESS_TOKEN: ${(process.env.CONTENTFUL_ACCESS_TOKEN || process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN)?.substring(0, 10)}...`);
    
    console.log('\n🔍 Fetching ONLY published directors...');
    
    // Fetch ONLY published directors
    const response = await client.getEntries({
      content_type: 'director',
      order: ['fields.order'],
      include: 2,
      limit: 1000, // Increase limit
    });
    
    console.log(`\n📊 Published Directors Query Results:`);
    console.log(`  - Total items found: ${response.items.length}`);
    console.log(`  - Total: ${response.total}`);
    
    const publishedDirectors = response.items.filter((item: any) => item.sys.publishedAt);
    const unpublishedDirectors = response.items.filter((item: any) => !item.sys.publishedAt);
    
    console.log(`  - Published: ${publishedDirectors.length}`);
    console.log(`  - Unpublished: ${unpublishedDirectors.length}`);
    
    console.log('\n📋 Published Directors:');
    publishedDirectors.forEach((item: any, index: number) => {
      const director = item.fields;
      const videos = director.videos || [];
      console.log(`  ${index + 1}. ${director.name} (${director.slug})`);
      console.log(`     Order: ${director.order}`);
      console.log(`     Videos: ${videos.length}`);
      console.log(`     Published: ${item.sys.publishedAt}`);
    });
    
    if (unpublishedDirectors.length > 0) {
      console.log('\n⚠️  Unpublished Directors:');
      unpublishedDirectors.forEach((item: any, index: number) => {
        const director = item.fields;
        console.log(`  ${index + 1}. ${director.name} (${director.slug}) - ${item.sys.id}`);
      });
    }
    
    // Check if there are more entries beyond the limit
    if (response.total > response.items.length) {
      console.log(`\n⚠️  WARNING: There are ${response.total} total entries but only ${response.items.length} returned due to limit`);
      console.log('This might be why some directors are missing from localhost');
    }
    
    console.log('\n✅ Check completed!');
    
  } catch (error) {
    console.error('❌ Error during check:', error);
  }
}

// Run the check
if (require.main === module) {
  checkPublishedDirectors().catch(console.error);
}

export { checkPublishedDirectors };
