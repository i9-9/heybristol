const { createClient } = require('contentful-management');
const path = require('path');

// Cargar variables de entorno de forma más robusta
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const spaceId = process.env.CONTENTFUL_SPACE_ID || 'ii9zv0je6636';
const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

if (!managementToken) {
  console.error('❌ CONTENTFUL_MANAGEMENT_TOKEN es requerido');
  process.exit(1);
}

const client = createClient({
  accessToken: managementToken,
});

async function createSampleEditorialVideos(space) {
  try {
    console.log('🎬 Creando editorial videos de ejemplo...');
    
    const environment = await space.getEnvironment('master');
    
    // Verificar que el content type existe
    try {
      await environment.getContentType('editorialVideo');
    } catch (error) {
      console.error('❌ Content type editorialVideo no existe. Ejecuta primero: node scripts/create-director-video-content-type.js');
      return;
    }
    
    // Crear videos de ejemplo editoriales
    const sampleVideos = [
      {
        id: 'editorial-video-1',
        title: 'Editorial Video 1',
        description: 'Primer video editorial para la sección de directors',
        order: 1
      },
      {
        id: 'editorial-video-2',
        title: 'Editorial Video 2',
        description: 'Segundo video editorial para la sección de directors',
        order: 2
      },
      {
        id: 'editorial-video-3',
        title: 'Editorial Video 3',
        description: 'Tercer video editorial para la sección de directors',
        order: 3
      }
    ];
    
    for (const videoData of sampleVideos) {
      try {
        // Verificar si ya existe
        const existing = await environment.getEntries({
          content_type: 'editorialVideo',
          'fields.id': videoData.id
        });
        
        if (existing.items.length > 0) {
          console.log(`⚠️  Editorial video "${videoData.title}" ya existe, saltando...`);
          continue;
        }
        
        // Crear la entrada
        const entry = await environment.createEntry('editorialVideo', {
          fields: {
            id: {
              'en-US': videoData.id
            },
            title: {
              'en-US': videoData.title
            },
            description: {
              'en-US': videoData.description
            },
            order: {
              'en-US': videoData.order
            }
            // Nota: Los videos (webmVideo, mp4Video, mobileVideo) se deben configurar manualmente en Contentful
            // ya que requieren subir los archivos de video
          }
        });
        
        await entry.publish();
        console.log(`✅ Editorial video "${videoData.title}" creado (ID: ${entry.sys.id})`);
        
      } catch (error) {
        console.error(`❌ Error creando editorial video "${videoData.title}":`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Iniciando creación de editorial videos de ejemplo...\n');
    
    const space = await client.getSpace(spaceId);
    await createSampleEditorialVideos(space);
    
    console.log('\n✅ Editorial videos de ejemplo creados exitosamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('1. Ve a Contentful Dashboard → Content → Editorial Video');
    console.log('2. Edita cada video y sube archivos de video');
    console.log('3. Los archivos de video deben estar en formato MP4, WebM, o MOV');
    console.log('4. Una vez subidos, los videos estarán disponibles en tu sección de directors');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
