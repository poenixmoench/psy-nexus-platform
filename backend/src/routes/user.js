const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');

// GET /api/user/profile - Geschützt
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }

        res.json({
            status: 'success',
            msg: 'Profil erfolgreich geladen',
            user
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Serverfehler: ' + err.message });
    }
});

// PUT /api/user/profile - Geschützt
router.put('/profile', auth, async (req, res) => {
    const { username, bio, avatar } = req.body;
    const updateFields = {};

    if (username) updateFields.username = username;
    if (bio) updateFields.bio = bio;
    if (avatar) updateFields.avatar = avatar;

    try {
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: updateFields },
            { new: true }
        ).select('-password');

        res.json({
            status: 'success',
            msg: 'Profil erfolgreich aktualisiert',
            user
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Serverfehler: ' + err.message });
    }
});

// PUT /api/user/password - Geschützt
router.put('/password', auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Aktuelles Passwort ist falsch' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ status: 'success', msg: 'Passwort erfolgreich geändert' });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Serverfehler: ' + err.message });
    }
});

// DELETE /api/user/delete-account - Geschützt
router.delete('/delete-account', auth, async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user.userId,
            { $set: { status: 'inactive' } }
        );

        res.json({ status: 'success', msg: 'Account erfolgreich deaktiviert' });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Serverfehler: ' + err.message });
    }
});

module.exports = router;
