import { Pool } from 'pg';

// Interface für die Benutzerdaten aus der Datenbank
interface User {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
}

// Funktion zum Erstellen der Benutzertabelle, falls sie nicht existiert
export async function setupUserTable(pool: Pool) {
  // Expliziter Zeilenumbruch und Leerzeichen verwendet, um unsichtbare Zeichen zu vermeiden
  const createQuery = 'CREATE TABLE IF NOT EXISTS users (' +
                     'id SERIAL PRIMARY KEY, ' +
                     'username VARCHAR(255) UNIQUE NOT NULL, ' +
                     'email VARCHAR(255) UNIQUE NOT NULL, ' +
                     'password_hash VARCHAR(255) NOT NULL, ' +
                     'created_at TIMESTAMP DEFAULT NOW()' +
                     ');';
  try {
    await pool.query(createQuery);
    console.log('User table has been created or already exists.');
  } catch (error) {
    console.error('Error creating user table:', error);
  }
}

// Funktion zum Hinzufügen eines neuen Benutzers
export async function addUser(pool: Pool, username: string, email: string, passwordHash: string): Promise<number | null> {
  const query = 'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id;';
  const values = [username, email, passwordHash];
  try {
    const result = await pool.query(query, values);
    return result.rows[0].id;
  } catch (error) {
    console.error('Error adding user:', error);
    return null;
  }
}

// Funktion zum Suchen eines Benutzers anhand von username oder email
export async function findUserByUsernameOrEmail(pool: Pool, identifier: string): Promise<User | null> {
  const query = 'SELECT id, username, email, password_hash FROM users WHERE username = $1 OR email = $1;';
  const values = [identifier];
  try {
    const result = await pool.query(query, values);
    if (result.rows.length > 0) {
      return result.rows[0] as User;
    }
    return null;
  } catch (error) {
    console.error('Error finding user:', error);
    return null;
  }
}
