const { createClient } = require('contentful-management');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const spaceId = process.env.CONTENTFUL_SPACE_ID;

console.log('🔍 Verificando configuración actual...');
console.log('CONTENTFUL_SPACE_ID:', spaceId ? '✅ Configurado' : '❌ No configurado');
console.log('CONTENTFUL_ACCESS_TOKEN:', process.env.CONTENTFUL_ACCESS_TOKEN ? '✅ Configurado' : '❌ No configurado');
console.log('CONTENTFUL_MANAGEMENT_TOKEN:', process.env.CONTENTFUL_MANAGEMENT_TOKEN ? '✅ Configurado' : '❌ No configurado');

console.log('\n📝 Para crear el MANAGEMENT_TOKEN:');
console.log('1. Ve a: https://app.contentful.com/spaces/' + spaceId + '/api/keys');
console.log('2. Click en "Personal access tokens"');
console.log('3. Click en "Generate personal token"');
console.log('4. Dale un nombre (ej: "Bristol Audio Setup")');
console.log('5. Copia el token generado');
console.log('6. Agrégalo a tu .env.local como:');
console.log('   CONTENTFUL_MANAGEMENT_TOKEN=tu_token_aqui');

console.log('\n💡 Alternativamente, puedes ejecutar:');
console.log('   CONTENTFUL_MANAGEMENT_TOKEN=tu_token node scripts/create-audio-content-type.js');

