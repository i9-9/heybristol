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

if (!managementToken) {
  console.error('❌ CONTENTFUL_MANAGEMENT_TOKEN es requerido');
  process.exit(1);
}

const client = createClient({
  accessToken: managementToken,
});

async function createEditorialVideoContentType(environment) {
  try {
    console.log('🎬 Creando content type EditorialVideo...');
    
    // Verificar si ya existe
    try {
      const existing = await environment.getContentType('editorialVideo');
      console.log('⚠️  Content type editorialVideo ya existe, actualizando...');
      return existing;
    } catch (error) {
      // No existe, continuar con la creación
    }
    
    // Crear el content type usando la API correcta para v11+
    const contentType = await environment.createContentTypeWithId('editorialVideo', {
      name: 'Editorial Video',
      displayField: 'title',
      description: 'Videos editoriales para la sección de directors',
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
          id: 'webmVideo',
          name: 'Video WebM',
          type: 'Link',
          linkType: 'Asset',
          required: false,
          validations: [
            {
              linkMimetypeGroup: ['video']
            }
          ]
        },
        {
          id: 'mp4Video',
          name: 'Video MP4',
          type: 'Link',
          linkType: 'Asset',
          required: false,
          validations: [
            {
              linkMimetypeGroup: ['video']
            }
          ]
        },
        {
          id: 'mobileVideo',
          name: 'Video Móvil',
          type: 'Link',
          linkType: 'Asset',
          required: false,
          validations: [
            {
              linkMimetypeGroup: ['video']
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
    console.log('✅ Content type EditorialVideo creado y publicado');
    
    return contentType;
    
  } catch (error) {
    console.error('❌ Error detallado:', error.message);
    if (error.sys?.id === 'VersionMismatch') {
      console.log('⚠️  Content type ya existe, actualizando...');
      const existingContentType = await environment.getContentType('editorialVideo');
      await existingContentType.publish();
      console.log('✅ Content type EditorialVideo actualizado');
      return existingContentType;
    }
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Iniciando creación de content type EditorialVideo...\n');
    
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment('master');
    await createEditorialVideoContentType(environment);
    
    console.log('\n✅ Content type EditorialVideo configurado exitosamente!');
    console.log('\n📝 Próximo paso: Crear entradas de editorial videos');
    console.log('💡 Ejecuta: node scripts/create-sample-editorial-videos.js');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
