import { Request, Response, NextFunction } from 'express';
import config from '../config/config';

export const addSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
};

export const rateLimit = (req: Request, res: Response, next: NextFunction) => {
  // Dies ist eine sehr vereinfachte Rate-Limiting-Logik.
  // In der Produktion würde man eine Bibliothek wie 'express-rate-limit' verwenden.
  const now = Date.now();
  const windowStart = now - config.security.rateLimitWindowMs;

  // Hier würde man normalerweise einen Speicher (z.B. Redis) verwenden, um IPs und Zeitstempel zu tracken.
  // Für dieses Beispiel wird ein simples In-Memory-Array verwendet, was bei Server-Neustarts verloren geht.
  if (!req.app.locals.requestHistory) {
    req.app.locals.requestHistory = new Map<string, number[]>();
  }

  const clientIP = req.ip || 'unknown';
  const history = req.app.locals.requestHistory.get(clientIP) || [];
  const recentRequests = history.filter((timestamp: number) => timestamp > windowStart);
  req.app.locals.requestHistory.set(clientIP, [...recentRequests, now]);

  if (recentRequests.length >= config.security.rateLimitMaxRequests) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  next();
};
