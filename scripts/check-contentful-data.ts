import { createClient } from 'contentful';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

class ContentfulDataChecker {
  private client: any;

  constructor() {
    this.client = createClient({
      space: process.env.CONTENTFUL_SPACE_ID!,
      accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
    });
  }

  async checkAliAliData(): Promise<void> {
    try {
      console.log('🔍 Verificando datos de Ali Ali desde Contentful...\n');

      // 1. Buscar el director Ali Ali
      const directorResponse = await this.client.getEntries({
        content_type: 'director',
        'fields.name': 'ALI ALI',
        include: 2
      });

      if (directorResponse.items.length === 0) {
        console.log('❌ Director Ali Ali no encontrado');
        return;
      }

      const director = directorResponse.items[0];
      console.log(`📊 DIRECTOR ALI ALI:`);
      console.log(`   - Nombre: ${director.fields.name}`);
      console.log(`   - Slug: ${director.fields.slug}`);
      console.log(`   - Videos asociados: ${director.fields.videos?.length || 0}`);
      console.log('');

      // 2. Verificar videos asociados
      if (director.fields.videos && director.fields.videos.length > 0) {
        console.log(`📹 VIDEOS ASOCIADOS AL DIRECTOR:`);
        director.fields.videos.forEach((video: any, index: number) => {
          console.log(`   ${index + 1}. ID: ${video.fields.id}`);
          console.log(`      - Título: "${video.fields.title}"`);
          console.log(`      - Cliente: "${video.fields.client}"`);
          console.log(`      - Vimeo ID: ${video.fields.vimeoId}`);
          console.log(`      - Thumbnail ID: ${video.fields.thumbnailId}`);
          console.log(`      - Order: ${video.fields.order}`);
          console.log('');
        });
      } else {
        console.log('❌ No hay videos asociados al director');
      }

      // 3. Buscar videos de Ali Ali por separado
      const videoResponse = await this.client.getEntries({
        content_type: 'directorVideo',
        'fields.id[match]': 'ali-ali-'
      });

      console.log(`📹 VIDEOS DE ALI ALI ENCONTRADOS POR BÚSQUEDA:`);
      videoResponse.items.forEach((video: any, index: number) => {
        console.log(`   ${index + 1}. ID: ${video.fields.id}`);
        console.log(`      - Título: "${video.fields.title}"`);
        console.log(`      - Cliente: "${video.fields.client}"`);
        console.log(`      - Vimeo ID: ${video.fields.vimeoId}`);
        console.log(`      - Thumbnail ID: ${video.fields.thumbnailId}`);
        console.log(`      - Order: ${video.fields.order}`);
        console.log('');
      });

      // 4. Simular la conversión a VideoItem
      console.log(`🔄 SIMULACIÓN DE CONVERSIÓN A VIDEOITEM:`);
      if (videoResponse.items.length > 0) {
        const video = videoResponse.items[0];
        const videoItem = {
          id: video.fields.vimeoId || video.fields.id,
          title: video.fields.title,
          description: `${video.fields.client} - ${video.fields.title}`,
          tags: [video.fields.client, video.fields.title]
        };
        
        console.log(`   VideoItem resultante:`);
        console.log(`   - ID: ${videoItem.id}`);
        console.log(`   - Title: "${videoItem.title}"`);
        console.log(`   - Description: "${videoItem.description}"`);
        console.log(`   - Tags[0]: "${videoItem.tags[0]}"`);
        console.log(`   - Tags[1]: "${videoItem.tags[1]}"`);
        console.log('');
        
        console.log(`   Lo que se mostraría en la UI:`);
        console.log(`   "${videoItem.tags[0] || 'CLIENTE'} | ${videoItem.title}"`);
        console.log(`   = "${videoItem.tags[0]} | ${videoItem.title}"`);
      }

    } catch (error) {
      console.error('❌ Error verificando datos:', error);
    }
  }
}

// Ejecutar el script
async function main() {
  const checker = new ContentfulDataChecker();
  await checker.checkAliAliData();
}

main().catch(console.error);
