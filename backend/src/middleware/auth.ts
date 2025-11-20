import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Typ-Interface für den Benutzerauftrag (Payload im JWT)
interface UserPayload {
    id: number;
}

// Middleware zur JWT-Authentifizierung und -Autorisierung
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    // Format: Bearer <token>
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authorization token required' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) { 
        console.error('JWT_SECRET is not defined!');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    jwt.verify(token, secret, (err, user) => {
        if (err) {
            // 403 Forbidden: Token ist ungültig oder abgelaufen
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        
        // Das User-Objekt wird in req.user gespeichert (dank express.d.ts Erweiterung)
        req.user = user as UserPayload;
        next();
    });
}
