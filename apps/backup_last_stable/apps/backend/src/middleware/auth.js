"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Middleware zur JWT-Authentifizierung und -Autorisierung
// Benutzt die globale Typdefinition von 'req.user' aus src/types/express.d.ts
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    // Format: Bearer <token>
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error('JWT_SECRET is not defined in environment variables!');
        return res.status(500).json({ error: 'Server configuration error: Missing JWT secret.' });
    }
    jsonwebtoken_1.default.verify(token, secret, (err, decodedUser) => {
        if (err) {
            // 403 Forbidden: Token ist ungültig oder abgelaufen
            console.error('JWT Verification Error:', err);
            return res.status(403).json({ error: 'Invalid or expired token.' });
        }
        // Das 'decodedUser' enthält den Payload des Tokens (z.B. { id: ... })
        // Speichere es im Request-Objekt ab, damit nachfolgende Handler darauf zugreifen können
        // Die Typisierung von req.user erfolgt global in express.d.ts
        // req.user ist vom Typ UserPayload (aus express.d.ts), also casten wir decodedUser entsprechend
        // Da decodedUser vom JWT generisch ist, müssen wir sicherstellen, dass es der Struktur von UserPayload entspricht.
        // Hier gehen wir davon aus, dass das Token { id, email, username } enthält.
        req.user = decodedUser; // <-- Verwendet die globale Typdefinition
        next(); // Gehe zur nächsten Middleware/Route
    });
}
