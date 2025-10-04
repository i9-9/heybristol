import { createClient } from 'contentful';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

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

class AliAliUploader {
  private client: any;

  constructor() {
    this.client = createClient({
      space: process.env.CONTENTFUL_SPACE_ID || process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!,
      accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN!,
    });
  }

  async uploadAliAli(): Promise<void> {
    try {
      console.log('🚀 Iniciando subida de Ali Ali...');

      // 1. Crear el director Ali Ali
      const directorEntry = await this.createDirector();
      console.log(`✅ Director Ali Ali creado: ${directorEntry.sys.id}`);

      // 2. Crear todos los videos
      const videoEntries = [];
      for (const video of aliAliVideos) {
        const videoEntry = await this.createVideo(video);
        videoEntries.push(videoEntry);
        console.log(`✅ Video "${video.title}" creado: ${videoEntry.sys.id}`);
      }

      // 3. Actualizar el director con las referencias a los videos
      await this.updateDirectorWithVideos(directorEntry.sys.id, videoEntries);
      console.log('✅ Director actualizado con referencias a videos');

      // 4. Publicar el director
      await this.publishEntry(directorEntry);
      console.log('✅ Director publicado');

      // 5. Publicar todos los videos
      for (const videoEntry of videoEntries) {
        await this.publishEntry(videoEntry);
        console.log(`✅ Video "${videoEntry.fields.title}" publicado`);
      }

      console.log('🎉 ¡Ali Ali y todos sus videos subidos exitosamente!');

    } catch (error) {
      console.error('❌ Error subiendo Ali Ali:', error);
      throw error;
    }
  }

  private async createDirector(): Promise<any> {
    const entry = await this.client.createEntry('director', {
      fields: {
        name: {
          'en-US': 'Ali Ali'
        },
        slug: {
          'en-US': 'ali-ali'
        },
        order: {
          'en-US': 1 // Ajustar según el orden deseado
        },
        videos: {
          'en-US': [] // Se llenará después
        }
      }
    });

    return entry;
  }

  private async createVideo(video: AliAliVideo): Promise<any> {
    const entry = await this.client.createEntry('directorVideo', {
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

  private async updateDirectorWithVideos(directorId: string, videoEntries: any[]): Promise<void> {
    const videoReferences = videoEntries.map(video => ({
      sys: {
        type: 'Link',
        linkType: 'Entry',
        id: video.sys.id
      }
    }));

    await this.client.updateEntry(directorId, {
      fields: {
        videos: {
          'en-US': videoReferences
        }
      }
    });
  }

  private async publishEntry(entry: any): Promise<void> {
    await this.client.publishEntry(entry);
  }

  async checkExistingAliAli(): Promise<void> {
    try {
      const response = await this.client.getEntries({
        content_type: 'director',
        'fields.name': 'Ali Ali'
      });

      if (response.items.length > 0) {
        console.log('⚠️  Ali Ali ya existe en Contentful:');
        response.items.forEach((item: any) => {
          console.log(`- ID: ${item.sys.id}, Slug: ${item.fields.slug}, Videos: ${item.fields.videos?.length || 0}`);
        });
      } else {
        console.log('✅ Ali Ali no existe en Contentful, se puede crear');
      }
    } catch (error) {
      console.error('Error verificando Ali Ali existente:', error);
    }
  }
}

// Ejecutar el script
async function main() {
  const uploader = new AliAliUploader();
  
  console.log('🔍 Verificando si Ali Ali ya existe...');
  await uploader.checkExistingAliAli();
  
  console.log('\n🚀 Subiendo Ali Ali y sus videos...');
  await uploader.uploadAliAli();
}

main().catch(console.error);
