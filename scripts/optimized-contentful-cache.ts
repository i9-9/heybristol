#!/usr/bin/env tsx

import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

/**
 * Advanced Contentful Caching Strategy Implementation
 * Performance Engineer Agent - Optimization Phase
 */

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum cache entries
  strategy: 'memory' | 'redis' | 'hybrid';
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

class AdvancedContentfulCache {
  private cache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;
  private hitCount = 0;
  private missCount = 0;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  set<T>(key: string, data: T, customTtl?: number): void {
    const ttl = customTtl || this.config.ttl;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0
    };

    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.missCount++;
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }

    // Update hit count and access time
    entry.hits++;
    entry.timestamp = Date.now();
    this.hitCount++;
    
    return entry.data;
  }

  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  getStats() {
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0;
    
    return {
      hitRate: Math.round(hitRate * 100) / 100,
      totalRequests,
      cacheSize: this.cache.size,
      maxSize: this.config.maxSize
    };
  }

  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }
}

// Global cache instance
const contentfulCache = new AdvancedContentfulCache({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100, // Maximum 100 entries
  strategy: 'memory'
});

/**
 * Enhanced Contentful Client with Advanced Caching
 */
class OptimizedContentfulClient {
  private client: any;
  private cache = contentfulCache;

  constructor() {
    this.initializeClient();
  }

  private async initializeClient() {
    const { createClient } = await import('contentful');
    
    this.client = createClient({
      space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!,
      accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN!,
    });
  }

  async getDirectors(forceRefresh = false): Promise<unknown[]> {
    const cacheKey = 'directors-all';
    
    if (!forceRefresh) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log('🎯 Cache HIT for directors');
        return cached as unknown[];
      }
    }

    console.log('🔄 Cache MISS for directors - fetching from Contentful');
    
    const startTime = Date.now();
    const response = await this.client.getEntries({
      content_type: 'director',
      order: ['fields.order'],
      include: 2,
    });
    const queryTime = Date.now() - startTime;

    const directors = response.items.map((item: any) => ({
      name: item.fields.name,
      slug: item.fields.slug,
      order: item.fields.order,
      videos: item.fields.videos || []
    }));

    // Cache with different TTL based on environment
    const ttl = process.env.NODE_ENV === 'development' ? 30 * 1000 : 5 * 60 * 1000;
    this.cache.set(cacheKey, directors, ttl);

    console.log(`✅ Directors fetched in ${queryTime}ms`);
    return directors;
  }

  async getDirectorBySlug(slug: string, forceRefresh = false): Promise<any | null> {
    const cacheKey = `director-${slug}`;
    
    if (!forceRefresh) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log(`🎯 Cache HIT for director: ${slug}`);
        return cached;
      }
    }

    console.log(`🔄 Cache MISS for director: ${slug} - fetching from Contentful`);
    
    const startTime = Date.now();
    const response = await this.client.getEntries({
      content_type: 'director',
      'fields.slug': slug,
      include: 2,
      limit: 1
    });
    const queryTime = Date.now() - startTime;

    if (response.items.length === 0) {
      return null;
    }

    const director = {
      name: response.items[0].fields.name,
      slug: response.items[0].fields.slug,
      order: response.items[0].fields.order,
      videos: response.items[0].fields.videos || []
    };

    // Cache with longer TTL for individual directors
    const ttl = process.env.NODE_ENV === 'development' ? 60 * 1000 : 10 * 60 * 1000;
    this.cache.set(cacheKey, director, ttl);

    console.log(`✅ Director ${slug} fetched in ${queryTime}ms`);
    return director;
  }

  getCacheStats() {
    return this.cache.getStats();
  }

  clearCache() {
    this.cache.clear();
    console.log('🗑️  Contentful cache cleared');
  }
}

// Export optimized client
export const optimizedContentfulClient = new OptimizedContentfulClient();

// Performance testing function
async function testOptimizedPerformance(): Promise<void> {
  console.log('🚀 TESTING OPTIMIZED CONTENTFUL PERFORMANCE');
  console.log('============================================');
  
  const client = optimizedContentfulClient;
  
  // Test 1: First load (cache miss)
  console.log('\n📊 Test 1: First Load (Cache Miss)');
  const start1 = Date.now();
  const directors1 = await client.getDirectors();
  const time1 = Date.now() - start1;
  console.log(`   Time: ${time1}ms`);
  console.log(`   Directors loaded: ${directors1.length}`);
  
  // Test 2: Second load (cache hit)
  console.log('\n📊 Test 2: Second Load (Cache Hit)');
  const start2 = Date.now();
  const directors2 = await client.getDirectors();
  const time2 = Date.now() - start2;
  console.log(`   Time: ${time2}ms`);
  console.log(`   Directors loaded: ${directors2.length}`);
  
  // Test 3: Individual director fetch
  console.log('\n📊 Test 3: Individual Director Fetch');
  const start3 = Date.now();
  const director = await client.getDirectorBySlug('ali-ali');
  const time3 = Date.now() - start3;
  console.log(`   Time: ${time3}ms`);
  console.log(`   Director: ${director?.name || 'Not found'}`);
  
  // Cache statistics
  console.log('\n📈 CACHE STATISTICS');
  console.log('===================');
  const stats = client.getCacheStats();
  console.log(`   Hit Rate: ${stats.hitRate}%`);
  console.log(`   Total Requests: ${stats.totalRequests}`);
  console.log(`   Cache Size: ${stats.cacheSize}/${stats.maxSize}`);
  
  // Performance improvement calculation
  const improvement = ((time1 - time2) / time1) * 100;
  console.log(`\n🎯 PERFORMANCE IMPROVEMENT`);
  console.log(`   Cache speedup: ${improvement.toFixed(1)}%`);
  console.log(`   Time saved: ${time1 - time2}ms`);
}

// Run performance test if called directly
if (require.main === module) {
  testOptimizedPerformance().catch(console.error);
}

export { OptimizedContentfulClient, AdvancedContentfulCache };
