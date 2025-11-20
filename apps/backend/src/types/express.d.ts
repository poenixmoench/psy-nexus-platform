// Definiert den Typ des Benutzerobjekts, das an req.user angehängt wird
interface UserPayload {
    id: number;
    email: string;
}

// Erweitert das Express Request-Interface
declare namespace Express {
    export interface Request {
        user: UserPayload;
    }
}
