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

// Orden de directores según lo especificado
const directorOrder = {
  'lemon': 1,
  'luciano-urbani': 2,
  'ivan-jurado': 3,
  'paloma-rincon': 4,
  'china-pequenino': 5,
  'tigre-escobar': 6
};

// Datos de videos con orden (solo algunos ejemplos, puedes expandir)
const videoOrders = {
  'lemon': [
    { id: 'lemon-rexona-1', order: 1 },
    { id: 'lemon-pepsodent-2', order: 2 },
    { id: 'lemon-pepsi-3', order: 3 },
    { id: 'lemon-lavirginia-4', order: 4 },
    { id: 'lemon-uber-5', order: 5 },
    { id: 'lemon-sadia-6', order: 6 },
    { id: 'lemon-movistar-7', order: 7 },
    { id: 'lemon-sprite-8', order: 8 },
    { id: 'lemon-h2o-9', order: 9 },
    { id: 'lemon-signal-10', order: 10 },
    { id: 'lemon-panamericanos-11', order: 11 },
    { id: 'lemon-oldspice-12', order: 12 },
    { id: 'lemon-zonajobs-13', order: 13 },
    { id: 'lemon-axe-14', order: 14 }
  ],
  'luciano-urbani': [
    { id: 'luciano-urbani-dubai-1', order: 1 },
    { id: 'luciano-urbani-toyota-2', order: 2 },
    { id: 'luciano-urbani-sprite-3', order: 3 },
    { id: 'luciano-urbani-kfc-4', order: 4 },
    { id: 'luciano-urbani-millerlite-5', order: 5 },
    { id: 'luciano-urbani-ford-6', order: 6 }
  ],
  'ivan-jurado': [
    { id: 'ivan-jurado-ag1-1', order: 1 },
    { id: 'ivan-jurado-valneva-2', order: 2 },
    { id: 'ivan-jurado-decathlon-3', order: 3 },
    { id: 'ivan-jurado-wayfair-4', order: 4 },
    { id: 'ivan-jurado-weightwatchers-5', order: 5 },
    { id: 'ivan-jurado-phillips-6', order: 6 }
  ],
  'paloma-rincon': [
    { id: 'paloma-rincon-ntt-1', order: 1 },
    { id: 'paloma-rincon-heinekensilver-2', order: 2 },
    { id: 'paloma-rincon-fn-3', order: 3 },
    { id: 'paloma-rincon-michelobultra-4', order: 4 },
    { id: 'paloma-rincon-earthsown-5', order: 5 },
    { id: 'paloma-rincon-papajohns-6', order: 6 }
  ],
  'china-pequenino': [
    { id: 'china-pequenino-reebok-1', order: 1 },
    { id: 'china-pequenino-movistar-2', order: 2 },
    { id: 'china-pequenino-ciudadela-3', order: 3 },
    { id: 'china-pequenino-nym-4', order: 4 },
    { id: 'china-pequenino-bees-5', order: 5 },
    { id: 'china-pequenino-oldi-6', order: 6 }
  ],
  'tigre-escobar': [
    { id: 'tigre-escobar-lafayette-1', order: 1 },
    { id: 'tigre-escobar-paulamendoza-2', order: 2 },
    { id: 'tigre-escobar-lafayette-3', order: 3 },
    { id: 'tigre-escobar-sandraweil-4', order: 4 }
  ]
};

async function migrateOrderValues() {
  try {
    console.log('🚀 Iniciando migración de valores de orden...');
    
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment('master');
    
    // Migrar orden de directores
    console.log('\n📝 Migrando orden de directores...');
    for (const [slug, order] of Object.entries(directorOrder)) {
      try {
        const entries = await environment.getEntries({
          content_type: 'director',
          'fields.slug': slug
        });
        
        if (entries.items.length > 0) {
          const entry = entries.items[0];
          entry.fields.order = { 'en-US': order };
          const updatedEntry = await entry.update();
          await updatedEntry.publish();
          console.log(`✅ Director ${slug}: order = ${order}`);
        } else {
          console.log(`⚠️  Director ${slug} no encontrado en Contentful`);
        }
      } catch (error) {
        console.error(`❌ Error actualizando director ${slug}:`, error.message);
      }
    }
    
    // Migrar orden de videos
    console.log('\n📝 Migrando orden de videos...');
    for (const [directorSlug, videos] of Object.entries(videoOrders)) {
      console.log(`\n🎬 Procesando videos de ${directorSlug}:`);
      
      for (const video of videos) {
        try {
          const entries = await environment.getEntries({
            content_type: 'directorVideo',
            'fields.id': video.id
          });
          
          if (entries.items.length > 0) {
            const entry = entries.items[0];
            entry.fields.order = { 'en-US': video.order };
            const updatedEntry = await entry.update();
            await updatedEntry.publish();
            console.log(`  ✅ ${video.id}: order = ${video.order}`);
          } else {
            console.log(`  ⚠️  Video ${video.id} no encontrado en Contentful`);
          }
        } catch (error) {
          console.error(`  ❌ Error actualizando video ${video.id}:`, error.message);
        }
      }
    }
    
    console.log('\n🎉 Migración completada!');
    console.log('\n📋 Resumen:');
    console.log('- Directores ordenados: Lemon(1), Urbani(2), Iván(3), Paloma(4), China(5), Tigre(6)');
    console.log('- Videos ordenados dentro de cada director');
    console.log('\n🚀 Ahora puedes desplegar tu aplicación!');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    process.exit(1);
  }
}

migrateOrderValues();
