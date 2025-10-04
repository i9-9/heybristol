import { createClient as createManagementClient } from 'contentful-management';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

class ContentfulPublisher {
  private managementClient: any;

  constructor() {
    this.managementClient = createManagementClient({
      accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
    });
  }

  async publishAliAliAndVideos(): Promise<void> {
    try {
      console.log('🚀 Publicando Ali Ali y sus videos...');

      const space = await this.managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!);
      const environment = await space.getEnvironment('master');

      // 1. Buscar el director Ali Ali
      const directorResponse = await environment.getEntries({
        content_type: 'director',
        'fields.name': 'ALI ALI'
      });

      if (directorResponse.items.length === 0) {
        throw new Error('Ali Ali no encontrado');
      }

      const director = directorResponse.items[0];
      console.log(`✅ Director Ali Ali encontrado: ${director.sys.id}`);

      // 2. Buscar videos de Ali Ali
      const videoResponse = await environment.getEntries({
        content_type: 'directorVideo',
        'fields.id[match]': 'ali-ali-'
      });

      console.log(`📹 Videos de Ali Ali encontrados: ${videoResponse.items.length}`);

      // 3. Publicar todos los videos primero
      for (const video of videoResponse.items) {
        try {
          await video.publish();
          console.log(`✅ Video "${video.fields.title}" publicado`);
        } catch (error) {
          console.log(`⚠️  Video "${video.fields.title}" ya estaba publicado o error:`, error.message);
        }
      }

      // 4. Actualizar el director con las referencias a los videos
      const videoReferences = videoResponse.items.map(video => ({
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id: video.sys.id
        }
      }));

      director.fields.videos = {
        'en-US': videoReferences
      };

      await director.update();
      console.log('✅ Director Ali Ali actualizado con referencias a videos');

      // 5. Publicar el director
      try {
        await director.publish();
        console.log('✅ Director Ali Ali publicado');
      } catch (error) {
        console.log(`⚠️  Director Ali Ali ya estaba publicado o error:`, error.message);
      }

      console.log('🎉 ¡Proceso completado!');

    } catch (error) {
      console.error('❌ Error:', error);
      throw error;
    }
  }

  async checkAliAliStatus(): Promise<void> {
    try {
      const space = await this.managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!);
      const environment = await space.getEnvironment('master');

      // Buscar director
      const directorResponse = await environment.getEntries({
        content_type: 'director',
        'fields.name': 'ALI ALI'
      });

      if (directorResponse.items.length > 0) {
        const director = directorResponse.items[0];
        console.log(`📊 Director Ali Ali:`);
        console.log(`   - ID: ${director.sys.id}`);
        console.log(`   - Videos asociados: ${director.fields.videos?.length || 0}`);
        console.log(`   - Estado: ${director.sys.publishedAt ? 'Publicado' : 'Borrador'}`);
      }

      // Buscar videos
      const videoResponse = await environment.getEntries({
        content_type: 'directorVideo',
        'fields.id[match]': 'ali-ali-'
      });

      console.log(`📹 Videos de Ali Ali encontrados: ${videoResponse.items.length}`);
      videoResponse.items.forEach((video: any, index: number) => {
        console.log(`   ${index + 1}. ${video.fields.title} - Estado: ${video.sys.publishedAt ? 'Publicado' : 'Borrador'}`);
      });

    } catch (error) {
      console.error('Error verificando estado:', error);
    }
  }
}

// Ejecutar el script
async function main() {
  const publisher = new ContentfulPublisher();
  
  console.log('🔍 Verificando estado actual...');
  await publisher.checkAliAliStatus();
  
  console.log('\n🚀 Publicando entradas...');
  await publisher.publishAliAliAndVideos();
}

main().catch(console.error);
