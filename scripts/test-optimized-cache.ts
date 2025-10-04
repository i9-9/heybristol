#!/usr/bin/env tsx

import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

/**
 * Contentful Cache Performance Test
 * Performance Engineer Agent - Testing Optimized Caching
 */

async function testOptimizedContentfulCache(): Promise<void> {
  console.log('🚀 TESTING OPTIMIZED CONTENTFUL CACHE');
  console.log('=====================================');
  
  try {
    // Import the optimized functions
    const { getDirectorsFromContentful, getCacheStats, clearContentfulCache } = await import('../src/lib/contentful');
    
    // Clear cache to start fresh
    clearContentfulCache();
    
    // Test 1: First load (cache miss)
    console.log('\n📊 Test 1: First Load (Cache Miss)');
    const start1 = Date.now();
    const directors1 = await getDirectorsFromContentful();
    const time1 = Date.now() - start1;
    console.log(`   Time: ${time1}ms`);
    console.log(`   Directors loaded: ${(directors1 as unknown[]).length}`);
    
    // Test 2: Second load (cache hit)
    console.log('\n📊 Test 2: Second Load (Cache Hit)');
    const start2 = Date.now();
    const directors2 = await getDirectorsFromContentful();
    const time2 = Date.now() - start2;
    console.log(`   Time: ${time2}ms`);
    console.log(`   Directors loaded: ${(directors2 as unknown[]).length}`);
    
    // Test 3: Third load (cache hit)
    console.log('\n📊 Test 3: Third Load (Cache Hit)');
    const start3 = Date.now();
    const directors3 = await getDirectorsFromContentful();
    const time3 = Date.now() - start3;
    console.log(`   Time: ${time3}ms`);
    console.log(`   Directors loaded: ${(directors3 as unknown[]).length}`);
    
    // Cache statistics
    console.log('\n📈 CACHE STATISTICS');
    console.log('===================');
    const stats = getCacheStats();
    console.log(`   Hit Rate: ${stats.hitRate}%`);
    console.log(`   Total Requests: ${stats.totalRequests}`);
    console.log(`   Cache Size: ${stats.cacheSize}`);
    
    // Performance improvement calculation
    const improvement = ((time1 - time2) / time1) * 100;
    const avgCacheTime = (time2 + time3) / 2;
    const avgImprovement = ((time1 - avgCacheTime) / time1) * 100;
    
    console.log(`\n🎯 PERFORMANCE IMPROVEMENT`);
    console.log(`   First vs Second: ${improvement.toFixed(1)}% improvement`);
    console.log(`   Time saved: ${time1 - time2}ms`);
    console.log(`   Average cache performance: ${avgImprovement.toFixed(1)}% improvement`);
    console.log(`   Average cache time: ${avgCacheTime.toFixed(1)}ms`);
    
    // Performance grade
    let grade = 'F';
    if (avgImprovement >= 80) grade = 'A+';
    else if (avgImprovement >= 70) grade = 'A';
    else if (avgImprovement >= 60) grade = 'B+';
    else if (avgImprovement >= 50) grade = 'B';
    else if (avgImprovement >= 40) grade = 'C';
    else if (avgImprovement >= 30) grade = 'D';
    
    console.log(`\n🏆 CACHE PERFORMANCE GRADE: ${grade}`);
    
    if (grade === 'A+' || grade === 'A') {
      console.log('   ✅ Excellent caching performance!');
    } else if (grade === 'B+' || grade === 'B') {
      console.log('   ✅ Good caching performance');
    } else if (grade === 'C') {
      console.log('   ⚠️  Moderate caching performance - consider optimization');
    } else {
      console.log('   ❌ Poor caching performance - needs optimization');
    }
    
    // Recommendations based on results
    console.log('\n💡 RECOMMENDATIONS');
    console.log('==================');
    if (stats.hitRate < 50) {
      console.log('   • Increase cache TTL for better hit rate');
    }
    if (time2 > 10) {
      console.log('   • Cache retrieval is slow - check implementation');
    }
    if (avgImprovement < 60) {
      console.log('   • Consider implementing Redis for better performance');
    }
    
    console.log('\n✅ Cache performance test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing optimized cache:', error);
  }
}

// Run the test
if (require.main === module) {
  testOptimizedContentfulCache().catch(console.error);
}

export { testOptimizedContentfulCache };
