const { createClient } = require('contentful-management');
require('dotenv').config({ path: '.env.local' });

const spaceId = process.env.CONTENTFUL_SPACE_ID || process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN || process.env.CONTENTFUL_ACCESS_TOKEN;

if (!spaceId || !accessToken) {
  console.error('❌ Error: Se requieren las variables de entorno CONTENTFUL_SPACE_ID y CONTENTFUL_MANAGEMENT_TOKEN');
  process.exit(1);
}

const client = createClient({
  accessToken: accessToken,
});

async function addOrderField() {
  try {
    console.log('🚀 Iniciando proceso para agregar campo "order"...');
    
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment('master');
    
    // Content types que necesitan el campo order
    const contentTypesToUpdate = [
      'director',
      'directorVideo', 
      'heroVideo',
      'editorialVideo'
    ];
    
    for (const contentTypeId of contentTypesToUpdate) {
      try {
        console.log(`\n📝 Procesando content type: ${contentTypeId}`);
        
        const contentType = await environment.getContentType(contentTypeId);
        
        // Verificar si el campo order ya existe
        const orderFieldExists = contentType.fields.some(field => field.id === 'order');
        
        if (orderFieldExists) {
          console.log(`✅ El campo "order" ya existe en ${contentTypeId}`);
          continue;
        }
        
        // Agregar el campo order
        contentType.fields.push({
          id: 'order',
          name: 'Order',
          type: 'Integer',
          required: false,
          localized: false,
          validations: [
            {
              range: {
                min: 1
              }
            }
          ],
          disabled: false,
          omitted: false
        });
        
        // Actualizar el content type
        const updatedContentType = await contentType.update();
        console.log(`✅ Campo "order" agregado exitosamente a ${contentTypeId}`);
        
        // Publicar el content type
        await updatedContentType.publish();
        console.log(`📢 Content type ${contentTypeId} publicado exitosamente`);
        
      } catch (error) {
        if (error.sys?.id === 'NotFound') {
          console.log(`⚠️  Content type ${contentTypeId} no encontrado, saltando...`);
        } else {
          console.error(`❌ Error procesando ${contentTypeId}:`, error.message);
        }
      }
    }
    
    console.log('\n🎉 Proceso completado!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Ve a Contentful y asigna valores de orden a tus entradas');
    console.log('2. Ejecuta: npm run update-contentful-queries');
    console.log('3. Despliega tu aplicación');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    process.exit(1);
  }
}

addOrderField();
