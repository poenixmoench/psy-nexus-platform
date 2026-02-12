"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const authService_1 = require("../services/authService"); // Importiere die Service-Funktionen
const validation_1 = require("../middleware/validation"); // Importiere die Validierungs-Middleware
const authSchemas_1 = require("../validation/authSchemas"); // Importiere die Zod-Schemas
const router = (0, express_1.Router)();
// POST /auth/register
// Verwendet die 'validate' Middleware mit 'registerSchema'
router.post('/register', (0, validation_1.validate)(authSchemas_1.registerSchema), async (req, res) => {
    try {
        // req.body ist hier bereits durch die Middleware validiert und bereinigt
        const { username, email, password } = req.body;
        // Rufe die Service-Funktion auf
        const token = await (0, authService_1.registerUser)(username, email, password);
        if (!token) {
            // Dieser Fall tritt ein, wenn ein unerwarteter Fehler in registerUser aufgetreten ist
            // (z.B. Datenbankfehler während des Speicherns nach erfolgreichem Hashing)
            return res.status(500).json({ error: 'Registration failed due to a server error.' });
        }
        // Erfolgreiche Registrierung: Token zurückgeben
        res.status(201).json({ token });
    }
    catch (error) {
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
router.post('/login', (0, validation_1.validate)(authSchemas_1.loginSchema), async (req, res) => {
    try {
        // req.body ist hier bereits durch die Middleware validiert und bereinigt
        const { email, password } = req.body;
        // Rufe die Service-Funktion auf
        const token = await (0, authService_1.loginUser)(email, password);
        if (!token) {
            // Dieser Fall tritt ein, wenn ein unerwarteter Fehler in loginUser aufgetreten ist
            // (z.B. Datenbankfehler während des Abgleichs)
            return res.status(500).json({ error: 'Login failed due to a server error.' });
        }
        // Erfolgreicher Login: Token zurückgeben
        res.json({ token });
    }
    catch (error) {
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
exports.authRoutes = router;
exports.default = router;
