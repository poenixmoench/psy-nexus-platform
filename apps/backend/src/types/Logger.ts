export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface Logger {
  log(level: LogLevel, component: string, operation: string, message: string, details?: any): void;
  info(component: string, operation: string, message: string, details?: any): void;
  warn(component: string, operation: string, message: string, details?: any): void;
  error(component: string, operation: string, message: string, details?: any): void;
}
