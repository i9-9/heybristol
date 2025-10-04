import { createClient as createManagementClient } from 'contentful-management';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

interface AliAliVideo {
  title: string;
  client: string;
  vimeoId: string;
  thumbnailId: string;
  order: number;
}

// Datos correctos de Ali Ali desde newdirectors.md
const aliAliVideos: AliAliVideo[] = [
  {
    title: "Byda Creative City - An artful life",
    client: "Byda Creative City",
    vimeoId: "1122932388",
    thumbnailId: "1122946283",
    order: 1
  },
  {
    title: "Heineken - The Cleaners",
    client: "Heineken",
    vimeoId: "1122933609",
    thumbnailId: "1122946774",
    order: 2
  },
  {
    title: "Rolling Stone - Rockin' Mamas",
    client: "Rolling Stone",
    vimeoId: "1122936607",
    thumbnailId: "1122947921",
    order: 3
  },
  {
    title: "Lavazza - Alexa",
    client: "Lavazza",
    vimeoId: "1122935465",
    thumbnailId: "1122947563",
    order: 4
  },
  {
    title: "Panda Cheese - Never say no to Panda",
    client: "Panda Cheese",
    vimeoId: "1122936014",
    thumbnailId: "1122947743",
    order: 5
  },
  {
    title: "Heineken - The Night is Young",
    client: "Heineken",
    vimeoId: "1122934070",
    thumbnailId: "1122947356",
    order: 6
  },
  {
    title: "Denner - The Good life",
    client: "Denner",
    vimeoId: "1122933135",
    thumbnailId: "1122946556",
    order: 7
  },
  {
    title: "Diesel - Be a follower",
    client: "Diesel",
    vimeoId: "1124330699",
    thumbnailId: "1124333771",
    order: 8
  }
];

class AliAliVideoCorrector {
  private managementClient: any;

  constructor() {
    this.managementClient = createManagementClient({
      accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
    });
  }

  async correctAliAliVideos(): Promise<void> {
    try {
      console.log('🚀 Corrigiendo datos de videos de Ali Ali...');

      const space = await this.managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!);
      const environment = await space.getEnvironment('master');

      // 1. Buscar videos de Ali Ali
      const videoResponse = await environment.getEntries({
        content_type: 'directorVideo',
        'fields.id[match]': 'ali-ali-'
      });

      console.log(`📹 Videos encontrados: ${videoResponse.items.length}`);

      // 2. Corregir cada video
      for (let i = 0; i < videoResponse.items.length; i++) {
        const video = videoResponse.items[i];
        const correctData = aliAliVideos[i];

        if (!correctData) {
          console.log(`⚠️  No hay datos correctos para el video ${i + 1}`);
          continue;
        }

        console.log(`🔧 Corrigiendo video ${i + 1}: ${correctData.title}`);

        // Actualizar campos con datos correctos
        video.fields.title = {
          'en-US': correctData.title
        };
        video.fields.client = {
          'en-US': correctData.client
        };
        video.fields.vimeoId = {
          'en-US': correctData.vimeoId
        };
        video.fields.thumbnailId = {
          'en-US': correctData.thumbnailId
        };
        video.fields.order = {
          'en-US': correctData.order
        };

        // Guardar cambios
        await video.update();
        console.log(`✅ Video "${correctData.title}" corregido`);

        // Publicar
        await video.publish();
        console.log(`✅ Video "${correctData.title}" publicado`);
      }

      // 3. Buscar el director Ali Ali y asociar videos
      const directorResponse = await environment.getEntries({
        content_type: 'director',
        'fields.name': 'ALI ALI'
      });

      if (directorResponse.items.length > 0) {
        const director = directorResponse.items[0];
        
        // Crear referencias a los videos corregidos
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

        await director.publish();
        console.log('✅ Director Ali Ali publicado');
      }

      console.log('🎉 ¡Todos los videos de Ali Ali corregidos y asociados!');

    } catch (error) {
      console.error('❌ Error corrigiendo videos:', error);
      throw error;
    }
  }

  async verifyCorrection(): Promise<void> {
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
        console.log(`   - Videos asociados: ${director.fields.videos?.length || 0}`);
      }

      // Buscar videos
      const videoResponse = await environment.getEntries({
        content_type: 'directorVideo',
        'fields.id[match]': 'ali-ali-'
      });

      console.log(`📹 Videos de Ali Ali:`);
      videoResponse.items.forEach((video: any, index: number) => {
        console.log(`   ${index + 1}. ${video.fields.title['en-US']} (${video.fields.client['en-US']})`);
        console.log(`      - Vimeo ID: ${video.fields.vimeoId['en-US']}`);
        console.log(`      - Estado: ${video.sys.publishedAt ? 'Publicado' : 'Borrador'}`);
      });

    } catch (error) {
      console.error('Error verificando corrección:', error);
    }
  }
}

// Ejecutar el script
async function main() {
  const corrector = new AliAliVideoCorrector();
  
  console.log('🔍 Verificando estado actual...');
  await corrector.verifyCorrection();
  
  console.log('\n🚀 Corrigiendo videos...');
  await corrector.correctAliAliVideos();
  
  console.log('\n🔍 Verificando resultado final...');
  await corrector.verifyCorrection();
}

main().catch(console.error);
