import { Pool } from 'pg';

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || 'db',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

// Optional: Funktion zum Testen der Pool-Verbindung
// Diese Funktion kann verwendet werden, um sicherzustellen, dass der Pool prinzipiell funktioniert,
// ist aber nicht zwingend notwendig für pool.query in anderen Funktionen.
export async function connectDB(): Promise<void> {
  console.log('Attempting to connect to the database...');
  try {
    // Führe einen simplen Query aus, um zu testen, ob der Pool funktioniert
    await pool.query('SELECT 1;');
    console.log('Connected to the database.');
  } catch (err) {
    if (err instanceof Error) {
      console.error('Error connecting to the database:', err.stack);
    } else {
      console.error('Error connecting to the database:', err);
    }
    // Wirf den Fehler weiter, damit initializeApp in index.ts ihn fängt
    throw err;
  }
}
