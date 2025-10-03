#!/usr/bin/env tsx

import * as dotenv from 'dotenv';

// Load environment variables from .env.local first, then .env
dotenv.config({ path: '.env.local' });
dotenv.config();

async function checkEnvironmentVariables() {
  console.log('🔍 Checking Environment Variables');
  console.log('=================================');
  
  console.log('\n📊 Environment Variables:');
  console.log(`  - NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`  - NEXT_PUBLIC_USE_CONTENTFUL: ${process.env.NEXT_PUBLIC_USE_CONTENTFUL}`);
  console.log(`  - NEXT_PUBLIC_CONTENTFUL_SPACE_ID: ${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}`);
  console.log(`  - NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN: ${process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN?.substring(0, 10)}...`);
  
  console.log('\n🔧 Logic Check:');
  const USE_CONTENTFUL = process.env.NEXT_PUBLIC_USE_CONTENTFUL === 'true';
  console.log(`  - USE_CONTENTFUL: ${USE_CONTENTFUL}`);
  console.log(`  - Will use Contentful: ${USE_CONTENTFUL ? 'YES' : 'NO'}`);
  
  if (!USE_CONTENTFUL) {
    console.log('\n❌ PROBLEM FOUND:');
    console.log('  - NEXT_PUBLIC_USE_CONTENTFUL is not set to "true"');
    console.log('  - This means the app will use local data instead of Contentful');
    
    console.log('\n💡 Solutions:');
    console.log('  1. Check your .env.local file');
    console.log('  2. Make sure NEXT_PUBLIC_USE_CONTENTFUL=true');
    console.log('  3. Restart your development server');
  } else {
    console.log('\n✅ Environment looks correct');
    console.log('  - The app should be using Contentful');
    console.log('  - If it\'s still using local data, there might be a caching issue');
  }
}

// Run the check
if (require.main === module) {
  checkEnvironmentVariables().catch(console.error);
}

export { checkEnvironmentVariables };
