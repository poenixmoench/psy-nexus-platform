// src/routes/eventRoutes.ts

import express, { Router, Request, Response } from 'express'; // Korrektur: Express und Typen korrekt importieren
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent
} from '../db/eventQueries'; // Korrektur: Relativer Pfad zu eventQueries (geht eine Ebene hoch von /routes nach /src, dann in /db)

// Du könntest auch connectDB benötigen, falls du die Verbindung hier direkt nutzt, was aber untypisch ist.
// import { connectDB } from '../db/connection'; 

// Erstellung des Express-Routers
const router: Router = express.Router();

// ------------------------------------------------------------------
// POST / - Create a new event
router.post('/', async (req: Request, res: Response) => { // Korrektur: Request- und Response-Typen explizit setzen
  // Destructuring aller möglichen Felder, die in req.body vorhanden sein können
  const { name, description, start_date, end_date, location, genres, lineup, ticket_link, ticket_type, created_by } = req.body;

  // Grundlegende Validierung
  if (!name || !description || !start_date || !end_date || !location || !created_by) {
    return res.status(400).json({ message: 'Missing required fields: name, description, start_date, end_date, location, and created_by' });
  }

  try {
    const newEvent = await createEvent(req.body);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    // Beachte: Der Fehler-Code (500) war im ursprünglichen Code unvollständig
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET / - Get all events
router.get('/', async (req: Request, res: Response) => {
  try {
    const events = await getAllEvents();
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching all events:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /:id - Get an event by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await getEventById(parseInt(id));
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /:id - Update an event by ID
router.put('/:id', async (req: Request, res: Response) => {
  const { name, description, start_date, end_date, location, genres, lineup, ticket_link, ticket_type, created_by } = req.body;
  if (!name && !description && !start_date && !end_date && !location && !genres && !lineup && !ticket_link && !ticket_type && !created_by) {
    return res.status(400).json({ message: 'At least one field must be provided for update' });
  }
  try {
    const { id } = req.params;
    const updatedEvent = await updateEvent(parseInt(id), req.body);
    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /:id - Delete an event by ID
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await deleteEvent(parseInt(id));
    if (!result) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; // Exportiere den Router
