// Script con diferentes presets de calidad para optimización de videos
// Uso: node scripts/video-quality-presets.js [input-file] [preset]

const { execSync } = require('child_process');
const path = require('path');

const inputFile = process.argv[2];
const preset = process.argv[3] || 'high';

if (!inputFile) {
  console.log('❌ Uso: node scripts/video-quality-presets.js [input-file] [preset]');
  console.log('Presets disponibles: ultra, high, medium, mobile');
  console.log('Ejemplo: node scripts/video-quality-presets.js input.mp4 ultra');
  process.exit(1);
}

const inputPath = path.resolve(inputFile);
const baseName = path.basename(inputFile, path.extname(inputFile));

const presets = {
  ultra: {
    mp4: {
      crf: 15,
      preset: 'veryslow',
      audio: '192k',
      description: 'Calidad ultra alta (archivo grande)'
    },
    webm: {
      crf: 20,
      audio: '192k',
      description: 'Calidad ultra alta WebM'
    }
  },
  high: {
    mp4: {
      crf: 18,
      preset: 'slow',
      audio: '128k',
      description: 'Calidad alta (recomendado)'
    },
    webm: {
      crf: 25,
      audio: '128k',
      description: 'Calidad alta WebM'
    }
  },
  medium: {
    mp4: {
      crf: 23,
      preset: 'medium',
      audio: '96k',
      description: 'Calidad media (balance calidad/tamaño)'
    },
    webm: {
      crf: 30,
      audio: '96k',
      description: 'Calidad media WebM'
    }
  },
  mobile: {
    mp4: {
      crf: 28,
      preset: 'fast',
      audio: '64k',
      description: 'Optimizado para móvil'
    },
    webm: {
      crf: 35,
      audio: '64k',
      description: 'Optimizado para móvil WebM'
    }
  }
};

const selectedPreset = presets[preset];
if (!selectedPreset) {
  console.log('❌ Preset no válido. Opciones disponibles:');
  Object.keys(presets).forEach(p => {
    console.log(`   - ${p}: ${presets[p].mp4.description}`);
  });
  process.exit(1);
}

console.log(`🎬 Optimizando video con preset: ${preset.toUpperCase()}`);
console.log(`📁 Input: ${inputPath}`);
console.log(`📊 Configuración: ${selectedPreset.mp4.description}`);

try {
  // Generar MP4
  const mp4Output = `public/videos/${baseName}_${preset}.mp4`;
  const mp4Command = `ffmpeg -i "${inputPath}" \
    -c:v libx264 \
    -preset ${selectedPreset.mp4.preset} \
    -crf ${selectedPreset.mp4.crf} \
    -c:a aac \
    -b:a ${selectedPreset.mp4.audio} \
    -movflags +faststart \
    -pix_fmt yuv420p \
    -y \
    "${mp4Output}"`;

  // Generar WebM
  const webmOutput = `public/videos/${baseName}_${preset}.webm`;
  const webmCommand = `ffmpeg -i "${inputPath}" \
    -c:v libvpx-vp9 \
    -crf ${selectedPreset.webm.crf} \
    -b:v 0 \
    -c:a libopus \
    -b:a ${selectedPreset.webm.audio} \
    -deadline good \
    -cpu-used 2 \
    -y \
    "${webmOutput}"`;

  console.log('🔄 Generando MP4...');
  execSync(mp4Command, { stdio: 'inherit' });
  
  console.log('🔄 Generando WebM...');
  execSync(webmCommand, { stdio: 'inherit' });

  console.log('✅ Videos generados exitosamente!');
  console.log(`📁 MP4: ${mp4Output}`);
  console.log(`📁 WebM: ${webmOutput}`);
  console.log(`📊 Preset: ${preset} - ${selectedPreset.mp4.description}`);

} catch (error) {
  console.error('❌ Error al optimizar video:', error.message);
  process.exit(1);
} 