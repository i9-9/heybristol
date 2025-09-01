const { createClient } = require('contentful-management');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

const spaceId = process.env.CONTENTFUL_SPACE_ID;
const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

if (!spaceId || !managementToken) {
  console.error('❌ CONTENTFUL_SPACE_ID y CONTENTFUL_MANAGEMENT_TOKEN son requeridos');
  process.exit(1);
}

const client = createClient({
  accessToken: managementToken,
});

async function uploadVideoAsset(space, filePath, title, description) {
  try {
    console.log(`📤 Subiendo ${title}...`);
    
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    
    // Crear el asset
    const asset = await space.createAsset({
      fields: {
        title: {
          'en-US': title
        },
        description: {
          'en-US': description
        },
        file: {
          'en-US': {
            contentType: fileName.endsWith('.webm') ? 'video/webm' : 'video/mp4',
            fileName: fileName,
            upload: fileBuffer
          }
        }
      }
    });
    
    // Procesar el asset
    await asset.processForAllLocales();
    
    // Esperar a que termine el procesamiento
    let processed = false;
    let attempts = 0;
    while (!processed && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const updatedAsset = await space.getAsset(asset.sys.id);
      if (updatedAsset.fields.file['en-US'].url) {
        processed = true;
        console.log(`✅ ${title} subido y procesado: ${updatedAsset.fields.file['en-US'].url}`);
      }
      attempts++;
    }
    
    if (!processed) {
      console.log(`⚠️  ${title} subido pero aún procesándose...`);
    }
    
    return asset.sys.id;
    
  } catch (error) {
    console.error(`❌ Error subiendo ${title}:`, error.message);
    return null;
  }
}

async function main() {
  try {
    console.log('🚀 Iniciando subida de videos a Contentful...\n');
    
    const space = await client.getSpace(spaceId);
    
    const videos = [
      {
        filePath: 'public/videos/under_construction.webm',
        title: 'Hero Video WebM',
        description: 'Video principal del hero en formato WebM'
      },
      {
        filePath: 'public/videos/under_construction.mp4',
        title: 'Hero Video MP4',
        description: 'Video principal del hero en formato MP4'
      },
      {
        filePath: 'public/videos/under_construction_mobile.mp4',
        title: 'Hero Video Mobile',
        description: 'Video del hero optimizado para móvil'
      }
    ];
    
    const assetIds = {};
    
    for (const video of videos) {
      const assetId = await uploadVideoAsset(space, video.filePath, video.title, video.description);
      if (assetId) {
        if (video.title.includes('WebM')) {
          assetIds.webm = assetId;
        } else if (video.title.includes('Mobile')) {
          assetIds.mobile = assetId;
        } else {
          assetIds.mp4 = assetId;
        }
      }
    }
    
    console.log('\n📋 Asset IDs generados:');
    console.log(JSON.stringify(assetIds, null, 2));
    
    console.log('\n✅ Videos subidos exitosamente!');
    console.log('\n📝 Próximo paso: Actualizar las entradas HeroVideo con estos Asset IDs');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
