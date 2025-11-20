import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { pool } from '../db/connection';

export const eventRouter = Router();

eventRouter.get('/', authenticateToken, async (req, res) => {
    console.log('User ID:', req.user?.id);

    try {
        // Beispiel-Query: Funktioniert nur, wenn die DB eine 'events' Tabelle hat
        const result = await pool.query('SELECT * FROM events');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Fehler beim Abrufen der Events' });
    }
});
