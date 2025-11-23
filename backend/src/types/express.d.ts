// Definiert den Typ des Benutzerobjekts, das an req.user angehängt wird
interface UserPayload {
    id: number;
    email: string;
    username: string;
}

// Erweitert das Express Request-Interface
declare namespace Express {
    export interface Request {
        user?: UserPayload; // Optional gemacht, falls nicht immer authentifiziert
    }
}
