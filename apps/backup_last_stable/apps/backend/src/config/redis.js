"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const logger_1 = __importDefault(require("../services/logger")); // Korrekter Default-Import
const redisClient = (0, redis_1.createClient)({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                logger_1.default.error(`Redis: Max retries (10) erreicht.`);
                return new Error('Redis connection failed');
            }
            const delay = Math.min(100 * Math.pow(2, retries), 3000);
            logger_1.default.warn(`Redis: Reconnect-Versuch ${retries}/10 in ${delay}ms...`);
            return delay;
        }
    }
});
redisClient.on('error', (err) => logger_1.default.error(`❌ Redis-Fehler: ${err}`));
redisClient.on('connect', () => logger_1.default.info('✅ Redis-Client verbindet sich...'));
redisClient.on('ready', () => logger_1.default.info('🎉 Redis-Client bereit für Operationen'));
const connectWithRetry = async () => {
    try {
        await redisClient.connect();
        logger_1.default.info('🚀 Verbunden mit Redis-Server');
    }
    catch (error) {
        // Die ReconnectStrategy übernimmt das Management
        logger_1.default.error(`⚠️ Initialer Redis-Fehler: ${error}`);
    }
};
connectWithRetry();
exports.default = redisClient;
