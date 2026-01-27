import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth'; // Importiere die JWT-Middleware
// Importiere die Zod-Validierungsmiddleware
// Korrigiert: Importiere 'validate', nicht 'validateResource'
import { validate } from '../middleware/validation';
// Importiere die Zod-Schemas für Events
// Korrigiert: Importiere aus 'eventSchemas.ts', nicht 'authSchemas.ts'
import { createEventSchema, updateEventSchema } from '../validation/eventSchemas';
// Importiere die Funktionen aus eventService.ts, einschließlich der neuen für UPDATE und DELETE
import {
    createEvent as createEventService,
    getAllEvents as getAllEventsService,
    getEventById as getEventByIdService,
    updateEvent as updateEventService, // Importiere die Update-Funktion
    deleteEvent as deleteEventService  // Importiere die Delete-Funktion
} from '../services/eventService';

const router = Router();

// POST-Route zum Erstellen eines Events - GESCHÜTZT und VALIDIERT
// Korrigiert: Nutze 'validate(createEventSchema)' anstelle von 'validateResource(createEventSchema)'
router.post('/', authenticateToken, validate(createEventSchema), async (req: Request, res: Response) => {
  try {
    // Extrahiere *validierte* Daten aus dem Request-Body
    // Durch validate(createEventSchema) ist req.body jetzt vom Typ des Schemas (z.B. { title: string, date: string })
    const { title, date } = req.body;

    // Die manuelle Validierung (if (!title || !date)) ist durch Zod bereits erfolgt und kann entfernt werden.
    // Optional: Weitere spezifische Prüfungen *nach* der Zod-Validierung, z.B. ob Datum in der Zukunft liegt
    // const eventDate = new Date(date);
    // if (eventDate < new Date()) { return res.status(400).json({ error: 'Date must be in the future' }); }

    // Rufe die Service-Funktion auf
    const newEvent = await createEventService(title, date);
    if (newEvent === null) {
      return res.status(500).json({ error: 'Failed to create event' });
    }
    res.status(201).json(newEvent);
  } catch (error) {
    // Dieser Catch-Block fängt Fehler ab, die *nach* der Zod-Validierung auftreten (z.B. DB-Fehler)
    console.error('Error in /events POST:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET-Route zum Abrufen aller Events - GESCHÜTZT (optional)
// Wenn du authenticateToken hier verwenden willst, entferne das Kommentarzeichen
// router.get('/', authenticateToken, async (req: Request, res: Response) => {
router.get('/', async (req: Request, res: Response) => {
  try {
    const events = await getAllEventsService();
    if (events === null) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(events);
  } catch (error) {
    console.error('Error in /events GET:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET Route für ein einzelnes Event - GESCHÜTZT (optional)
// Wenn du authenticateToken hier verwenden willst, entferne das Kommentarzeichen
// router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id, 10);

    if (isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const event = await getEventByIdService(eventId);

    if (event === null) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error in /events/:id GET:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT-Route zum Aktualisieren eines Events - GESCHÜTZT und VALIDIERT
// Korrigiert: Nutze 'validate(updateEventSchema)' anstelle von 'validateResource(updateEventSchema)'
router.put('/:id', authenticateToken, validate(updateEventSchema), async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    // Extrahiere *validierte* neue Daten aus dem Body
    // Durch validate(updateEventSchema) ist req.body jetzt vom Typ des Schemas (z.B. { title?: string, date?: string })
    const { title, date } = req.body;

    if (isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    // Die manuelle Validierung (if (!title || !date)) ist durch Zod bereits erfolgt (wenn die Felder required sind).
    // Falls in updateEventSchema die Felder optional sind (z.B. .optional()), musst du hier prüfen,
    // ob *mindestens eines* der zu aktualisierenden Felder im Body vorhanden ist.
    // if (!title && !date) { return res.status(400).json({ error: 'At least one field (title or date) must be provided for update' }); }

    const updatedEvent = await updateEventService(eventId, title, date);

    if (updatedEvent === null) {
      // Dies kann passieren, wenn das Event mit der ID nicht existiert
      return res.status(404).json({ error: 'Event not found or update failed' });
    }

    res.json(updatedEvent);
  } catch (error) {
    // Dieser Catch-Block fängt Fehler ab, die *nach* der Zod-Validierung auftreten (z.B. DB-Fehler)
    console.error('Error in /events/:id PUT:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE-Route zum Löschen eines Events - GESCHÜTZT
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id, 10);

    if (isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const deletedEvent = await deleteEventService(eventId);

    if (deletedEvent === null) {
      // Dies bedeutet, dass kein Event mit dieser ID existierte.
      return res.status(404).json({ error: 'Event not found' });
    }

    // Erfolgreich gelöschtes Event zurückgeben (optional, 204 No Content ist auch üblich)
    res.json(deletedEvent);
  } catch (error) {
    console.error('Error in /events/:id DELETE:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export const eventRoutes = router;
