import { createClient } from 'redis';
import logger from '../services/logger'; // Korrekter Default-Import

const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
    socket: {
        reconnectStrategy: (retries: number) => {
            if (retries > 10) {
                logger.error(`Redis: Max retries (10) erreicht.`);
                return new Error('Redis connection failed');
            }
            const delay = Math.min(100 * Math.pow(2, retries), 3000);
            logger.warn(`Redis: Reconnect-Versuch ${retries}/10 in ${delay}ms...`);
            return delay;
        }
    }
});

redisClient.on('error', (err) => logger.error(`❌ Redis-Fehler: ${err}`));
redisClient.on('connect', () => logger.info('✅ Redis-Client verbindet sich...'));
redisClient.on('ready', () => logger.info('🎉 Redis-Client bereit für Operationen'));

const connectWithRetry = async () => {
    try {
        await redisClient.connect();
        logger.info('🚀 Verbunden mit Redis-Server');
    } catch (error) {
        // Die ReconnectStrategy übernimmt das Management
        logger.error(`⚠️ Initialer Redis-Fehler: ${error}`);
    }
};

connectWithRetry();

export default redisClient;
