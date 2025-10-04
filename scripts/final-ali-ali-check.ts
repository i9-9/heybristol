import { createClient as createManagementClient } from 'contentful-management';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

class AliAliFinalCheck {
  private managementClient: any;

  constructor() {
    this.managementClient = createManagementClient({
      accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
    });
  }

  async checkAliAliFinalStatus(): Promise<void> {
    try {
      console.log('🔍 VERIFICACIÓN FINAL DE ALI ALI...\n');

      const space = await this.managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!);
      const environment = await space.getEnvironment('master');

      // 1. Buscar el director Ali Ali
      const directorResponse = await environment.getEntries({
        content_type: 'director',
        'fields.name': 'ALI ALI'
      });

      if (directorResponse.items.length === 0) {
        console.log('❌ Ali Ali no encontrado');
        return;
      }

      const director = directorResponse.items[0];
      console.log(`📊 DIRECTOR ALI ALI:`);
      console.log(`   - ID: ${director.sys.id}`);
      console.log(`   - Nombre: ${director.fields.name}`);
      console.log(`   - Slug: ${director.fields.slug}`);
      console.log(`   - Estado: ${director.sys.publishedAt ? 'Publicado' : 'Borrador'}`);
      console.log(`   - Versión: ${director.sys.version}`);
      
      // Verificar videos asociados
      if (director.fields.videos && director.fields.videos.length > 0) {
        console.log(`   - Videos asociados: ${director.fields.videos.length}`);
        console.log('   - Lista de videos:');
        director.fields.videos.forEach((videoRef: any, index: number) => {
          console.log(`     ${index + 1}. ID: ${videoRef.sys.id}`);
        });
      } else {
        console.log(`   - Videos asociados: 0`);
      }

      // 2. Buscar videos de Ali Ali por separado
      const videoResponse = await environment.getEntries({
        content_type: 'directorVideo',
        'fields.id[match]': 'ali-ali-'
      });

      console.log(`\n📹 VIDEOS DE ALI ALI ENCONTRADOS: ${videoResponse.items.length}`);
      videoResponse.items.forEach((video: any, index: number) => {
        console.log(`   ${index + 1}. ${video.fields.title}`);
        console.log(`      - ID: ${video.sys.id}`);
        console.log(`      - Cliente: ${video.fields.client}`);
        console.log(`      - Vimeo ID: ${video.fields.vimeoId}`);
        console.log(`      - Estado: ${video.sys.publishedAt ? 'Publicado' : 'Borrador'}`);
        console.log(`      - Versión: ${video.sys.version}`);
      });

      // 3. Verificar si los videos están asociados correctamente
      console.log(`\n🔗 VERIFICACIÓN DE ASOCIACIÓN:`);
      if (director.fields.videos && director.fields.videos.length > 0) {
        const associatedVideoIds = director.fields.videos.map((ref: any) => ref.sys.id);
        const foundVideoIds = videoResponse.items.map((video: any) => video.sys.id);
        
        console.log(`   - Videos asociados al director: ${associatedVideoIds.length}`);
        console.log(`   - Videos encontrados por búsqueda: ${foundVideoIds.length}`);
        
        const missingAssociations = foundVideoIds.filter((id: string) => !associatedVideoIds.includes(id));
        const extraAssociations = associatedVideoIds.filter((id: string) => !foundVideoIds.includes(id));
        
        if (missingAssociations.length > 0) {
          console.log(`   - Videos sin asociar: ${missingAssociations.length}`);
          missingAssociations.forEach((id: string) => console.log(`     - ${id}`));
        }
        
        if (extraAssociations.length > 0) {
          console.log(`   - Asociaciones extra: ${extraAssociations.length}`);
          extraAssociations.forEach((id: string) => console.log(`     - ${id}`));
        }
        
        if (missingAssociations.length === 0 && extraAssociations.length === 0) {
          console.log(`   ✅ Todos los videos están correctamente asociados`);
        }
      } else {
        console.log(`   ❌ No hay videos asociados al director`);
      }

    } catch (error) {
      console.error('❌ Error en verificación:', error);
    }
  }
}

// Ejecutar el script
async function main() {
  const checker = new AliAliFinalCheck();
  await checker.checkAliAliFinalStatus();
}

main().catch(console.error);
