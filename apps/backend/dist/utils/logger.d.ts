/**
 * Production-Ready Logger Utility
 * Strukturiertes Logging für PSY-NEXUS Backend
 */
export declare class Logger {
    private context;
    constructor(context: string);
    log(message: string, data?: any): void;
    error(message: string, error?: any): void;
    warn(message: string, data?: any): void;
    debug(message: string, data?: any): void;
    info(message: string, data?: any): void;
}
export declare const createLogger: (context: string) => Logger;
