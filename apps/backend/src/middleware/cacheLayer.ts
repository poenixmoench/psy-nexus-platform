import redisClient from '../config/redis';
import logger from '../services/logger';

interface CacheOptions {
  ttl?: number;
  prefix?: string;
}

export class MongoCache {
  private readonly defaultTtl: number = 300;
  private readonly prefix: string;

  constructor(options?: CacheOptions) {
    this.prefix = options?.prefix || 'mongo:';
    this.defaultTtl = options?.ttl || this.defaultTtl;
  }

  private generateKey(collection: string, query: any, options?: any): string {
    const queryHash = this.hash(JSON.stringify({ query, options }));
    return `${this.prefix}${collection}:${queryHash}`;
  }

  private hash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }

  async get<T>(collection: string, query: any, options?: any): Promise<T | null> {
    try {
      const key = this.generateKey(collection, query, options);
      const cachedData = await redisClient.get(key).catch(() => null);
      
      if (cachedData) {
        logger.info(`🎯 Cache HIT: ${key}`);
        return JSON.parse(cachedData as string);
      }
      
      logger.info(`🔍 Cache MISS: ${key}`);
      return null;
    } catch (error) {
      logger.error(`Redis GET Fehler: ${error}`);
      return null;
    }
  }

  async set(collection: string, query: any, data: any, options?: any, ttl?: number): Promise<void> {
    try {
      const key = this.generateKey(collection, query, options);
      const ttlSeconds = ttl || this.defaultTtl;
      await redisClient.setEx(key, ttlSeconds, JSON.stringify(data));
      logger.info(`💾 Cache SET: ${key} (TTL: ${ttlSeconds}s)`);
    } catch (error) {
      logger.error(`Redis SET Fehler: ${error}`);
    }
  }

  async invalidate(collection: string, query?: any): Promise<void> {
    try {
      if (query) {
        const key = this.generateKey(collection, query);
        await redisClient.del(key);
      } else {
        const pattern = `${this.prefix}${collection}:*`;
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) await redisClient.del(keys);
      }
    } catch (error) {
      logger.error(`Redis DELETE Fehler: ${error}`);
    }
  }
}

export const mongoCache = new MongoCache();
