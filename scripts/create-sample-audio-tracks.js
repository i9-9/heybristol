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

async function createSampleAudioTracks(space) {
  try {
    console.log('🎵 Creando audio tracks de ejemplo...');
    
    // Verificar que el content type existe
    try {
      await space.getContentType('audioTrack');
    } catch (error) {
      console.error('❌ Content type audioTrack no existe. Ejecuta primero: node scripts/create-audio-content-type.js');
      return;
    }
    
    // Crear audio tracks de ejemplo
    const sampleTracks = [
      {
        id: 'ambient-music-1',
        title: 'Ambient Music 1'
      },
      {
        id: 'cinematic-score-1',
        title: 'Cinematic Score 1'
      },
      {
        id: 'electronic-beat-1',
        title: 'Electronic Beat 1'
      }
    ];
    
    for (const trackData of sampleTracks) {
      try {
        // Verificar si ya existe
        const existing = await space.getEntries({
          content_type: 'audioTrack',
          'fields.id': trackData.id
        });
        
        if (existing.items.length > 0) {
          console.log(`⚠️  Audio track "${trackData.title}" ya existe, saltando...`);
          continue;
        }
        
        // Crear la entrada
        const entry = await space.createEntry('audioTrack', {
          fields: {
            id: {
              'en-US': trackData.id
            },
            title: {
              'en-US': trackData.title
            }
            // Nota: audioFile se debe configurar manualmente en Contentful
            // ya que requiere subir el archivo de audio
          }
        });
        
        await entry.publish();
        console.log(`✅ Audio track "${trackData.title}" creado (ID: ${entry.sys.id})`);
        
      } catch (error) {
        console.error(`❌ Error creando audio track "${trackData.title}":`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Iniciando creación de audio tracks de ejemplo...\n');
    
    const space = await client.getSpace(spaceId);
    await createSampleAudioTracks(space);
    
    console.log('\n✅ Audio tracks de ejemplo creados exitosamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('1. Ve a Contentful Dashboard → Content → Audio Track');
    console.log('2. Edita cada audio track y sube un archivo de audio');
    console.log('3. Los archivos de audio deben estar en formato MP3, WAV, o M4A');
    console.log('4. Una vez subidos, los audio tracks estarán disponibles en tu sitio');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
