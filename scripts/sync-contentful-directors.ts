#!/usr/bin/env tsx

import { createClient } from 'contentful-management';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Contentful Management API client
const managementClient = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
});

// Contentful space and environment
const SPACE_ID = process.env.CONTENTFUL_SPACE_ID || process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!;
const ENVIRONMENT_ID = process.env.CONTENTFUL_ENVIRONMENT_ID || 'master';

class ContentfulSyncChecker {
  private space: any;
  private environment: any;

  async initialize() {
    console.log('🚀 Initializing Contentful Management API...');
    
    this.space = await managementClient.getSpace(SPACE_ID);
    this.environment = await this.space.getEnvironment(ENVIRONMENT_ID);
    
    console.log('✅ Connected to Contentful space:', SPACE_ID);
    console.log('✅ Environment:', ENVIRONMENT_ID);
  }

  async checkDirectorPublishingStatus(): Promise<void> {
    console.log('🔍 Checking Director Publishing Status');
    console.log('=====================================');
    
    try {
      // Get all director entries using Management API
      const entries = await this.environment.getEntries({
        content_type: 'director',
        limit: 1000
      });
      
      console.log(`📊 Found ${entries.items.length} director entries`);
      
      const publishedDirectors = entries.items.filter((entry: any) => entry.sys.publishedAt);
      const unpublishedDirectors = entries.items.filter((entry: any) => !entry.sys.publishedAt);
      
      console.log(`✅ Published directors: ${publishedDirectors.length}`);
      console.log(`⚠️  Unpublished directors: ${unpublishedDirectors.length}`);
      
      if (unpublishedDirectors.length > 0) {
        console.log('\n📋 Unpublished Directors:');
        unpublishedDirectors.forEach((entry: any, index: number) => {
          const name = entry.fields.name?.['en-US'] || 'Unknown';
          const slug = entry.fields.slug?.['en-US'] || 'unknown';
          console.log(`  ${index + 1}. ${name} (${slug}) - ${entry.sys.id}`);
          console.log(`     Created: ${entry.sys.createdAt}`);
          console.log(`     Updated: ${entry.sys.updatedAt}`);
          console.log(`     Published: ${entry.sys.publishedAt || 'Not published'}`);
        });
        
        console.log('\n🔧 Attempting to publish unpublished directors...');
        
        let publishedCount = 0;
        let failedCount = 0;
        
        for (const entry of unpublishedDirectors) {
          try {
            // Refresh the entry to get the latest version
            const refreshedEntry = await this.environment.getEntry(entry.sys.id);
            
            // Publish the entry
            await refreshedEntry.publish();
            
            const name = refreshedEntry.fields.name?.['en-US'] || 'Unknown';
            console.log(`  ✅ Published: ${name} (${refreshedEntry.sys.id})`);
            publishedCount++;
            
          } catch (error: any) {
            const name = entry.fields.name?.['en-US'] || 'Unknown';
            console.log(`  ❌ Failed to publish: ${name} (${entry.sys.id})`);
            console.log(`     Error: ${error.message}`);
            failedCount++;
          }
        }
        
        console.log('\n📊 Publishing Summary:');
        console.log(`  ✅ Successfully published: ${publishedCount} directors`);
        console.log(`  ❌ Failed to publish: ${failedCount} directors`);
      }
      
      // Now check videos
      console.log('\n🔍 Checking Director Videos...');
      const videoEntries = await this.environment.getEntries({
        content_type: 'directorVideo',
        limit: 1000
      });
      
      const publishedVideos = videoEntries.items.filter((entry: any) => entry.sys.publishedAt);
      const unpublishedVideos = videoEntries.items.filter((entry: any) => !entry.sys.publishedAt);
      
      console.log(`📊 Found ${videoEntries.items.length} video entries`);
      console.log(`✅ Published videos: ${publishedVideos.length}`);
      console.log(`⚠️  Unpublished videos: ${unpublishedVideos.length}`);
      
      if (unpublishedVideos.length > 0) {
        console.log('\n🔧 Publishing unpublished videos...');
        
        let publishedVideoCount = 0;
        let failedVideoCount = 0;
        
        for (const entry of unpublishedVideos) {
          try {
            const refreshedEntry = await this.environment.getEntry(entry.sys.id);
            await refreshedEntry.publish();
            
            const title = refreshedEntry.fields.title?.['en-US'] || 'Unknown';
            publishedVideoCount++;
            
          } catch (error: any) {
            failedVideoCount++;
          }
        }
        
        console.log(`  ✅ Published ${publishedVideoCount} videos`);
        console.log(`  ❌ Failed to publish ${failedVideoCount} videos`);
      }
      
    } catch (error) {
      console.error('❌ Error checking publishing status:', error);
      throw error;
    }
  }
}

async function main() {
  console.log('🔧 Contentful Sync Checker');
  console.log('===========================');
  
  const checker = new ContentfulSyncChecker();
  
  try {
    await checker.initialize();
    await checker.checkDirectorPublishingStatus();
    
    console.log('\n🎉 Sync check completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Wait 1-2 minutes for Contentful cache to update');
    console.log('2. Restart your local development server');
    console.log('3. Check localhost again');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { ContentfulSyncChecker };
