#!/usr/bin/env tsx

import { getDirectorsFromContentful } from '../src/lib/contentful';

async function testAppCache() {
  console.log('🧪 Testing App Cache');
  console.log('====================');
  
  try {
    console.log('🔄 Fetching directors using app function...');
    
    const directors = await getDirectorsFromContentful();
    
    console.log(`\n📊 Results:`);
    console.log(`  - Directors returned: ${(directors as unknown[]).length}`);
    
    console.log(`\n📝 Directors:`);
    (directors as unknown[]).forEach((director: any, index) => {
      console.log(`  ${index + 1}. ${director.name} (${director.slug})`);
      console.log(`     Order: ${director.order}`);
      console.log(`     Videos: ${director.videos.length}`);
    });
    
    console.log(`\n✅ App cache test completed!`);
    
  } catch (error) {
    console.error('❌ Error testing app cache:', error);
  }
}

// Run the test
if (require.main === module) {
  testAppCache().catch(console.error);
}

export { testAppCache };
