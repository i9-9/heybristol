const { createClient } = require('contentful-management');
const path = require('path');

// Cargar variables de entorno de forma más robusta
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

// Usar variables de entorno con dotenv
const spaceId = process.env.CONTENTFUL_SPACE_ID || 'ii9zv0je6636';
const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

console.log('🔍 Verificando variables de entorno...');
console.log('CONTENTFUL_SPACE_ID:', spaceId ? '✅ Configurado' : '❌ No configurado');
console.log('CONTENTFUL_MANAGEMENT_TOKEN:', managementToken ? '✅ Configurado' : '❌ No configurado');

// Debug: mostrar todas las variables que empiezan con CONTENTFUL
console.log('\n🔍 Variables CONTENTFUL disponibles:');
Object.keys(process.env)
  .filter(key => key.startsWith('CONTENTFUL'))
  .forEach(key => {
    const value = process.env[key];
    console.log(`${key}: ${value ? '✅ ' + (value.length > 20 ? value.substring(0, 20) + '...' : value) : '❌ No configurado'}`);
  });

if (!managementToken) {
  console.error('❌ CONTENTFUL_MANAGEMENT_TOKEN es requerido');
  console.error('💡 Configura la variable: export CONTENTFUL_MANAGEMENT_TOKEN=tu_token');
  console.error('💡 O ejecuta: CONTENTFUL_MANAGEMENT_TOKEN=tu_token node scripts/create-audio-content-type.js');
  process.exit(1);
}

const client = createClient({
  accessToken: managementToken,
});

async function createAudioTrackContentType(environment) {
  try {
    console.log('🎵 Creando content type AudioTrack...');
    
    // Verificar si ya existe
    try {
      const existing = await environment.getContentType('audioTrack');
      console.log('⚠️  Content type audioTrack ya existe, actualizando...');
      return existing;
    } catch (error) {
      // No existe, continuar con la creación
    }
    
    // Crear el content type usando la API correcta para v11+
    const contentType = await environment.createContentTypeWithId('audioTrack', {
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
        }
      ]
    });
    
    await contentType.publish();
    console.log('✅ Content type AudioTrack creado y publicado');
    
    return contentType;
    
  } catch (error) {
    console.error('❌ Error detallado:', error.message);
    if (error.sys?.id === 'VersionMismatch') {
      console.log('⚠️  Content type ya existe, actualizando...');
      const existingContentType = await environment.getContentType('audioTrack');
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
    const environment = await space.getEnvironment('master');
    await createAudioTrackContentType(environment);
    
    console.log('\n✅ Content type AudioTrack configurado exitosamente!');
    console.log('\n📝 Próximo paso: Crear entradas de audio tracks');
    console.log('💡 Ejecuta: node scripts/create-sample-audio-tracks.js');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
