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

// Datos correctos de Ali Ali - solo el nombre del proyecto en el título
const aliAliVideos: AliAliVideo[] = [
  {
    title: "An artful life",
    client: "Byda Creative City",
    vimeoId: "1122932388",
    thumbnailId: "1122946283",
    order: 1
  },
  {
    title: "The Cleaners",
    client: "Heineken",
    vimeoId: "1122933609",
    thumbnailId: "1122946774",
    order: 2
  },
  {
    title: "Rockin' Mamas",
    client: "Rolling Stone",
    vimeoId: "1122936607",
    thumbnailId: "1122947921",
    order: 3
  },
  {
    title: "Alexa",
    client: "Lavazza",
    vimeoId: "1122935465",
    thumbnailId: "1122947563",
    order: 4
  },
  {
    title: "Never say no to Panda",
    client: "Panda Cheese",
    vimeoId: "1122936014",
    thumbnailId: "1122947743",
    order: 5
  },
  {
    title: "The Night is Young",
    client: "Heineken",
    vimeoId: "1122934070",
    thumbnailId: "1122947356",
    order: 6
  },
  {
    title: "The Good life",
    client: "Denner",
    vimeoId: "1122933135",
    thumbnailId: "1122946556",
    order: 7
  },
  {
    title: "Be a follower",
    client: "Diesel",
    vimeoId: "1124330699",
    thumbnailId: "1124333771",
    order: 8
  }
];

class AliAliTitleCorrector {
  private managementClient: any;

  constructor() {
    this.managementClient = createManagementClient({
      accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
    });
  }

  async correctVideoTitles(): Promise<void> {
    try {
      console.log('🚀 Corrigiendo títulos de videos de Ali Ali...');

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

        console.log(`🔧 Corrigiendo video ${i + 1}:`);
        console.log(`   - Título actual: "${video.fields.title['en-US']}"`);
        console.log(`   - Cliente actual: "${video.fields.client['en-US']}"`);
        console.log(`   - Título nuevo: "${correctData.title}"`);
        console.log(`   - Cliente nuevo: "${correctData.client}"`);

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

      console.log('🎉 ¡Todos los títulos de videos corregidos!');

    } catch (error) {
      console.error('❌ Error corrigiendo títulos:', error);
      throw error;
    }
  }

  async verifyTitles(): Promise<void> {
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
        console.log(`   ${index + 1}. Título: "${video.fields.title['en-US']}"`);
        console.log(`      Cliente: "${video.fields.client['en-US']}"`);
        console.log(`      Lo que se mostrará: "${video.fields.client['en-US']} | ${video.fields.title['en-US']}"`);
        console.log('');
      });

    } catch (error) {
      console.error('Error verificando títulos:', error);
    }
  }
}

// Ejecutar el script
async function main() {
  const corrector = new AliAliTitleCorrector();
  
  console.log('🔍 Verificando títulos actuales...');
  await corrector.verifyTitles();
  
  console.log('\n🚀 Corrigiendo títulos...');
  await corrector.correctVideoTitles();
  
  console.log('\n🔍 Verificando resultado final...');
  await corrector.verifyTitles();
}

main().catch(console.error);
