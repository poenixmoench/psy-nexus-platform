import { pool } from './connection.js';

export async function setupEventTable(): Promise<void> {
    const createEventsTableQuery = `
        CREATE TABLE IF NOT EXISTS events (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            start_date TIMESTAMP WITH TIME ZONE NOT NULL,
            end_date TIMESTAMP WITH TIME ZONE NOT NULL,
            location VARCHAR(255) NOT NULL,
            genres TEXT[] NOT NULL DEFAULT '{}',
            lineup TEXT[] NOT NULL DEFAULT '{}',
            ticket_link TEXT,
            ticket_type TEXT,
            created_by INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(createEventsTableQuery);
        console.log("✅ Events table checked/created successfully.");
    } catch (error: any) {
        if (error.code !== '42P07') {
            console.warn("⚠️  Warning: Events table setup:", error.message);
        }
    }
}

interface Event {
  id: number;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  location: string;
}

export async function getEvents(): Promise<Event[]> {
  const result = await pool.query('SELECT * FROM events');
  return result.rows;
}

export async function getAllEvents(): Promise<Event[]> {
  return getEvents();
}

export async function getEventById(id: number): Promise<Event | null> {
  const result = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function createEvent(event: any): Promise<Event> {
  const result = await pool.query(
    'INSERT INTO events (name, description, start_date, end_date, location, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [event.name, event.description, event.start_date, event.end_date, event.location, event.created_by]
  );
  return result.rows[0];
}

export async function updateEvent(id: number, event: any): Promise<Event | null> {
  const result = await pool.query(
    'UPDATE events SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
    [event.name, event.description, id]
  );
  return result.rows[0] || null;
}

export async function deleteEvent(id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING id', [id]);
  return result.rows.length > 0;
}
