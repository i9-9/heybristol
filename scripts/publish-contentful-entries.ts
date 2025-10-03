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

class ContentfulPublisher {
  private space: any;
  private environment: any;

  async initialize() {
    console.log('🚀 Initializing Contentful Management API...');
    
    this.space = await managementClient.getSpace(SPACE_ID);
    this.environment = await this.space.getEnvironment(ENVIRONMENT_ID);
    
    console.log('✅ Connected to Contentful space:', SPACE_ID);
    console.log('✅ Environment:', ENVIRONMENT_ID);
  }

  async publishAllUnpublishedEntries(): Promise<void> {
    console.log('🔍 Finding all unpublished entries...');
    
    try {
      // Get all unpublished entries
      const entries = await this.environment.getEntries({
        limit: 1000,
        'sys.publishedAt[exists]': false
      } as any);
      
      console.log(`📊 Found ${entries.items.length} unpublished entries`);
      
      if (entries.items.length === 0) {
        console.log('✅ All entries are already published!');
        return;
      }
      
      // Group entries by content type
      const entriesByType: { [key: string]: any[] } = {};
      entries.items.forEach((entry: any) => {
        const contentType = entry.sys.contentType.sys.id;
        if (!entriesByType[contentType]) {
          entriesByType[contentType] = [];
        }
        entriesByType[contentType].push(entry);
      });
      
      console.log('\n📋 Unpublished entries by content type:');
      Object.keys(entriesByType).forEach(contentType => {
        console.log(`  - ${contentType}: ${entriesByType[contentType].length} entries`);
      });
      
      // Publish entries
      let publishedCount = 0;
      let failedCount = 0;
      
      for (const contentType of Object.keys(entriesByType)) {
        console.log(`\n📝 Publishing ${contentType} entries...`);
        
        for (const entry of entriesByType[contentType]) {
          try {
            // Refresh the entry to get the latest version
            const refreshedEntry = await this.environment.getEntry(entry.sys.id);
            
            // Publish the entry
            await refreshedEntry.publish();
            
            const entryName = this.getEntryName(refreshedEntry);
            console.log(`  ✅ Published: ${entryName} (${refreshedEntry.sys.id})`);
            publishedCount++;
            
          } catch (error: any) {
            const entryName = this.getEntryName(entry);
            console.log(`  ❌ Failed to publish: ${entryName} (${entry.sys.id})`);
            console.log(`     Error: ${error.message}`);
            failedCount++;
          }
        }
      }
      
      console.log('\n📊 Publishing Summary:');
      console.log(`  ✅ Successfully published: ${publishedCount} entries`);
      console.log(`  ❌ Failed to publish: ${failedCount} entries`);
      
      if (failedCount > 0) {
        console.log('\n⚠️  Some entries failed to publish. This might be due to:');
        console.log('  - Missing required fields');
        console.log('  - Invalid field values');
        console.log('  - Referenced entries that are not published');
        console.log('  - Content type validation errors');
      }
      
    } catch (error) {
      console.error('❌ Error publishing entries:', error);
      throw error;
    }
  }

  private getEntryName(entry: any): string {
    try {
      const fields = entry.fields;
      
      // Try different field names based on content type
      if (fields.name && fields.name['en-US']) {
        return fields.name['en-US'];
      }
      if (fields.title && fields.title['en-US']) {
        return fields.title['en-US'];
      }
      if (fields.id && fields.id['en-US']) {
        return fields.id['en-US'];
      }
      
      return `Entry ${entry.sys.id}`;
    } catch (error) {
      return `Entry ${entry.sys.id}`;
    }
  }

  async checkPublishedStatus(): Promise<void> {
    console.log('🔍 Checking published status of all entries...');
    
    try {
      // Get all entries
      const entries = await this.environment.getEntries({
        limit: 1000
      });
      
      const publishedEntries = entries.items.filter((entry: any) => entry.sys.publishedAt);
      const unpublishedEntries = entries.items.filter((entry: any) => !entry.sys.publishedAt);
      
      console.log(`📊 Total entries: ${entries.items.length}`);
      console.log(`✅ Published entries: ${publishedEntries.length}`);
      console.log(`⚠️  Unpublished entries: ${unpublishedEntries.length}`);
      
      if (unpublishedEntries.length > 0) {
        console.log('\n📋 Unpublished entries:');
        unpublishedEntries.forEach((entry: any) => {
          const entryName = this.getEntryName(entry);
          const contentType = entry.sys.contentType.sys.id;
          console.log(`  - ${entryName} (${contentType}) - ${entry.sys.id}`);
        });
      }
      
    } catch (error) {
      console.error('❌ Error checking published status:', error);
      throw error;
    }
  }
}

async function main() {
  console.log('📢 Contentful Entries Publisher');
  console.log('================================');
  
  const publisher = new ContentfulPublisher();
  
  try {
    // Initialize Contentful connection
    await publisher.initialize();
    
    // Check current published status
    await publisher.checkPublishedStatus();
    
    // Ask for confirmation
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise<string>((resolve) => {
      rl.question('\nDo you want to publish all unpublished entries? (y/N): ', resolve);
    });
    
    rl.close();
    
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('❌ Publishing cancelled by user');
      process.exit(0);
    }
    
    // Publish all unpublished entries
    await publisher.publishAllUnpublishedEntries();
    
    // Check final status
    console.log('\n🔍 Final status check:');
    await publisher.checkPublishedStatus();
    
    console.log('\n🎉 Publishing process completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Go to Contentful and verify all entries are published');
    console.log('2. Test the website to ensure everything works correctly');
    console.log('3. Check that all videos are displaying properly');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { ContentfulPublisher };
