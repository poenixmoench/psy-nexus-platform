import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

export const cspMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const cspHeaderArray = [
    "default-src 'none'",
    "script-src 'self' https://cdn.jsdelivr.net",
    "style-src 'self' https://cdn.jsdelivr.net https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.psy-nexus.live",
    "form-action 'self'",
    "frame-src 'self'",
    "object-src 'none'",
    "media-src 'self'",
    "manifest-src 'self'",
    "report-uri /api/security/csp-report",
    "upgrade-insecure-requests"
  ];
  const cspHeader = cspHeaderArray.join('; ');
  res.setHeader('Content-Security-Policy', cspHeader);
  res.setHeader('Content-Security-Policy-Report-Only', cspHeader);
  next();
};

export const securityHeadersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');
  next();
};

export const corsMiddleware = cors({
  origin: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
});

export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

export const aiRateLimitMiddleware = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  keyGenerator: (req: any) => req.user?.id || req.ip,
  message: 'Too many AI requests. Please wait before trying again.'
});
