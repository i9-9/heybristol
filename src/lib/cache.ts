// Simple in-memory cache para datos de Contentful
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutos por defecto

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Verificar si expiró
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Limpiar entradas expiradas
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Instancia global del cache
export const contentfulCache = new SimpleCache();

// Limpiar cache cada 10 minutos
if (typeof window !== 'undefined') {
  setInterval(() => {
    contentfulCache.cleanup();
  }, 10 * 60 * 1000);
}

const inflightRequests = new Map<string, Promise<unknown>>();

// Función helper para wrap funciones async con cache
export function withCache<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  keyGenerator: (...args: T) => string,
  ttl?: number
) {
  return async (...args: T): Promise<R> => {
    const cacheKey = keyGenerator(...args);
    
    // Intentar obtener del cache primero
    const cached = contentfulCache.get<R>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const pending = inflightRequests.get(cacheKey);
    if (pending) {
      return pending as Promise<R>;
    }

    const request = fn(...args)
      .then((result) => {
        contentfulCache.set(cacheKey, result, ttl);
        return result;
      })
      .finally(() => {
        inflightRequests.delete(cacheKey);
      });

    inflightRequests.set(cacheKey, request);
    return request;
  };
}

