#!/usr/bin/env tsx

import mammoth from 'mammoth';
import * as path from 'path';

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

class DirectorParser {
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
    
    console.log('📝 Raw text lines:');
    lines.forEach((line, index) => {
      console.log(`  ${index + 1}: "${line}"`);
    });
    
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
}

async function main() {
  const docxFilePath = path.join(process.cwd(), 'Direectores reels info.docx');
  
  console.log('🎬 Bristol Directors Parser (Test Mode)');
  console.log('========================================');
  
  // Check if .docx file exists
  const fs = require('fs');
  if (!fs.existsSync(docxFilePath)) {
    console.error(`❌ File not found: ${docxFilePath}`);
    console.log('Please make sure the .docx file is in the project root directory.');
    process.exit(1);
  }
  
  const parser = new DirectorParser();
  
  try {
    // Parse .docx file
    const text = await parser.parseDocxFile(docxFilePath);
    
    console.log('\n📄 Raw text extracted from DOCX:');
    console.log('==================================');
    console.log(text);
    console.log('\n');
    
    // Parse director data
    const directorsData = parser.parseDirectorData(text);
    
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
    
    console.log('\n✅ Parsing completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Review the parsed data above');
    console.log('2. If the parsing looks correct, run the full upload script');
    console.log('3. Make sure you have CONTENTFUL_MANAGEMENT_TOKEN configured');
    console.log('4. Run: npm run upload-directors-docx');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { DirectorParser };
