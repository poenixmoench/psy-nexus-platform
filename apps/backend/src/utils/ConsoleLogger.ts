import { Logger, LogLevel } from '../types/Logger';

class ConsoleLogger implements Logger {
  log(level: LogLevel, component: string, operation: string, message: string, details?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] [${component}] [${operation}] ${message}`;
    if (details) {
      console.log(logEntry, details);
    } else {
      console.log(logEntry);
    }
  }

  info(component: string, operation: string, message: string, details?: any): void {
    this.log(LogLevel.INFO, component, operation, message, details);
  }

  warn(component: string, operation: string, message: string, details?: any): void {
    this.log(LogLevel.WARN, component, operation, message, details);
  }

  error(component: string, operation: string, message: string, details?: any): void {
    this.log(LogLevel.ERROR, component, operation, message, details);
  }
}

export default ConsoleLogger;
