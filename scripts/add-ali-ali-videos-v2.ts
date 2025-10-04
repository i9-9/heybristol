import { createClient } from 'contentful';
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

// Datos de Ali Ali desde newdirectors.md
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

class AliAliVideoUploader {
  private client: any;
  private managementClient: any;

  constructor() {
    // Cliente de lectura
    this.client = createClient({
      space: process.env.CONTENTFUL_SPACE_ID!,
      accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
    });

    // Cliente de gestión
    this.managementClient = createManagementClient({
      accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
    });
  }

  async addVideosToAliAli(): Promise<void> {
    try {
      console.log('🚀 Agregando videos a Ali Ali...');

      // 1. Buscar el director Ali Ali usando el cliente de lectura
      const aliAliDirector = await this.findAliAliDirector();
      if (!aliAliDirector) {
        throw new Error('Ali Ali no encontrado en Contentful');
      }

      console.log(`✅ Director Ali Ali encontrado: ${aliAliDirector.sys.id}`);

      // 2. Obtener el espacio y environment para gestión
      const space = await this.managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!);
      const environment = await space.getEnvironment('master');

      // 3. Crear todos los videos
      const videoEntries = [];
      for (const video of aliAliVideos) {
        const videoEntry = await this.createVideo(environment, video);
        videoEntries.push(videoEntry);
        console.log(`✅ Video "${video.title}" creado: ${videoEntry.sys.id}`);
      }

      // 4. Obtener la entrada del director para gestión
      const directorEntry = await environment.getEntry(aliAliDirector.sys.id);

      // 5. Actualizar el director con las referencias a los videos
      await this.updateDirectorWithVideos(directorEntry, videoEntries);
      console.log('✅ Director Ali Ali actualizado con referencias a videos');

      // 6. Publicar el director
      await directorEntry.publish();
      console.log('✅ Director Ali Ali publicado');

      // 7. Publicar todos los videos
      for (const videoEntry of videoEntries) {
        await videoEntry.publish();
        console.log(`✅ Video "${videoEntry.fields.title}" publicado`);
      }

      console.log('🎉 ¡Todos los videos de Ali Ali agregados exitosamente!');

    } catch (error) {
      console.error('❌ Error agregando videos a Ali Ali:', error);
      throw error;
    }
  }

  private async findAliAliDirector(): Promise<any> {
    const response = await this.client.getEntries({
      content_type: 'director',
      'fields.name': 'ALI ALI'
    });

    if (response.items.length === 0) {
      return null;
    }

    return response.items[0];
  }

  private async createVideo(space: any, video: AliAliVideo): Promise<any> {
    const entry = await space.createEntry('directorVideo', {
      fields: {
        id: {
          'en-US': `ali-ali-${video.order}`
        },
        title: {
          'en-US': video.title
        },
        client: {
          'en-US': video.client
        },
        vimeoId: {
          'en-US': video.vimeoId
        },
        thumbnailId: {
          'en-US': video.thumbnailId
        },
        order: {
          'en-US': video.order
        }
      }
    });

    return entry;
  }

  private async updateDirectorWithVideos(director: any, videoEntries: any[]): Promise<void> {
    const videoReferences = videoEntries.map(video => ({
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
  }

  async checkAliAliStatus(): Promise<void> {
    try {
      const aliAliDirector = await this.findAliAliDirector();
      
      if (aliAliDirector) {
        const videoCount = aliAliDirector.fields.videos?.length || 0;
        console.log(`📊 Ali Ali actualmente tiene ${videoCount} videos`);
        
        if (videoCount > 0) {
          console.log('Videos existentes:');
          aliAliDirector.fields.videos.forEach((video: any, index: number) => {
            console.log(`   ${index + 1}. ${video.fields.title} (${video.fields.client})`);
          });
        }
      } else {
        console.log('❌ Ali Ali no encontrado en Contentful');
      }
    } catch (error) {
      console.error('Error verificando estado de Ali Ali:', error);
    }
  }
}

// Ejecutar el script
async function main() {
  const uploader = new AliAliVideoUploader();
  
  console.log('🔍 Verificando estado actual de Ali Ali...');
  await uploader.checkAliAliStatus();
  
  console.log('\n🚀 Agregando videos a Ali Ali...');
  await uploader.addVideosToAliAli();
}

main().catch(console.error);
