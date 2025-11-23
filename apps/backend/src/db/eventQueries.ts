import { pool } from './connection'; // Importiert den Pool
// import { Pool } from 'pg'; // Optional, wenn nicht anderweitig benötigt

// Korrigierte CREATE TABLE Query für Events (gemäß M1.3 Spezifikation)
export const createEventTableQuery = `
  CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,           -- Name des Events
    description TEXT NOT NULL,            -- Beschreibung
    start_date TIMESTAMP WITH TIME ZONE NOT NULL, -- Startdatum/Uhrzeit
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,   -- Enddatum/Uhrzeit
    location VARCHAR(255) NOT NULL,       -- Ort
    genres TEXT[],                        -- Genres als Array von Strings
    created_by INTEGER REFERENCES users(id) ON DELETE CASCADE -- Fremdschlüssel zu users
  );
`;

// Funktion zum Erstellen der Tabelle
export async function setupEventTable() {
  console.log('Setting up events table...');
  try {
    await pool.query(createEventTableQuery);
    console.log('Events table setup complete.');
  } catch (err) {
    console.error('Error setting up events table:', err);
    // Optional: throw err; um den Fehler weiterzuverbreiten
  }
}

// Optional: Exportiere CRUD-Funktionen hier
// z.B. export { getEvents, createEvent, ... };
