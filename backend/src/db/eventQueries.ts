import { pool } from './connection'; // Stelle sicher, dass der Pfad zu deiner connection.ts passt

export const createEventTableQuery = `
  CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL
  );
`;

export async function setupEventTable() {
  console.log('Setting up events table...');
  try {
    await pool.query(createEventTableQuery);
    console.log('Events table setup complete.');
  } catch (err) {
    if (err instanceof Error) {
      console.error('Error setting up events table:', err.stack);
    } else {
      console.error('Error setting up events table:', err);
    }
  }
}

export async function createEvent(title: string, date: string) {
  const query = 'INSERT INTO events(title, date) VALUES($1, $2) RETURNING *';
  const values = [title, date];
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    if (err instanceof Error) {
      console.error('Error creating event:', err.stack);
    } else {
      console.error('Error creating event:', err);
    }
    return null;
  }
}

export async function getAllEvents(sort: string = 'chronological'): Promise<any[] | null> {
  let query = 'SELECT * FROM events';
  if (sort === 'reverse_chronological') {
    query += ' ORDER BY date DESC';
  } else {
    query += ' ORDER BY date ASC';
  }
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (err) {
    if (err instanceof Error) {
      console.error('Error fetching events:', err.stack);
    } else {
      console.error('Error fetching events:', err);
    }
    return null;
  }
}

export async function getEventById(id: number) {
  const query = 'SELECT * FROM events WHERE id = $1';
  const values = [id];
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    if (err instanceof Error) {
      console.error('Error fetching event by ID:', err.stack);
    } else {
      console.error('Error fetching event by ID:', err);
    }
    return null;
  }
}

// Neue Funktion: Event aktualisieren
export async function updateEvent(id: number, title: string, date: string) {
  const query = 'UPDATE events SET title = $2, date = $3 WHERE id = $1 RETURNING *';
  const values = [id, title, date];
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    if (err instanceof Error) {
      console.error('Error updating event:', err.stack);
    } else {
      console.error('Error updating event:', err);
    }
    return null;
  }
}

// Neue Funktion: Event löschen
export async function deleteEvent(id: number) {
  const query = 'DELETE FROM events WHERE id = $1 RETURNING *';
  const values = [id];
  try {
    const result = await pool.query(query, values);
    // result.rows[0] enthält das gelöschte Event oder ist undefined, wenn keins gefunden wurde
    return result.rows[0] || null;
  } catch (err) {
    if (err instanceof Error) {
      console.error('Error deleting event:', err.stack);
    } else {
      console.error('Error deleting event:', err);
    }
    return null;
  }
}
