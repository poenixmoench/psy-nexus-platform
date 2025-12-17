const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Session = require('../models/Session');

// GET /api/user/sessions/me - Geschützt
router.get('/me', auth, async (req, res) => {
    try {
        // JWT decoded hat userId, NICHT id!
        const userId = req.user.userId;
        
        const session = await Session.findOne({ userId: userId, status: 'active' })
            .sort({ lastActivity: -1 })
            .populate('userId', 'username email');

        if (!session) {
            return res.status(404).json({ msg: 'Keine aktive Session gefunden' });
        }

        res.json({
            status: 'success',
            msg: 'Session geladen',
            session
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Serverfehler: ' + err.message });
    }
});

// POST /api/user/sessions/start - Geschützt
router.post('/start', auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Schließe vorherige Sessions
        await Session.updateMany({ userId: userId, status: 'active' }, { status: 'paused' });

        const newSession = new Session({
            userId: userId,
            status: 'active'
        });

        await newSession.save();

        res.status(201).json({
            status: 'success',
            msg: 'Neue Session gestartet',
            sessionId: newSession._id
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Serverfehler: ' + err.message });
    }
});

module.exports = router;
