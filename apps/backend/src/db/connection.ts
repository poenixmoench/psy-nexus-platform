import { Pool } from 'pg'; 

// Stellen Sie sicher, dass dies exportiert wird
export const pool = new Pool({
  // Fügen Sie hier Ihre DB-Konfiguration ein (aus ENV-Variablen)
  user: process.env.DB_USER,
  host: process.env.DB_HOST || 'db', // 'db' ist der Docker-Compose-Dienstname
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
});

// Stellen Sie sicher, dass dies exportiert wird
export function connectDB() {
  console.log('Attempting to connect to the database...');
  // Ihre Verbindungslogik
}
