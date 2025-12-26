import { Client } from 'pg';

const client = new Client({
    host: process.env.DB_HOST || 'db', // Nutze den Dienstnamen 'db' innerhalb des Docker-Netzwerks
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'psy_nexus_user',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'psy_nexus_db',
});

export async function connectDB() {
    try {
        await client.connect();
        console.log('Database connected successfully! (Host: db)');
        const res = await client.query('SELECT NOW()');
        console.log('Test query successful. Current DB time:', res.rows[0].now);
        return client;
    } catch (err) {
        console.error('Database connection error:', err);
        throw err; // Wirft den Fehler, damit der Startvorgang abbricht
    }
}
