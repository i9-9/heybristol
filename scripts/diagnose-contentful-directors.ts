import { createClient } from 'contentful';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

class ContentfulDiagnostic {
  private client: any;

  constructor() {
    this.client = createClient({
      space: process.env.CONTENTFUL_SPACE_ID || process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!,
      accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN!,
    });
  }

  async diagnoseDirectors(): Promise<void> {
    try {
      console.log('🔍 DIAGNÓSTICO DE CONTENTFUL - DIRECTORES\n');

      // Obtener todos los directores
      const directorsResponse = await this.client.getEntries({
        content_type: 'director',
        include: 2
      });

      console.log(`📊 Total de directores en Contentful: ${directorsResponse.items.length}\n`);

      // Listar todos los directores con sus videos
      for (const director of directorsResponse.items) {
        const fields = director.fields;
        const videos = fields.videos || [];
        
        console.log(`🎬 DIRECTOR: ${fields.name}`);
        console.log(`   Slug: ${fields.slug}`);
        console.log(`   Order: ${fields.order}`);
        console.log(`   Videos: ${videos.length}`);
        
        if (videos.length > 0) {
          videos.forEach((video: any, index: number) => {
            console.log(`     ${index + 1}. ${video.fields.title} (${video.fields.client})`);
            console.log(`        Vimeo ID: ${video.fields.vimeoId}`);
            console.log(`        Thumbnail ID: ${video.fields.thumbnailId}`);
            console.log(`        Order: ${video.fields.order}`);
          });
        }
        console.log('');
      }

      // Verificar específicamente Ali Ali
      console.log('🔍 VERIFICACIÓN ESPECÍFICA DE ALI ALI:');
      const aliAliDirectors = directorsResponse.items.filter((director: any) => 
        director.fields.name.toLowerCase().includes('ali')
      );

      if (aliAliDirectors.length > 0) {
        console.log(`✅ Ali Ali encontrado en Contentful:`);
        aliAliDirectors.forEach((director: any) => {
          console.log(`   - Nombre: ${director.fields.name}`);
          console.log(`   - Slug: ${director.fields.slug}`);
          console.log(`   - Videos: ${director.fields.videos?.length || 0}`);
        });
      } else {
        console.log('❌ Ali Ali NO encontrado en Contentful');
      }

    } catch (error) {
      console.error('❌ Error en diagnóstico:', error);
    }
  }

  async compareWithMarkdown(): Promise<void> {
    console.log('\n📋 COMPARACIÓN CON ARCHIVO MARKDOWN:\n');

    // Datos esperados de Ali Ali desde newdirectors.md
    const expectedAliAliVideos = [
      { title: "Byda Creative City - An artful life", client: "Byda Creative City", vimeoId: "1122932388", order: 1 },
      { title: "Heineken - The Cleaners", client: "Heineken", vimeoId: "1122933609", order: 2 },
      { title: "Rolling Stone - Rockin' Mamas", client: "Rolling Stone", vimeoId: "1122936607", order: 3 },
      { title: "Lavazza - Alexa", client: "Lavazza", vimeoId: "1122935465", order: 4 },
      { title: "Panda Cheese - Never say no to Panda", client: "Panda Cheese", vimeoId: "1122936014", order: 5 },
      { title: "Heineken - The Night is Young", client: "Heineken", vimeoId: "1122934070", order: 6 },
      { title: "Denner - The Good life", client: "Denner", vimeoId: "1122933135", order: 7 },
      { title: "Diesel - Be a follower", client: "Diesel", vimeoId: "1124330699", order: 8 }
    ];

    console.log('📝 Videos esperados de Ali Ali (desde newdirectors.md):');
    expectedAliAliVideos.forEach((video, index) => {
      console.log(`   ${index + 1}. ${video.title} (${video.client}) - Vimeo: ${video.vimeoId}`);
    });

    // Verificar si Ali Ali existe en Contentful
    try {
      const aliAliResponse = await this.client.getEntries({
        content_type: 'director',
        'fields.name': 'Ali Ali'
      });

      if (aliAliResponse.items.length > 0) {
        const aliAli = aliAliResponse.items[0];
        const actualVideos = aliAli.fields.videos || [];
        
        console.log(`\n📊 Videos actuales de Ali Ali en Contentful: ${actualVideos.length}`);
        
        if (actualVideos.length > 0) {
          actualVideos.forEach((video: any, index: number) => {
            console.log(`   ${index + 1}. ${video.fields.title} (${video.fields.client}) - Vimeo: ${video.fields.vimeoId}`);
          });
        }

        // Comparar
        console.log('\n🔍 ANÁLISIS DE DIFERENCIAS:');
        if (actualVideos.length === expectedAliAliVideos.length) {
          console.log('✅ Misma cantidad de videos');
        } else {
          console.log(`⚠️  Diferencia en cantidad: Esperados ${expectedAliAliVideos.length}, Actuales ${actualVideos.length}`);
        }

        // Verificar videos específicos
        const actualTitles = actualVideos.map((v: any) => v.fields.title);
        const expectedTitles = expectedAliAliVideos.map(v => v.title);
        
        const missingVideos = expectedTitles.filter(title => !actualTitles.includes(title));
        const extraVideos = actualTitles.filter(title => !expectedTitles.includes(title));

        if (missingVideos.length > 0) {
          console.log('\n❌ Videos faltantes en Contentful:');
          missingVideos.forEach(title => console.log(`   - ${title}`));
        }

        if (extraVideos.length > 0) {
          console.log('\n➕ Videos extra en Contentful:');
          extraVideos.forEach(title => console.log(`   - ${title}`));
        }

        if (missingVideos.length === 0 && extraVideos.length === 0) {
          console.log('\n✅ Todos los videos coinciden perfectamente');
        }

      } else {
        console.log('\n❌ Ali Ali no existe en Contentful - necesita ser creado');
      }

    } catch (error) {
      console.error('❌ Error comparando con Contentful:', error);
    }
  }

  async getContentfulStats(): Promise<void> {
    try {
      console.log('\n📊 ESTADÍSTICAS GENERALES DE CONTENTFUL:\n');

      // Contar directores
      const directorsResponse = await this.client.getEntries({
        content_type: 'director'
      });

      // Contar videos
      const videosResponse = await this.client.getEntries({
        content_type: 'directorVideo'
      });

      console.log(`📈 Total de directores: ${directorsResponse.items.length}`);
      console.log(`🎬 Total de videos: ${videosResponse.items.length}`);

      // Videos por director
      let totalVideosInDirectors = 0;
      directorsResponse.items.forEach((director: any) => {
        const videoCount = director.fields.videos?.length || 0;
        totalVideosInDirectors += videoCount;
      });

      console.log(`🔗 Videos asociados a directores: ${totalVideosInDirectors}`);
      console.log(`📊 Videos huérfanos: ${videosResponse.items.length - totalVideosInDirectors}`);

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
    }
  }
}

// Ejecutar diagnóstico completo
async function main() {
  const diagnostic = new ContentfulDiagnostic();
  
  await diagnostic.diagnoseDirectors();
  await diagnostic.compareWithMarkdown();
  await diagnostic.getContentfulStats();
}

main().catch(console.error);