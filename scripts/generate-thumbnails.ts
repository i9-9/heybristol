import fs from 'fs';
import path from 'path';
import https from 'https';
import { directors } from '../src/data/directors';

// Función para descargar una imagen
function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
      }
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Eliminar archivo parcial
      reject(err);
    });
  });
}

// Función para generar thumbnails de un director
async function generateThumbnailsForDirector(directorSlug: string) {
  const director = directors.find(d => d.slug === directorSlug);
  
  if (!director) {
    console.error(`❌ Director "${directorSlug}" no encontrado.`);
    console.log('Directores disponibles:');
    directors.forEach(d => console.log(`  - ${d.slug} (${d.name})`));
    return;
  }

  console.log(`🎬 Generando thumbnails para: ${director.name} (${director.slug})`);
  console.log(`📁 Videos encontrados: ${director.videos.length}`);

  // Crear carpeta para el director
  const outputDir = path.join(process.cwd(), 'thumbnails', director.slug);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generar thumbnails para cada video
  for (let i = 0; i < director.videos.length; i++) {
    const video = director.videos[i];
    const thumbnailUrl = `https://vumbnail.com/${video.vimeoId}.jpg`;
    const filename = `${video.order.toString().padStart(2, '0')}-${video.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${video.client.toLowerCase()}.jpg`;
    const filepath = path.join(outputDir, filename);

    try {
      console.log(`📥 Descargando: ${video.title} (${video.client})`);
      await downloadImage(thumbnailUrl, filepath);
      console.log(`✅ Guardado: ${filename}`);
    } catch (error) {
      console.error(`❌ Error descargando ${video.title}:`, (error as Error).message);
    }
  }

  console.log(`\n🎉 Thumbnails generados en: ${outputDir}`);
  console.log(`📊 Total: ${director.videos.length} videos procesados`);
}

// Función para generar thumbnails de todos los directores
async function generateAllThumbnails() {
  console.log('🎬 Generando thumbnails para todos los directores...\n');
  
  for (const director of directors) {
    await generateThumbnailsForDirector(director.slug);
    console.log(''); // Línea en blanco entre directores
  }
  
  console.log('🎉 ¡Todos los thumbnails han sido generados!');
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📋 Uso del script:');
    console.log('  npm run generate-thumbnails <director-slug>  # Generar para un director específico');
    console.log('  npm run generate-thumbnails --all            # Generar para todos los directores');
    console.log('');
    console.log('📁 Los thumbnails se guardarán en: ./thumbnails/<director-slug>/');
    console.log('');
    console.log('🎬 Directores disponibles:');
    directors.forEach(d => console.log(`  - ${d.slug} (${d.name}) - ${d.videos.length} videos`));
    return;
  }

  if (args[0] === '--all') {
    await generateAllThumbnails();
  } else {
    await generateThumbnailsForDirector(args[0]);
  }
}

// Ejecutar script
main().catch(console.error);

