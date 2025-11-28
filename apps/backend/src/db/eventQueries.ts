import { pool } from './connection';

// --- NEU: Funktion zum Erstellen der Events-Tabelle ---
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
        console.log("Events table checked/created successfully.");
    } catch (error) {
        console.error("Error setting up events table:", error);
        throw error; // Wichtig: Fehler weiterwerfen, damit der Startvorgang abbricht
    }
}
// --- ENDE NEU ---

// Bestehendes Interface für ein Event-Objekt (Rückgabetyp für Abfragen)
interface Event {
  id: number;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  location: string;
  genres: string[];
  lineup: string[];
  ticket_link?: string | null;
  ticket_type?: string | null;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

// Neues Interface für die Eingabedaten bei der Event-Erstellung
// Hier werden alle Felder als optional markiert, die auch optional sein sollen
interface CreateEventInput {
  name: string; // Angenommen, dies ist immer erforderlich
  description: string; // Angenommen, dies ist immer erforderlich
  start_date: Date; // Angenommen, dies ist immer erforderlich
  end_date: Date; // Angenommen, dies ist immer erforderlich
  location: string; // Angenommen, dies ist immer erforderlich
  created_by: number; // Angenommen, dies ist immer erforderlich
  // Optionale Felder
  genres?: string[]; // Kann undefined sein, DB-Standard '{}' wird verwendet
  lineup?: string[]; // Kann undefined sein, DB-Standard '{}' wird verwendet
  ticket_link?: string | null; // Kann undefined oder null sein
  ticket_type?: string | null; // Kann undefined oder null sein
}

// Angepasste createEvent-Funktion mit neuem Interface und korrektem Umgang mit optionalen Feldern
export async function createEvent(event: CreateEventInput): Promise<Event> {
  try {
    // Verwende COALESCE, um sicherzustellen, dass entweder der übergebene Wert oder das DB-DEFAULT verwendet wird
    // Für TEXT[]-Felder: COALESCE($genres, '{}')
    // Für TEXT-Felder, die NULL sein dürfen: $ticket_link (kann null/undefined sein)
    const query = `
      INSERT INTO events (name, description, start_date, end_date, location, genres, lineup, ticket_link, ticket_type, created_by)
      VALUES ($1, $2, $3, $4, $5, COALESCE($6, '{}'), COALESCE($7, '{}'), $8, $9, $10)
      RETURNING *;
    `;
    // Die Reihenfolge der Werte muss mit der Reihenfolge in der VALUES-Klausel übereinstimmen
    const values = [
      event.name,
      event.description,
      event.start_date,
      event.end_date,
      event.location,
      event.genres, // Wird als Array oder undefined übergeben, COALESCE im Query kümmert sich um das DEFAULT
      event.lineup, // Wird als Array oder undefined übergeben, COALESCE im Query kümmert sich um das DEFAULT
      event.ticket_link, // Wird als string, null oder undefined übergeben
      event.ticket_type, // Wird als string, null oder undefined übergeben
      event.created_by
    ];
    const result = await pool.query(query, values);
    // Gib das erstellte Event-Objekt zurück
    const createdEvent = result.rows[0];
    // Stelle sicher, dass Datumswerte als Date-Objekte zurückgegeben werden
    return {
      ...createdEvent,
      start_date: new Date(createdEvent.start_date),
      end_date: new Date(createdEvent.end_date),
      created_at: new Date(createdEvent.created_at),
      updated_at: new Date(createdEvent.updated_at)
    };
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

export async function getAllEvents(): Promise<Event[]> {
  try {
    const query = 'SELECT * FROM events;';
    const result = await pool.query(query);
    return result.rows.map(row => ({
      ...row,
      start_date: new Date(row.start_date),
      end_date: new Date(row.end_date),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }));
  } catch (error) {
    console.error('Error getting all events:', error);
    throw error;
  }
}

export async function getEventById(id: number): Promise<Event | null> {
  try {
    const query = 'SELECT * FROM events WHERE id = $1;';
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return null;
    const event = result.rows[0];
    return {
      ...event,
      start_date: new Date(event.start_date),
      end_date: new Date(event.end_date),
      created_at: new Date(event.created_at),
      updated_at: new Date(event.updated_at)
    };
  } catch (error) {
    console.error('Error getting event by id:', error);
    throw error;
  }
}

// Angepasste updateEvent-Funktion, die updated_at automatisch setzt
export async function updateEvent(id: number, updates: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at'>>): Promise<Event> {
  try {
    const keys = Object.keys(updates);
    // Füge 'updated_at = NOW()' hinzu
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ') + ', updated_at = NOW()';
    // Füge die ID am Ende als letzter Parameter hinzu
    const values = [...keys.map(key => updates[key as keyof typeof updates]), id];
    const query = `
      UPDATE events
      SET ${setClause}
      WHERE id = $${keys.length + 1} -- Die ID ist jetzt immer der letzte Parameter
      RETURNING *;
    `;
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
        // Optional: Werfe einen Fehler, wenn die ID nicht existiert
        throw new Error(`Event with id ${id} not found for update.`);
    }
    return result.rows[0];
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
}

export async function deleteEvent(id: number): Promise<Event | null> {
  try {
    const query = 'DELETE FROM events WHERE id = $1 RETURNING *;';
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return null;
    const event = result.rows[0];
    return {
      ...event,
      start_date: new Date(event.start_date),
      end_date: new Date(event.end_date),
      created_at: new Date(event.created_at),
      updated_at: new Date(event.updated_at)
    };
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
}

// Platzhalter-Exporte, falls du sie vorher hattest und sie temporär deaktiviert waren
// export const createEvent = async () => null;
// export const getAllEvents = async () => null;
// export const getEventById = async () => null;
// export const updateEvent = async () => null;
// export const deleteEvent = async () => null;
