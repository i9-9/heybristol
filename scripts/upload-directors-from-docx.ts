#!/usr/bin/env tsx

import mammoth from 'mammoth';
import { createClient } from 'contentful-management';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config();

// Contentful Management API client
const managementClient = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
});

// Contentful space and environment
const SPACE_ID = process.env.CONTENTFUL_SPACE_ID || process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!;
const ENVIRONMENT_ID = process.env.CONTENTFUL_ENVIRONMENT_ID || 'master';

interface DirectorData {
  name: string;
  slug: string;
  order: number;
  videos: VideoData[];
}

interface VideoData {
  id: string;
  title: string;
  client: string;
  vimeoId: string;
  thumbnailId?: string;
  order: number;
}

class DirectorUploader {
  private space: any;
  private environment: any;

  async initialize() {
    console.log('🚀 Initializing Contentful Management API...');
    
    this.space = await managementClient.getSpace(SPACE_ID);
    this.environment = await this.space.getEnvironment(ENVIRONMENT_ID);
    
    console.log('✅ Connected to Contentful space:', SPACE_ID);
    console.log('✅ Environment:', ENVIRONMENT_ID);
  }

  async parseDocxFile(filePath: string): Promise<string> {
    console.log('📄 Parsing .docx file:', filePath);
    
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      console.log('✅ Successfully parsed .docx file');
      return result.value;
    } catch (error) {
      console.error('❌ Error parsing .docx file:', error);
      throw error;
    }
  }

  parseDirectorData(text: string): DirectorData[] {
    console.log('🔍 Parsing director data from text...');
    
    const directors: DirectorData[] = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let currentDirector: DirectorData | null = null;
    let directorOrder = 1;
    let videoOrder = 1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip empty lines and common headers
      if (!line || line.includes('DIRECTOR') || line.includes('VIDEO') || line.includes('CLIENT')) {
        continue;
      }
      
      // Check if this is a director name (usually appears alone or with minimal text)
      if (this.isDirectorName(line)) {
        // Save previous director if exists
        if (currentDirector) {
          directors.push(currentDirector);
        }
        
        // Start new director
        currentDirector = {
          name: line,
          slug: this.createSlug(line),
          order: directorOrder++,
          videos: []
        };
        videoOrder = 1;
        console.log(`📁 Found director: ${line}`);
        continue;
      }
      
      // If we have a current director, try to parse video data
      if (currentDirector && this.isVideoData(line)) {
        const videoData = this.parseVideoLine(line, currentDirector.slug, videoOrder++);
        if (videoData) {
          currentDirector.videos.push(videoData);
          console.log(`  📹 Added video: ${videoData.title} (${videoData.client})`);
        }
      }
    }
    
    // Add the last director
    if (currentDirector) {
      directors.push(currentDirector);
    }
    
    console.log(`✅ Parsed ${directors.length} directors with ${directors.reduce((sum, d) => sum + d.videos.length, 0)} total videos`);
    return directors;
  }

  private isDirectorName(line: string): boolean {
    // Director names are usually short, don't contain common video-related keywords,
    // and don't look like video titles or client names
    const videoKeywords = ['video', 'commercial', 'campaign', 'ad', 'spot', 'film'];
    const hasVideoKeywords = videoKeywords.some(keyword => 
      line.toLowerCase().includes(keyword)
    );
    
    // Director names are typically 2-4 words, don't contain numbers in the middle,
    // and don't contain common client names
    const words = line.split(' ');
    const hasNumbers = /\d/.test(line);
    const isTooLong = words.length > 4;
    
    return !hasVideoKeywords && !hasNumbers && !isTooLong && words.length >= 1;
  }

  private isVideoData(line: string): boolean {
    // Video data usually contains a title and client, separated by some delimiter
    // Look for patterns like "Title - Client" or "Title | Client" or similar
    const separators = [' - ', ' | ', ' – ', ' — '];
    return separators.some(sep => line.includes(sep));
  }

  private parseVideoLine(line: string, directorSlug: string, order: number): VideoData | null {
    try {
      // Try different separators
      const separators = [' - ', ' | ', ' – ', ' — '];
      let parts: string[] = [];
      
      for (const sep of separators) {
        if (line.includes(sep)) {
          parts = line.split(sep);
          break;
        }
      }
      
      if (parts.length < 2) {
        console.warn(`⚠️  Could not parse video line: ${line}`);
        return null;
      }
      
      const title = parts[0].trim();
      const client = parts[1].trim();
      
      // Generate IDs based on the pattern used in the existing data
      const videoId = `${directorSlug}-${client.toLowerCase().replace(/\s+/g, '-')}-${order}`;
      
      // For now, we'll use placeholder Vimeo IDs - these will need to be updated manually
      const vimeoId = `PLACEHOLDER_${Date.now()}_${order}`;
      
      return {
        id: videoId,
        title,
        client,
        vimeoId,
        order
      };
    } catch (error) {
      console.error(`❌ Error parsing video line: ${line}`, error);
      return null;
    }
  }

  private createSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async createDirectorEntry(directorData: DirectorData): Promise<any> {
    console.log(`📝 Creating director entry: ${directorData.name}`);
    
    try {
      const entry = await this.environment.createEntry('director', {
        fields: {
          name: {
            'en-US': directorData.name
          },
          slug: {
            'en-US': directorData.slug
          },
          order: {
            'en-US': directorData.order
          },
          videos: {
            'en-US': [] // Will be populated after creating video entries
          }
        }
      });
      
      console.log(`✅ Created director entry: ${directorData.name} (${entry.sys.id})`);
      return entry;
    } catch (error) {
      console.error(`❌ Error creating director entry: ${directorData.name}`, error);
      throw error;
    }
  }

  async createVideoEntry(videoData: VideoData, directorEntryId: string): Promise<any> {
    console.log(`📹 Creating video entry: ${videoData.title}`);
    
    try {
      const entry = await this.environment.createEntry('directorVideo', {
        fields: {
          id: {
            'en-US': videoData.id
          },
          title: {
            'en-US': videoData.title
          },
          client: {
            'en-US': videoData.client
          },
          vimeoId: {
            'en-US': videoData.vimeoId
          },
          order: {
            'en-US': videoData.order
          }
        }
      });
      
      console.log(`✅ Created video entry: ${videoData.title} (${entry.sys.id})`);
      return entry;
    } catch (error) {
      console.error(`❌ Error creating video entry: ${videoData.title}`, error);
      throw error;
    }
  }

  async updateDirectorWithVideos(directorEntry: any, videoEntries: any[]): Promise<void> {
    console.log(`🔗 Linking ${videoEntries.length} videos to director: ${directorEntry.fields.name['en-US']}`);
    
    try {
      directorEntry.fields.videos = {
        'en-US': videoEntries.map(video => ({
          sys: {
            type: 'Link',
            linkType: 'Entry',
            id: video.sys.id
          }
        }))
      };
      
      await directorEntry.update();
      console.log(`✅ Updated director with video references`);
    } catch (error) {
      console.error(`❌ Error updating director with videos:`, error);
      throw error;
    }
  }

  async publishEntry(entry: any): Promise<void> {
    try {
      await entry.publish();
      console.log(`📢 Published entry: ${entry.sys.id}`);
    } catch (error) {
      console.error(`❌ Error publishing entry:`, error);
      throw error;
    }
  }

  async uploadDirectorsToContentful(directorsData: DirectorData[]): Promise<void> {
    console.log(`🚀 Starting upload of ${directorsData.length} directors to Contentful...`);
    
    for (const directorData of directorsData) {
      try {
        // Create director entry
        const directorEntry = await this.createDirectorEntry(directorData);
        
        // Create video entries
        const videoEntries = [];
        for (const videoData of directorData.videos) {
          const videoEntry = await this.createVideoEntry(videoData, directorEntry.sys.id);
          videoEntries.push(videoEntry);
        }
        
        // Update director with video references
        await this.updateDirectorWithVideos(directorEntry, videoEntries);
        
        // Publish director entry
        await this.publishEntry(directorEntry);
        
        // Publish video entries
        for (const videoEntry of videoEntries) {
          await this.publishEntry(videoEntry);
        }
        
        console.log(`✅ Successfully uploaded director: ${directorData.name}`);
        
      } catch (error) {
        console.error(`❌ Failed to upload director: ${directorData.name}`, error);
        // Continue with next director
      }
    }
    
    console.log('🎉 Upload process completed!');
  }

  async checkExistingDirectors(): Promise<void> {
    console.log('🔍 Checking existing directors in Contentful...');
    
    try {
      const entries = await this.environment.getEntries({
        content_type: 'director',
        limit: 1000
      });
      
      console.log(`📊 Found ${entries.items.length} existing directors:`);
      entries.items.forEach((entry: any) => {
        console.log(`  - ${entry.fields.name['en-US']} (${entry.fields.slug['en-US']})`);
      });
      
    } catch (error) {
      console.error('❌ Error checking existing directors:', error);
    }
  }
}

