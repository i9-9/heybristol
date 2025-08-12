// Script para optimizar videos con ffmpeg usando configuraciones de alta calidad
// Uso: node scripts/optimize-video.js [input-file] [output-file]

const { execSync } = require('child_process');
const path = require('path');

const inputFile = process.argv[2];
const outputFile = process.argv[3];

if (!inputFile || !outputFile) {
  console.log('❌ Uso: node scripts/optimize-video.js [input-file] [output-file]');
  console.log('Ejemplo: node scripts/optimize-video.js input.mp4 output_optimized.mp4');
  process.exit(1);
}

const inputPath = path.resolve(inputFile);
const outputPath = path.resolve(outputFile);

console.log('🎬 Optimizando video con configuración de alta calidad...');
console.log(`📁 Input: ${inputPath}`);
console.log(`📁 Output: ${outputPath}`);

try {
  // Configuración de alta calidad para MP4
  const mp4Command = `ffmpeg -i "${inputPath}" \
    -c:v libx264 \
    -preset slow \
    -crf 18 \
    -c:a aac \
    -b:a 128k \
    -movflags +faststart \
    -pix_fmt yuv420p \
    "${outputPath}"`;

  // Configuración de alta calidad para WebM
  const webmCommand = `ffmpeg -i "${inputPath}" \
    -c:v libvpx-vp9 \
    -crf 30 \
    -b:v 0 \
    -c:a libopus \
    -b:a 128k \
    -deadline good \
    -cpu-used 2 \
    "${outputPath.replace('.mp4', '.webm')}"`;

  console.log('🔄 Generando MP4 optimizado...');
  execSync(mp4Command, { stdio: 'inherit' });
  
  console.log('🔄 Generando WebM optimizado...');
  execSync(webmCommand, { stdio: 'inherit' });

  console.log('✅ Videos optimizados generados exitosamente!');
  console.log('📊 Configuraciones utilizadas:');
  console.log('   - MP4: H.264 con CRF 18 (alta calidad)');
  console.log('   - WebM: VP9 con CRF 30 (alta calidad)');
  console.log('   - Preset: slow (mejor compresión)');
  console.log('   - Audio: AAC/Opus 128k');

} catch (error) {
  console.error('❌ Error al optimizar video:', error.message);
  process.exit(1);
} 