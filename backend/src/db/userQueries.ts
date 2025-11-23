import { Pool } from 'pg';
import { pool } from './connection'; // Importiere den bereits erstellten Pool

// Funktion zum Erstellen der Benutzertabelle, falls sie nicht existiert
export async function setupUserTable() {
  console.log('Setting up users table...');
  const createQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  try {
    await pool.query(createQuery);
    console.log('Users table setup complete.');
  } catch (err) {
    if (err instanceof Error) {
      console.error('Error setting up users table:', err.stack);
    } else {
      console.error('Error setting up users table:', err);
    }
  }
}

export const createUser = async (username: string, email: string, passwordHash: string): Promise<number> => {
    const query = `
        INSERT INTO users (username, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id;
    `;
    try {
        const res = await pool.query(query, [username, email, passwordHash]);
        return res.rows[0].id;
    } catch (err) {
        console.error('Error creating user:', err);
        throw new Error('Failed to create user');
    }
};

export const findUserByEmail = async (email: string): Promise<any | null> => {
    const query = 'SELECT * FROM users WHERE email = $1';
    try {
        const res = await pool.query(query, [email]);
        return res.rows[0] || null;
    } catch (err) {
        console.error('Error finding user by email:', err);
        throw new Error('Failed to find user by email');
    }
};

export const findUserByUsername = async (username: string): Promise<any | null> => {
    const query = 'SELECT * FROM users WHERE username = $1';
    try {
        const res = await pool.query(query, [username]);
        return res.rows[0] || null;
    } catch (err) {
        console.error('Error finding user by username:', err);
        throw new Error('Failed to find user by username');
    }
};