async function main() {
  const docxFilePath = path.join(process.cwd(), 'Direectores reels info.docx');
  
  console.log('🎬 Bristol Directors Upload Script');
  console.log('=====================================');
  
  // Check if .docx file exists
  const fs = require('fs');
  if (!fs.existsSync(docxFilePath)) {
    console.error(`❌ File not found: ${docxFilePath}`);
    console.log('Please make sure the .docx file is in the project root directory.');
    process.exit(1);
  }
  
  const uploader = new DirectorUploader();
  
  try {
    // Initialize Contentful connection
    await uploader.initialize();
    
    // Check existing directors
    await uploader.checkExistingDirectors();
    
    // Parse .docx file
    const text = await uploader.parseDocxFile(docxFilePath);
    
    // Parse director data
    const directorsData = uploader.parseDirectorData(text);
    
    if (directorsData.length === 0) {
      console.log('⚠️  No director data found in the .docx file');
      console.log('Please check the file format and content.');
      process.exit(1);
    }
    
    // Display parsed data
    console.log('\n📋 Parsed Director Data:');
    console.log('========================');
    directorsData.forEach((director, index) => {
      console.log(`\n${index + 1}. ${director.name} (${director.slug})`);
      console.log(`   Order: ${director.order}`);
      console.log(`   Videos: ${director.videos.length}`);
      director.videos.forEach((video, videoIndex) => {
        console.log(`     ${videoIndex + 1}. ${video.title} - ${video.client}`);
        console.log(`        ID: ${video.id}`);
        console.log(`        Vimeo ID: ${video.vimeoId} (PLACEHOLDER - needs manual update)`);
      });
    });
    
    // Ask for confirmation
    console.log('\n⚠️  IMPORTANT NOTES:');
    console.log('- All Vimeo IDs are set to PLACEHOLDER values');
    console.log('- You will need to manually update these with real Vimeo IDs');
    console.log('- This script will create new entries in Contentful');
    console.log('- Make sure you have the correct CONTENTFUL_MANAGEMENT_TOKEN');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise<string>((resolve) => {
      rl.question('\nDo you want to proceed with the upload? (y/N): ', resolve);
    });
    
    rl.close();
    
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('❌ Upload cancelled by user');
      process.exit(0);
    }
    
    // Upload to Contentful
    await uploader.uploadDirectorsToContentful(directorsData);
    
    console.log('\n🎉 Upload completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Go to Contentful and verify the uploaded directors');
    console.log('2. Update the Vimeo IDs with real values');
    console.log('3. Add thumbnail IDs if available');
    console.log('4. Test the website to ensure everything works correctly');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { DirectorUploader };
