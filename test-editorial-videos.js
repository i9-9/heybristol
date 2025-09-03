// Script de prueba para verificar videos editoriales
const { getEditorialVideosFromContentful } = require('./src/lib/contentful.ts');

async function testEditorialVideos() {
  try {
    console.log('🎬 Probando carga de videos editoriales...\n');
    
    const videos = await getEditorialVideosFromContentful();
    
    console.log(`✅ Se encontraron ${videos.length} videos editoriales:`);
    
    videos.forEach((video, index) => {
      console.log(`\n${index + 1}. ${video.title} (ID: ${video.id})`);
      console.log(`   - Descripción: ${video.description || 'Sin descripción'}`);
      console.log(`   - Orden: ${video.order || 'Sin orden'}`);
      console.log(`   - WebM: ${video.webmVideo ? '✅' : '❌'}`);
      console.log(`   - MP4: ${video.mp4Video ? '✅' : '❌'}`);
      console.log(`   - Mobile: ${video.mobileVideo ? '✅' : '❌'}`);
      
      if (video.webmVideo) {
        console.log(`   - WebM URL: https:${video.webmVideo.fields.file.url}`);
      }
      if (video.mp4Video) {
        console.log(`   - MP4 URL: https:${video.mp4Video.fields.file.url}`);
      }
      if (video.mobileVideo) {
        console.log(`   - Mobile URL: https:${video.mobileVideo.fields.file.url}`);
      }
    });
    
    if (videos.length === 0) {
      console.log('\n⚠️  No se encontraron videos editoriales en Contentful.');
      console.log('💡 Asegúrate de que:');
      console.log('   1. Los videos estén creados en Contentful');
      console.log('   2. Los videos estén publicados');
      console.log('   3. Las variables de entorno estén configuradas correctamente');
    }
    
  } catch (error) {
    console.error('❌ Error al cargar videos editoriales:', error.message);
  }
}

testEditorialVideos();
