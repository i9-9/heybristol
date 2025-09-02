const { createClient } = require('contentful-management');
require('dotenv').config({ path: '.env.local' });

const spaceId = process.env.CONTENTFUL_SPACE_ID || 'ii9zv0je6636';
const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

const client = createClient({
  accessToken: managementToken,
});

async function createAudioTrackContentType() {
  try {
    console.log('🔍 Obteniendo espacio...');
    const space = await client.getSpace(spaceId);
    console.log('✅ Espacio obtenido:', space.name);
    
    // Verificar si ya existe
    try {
      const existing = await space.getContentType('audioTrack');
      console.log('⚠️  Content type audioTrack ya existe');
      return existing;
    } catch (error) {
      console.log('📝 Content type no existe, creando...');
    }
    
    console.log('🎵 Creando content type AudioTrack...');
    
    // Crear el content type usando la API correcta
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
    
    console.log('📝 Content type creado, publicando...');
    await contentType.publish();
    console.log('✅ Content type AudioTrack creado y publicado exitosamente!');
    
    return contentType;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.sys?.id === 'VersionMismatch') {
      console.log('💡 Content type ya existe, intentando obtener...');
      try {
        const space = await client.getSpace(spaceId);
        const existing = await space.getContentType('audioTrack');
        console.log('✅ Content type existente encontrado:', existing.name);
        return existing;
      } catch (e) {
        console.error('❌ Error obteniendo content type existente:', e.message);
      }
    }
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Iniciando creación de content type AudioTrack...\n');
    
    await createAudioTrackContentType();
    
    console.log('\n✅ Content type AudioTrack configurado exitosamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('1. Ve a Contentful y verifica que el content type se creó');
    console.log('2. Crea archivos de audio en public/audio/');
    console.log('3. Ejecuta el script de migración de audio tracks');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
