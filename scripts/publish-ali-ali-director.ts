import { createClient as createManagementClient } from 'contentful-management';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

class AliAliPublisher {
  private managementClient: any;

  constructor() {
    this.managementClient = createManagementClient({
      accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
    });
  }

  async publishAliAliDirector(): Promise<void> {
    try {
      console.log('🚀 Publicando director Ali Ali...');

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
      console.log(`📊 Estado actual: ${director.sys.publishedAt ? 'Publicado' : 'Borrador'}`);
      console.log(`📊 Versión: ${director.sys.version}`);

      // 2. Buscar videos de Ali Ali
      const videoResponse = await environment.getEntries({
        content_type: 'directorVideo',
        'fields.id[match]': 'ali-ali-'
      });

      console.log(`📹 Videos encontrados: ${videoResponse.items.length}`);

      // 3. Crear referencias a los videos
      const videoReferences = videoResponse.items.map(video => ({
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id: video.sys.id
        }
      }));

      // 4. Actualizar el director con las referencias
      director.fields.videos = {
        'en-US': videoReferences
      };

      // 5. Guardar cambios
      await director.update();
      console.log('✅ Director Ali Ali actualizado con referencias a videos');

      // 6. Publicar el director
      await director.publish();
      console.log('✅ Director Ali Ali publicado');

      console.log('🎉 ¡Director Ali Ali publicado exitosamente!');

    } catch (error) {
      console.error('❌ Error publicando director:', error);
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
        console.log(`   - Versión: ${director.sys.version}`);
        
        if (director.fields.videos && director.fields.videos.length > 0) {
          console.log('   - Videos asociados:');
          director.fields.videos.forEach((videoRef: any, index: number) => {
            console.log(`     ${index + 1}. ID: ${videoRef.sys.id}`);
          });
        }
      }

    } catch (error) {
      console.error('Error verificando estado:', error);
    }
  }
}

// Ejecutar el script
async function main() {
  const publisher = new AliAliPublisher();
  
  console.log('🔍 Verificando estado actual...');
  await publisher.checkAliAliStatus();
  
  console.log('\n🚀 Publicando director...');
  await publisher.publishAliAliDirector();
  
  console.log('\n🔍 Verificando resultado final...');
  await publisher.checkAliAliStatus();
}

main().catch(console.error);
