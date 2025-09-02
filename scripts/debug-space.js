const { createClient } = require('contentful-management');
require('dotenv').config({ path: '.env.local' });

const spaceId = process.env.CONTENTFUL_SPACE_ID || 'ii9zv0je6636';
const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

const client = createClient({
  accessToken: managementToken,
});

async function debugSpace() {
  try {
    console.log('🔍 Obteniendo espacio...');
    const space = await client.getSpace(spaceId);
    console.log('✅ Espacio obtenido:', space.name);
    
    console.log('\n📋 Métodos disponibles en space:');
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(space))
      .filter(name => typeof space[name] === 'function');
    
    methods.forEach(method => {
      console.log(`  - ${method}`);
    });
    
    console.log('\n🔍 Verificando propiedades del espacio:');
    console.log('  - sys.id:', space.sys.id);
    console.log('  - name:', space.name);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugSpace();
