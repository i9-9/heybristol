#!/usr/bin/env tsx

import * as fs from 'fs';
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

class NewDirectorsParser {
  parseMarkdownFile(filePath: string): DirectorData[] {
    console.log('📄 Parsing markdown file:', filePath);
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').map(line => line.trim());
    
    const directors: DirectorData[] = [];
    let currentDirector: DirectorData | null = null;
    let directorOrder = 1;
    
    console.log('🔍 Parsing director data from markdown...');
    
    // First pass: identify directors
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip empty lines and metadata lines
      if (!line || line.startsWith('Director:') || line.startsWith('Titulo:') || 
          line.startsWith('Link al') || line.startsWith('Orden:')) {
        continue;
      }
      
      // Check if this is a director name
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
    
    // Second pass: parse videos for each director
    this.parseVideosForDirectors(directors, lines);
    
    console.log(`✅ Parsed ${directors.length} directors with ${directors.reduce((sum, d) => sum + d.videos.length, 0)} total videos`);
    return directors;
  }

  private parseVideosForDirectors(directors: DirectorData[], lines: string[]): void {
    for (const director of directors) {
      let videoOrder = 1;
      const processedVideos = new Set<string>();
      
      // Find all video entries for this director
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Look for "Director: [Director Name]" pattern
        if (line === `Director: ${director.name}`) {
          const videoData = this.parseVideoEntry(lines, i);
          if (videoData) {
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
      
      // Parse the next few lines after "Director: [Name]"
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
          break;
        }
      }
      
      // Skip videos without Vimeo ID
      if (!title || !vimeoId) {
        return null;
      }
      
      // Extract client from title
      const titleParts = title.split(' - ');
      let videoTitle = titleParts[0] || title;
      let client = titleParts[1] || 'Unknown';
      
      // Improve client extraction
      if (client === 'Unknown' && titleParts.length === 1) {
        const brandNames = [
          'Adidas', 'Nike', 'Puma', 'Coca Cola', 'Pepsi', 'McDonald\'s', 'Mc Donalds',
          'Toyota', 'Honda', 'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Ford',
          'Apple', 'Samsung', 'Google', 'Microsoft', 'Amazon', 'Netflix',
          'Heineken', 'Corona', 'Budweiser', 'Stella Artois', 'Reebok', 'Under Armour',
          'Lavazza', 'Diesel', 'Denner', 'Panda Cheese', 'Rolling Stone', 'Vicio',
          'Donettes', 'Ricky Rubio', 'Aitana', 'Sebastian Yatra', 'Alizzz', 'C Tangana',
          'Ministerio de Igualdad', 'Braun', 'Lancome', 'Grey Goose', 'Lassa', 'Telekom',
          'Gstar', 'Hard Rock', 'Turkish Airlines', 'Etihad', 'Grupo Marina', 'McCafe',
          'BCI', 'Baltika', 'Vodafone', 'Jeep', 'Macallan', 'Iberdrola', 'Asus',
          'Emirates NBD', 'Vitalis', 'Chivas', 'Kotex', 'Gillette', 'Sennheiser',
          'Bepantol', 'Mercado Livre', 'Sector', 'Lamborghini', 'Citroen', 'Peugeot',
          'Porsche', 'Kia'
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
        id: '',
        title: videoTitle,
        client: client,
        vimeoId: vimeoId,
        thumbnailId: thumbnailId || undefined,
        order: 0
      };
    } catch (error) {
      console.error(`❌ Error parsing video entry:`, error);
      return null;
    }
  }

  private isDirectorName(line: string): boolean {
    const prefixes = ['Director:', 'Titulo:', 'Link al', 'Orden:'];
    const hasPrefix = prefixes.some(prefix => line.startsWith(prefix));
    
    const words = line.split(' ');
    const hasNumbers = /\d/.test(line);
    const hasUrl = line.includes('http') || line.includes('vimeo.com');
    const isTooLong = words.length > 4;
    const hasMissingVideos = line.includes('falta que envíe') || line.includes('missing');
    
    return !hasPrefix && !hasNumbers && !hasUrl && !isTooLong && !hasMissingVideos && 
           words.length >= 1 && words.length <= 4;
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
  const markdownFilePath = path.join(process.cwd(), 'newdirectors.md');
  
  console.log('🎬 Bristol New Directors Parser (Test Mode)');
  console.log('===========================================');
  
  // Check if markdown file exists
  if (!fs.existsSync(markdownFilePath)) {
    console.error(`❌ File not found: ${markdownFilePath}`);
    console.log('Please make sure the newdirectors.md file is in the project root directory.');
    process.exit(1);
  }
  
  const parser = new NewDirectorsParser();
  
  try {
    // Parse markdown file
    const directorsData = parser.parseMarkdownFile(markdownFilePath);
    
    if (directorsData.length === 0) {
      console.log('⚠️  No director data found in the markdown file');
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
    console.log('\n📝 Summary:');
    console.log(`- Total directors: ${directorsData.length}`);
    console.log(`- Total videos: ${directorsData.reduce((sum, d) => sum + d.videos.length, 0)}`);
    console.log(`- Directors with videos: ${directorsData.filter(d => d.videos.length > 0).length}`);
    
    console.log('\n📝 Next steps:');
    console.log('1. Review the parsed data above');
    console.log('2. If the parsing looks correct, get a valid CONTENTFUL_MANAGEMENT_TOKEN');
    console.log('3. Run: npm run upload-new-directors');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { NewDirectorsParser };
