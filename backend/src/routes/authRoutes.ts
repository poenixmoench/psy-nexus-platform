import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { addUser, findUserByUsernameOrEmail } from '../db/userQueries';
// Korrekter Import des Pools
import { pool } from '../db/connection'; // <--- KORRIGIERT: Von connection.ts

const router = Router();
const SALT_ROUNDS = 10; // Fester Wert für bcrypt

// POST /auth/register
router.post('/register', async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email and password are required' });
    }

    try {
        // Überprüfen, ob Benutzer bereits existiert
        const existingUser = await findUserByUsernameOrEmail(pool, username);
        if (existingUser) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        // Passwort hashing
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Benutzer erstellen
        const userId = await addUser(pool, username, email, passwordHash);
        if (!userId) {
            return res.status(500).json({ error: 'Failed to create user' });
        }

        // JWT-Token erstellen
        // ACHTUNG: Hier wird nur die ID in das Token gepackt.
        // In der Middleware wird nur die ID aus dem Token gelesen.
        const secret = process.env.JWT_SECRET;
        if (!secret) { throw new Error('JWT_SECRET is not defined'); }
        // Signiere das Token nur mit der ID
        const token = jwt.sign({ id: userId }, secret, { expiresIn: '1h' });

        res.status(201).json({ token, id: userId, username, email });
    } catch (error) {
        console.error('Error in /auth/register:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
    const { identifier, password } = req.body; // identifier kann Username oder Email sein

    if (!identifier || !password) {
        return res.status(400).json({ error: 'Identifier (username/email) and password are required' });
    }

    try {
        // Benutzer suchen
        const user = await findUserByUsernameOrEmail(pool, identifier);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Passwort verifizieren
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // JWT-Token erstellen (nur mit ID)
        const secret = process.env.JWT_SECRET;
        if (!secret) { throw new Error('JWT_SECRET is not defined'); }
        // Signiere das Token nur mit der ID des gefundenen Benutzers
        const token = jwt.sign({ id: user.id }, secret, { expiresIn: '1h' });

        res.json({ token, id: user.id, username: user.username, email: user.email });
    } catch (error) {
        console.error('Error in /auth/login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export const authRoutes = router;
