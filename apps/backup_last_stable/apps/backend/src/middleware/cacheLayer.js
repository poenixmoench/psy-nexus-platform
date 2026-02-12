"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoCache = exports.MongoCache = void 0;
const redis_1 = __importDefault(require("../config/redis"));
const logger_1 = __importDefault(require("../services/logger"));
class MongoCache {
    constructor(options) {
        this.defaultTtl = 300;
        this.prefix = options?.prefix || 'mongo:';
        this.defaultTtl = options?.ttl || this.defaultTtl;
    }
    generateKey(collection, query, options) {
        const queryHash = this.hash(JSON.stringify({ query, options }));
        return `${this.prefix}${collection}:${queryHash}`;
    }
    hash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return Math.abs(hash).toString(36);
    }
    async get(collection, query, options) {
        try {
            const key = this.generateKey(collection, query, options);
            const cachedData = await redis_1.default.get(key).catch(() => null);
            if (cachedData) {
                logger_1.default.info(`🎯 Cache HIT: ${key}`);
                return JSON.parse(cachedData);
            }
            logger_1.default.info(`🔍 Cache MISS: ${key}`);
            return null;
        }
        catch (error) {
            logger_1.default.error(`Redis GET Fehler: ${error}`);
            return null;
        }
    }
    async set(collection, query, data, options, ttl) {
        try {
            const key = this.generateKey(collection, query, options);
            const ttlSeconds = ttl || this.defaultTtl;
            await redis_1.default.setEx(key, ttlSeconds, JSON.stringify(data));
            logger_1.default.info(`💾 Cache SET: ${key} (TTL: ${ttlSeconds}s)`);
        }
        catch (error) {
            logger_1.default.error(`Redis SET Fehler: ${error}`);
        }
    }
    async invalidate(collection, query) {
        try {
            if (query) {
                const key = this.generateKey(collection, query);
                await redis_1.default.del(key);
            }
            else {
                const pattern = `${this.prefix}${collection}:*`;
                const keys = await redis_1.default.keys(pattern);
                if (keys.length > 0)
                    await redis_1.default.del(keys);
            }
        }
        catch (error) {
            logger_1.default.error(`Redis DELETE Fehler: ${error}`);
        }
    }
}
exports.MongoCache = MongoCache;
exports.mongoCache = new MongoCache();
