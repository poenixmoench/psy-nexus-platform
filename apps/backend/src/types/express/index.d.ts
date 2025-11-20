import { User } from '../../models/userModel';

declare global {
    namespace Express {
        // Erweitert den Standard-Request-Typ von Express
        interface Request {
            user?: User; // Fügt eine optionale 'user'-Eigenschaft hinzu
        }
    }
}
