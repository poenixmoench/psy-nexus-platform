import { pool } from './connection'; // FIX: Named import für 'pool'
import { Pool } from 'pg';

// Ihre Datenbankabfragen hier
export const createEventTableQuery = `
  CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date TIMESTAMP NOT NULL
  );
`;

export function setupEventTable() {
  console.log('Setting up events table...');
  // Verwendung von pool.query
  pool.query(createEventTableQuery)
    .then(res => console.log('Events table setup complete.'))
    .catch(err => console.error('Error setting up events table:', err.stack));
}
