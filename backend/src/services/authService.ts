import { Client } from 'pg';
import bcrypt from 'bcrypt';

const dbConfig = {
    user: process.env.POSTGRES_USER || 'psyuser',
    host: process.env.POSTGRES_HOST || 'docker-db-1',
    database: process.env.POSTGRES_DB || 'psynexusdb',
    password: process.env.POSTGRES_PASSWORD || 'SuperSecurePassword123',
    port: 5432,
};

const SALT_ROUNDS = 10;

/**
 * Registers a new user by hashing the password and inserting credentials into the database.
 * @param username 
 * @param email 
 * @param password 
 * @returns {Promise<boolean>} True if registration is successful, false otherwise (e.g., if user already exists).
 */
export async function registerUser(username: string, email: string, password: string): Promise<boolean> {
    const client = new Client(dbConfig);
    
    try {
        await client.connect();
        
        // 1. Passwort hashen
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // 2. User in die DB einfügen
        const query = 'INSERT INTO users(username, email, password_hash) VALUES($1, $2, $3) RETURNING id';
        const values = [username, email, hashedPassword];
        
        const res = await client.query(query, values);

        return res.rowCount === 1; // Erfolgreich, wenn genau eine Zeile eingefügt wurde

    } catch (error: any) {
        // Prüfe auf Unique Constraint Violation (Fehlercode 23505 ist Postgres für unique_violation)
        if (error.code === '23505') {
            console.warn(`Registration failed: User with email ${email} or username ${username} already exists.`);
            return false;
        }
        console.error('Database error during user registration:', error);
        return false;
    } finally {
        await client.end();
    }
}
