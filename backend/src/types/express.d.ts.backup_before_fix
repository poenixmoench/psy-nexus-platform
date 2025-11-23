// Definiert den Typ des Benutzerobjekts, das an req.user angehängt wird
// Angepasst an die tatsächliche Nutzung in auth.ts (speichert nur die ID aus dem JWT)
interface UserPayload {
    id: number;
    // email und username wurden entfernt, da sie in auth.ts nicht aus dem Token extrahiert werden
    // und sonst zu TS2739 führen würden.
}

// Erweitert das Express Request-Interface
// Mache 'user' optional, damit es undefined sein kann, wenn nicht authentifiziert
declare namespace Express {
    export interface Request {
        user?: UserPayload; // Optional gemacht
    }
}
