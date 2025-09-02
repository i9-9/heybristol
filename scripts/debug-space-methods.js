const { createClient } = require('contentful-management');
require('dotenv').config({ path: '.env.local' });

const spaceId = process.env.CONTENTFUL_SPACE_ID || 'ii9zv0je6636';
const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

const client = createClient({
  accessToken: managementToken,
});

async function debugSpaceMethods() {
  try {
    console.log('🔍 Obteniendo espacio...');
    const space = await client.getSpace(spaceId);
    
    console.log('📋 Métodos disponibles en space:');
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(space))
      .filter(name => typeof space[name] === 'function' && name.includes('ContentType'));
    
    methods.forEach(method => {
      console.log(`  - ${method}`);
    });
    
    console.log('\n🔍 Verificando si existe content type audioTrack...');
    try {
      const existing = await space.getContentType('audioTrack');
      console.log('✅ Content type audioTrack ya existe');
    } catch (error) {
      console.log('❌ Content type audioTrack no existe:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugSpaceMethods();
