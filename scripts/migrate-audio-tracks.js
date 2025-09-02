const { createClient } = require('contentful-management');
const fs = require('fs');
const path = require('path');

// Usar variables de entorno directamente
const spaceId = process.env.CONTENTFUL_SPACE_ID || 'ii9zv0je6636';
const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

if (!managementToken) {
  console.error('❌ CONTENTFUL_MANAGEMENT_TOKEN es requerido');
  console.error('💡 Configura la variable: export CONTENTFUL_MANAGEMENT_TOKEN=tu_token');
  process.exit(1);
}

const client = createClient({
  accessToken: managementToken,
});

async function uploadAudioAsset(space, filePath, title, description) {
  try {
    console.log(`🎵 Subiendo ${title}...`);
    
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
            contentType: fileName.endsWith('.mp3') ? 'audio/mpeg' : 
                        fileName.endsWith('.wav') ? 'audio/wav' : 
                        fileName.endsWith('.ogg') ? 'audio/ogg' : 'audio/mpeg',
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

async function createAudioTrackEntry(space, audioData) {
  try {
    console.log(`📝 Creando entrada: ${audioData.title}...`);
    
    const entry = await space.createEntry('audioTrack', {
      fields: {
        id: {
          'en-US': audioData.id
        },
        title: {
          'en-US': audioData.title
        },
        description: {
          'en-US': audioData.description || ''
        },
        audioFile: {
          'en-US': {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: audioData.audioFileId
            }
          }
        },
        volume: {
          'en-US': audioData.volume || 0.5
        },
        loop: {
          'en-US': audioData.loop !== undefined ? audioData.loop : true
        },
        fadeIn: {
          'en-US': audioData.fadeIn || 0
        },
        fadeOut: {
          'en-US': audioData.fadeOut || 0
        },
        order: {
          'en-US': audioData.order || 0
        }
      }
    });
    
    await entry.publish();
    console.log(`✅ Entrada creada: ${audioData.title}`);
    
    return entry;
    
  } catch (error) {
    console.error(`❌ Error creando entrada ${audioData.title}:`, error.message);
    return null;
  }
}

async function main() {
  try {
    console.log('🚀 Iniciando migración de audio tracks a Contentful...\n');
    
    const space = await client.getSpace(spaceId);
    
    // Datos de ejemplo para audio tracks
    // TODO: Reemplazar con archivos de audio reales
    const audioTracks = [
      {
        id: 'hero-music-1',
        title: 'Hero Music Track 1',
        description: 'Música de fondo para el hero principal',
        filePath: 'public/audio/hero-music-1.mp3', // TODO: Crear este archivo
        volume: 0.3,
        loop: true,
        fadeIn: 2,
        fadeOut: 2,
        order: 1
      },
      {
        id: 'hero-music-2',
        title: 'Hero Music Track 2',
        description: 'Música alternativa para el hero',
        filePath: 'public/audio/hero-music-2.mp3', // TODO: Crear este archivo
        volume: 0.4,
        loop: true,
        fadeIn: 1.5,
        fadeOut: 1.5,
        order: 2
      }
    ];
    
    console.log('⚠️  NOTA: Este script está configurado con archivos de ejemplo.');
    console.log('📁 Crea la carpeta public/audio/ y agrega tus archivos de música.');
    console.log('🎵 Formatos soportados: MP3, WAV, OGG\n');
    
    // Verificar si existen los archivos
    const existingFiles = audioTracks.filter(track => {
      const exists = fs.existsSync(track.filePath);
      if (!exists) {
        console.log(`⚠️  Archivo no encontrado: ${track.filePath}`);
      }
      return exists;
    });
    
    if (existingFiles.length === 0) {
      console.log('❌ No se encontraron archivos de audio para subir.');
      console.log('💡 Crea archivos de música en public/audio/ y actualiza el script.');
      return;
    }
    
    console.log(`📤 Subiendo ${existingFiles.length} archivos de audio...\n`);
    
    // Subir archivos y crear entradas
    for (const track of existingFiles) {
      const audioFileId = await uploadAudioAsset(
        space, 
        track.filePath, 
        track.title, 
        track.description
      );
      
      if (audioFileId) {
        await createAudioTrackEntry(space, {
          ...track,
          audioFileId
        });
      }
      
      console.log(''); // Línea en blanco para separar
    }
    
    console.log('✅ Migración de audio tracks completada!');
    console.log('\n📝 Próximos pasos:');
    console.log('1. Ve a Contentful y verifica las entradas creadas');
    console.log('2. Ajusta volúmenes, loops y efectos según necesites');
    console.log('3. Prueba el botón de música en el sitio');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
