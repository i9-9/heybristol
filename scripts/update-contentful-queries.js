const fs = require('fs');
const path = require('path');

console.log('🔄 Actualizando consultas de Contentful para usar campo "order"...');

const contentfulFile = path.join(__dirname, '..', 'src', 'lib', 'contentful.ts');

try {
  let content = fs.readFileSync(contentfulFile, 'utf8');
  
  // Actualizar consulta de directores para usar order
  content = content.replace(
    /const response = await client\.getEntries\(\{\s*content_type: 'director',\s*include: 2, \/\/ Include referenced entries \(videos\)\s*\}\);/,
    `const response = await client.getEntries({
      content_type: 'director',
      order: ['fields.order'], // Ordenar por el campo order
      include: 2, // Include referenced entries (videos)
    });`
  );
  
  // Actualizar consulta de hero videos para usar order
  content = content.replace(
    /const response = await client\.getEntries\(\{\s*content_type: 'heroVideo',\s*include: 2, \/\/ Include referenced assets\s*\}\);/,
    `const response = await client.getEntries({
      content_type: 'heroVideo',
      order: ['fields.order'], // Ordenar por el campo order
      include: 2, // Include referenced assets
    });`
  );
  
  // Actualizar consulta de editorial videos para usar order
  content = content.replace(
    /const entries = await client\.getEntries\(\{\s*content_type: 'editorialVideo'\s*\}\);/,
    `const entries = await client.getEntries({
      content_type: 'editorialVideo',
      order: ['fields.order'] // Ordenar por el campo order
    });`
  );
  
  // Actualizar los tipos para hacer order requerido
  content = content.replace(
    /order\?: number/g,
    'order: number'
  );
  
  // Remover los fallbacks de order ya que ahora será requerido
  content = content.replace(
    /order: director\.fields\.order \|\| index \+ 1, \/\/ Fallback to index if order field doesn't exist/g,
    'order: director.fields.order,'
  );
  
  content = content.replace(
    /order: directorVideo\.fields\.order \|\| videoIndex \+ 1, \/\/ Fallback to index if order field doesn't exist/g,
    'order: directorVideo.fields.order,'
  );
  
  content = content.replace(
    /order: item\.fields\.order \|\| 1, \/\/ Fallback to 1 if order field doesn't exist/g,
    'order: item.fields.order,'
  );
  
  content = content.replace(
    /order: heroVideo\.fields\.order \|\| index \+ 1, \/\/ Fallback to index if order field doesn't exist/g,
    'order: heroVideo.fields.order,'
  );
  
  content = content.replace(
    /order: video\.fields\.order \|\| index \+ 1, \/\/ Fallback to index if order field doesn't exist/g,
    'order: video.fields.order,'
  );
  
  fs.writeFileSync(contentfulFile, content);
  
  console.log('✅ Consultas de Contentful actualizadas exitosamente!');
  console.log('\n📋 Cambios realizados:');
  console.log('- Agregado order: [\'fields.order\'] a todas las consultas');
  console.log('- Actualizado tipos para hacer order requerido');
  console.log('- Removido fallbacks de order');
  console.log('\n🚀 Ahora puedes desplegar tu aplicación!');
  
} catch (error) {
  console.error('❌ Error actualizando archivo:', error.message);
  process.exit(1);
}
