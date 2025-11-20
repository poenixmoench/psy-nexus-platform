import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
    createEvent as createEventService, 
    getAllEvents as getAllEventsService, 
    getEventById as getEventByIdService, 
    updateEvent as updateEventService, 
    deleteEvent as deleteEventService 
} from '../services/eventService';

const router = Router();

// POST /events - GESCHÜTZT
router.post('/', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { title, date } = req.body;
        if (!title || !date) {
            return res.status(400).json({ error: 'Title and date are required' });
        }
        const newEvent = await createEventService(title, date);
        if (newEvent === null) {
            return res.status(500).json({ error: 'Failed to create event' });
        }
        res.status(201).json(newEvent);
    } catch (error) {
        console.error('Error in /events POST:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /events - UNGESCHÜTZT (Read-only Access)
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

// GET /events/:id - UNGESCHÜTZT (Read-only Access)
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

// PUT /events/:id - GESCHÜTZT
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
        const eventId = parseInt(req.params.id, 10);
        const { title, date } = req.body; 
        
        if (isNaN(eventId) || !title || !date) {
            return res.status(400).json({ error: 'Missing or invalid parameters' });
        }
        
        const updatedEvent = await updateEventService(eventId, title, date);
        
        if (updatedEvent === null) {
            return res.status(404).json({ error: 'Event not found or update failed' });
        }
        res.json(updatedEvent);
    } catch (error) {
        console.error('Error in /events/:id PUT:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE /events/:id - GESCHÜTZT
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
        const eventId = parseInt(req.params.id, 10);
        if (isNaN(eventId)) {
            return res.status(400).json({ error: 'Invalid event ID' });
        }
        const deletedEvent = await deleteEventService(eventId);
        if (deletedEvent === null) { 
            return res.status(404).json({ error: 'Event not found' });
        } 
        res.json(deletedEvent);
    } catch (error) {
        console.error('Error in /events/:id DELETE:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export const eventRoutes = router;
