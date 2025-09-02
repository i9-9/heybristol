const { createClient } = require('contentful-management');
require('dotenv').config({ path: '.env.local' });

const spaceId = process.env.CONTENTFUL_SPACE_ID || 'ii9zv0je6636';
const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

const client = createClient({
  accessToken: managementToken,
});

async function testAPI() {
  try {
    console.log('🔍 Probando API de Contentful Management...');
    
    const space = await client.getSpace(spaceId);
    console.log('✅ Espacio obtenido:', space.name);
    
    // Listar content types existentes
    console.log('\n📋 Content types existentes:');
    const contentTypes = await space.getContentTypes();
    contentTypes.items.forEach(ct => {
      console.log(`  - ${ct.sys.id}: ${ct.name}`);
    });
    
    // Probar crear un content type simple
    console.log('\n🎵 Intentando crear content type AudioTrack...');
    
    const contentType = await space.createContentType({
      sys: {
        id: 'audioTrack'
      },
      name: 'Audio Track',
      displayField: 'title',
      description: 'Tracks de audio para el hero',
      fields: [
        {
          id: 'title',
          name: 'Título',
          type: 'Symbol',
          required: true
        }
      ]
    });
    
    await contentType.publish();
    console.log('✅ Content type AudioTrack creado y publicado!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.sys?.id === 'VersionMismatch') {
      console.log('💡 Content type ya existe, intentando obtener...');
      try {
        const space = await client.getSpace(spaceId);
        const existing = await space.getContentType('audioTrack');
        console.log('✅ Content type existente encontrado:', existing.name);
      } catch (e) {
        console.error('❌ Error obteniendo content type existente:', e.message);
      }
    }
  }
}

testAPI();
