// Script específico para optimizar el video original under_construction (720p).mp4
// Uso: node scripts/optimize-original-video.js

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const originalVideo = 'under_costruction (720p).mp4';

// Verificar que el archivo original existe
if (!fs.existsSync(originalVideo)) {
  console.log('❌ No se encontró el archivo original:', originalVideo);
  console.log('📁 Por favor, coloca el archivo en el directorio raíz del proyecto');
  console.log('📁 Ubicación esperada:', path.resolve(originalVideo));
  process.exit(1);
}

console.log('🎬 Optimizando video original con configuración balanceada...');
console.log(`📁 Input: ${originalVideo}`);

try {
  // Configuración balanceada para MP4 (buena calidad, bien comprimido)
  const mp4Command = `ffmpeg -i "${originalVideo}" \
    -c:v libx264 \
    -preset slow \
    -crf 20 \
    -c:a aac \
    -b:a 128k \
    -movflags +faststart \
    -pix_fmt yuv420p \
    -vf "scale=1280:720:flags=lanczos" \
    -y \
    "public/videos/under_construction_optimized.mp4"`;

  // Configuración balanceada para WebM (mejor compresión)
  const webmCommand = `ffmpeg -i "${originalVideo}" \
    -c:v libvpx-vp9 \
    -crf 28 \
    -b:v 0 \
    -c:a libopus \
    -b:a 128k \
    -deadline good \
    -cpu-used 2 \
    -vf "scale=1280:720:flags=lanczos" \
    -y \
    "public/videos/under_construction.webm"`;

  // Configuración para móvil (más comprimido)
  const mobileCommand = `ffmpeg -i "${originalVideo}" \
    -c:v libx264 \
    -preset medium \
    -crf 25 \
    -c:a aac \
    -b:a 96k \
    -movflags +faststart \
    -pix_fmt yuv420p \
    -vf "scale=854:480:flags=lanczos" \
    -y \
    "public/videos/under_construction_mobile.mp4"`;

  console.log('🔄 Generando MP4 optimizado (1280x720)...');
  execSync(mp4Command, { stdio: 'inherit' });
  
  console.log('🔄 Generando WebM optimizado (1280x720)...');
  execSync(webmCommand, { stdio: 'inherit' });

  console.log('🔄 Generando MP4 móvil (854x480)...');
  execSync(mobileCommand, { stdio: 'inherit' });

  console.log('✅ Videos optimizados generados exitosamente!');
  console.log('📊 Configuraciones utilizadas:');
  console.log('   - MP4: CRF 20, preset slow, 1280x720');
  console.log('   - WebM: CRF 28, VP9, 1280x720');
  console.log('   - Mobile: CRF 25, preset medium, 854x480');
  console.log('   - Audio: AAC/Opus 128k (96k para móvil)');
  console.log('');
  console.log('📁 Archivos generados:');
  console.log('   - public/videos/under_construction_optimized.mp4');
  console.log('   - public/videos/under_construction.webm');
  console.log('   - public/videos/under_construction_mobile.mp4');

} catch (error) {
  console.error('❌ Error al optimizar video:', error.message);
  process.exit(1);
} 