// Script para generar la imagen Open Graph
// NOTA: Para ejecutar este script, primero instala canvas temporalmente:
// npm install canvas
// node scripts/generate-og-image.js
// npm uninstall canvas

const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// Crear un canvas de 1200x630 (tamaño estándar para Open Graph)
const canvas = createCanvas(1200, 630);
const ctx = canvas.getContext('2d');

// Fondo negro
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, 1200, 630);

// Función para dibujar el logo de Bristol
function drawBristolLogo() {
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 120px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Dibujar "BRISTOL" centrado
  ctx.fillText('BRISTOL', 600, 315);
  
  // Agregar un subtítulo más pequeño
  ctx.font = '36px Arial, sans-serif';
  ctx.fillStyle = '#cccccc';
  ctx.fillText('Productora de contenido audiovisual', 600, 400);
}

// Dibujar el logo
drawBristolLogo();

// Guardar como PNG
const buffer = canvas.toBuffer('image/png');
const outputPath = path.join(__dirname, '../public/opengraph-image.png');

fs.writeFileSync(outputPath, buffer);
console.log('✅ Open Graph image generated successfully at:', outputPath); 