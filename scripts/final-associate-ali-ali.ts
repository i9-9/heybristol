import { createClient as createManagementClient } from 'contentful-management';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

class AliAliFinalAssociator {
  private managementClient: any;

  constructor() {
    this.managementClient = createManagementClient({
      accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
    });
  }

  async associateVideosToAliAli(): Promise<void> {
    try {
      console.log('🚀 Asociando videos a Ali Ali (intento final)...');

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

      console.log('🎉 ¡Videos asociados exitosamente!');

    } catch (error) {
      console.error('❌ Error asociando videos:', error);
      throw error;
    }
  }

  async verifyFinalAssociation(): Promise<void> {
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
        
        if (director.fields.videos && director.fields.videos.length > 0) {
          console.log('   - Videos asociados:');
          director.fields.videos.forEach((videoRef: any, index: number) => {
            console.log(`     ${index + 1}. ID: ${videoRef.sys.id}`);
          });
        }
      }

      // Buscar videos
      const videoResponse = await environment.getEntries({
        content_type: 'directorVideo',
        'fields.id[match]': 'ali-ali-'
      });

      console.log(`\n📹 Videos de Ali Ali:`);
      videoResponse.items.forEach((video: any, index: number) => {
        console.log(`   ${index + 1}. ${video.fields.title['en-US']} (${video.fields.client['en-US']})`);
        console.log(`      - Vimeo ID: ${video.fields.vimeoId['en-US']}`);
        console.log(`      - Estado: ${video.sys.publishedAt ? 'Publicado' : 'Borrador'}`);
      });

    } catch (error) {
      console.error('Error verificando asociación:', error);
    }
  }
}

// Ejecutar el script
async function main() {
  const associator = new AliAliFinalAssociator();
  
  console.log('🔍 Verificando estado actual...');
  await associator.verifyFinalAssociation();
  
  console.log('\n🚀 Asociando videos...');
  await associator.associateVideosToAliAli();
  
  console.log('\n🔍 Verificando resultado final...');
  await associator.verifyFinalAssociation();
}

main().catch(console.error);
