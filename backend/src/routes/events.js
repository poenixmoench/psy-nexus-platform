const express = require('express');
const router = express.Router();
const db = require('../db');
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM events ORDER BY date DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});
router.post('/', async (req, res) => {
  const { title, description, location, date, time } = req.body;
  if (!title || !date) return res.status(400).json({ error: 'Title and date required' });
  try {
    const { rows } = await db.query(
      'INSERT INTO events (title, description, location, date, time) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, location, date, time]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});
router.put('/:id', async (req, res) => {
  const { title, description, location, date, time } = req.body;
  try {
    const { rows } = await db.query(
      'UPDATE events SET title=$1, description=$2, location=$3, date=$4, time=$5, updated_at=CURRENT_TIMESTAMP WHERE id=$6 RETURNING *',
      [title, description, location, date, time, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await db.query('DELETE FROM events WHERE id = $1 RETURNING *', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event deleted', event: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});
module.exports = router;
