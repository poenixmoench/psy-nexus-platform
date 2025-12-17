import { Request, Response, NextFunction } from 'express';
/**
 * Express Middleware zur Begrenzung der Anfragen pro IP-Adresse.
 * Schützt die Agenten-Endpunkte vor Überlastung.
 */
export declare const agentRateLimiter: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=rate-limiter.d.ts.map