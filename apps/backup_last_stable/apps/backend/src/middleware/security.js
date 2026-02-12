"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = exports.addSecurityHeaders = void 0;
const config_1 = __importDefault(require("../config/config"));
const addSecurityHeaders = (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
};
exports.addSecurityHeaders = addSecurityHeaders;
const rateLimit = (req, res, next) => {
    // Dies ist eine sehr vereinfachte Rate-Limiting-Logik.
    // In der Produktion würde man eine Bibliothek wie 'express-rate-limit' verwenden.
    const now = Date.now();
    const windowStart = now - config_1.default.security.rateLimitWindowMs;
    // Hier würde man normalerweise einen Speicher (z.B. Redis) verwenden, um IPs und Zeitstempel zu tracken.
    // Für dieses Beispiel wird ein simples In-Memory-Array verwendet, was bei Server-Neustarts verloren geht.
    if (!req.app.locals.requestHistory) {
        req.app.locals.requestHistory = new Map();
    }
    const clientIP = req.ip || 'unknown';
    const history = req.app.locals.requestHistory.get(clientIP) || [];
    const recentRequests = history.filter((timestamp) => timestamp > windowStart);
    req.app.locals.requestHistory.set(clientIP, [...recentRequests, now]);
    if (recentRequests.length >= config_1.default.security.rateLimitMaxRequests) {
        return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    next();
};
exports.rateLimit = rateLimit;
