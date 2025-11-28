import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

const logDir = process.env.LOG_DIR || './logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

export const auditLogMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  (req as any).requestId = requestId;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = {
      requestId,
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId: (req as any).user?.id || 'anonymous',
      ip: req.ip
    };

    const logLine = JSON.stringify(logEntry);
    fs.appendFileSync(path.join(logDir, 'audit.log'), logLine + '\n');
  });

  next();
};
