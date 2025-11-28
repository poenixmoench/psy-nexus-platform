// /root/psy-nexus-platform/apps/backend/src/index.ts

import express from 'express';
import { connectDB } from './db/connection';
// --- NEU: Importiere setupEventTable ---
import { setupEventTable } from './db/eventQueries';
// --- ENDE NEU ---
import { authRoutes } from './routes/authRoutes';
// HINZUGEFÜGT: Importiere den Event-Router
import eventRoutes from './routes/eventRoutes';

const app = express();

async function initializeApp() {
  try {
    // 1. Datenbankverbindung herstellen
    await connectDB();

    console.log('Database connected successfully.');

    // --- NEU: Tabellen erstellen/überprüfen ---
    await setupEventTable();
    console.log('Database tables checked/created.');
    // --- ENDE NEU ---

    // Weitere Initialisierungen (falls vorhanden)
  } catch (err) {
    console.error('Failed to initialize app:', err);
    process.exit(1); // Beendet den Prozess bei einem Fehler
  }
}

initializeApp().then(() => {
  // Middleware
  app.use(express.json()); // <-- KORRIGIERT: Hinzugefügt

  // Einfache Health Check Route
  app.get('/api/health', (req, res) => {
    res.status(200).send({ status: 'OK', message: 'Backend is running' });
  });

  // Weitere Middleware und Routen
  app.use('/auth', authRoutes);

  // KORRIGIERT: Registriere den Event-Router
  app.use('/api/events', eventRoutes); // <-- KORRIGIERT: Hinzugefügt

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Backend server starting on port ${PORT}...`);
  });
});

export { app };
