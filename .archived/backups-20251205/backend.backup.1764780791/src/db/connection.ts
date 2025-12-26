import { Pool } from 'pg';

// Verwende DATABASE_URL, die durch Docker Compose gesetzt wird
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.error("FATAL: DATABASE_URL Umgebungsvariable fehlt.");
    // Exit the process to prevent the server from starting without DB config
    process.exit(1); 
}

export const pool = new Pool({
  connectionString: dbUrl,
  // Optional: Connection pooling settings
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function connectDB(): Promise<void> {
  console.log('Attempting to connect to the database...');
  try {
    // Führe einen simplen Query aus, um zu testen, ob der Pool funktioniert
    await pool.query('SELECT 1;');
    console.log('✅ Connected to the database successfully.');
  } catch (err) {
    console.error('❌ Error connecting to the database:', err);
    throw err;
  }
}
