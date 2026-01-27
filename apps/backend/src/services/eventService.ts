// backend/src/services/eventService.ts

// Importiere auch updateEvent und deleteEvent aus eventQueries.ts
import { 
    createEvent as dbCreateEvent, 
    getEvents as dbGetAllEvents, 
    getEventById as dbGetEventById,
    updateEvent as dbUpdateEvent,
    deleteEvent as dbDeleteEvent
} from '../db/eventQueries';

// Wrapper-Funktionen, die z.B. Validierung oder andere Logik enthalten könnten
// Hier werden einfach die Funktionen aus der Datenbankschicht (db/eventQueries.ts) direkt exportiert
// Stelle sicher, dass die Funktionen in eventQueries.ts entsprechend definiert sind (async/await)

export async function createEvent(title: string, date: string) {
  try {
    // Optional: Weitere Validierung hier
    const result = await dbCreateEvent({ title, date });
    return result;
  } catch (error) {
    console.error('Service Error creating event:', error);
    return null; // oder throw new Error(...)
  }
}

export async function getAllEvents(sort: string = 'chronological') {
  try {
    const result = await dbGetAllEvents();
    return result;
  } catch (error) {
    console.error('Service Error fetching events:', error);
    return null; // oder throw new Error(...)
  }
}

export async function getEventById(id: number) {
  try {
    const result = await dbGetEventById(id.toString());
    return result;
  } catch (error) {
    console.error('Service Error fetching event by ID:', error);
    return null; // oder throw new Error(...)
  }
}

// NEU: Exportiere updateEvent
export async function updateEvent(id: number, title: string, date: string) {
  try {
    const result = await dbUpdateEvent(id.toString(), title);
    return result;
  } catch (error) {
    console.error('Service Error updating event:', error);
    return null; // oder throw new Error(...)
  }
}

// NEU: Exportiere deleteEvent
export async function deleteEvent(id: number) {
  try {
    const result = await dbDeleteEvent(id.toString());
    return result;
  } catch (error) {
    console.error('Service Error deleting event:', error);
    return null; // oder throw new Error(...)
  }
}

// Falls du weitere Funktionen wie z.B. updateEvent, deleteEvent etc. brauchst, füge sie hier hinzu
