const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const authenticateJWT = require('../middleware/auth');

// Get Events (Chronological: LIVE → FUTURE → PAST)
router.get('/events', authenticateJWT, async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }); // Assuming date is stored as DATE
    const now = new Date();

    const sortedEvents = events.map(event => {
      const eventDate = new Date(event.date);
      let status = 'past';
      if (eventDate >= now) status = 'future';
      if (eventDate.toDateString() === now.toDateString()) status = 'live';
      return { ...event._doc, status };
    });

    // Sort by status: live -> future -> past
    sortedEvents.sort((a, b) => {
      const order = { live: 0, future: 1, past: 2 };
      return order[a.status] - order[b.status];
    });

    res.status(200).json(sortedEvents);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create Event
router.post('/events', authenticateJWT, async (req, res) => {
  try {
    const { title, date, location, genre, price } = req.body;
    const event = new Event({
      title,
      date,
      location,
      genre,
      price,
      organizer_id: req.user.id,
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete Event
router.delete('/events/:id', authenticateJWT, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.organizer_id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await event.remove();
    res.status(200).json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
