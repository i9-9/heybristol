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
    console.log('🔍 Parsing director data from structured text...');
    
    const directors: DirectorData[] = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let currentDirector: DirectorData | null = null;
    let directorOrder = 1;
    
    // Process the structured format
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip empty lines and headers
      if (!line || line.includes('Director:') || line.includes('Titulo:') || line.includes('Link al') || line.includes('Orden:')) {
        continue;
      }
      
      // Check if this is a director name (appears alone, not prefixed with "Director:")
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
        console.log(`📁 Found director: ${line}`);
        continue;
      }
    }
    
    // Add the last director
    if (currentDirector) {
      directors.push(currentDirector);
    }
    
    // Now parse videos for each director
    this.parseVideosForDirectors(directors, lines);
    
    console.log(`✅ Parsed ${directors.length} directors with ${directors.reduce((sum, d) => sum + d.videos.length, 0)} total videos`);
    return directors;
  }

  private parseVideosForDirectors(directors: DirectorData[], lines: string[]): void {
    for (const director of directors) {
      let videoOrder = 1;
      const processedVideos = new Set<string>(); // Track processed videos to avoid duplicates
      
      // Find all video entries for this director
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Look for "Director: [Director Name]" pattern or exact match for names like "ALI ALI"
        if (line === `Director: ${director.name}` || line === director.name) {
          // Parse the next few lines to get video data
          const videoData = this.parseVideoEntry(lines, i);
          if (videoData) {
            // Create a unique key for this video to avoid duplicates
            const videoKey = `${videoData.title}-${videoData.vimeoId}`;
            
            if (!processedVideos.has(videoKey)) {
              processedVideos.add(videoKey);
              videoData.order = videoOrder++;
              videoData.id = `${director.slug}-${videoData.client.toLowerCase().replace(/\s+/g, '-')}-${videoData.order}`;
              director.videos.push(videoData);
              console.log(`  📹 Added video: ${videoData.title} (${videoData.client})`);
            }
          }
        }
      }
    }
  }

  private parseVideoEntry(lines: string[], startIndex: number): VideoData | null {
    try {
      let title = '';
      let vimeoId = '';
      let thumbnailId = '';
      
      // Look for the next few lines after "Director: [Name]"
      for (let i = startIndex + 1; i < startIndex + 10 && i < lines.length; i++) {
        const line = lines[i];
        
        if (line.startsWith('Titulo: ')) {
          title = line.replace('Titulo: ', '').trim();
        } else if (line.startsWith('Link al video: ')) {
          const videoUrl = line.replace('Link al video: ', '').trim();
          if (videoUrl.includes('vimeo.com/')) {
            vimeoId = videoUrl.split('vimeo.com/')[1];
          }
        } else if (line.startsWith('Link al thumbnail: ')) {
          const thumbnailUrl = line.replace('Link al thumbnail: ', '').trim();
          if (thumbnailUrl.includes('vimeo.com/')) {
            thumbnailId = thumbnailUrl.split('vimeo.com/')[1];
          }
        } else if (line.startsWith('Orden: ')) {
          // We've reached the order, stop parsing this video
          break;
        }
      }
      
      if (!title || !vimeoId) {
        return null;
      }
      
      // Extract client from title (everything after the first " - ")
      const titleParts = title.split(' - ');
      let videoTitle = titleParts[0] || title;
      let client = titleParts[1] || 'Unknown';
      
      // If no clear separator, try to extract client from common patterns
      if (client === 'Unknown' && titleParts.length === 1) {
        // Look for common client patterns in the title
        const clientPatterns = [
          /^(.*?)\s+(ft|feat|featuring)\s+(.*)$/i, // "Artist ft Other Artist"
          /^(.*?)\s+-\s+(.*)$/, // "Title - Description"
          /^(.*?)\s+\(.*\)$/, // "Title (Description)"
        ];
        
        for (const pattern of clientPatterns) {
          const match = title.match(pattern);
          if (match) {
            videoTitle = match[1].trim();
            client = match[2] ? match[2].trim() : 'Unknown';
            break;
          }
        }
        
        // If still unknown, try to extract from common brand names
        const brandNames = [
          'Adidas', 'Nike', 'Puma', 'Coca Cola', 'Pepsi', 'McDonald\'s', 'Mc Donalds',
          'Toyota', 'Honda', 'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Ford',
          'Apple', 'Samsung', 'Google', 'Microsoft', 'Amazon', 'Netflix',
          'Heineken', 'Corona', 'Budweiser', 'Stella Artois',
          'Nike', 'Adidas', 'Puma', 'Reebok', 'Under Armour'
        ];
        
        for (const brand of brandNames) {
          if (title.toLowerCase().includes(brand.toLowerCase())) {
            client = brand;
            videoTitle = title.replace(new RegExp(brand, 'gi'), '').trim();
            break;
          }
        }
      }
      
      return {
        id: '', // Will be set by caller
        title: videoTitle,
        client: client,
        vimeoId: vimeoId,
        thumbnailId: thumbnailId || undefined,
        order: 0 // Will be set by caller
      };
    } catch (error) {
      console.error(`❌ Error parsing video entry:`, error);
      return null;
    }
  }

  private isDirectorName(line: string): boolean {
    // Director names are standalone lines that don't start with common prefixes
    const prefixes = ['Director:', 'Titulo:', 'Link al', 'Orden:'];
    const hasPrefix = prefixes.some(prefix => line.startsWith(prefix));
    
    // Director names are typically 2-4 words, don't contain URLs, and don't contain numbers
    const words = line.split(' ');
    const hasNumbers = /\d/.test(line);
    const hasUrl = line.includes('http') || line.includes('vimeo.com');
    const isTooLong = words.length > 4;
    
    return !hasPrefix && !hasNumbers && !hasUrl && !isTooLong && words.length >= 1 && words.length <= 4;
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
  
  console.log('🎬 Bristol Directors Parser (Improved Test Mode)');
  console.log('================================================');
  
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
        console.log(`        Vimeo ID: ${video.vimeoId}`);
        if (video.thumbnailId) {
          console.log(`        Thumbnail ID: ${video.thumbnailId}`);
        }
      });
    });
    
    console.log('\n✅ Parsing completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Review the parsed data above');
    console.log('2. If the parsing looks correct, run the full upload script');
    console.log('3. Make sure you have CONTENTFUL_MANAGEMENT_TOKEN and CONTENTFUL_SPACE_ID configured');
    console.log('4. Run: npm run upload-directors-docx-improved');
    
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
