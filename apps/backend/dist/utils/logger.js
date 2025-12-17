/**
 * Production-Ready Logger Utility
 * Strukturiertes Logging für PSY-NEXUS Backend
 */
export class Logger {
    constructor(context) {
        this.context = context;
    }
    log(message, data) {
        console.log(`[${this.context}] ${message}`, data || '');
    }
    error(message, error) {
        console.error(`[❌ ${this.context}] ${message}`, error || '');
    }
    warn(message, data) {
        console.warn(`[⚠️  ${this.context}] ${message}`, data || '');
    }
    debug(message, data) {
        if (process.env.DEBUG) {
            console.debug(`[🔍 ${this.context}] ${message}`, data || '');
        }
    }
    info(message, data) {
        console.info(`[ℹ️  ${this.context}] ${message}`, data || '');
    }
}
export const createLogger = (context) => new Logger(context);
//# sourceMappingURL=logger.js.map