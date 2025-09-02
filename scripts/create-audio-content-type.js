const { createClient } = require('contentful-management');
require('dotenv').config({ path: '.env.local' });

// Usar variables de entorno con dotenv
const spaceId = process.env.CONTENTFUL_SPACE_ID || 'ii9zv0je6636';
const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

console.log('🔍 Verificando variables de entorno...');
console.log('CONTENTFUL_SPACE_ID:', spaceId ? '✅ Configurado' : '❌ No configurado');
console.log('CONTENTFUL_MANAGEMENT_TOKEN:', managementToken ? '✅ Configurado' : '❌ No configurado');

if (!managementToken) {
  console.error('❌ CONTENTFUL_MANAGEMENT_TOKEN es requerido');
  console.error('💡 Configura la variable: export CONTENTFUL_MANAGEMENT_TOKEN=tu_token');
  console.error('💡 O ejecuta: CONTENTFUL_MANAGEMENT_TOKEN=tu_token node scripts/create-audio-content-type.js');
  process.exit(1);
}

const client = createClient({
  accessToken: managementToken,
});

async function createAudioTrackContentType(space) {
  try {
    console.log('🎵 Creando content type AudioTrack...');
    
    // Verificar si ya existe
    try {
      const existing = await space.getContentType('audioTrack');
      console.log('⚠️  Content type audioTrack ya existe, actualizando...');
      return existing;
    } catch (error) {
      // No existe, continuar con la creación
    }
    
    const contentType = await space.createContentType({
      sys: {
        id: 'audioTrack'
      },
      name: 'Audio Track',
      displayField: 'title',
      description: 'Tracks de audio para el hero',
      fields: [
        {
          id: 'id',
          name: 'ID',
          type: 'Symbol',
          required: true,
          validations: [
            {
              unique: true
            }
          ]
        },
        {
          id: 'title',
          name: 'Título',
          type: 'Symbol',
          required: true
        },
        {
          id: 'description',
          name: 'Descripción',
          type: 'Text',
          required: false
        },
        {
          id: 'audioFile',
          name: 'Archivo de Audio',
          type: 'Link',
          linkType: 'Asset',
          required: true,
          validations: [
            {
              linkMimetypeGroup: ['audio']
            }
          ]
        },
        {
          id: 'volume',
          name: 'Volumen (0-1)',
          type: 'Number',
          required: false,
          validations: [
            {
              range: {
                min: 0,
                max: 1
              }
            }
          ]
        },
        {
          id: 'loop',
          name: 'Loop',
          type: 'Boolean',
          required: false
        },
        {
          id: 'fadeIn',
          name: 'Fade In (segundos)',
          type: 'Number',
          required: false,
          validations: [
            {
              range: {
                min: 0,
                max: 10
              }
            }
          ]
        },
        {
          id: 'fadeOut',
          name: 'Fade Out (segundos)',
          type: 'Number',
          required: false,
          validations: [
            {
              range: {
                min: 0,
                max: 10
              }
            }
          ]
        },
        {
          id: 'order',
          name: 'Orden',
          type: 'Integer',
          required: false
        }
      ]
    });
    
    await contentType.publish();
    console.log('✅ Content type AudioTrack creado y publicado');
    
    return contentType;
    
  } catch (error) {
    if (error.sys?.id === 'VersionMismatch') {
      console.log('⚠️  Content type ya existe, actualizando...');
      const existingContentType = await space.getContentType('audioTrack');
      await existingContentType.publish();
      console.log('✅ Content type AudioTrack actualizado');
      return existingContentType;
    }
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Iniciando creación de content type AudioTrack...\n');
    
    const space = await client.getSpace(spaceId);
    await createAudioTrackContentType(space);
    
    console.log('\n✅ Content type AudioTrack configurado exitosamente!');
    console.log('\n📝 Próximo paso: Crear entradas de audio tracks');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
