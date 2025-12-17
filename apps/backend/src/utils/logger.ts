/**
 * Production-Ready Logger Utility
 * Strukturiertes Logging für PSY-NEXUS Backend
 */

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  log(message: string, data?: any): void {
    console.log(`[${this.context}] ${message}`, data || '');
  }

  error(message: string, error?: any): void {
    console.error(`[❌ ${this.context}] ${message}`, error || '');
  }

  warn(message: string, data?: any): void {
    console.warn(`[⚠️  ${this.context}] ${message}`, data || '');
  }

  debug(message: string, data?: any): void {
    if (process.env.DEBUG) {
      console.debug(`[🔍 ${this.context}] ${message}`, data || '');
    }
  }

  info(message: string, data?: any): void {
    console.info(`[ℹ️  ${this.context}] ${message}`, data || '');
  }
}

export const createLogger = (context: string): Logger => new Logger(context);
