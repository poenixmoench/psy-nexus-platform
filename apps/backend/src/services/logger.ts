import fs from 'fs';
import path from 'path';

const logDir = process.env.LOG_DIR || './logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = {
  info: (message: string, data?: any) => {
    console.log(`ℹ️ ${message}`, data || '');
    fs.appendFileSync(path.join(logDir, 'combined.log'), JSON.stringify({ level: 'info', message, data, timestamp: new Date().toISOString() }) + '\n');
  },
  warn: (message: string, data?: any) => {
    console.warn(`⚠️ ${message}`, data || '');
    fs.appendFileSync(path.join(logDir, 'combined.log'), JSON.stringify({ level: 'warn', message, data, timestamp: new Date().toISOString() }) + '\n');
  },
  error: (message: string, data?: any) => {
    console.error(` [ERR]  ${message}`, data || '');
    fs.appendFileSync(path.join(logDir, 'error.log'), JSON.stringify({ level: 'error', message, data, timestamp: new Date().toISOString() }) + '\n');
  }
};

export default logger;
