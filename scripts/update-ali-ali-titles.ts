import { createClient as createManagementClient } from 'contentful-management';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

class AliAliTitleUpdater {
  private managementClient: any;

  constructor() {
    this.managementClient = createManagementClient({
      accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
    });
  }

  async updateVideoTitles(): Promise<void> {
    try {
      console.log('🚀 Actualizando títulos de videos de Ali Ali...');

      const space = await this.managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!);
      const environment = await space.getEnvironment('master');

      // Datos correctos - solo el nombre del proyecto
      const titleUpdates = [
        { id: 'ali-ali-1', title: 'An artful life', client: 'Byda Creative City' },
        { id: 'ali-ali-2', title: 'The Cleaners', client: 'Heineken' },
        { id: 'ali-ali-3', title: 'Rockin\' Mamas', client: 'Rolling Stone' },
        { id: 'ali-ali-4', title: 'Alexa', client: 'Lavazza' },
        { id: 'ali-ali-5', title: 'Never say no to Panda', client: 'Panda Cheese' },
        { id: 'ali-ali-6', title: 'The Night is Young', client: 'Heineken' },
        { id: 'ali-ali-7', title: 'The Good life', client: 'Denner' },
        { id: 'ali-ali-8', title: 'Be a follower', client: 'Diesel' }
      ];

      // Buscar videos de Ali Ali
      const videoResponse = await environment.getEntries({
        content_type: 'directorVideo',
        'fields.id[match]': 'ali-ali-'
      });

      console.log(`📹 Videos encontrados: ${videoResponse.items.length}`);

      // Actualizar cada video
      for (const update of titleUpdates) {
        const video = videoResponse.items.find((v: any) => v.fields.id['en-US'] === update.id);
        
        if (!video) {
          console.log(`⚠️  Video ${update.id} no encontrado`);
          continue;
        }

        console.log(`🔧 Actualizando ${update.id}:`);
        console.log(`   - Título actual: "${video.fields.title['en-US']}"`);
        console.log(`   - Título nuevo: "${update.title}"`);

        // Actualizar solo el título
        video.fields.title = {
          'en-US': update.title
        };

        // Guardar cambios (sin publicar)
        await video.update();
        console.log(`✅ Video "${update.title}" actualizado`);
      }

      console.log('🎉 ¡Todos los títulos actualizados!');
      console.log('📝 Nota: Los videos están actualizados pero no publicados. Puedes publicarlos manualmente desde Contentful.');

    } catch (error) {
      console.error('❌ Error actualizando títulos:', error);
      throw error;
    }
  }

  async verifyUpdates(): Promise<void> {
    try {
      const space = await this.managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!);
      const environment = await space.getEnvironment('master');

      // Buscar videos
      const videoResponse = await environment.getEntries({
        content_type: 'directorVideo',
        'fields.id[match]': 'ali-ali-'
      });

      console.log(`📹 Videos de Ali Ali:`);
      videoResponse.items.forEach((video: any, index: number) => {
        console.log(`   ${index + 1}. ID: ${video.fields.id['en-US']}`);
        console.log(`      Título: "${video.fields.title['en-US']}"`);
        console.log(`      Cliente: "${video.fields.client['en-US']}"`);
        console.log(`      Lo que se mostrará: "${video.fields.client['en-US']} | ${video.fields.title['en-US']}"`);
        console.log(`      Estado: ${video.sys.publishedAt ? 'Publicado' : 'Borrador'}`);
        console.log('');
      });

    } catch (error) {
      console.error('Error verificando actualizaciones:', error);
    }
  }
}

// Ejecutar el script
async function main() {
  const updater = new AliAliTitleUpdater();
  
  console.log('🔍 Verificando estado actual...');
  await updater.verifyUpdates();
  
  console.log('\n🚀 Actualizando títulos...');
  await updater.updateVideoTitles();
  
  console.log('\n🔍 Verificando resultado final...');
  await updater.verifyUpdates();
}

main().catch(console.error);
