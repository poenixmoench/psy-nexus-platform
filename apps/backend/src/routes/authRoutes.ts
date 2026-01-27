import { Router, Request, Response } from 'express';
import { registerUser, loginUser } from '../services/authService'; // Importiere die Service-Funktionen
import { validate } from '../middleware/validation'; // Importiere die Validierungs-Middleware
import { registerSchema, loginSchema } from '../validation/authSchemas'; // Importiere die Zod-Schemas

const router = Router();

// POST /auth/register
// Verwendet die 'validate' Middleware mit 'registerSchema'
router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    // req.body ist hier bereits durch die Middleware validiert und bereinigt
    const { username, email, password } = req.body;

    // Rufe die Service-Funktion auf
    const token = await registerUser(username, email, password);

    if (!token) {
        // Dieser Fall tritt ein, wenn ein unerwarteter Fehler in registerUser aufgetreten ist
        // (z.B. Datenbankfehler während des Speicherns nach erfolgreichem Hashing)
        return res.status(500).json({ error: 'Registration failed due to a server error.' });
    }

    // Erfolgreiche Registrierung: Token zurückgeben
    res.status(201).json({ token });
  } catch (error) {
    console.error('Error in /auth/register route:', error);
    // Behandle spezifische Fehler von registerUser
    if (error instanceof Error) {
        if (error.message === 'Email already exists' || error.message === 'Username already exists') {
            return res.status(409).json({ error: error.message });
        }
        // Andere Fehler von registerUser (z.B. 'Could not register user') oder Validierungsfehler
        // werden als generischer 500er Fehler behandelt oder weiter unten abgefangen.
    }
    // Fallback für unerwartete Fehler
    res.status(500).json({ error: 'Internal Server Error during registration' });
  }
});

// POST /auth/login
// Verwendet die 'validate' Middleware mit 'loginSchema'
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    // req.body ist hier bereits durch die Middleware validiert und bereinigt
    const { email, password } = req.body;

    // Rufe die Service-Funktion auf
    const token = await loginUser(email, password);

    if (!token) {
        // Dieser Fall tritt ein, wenn ein unerwarteter Fehler in loginUser aufgetreten ist
        // (z.B. Datenbankfehler während des Abgleichs)
        return res.status(500).json({ error: 'Login failed due to a server error.' });
    }

    // Erfolgreicher Login: Token zurückgeben
    res.json({ token });
  } catch (error) {
    console.error('Error in /auth/login route:', error);
    // Behandle spezifische Fehler von loginUser
    if (error instanceof Error) {
        if (error.message === 'Invalid credentials') {
            return res.status(401).json({ error: error.message });
        }
        // Andere Fehler von loginUser (z.B. 'Could not log in user')
        // werden als generischer 500er Fehler behandelt oder weiter unten abgefangen.
    }
    // Fallback für unerwartete Fehler
    res.status(500).json({ error: 'Internal Server Error during login' });
  }
});

export const authRoutes = router;
