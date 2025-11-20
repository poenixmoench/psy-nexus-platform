// backend/src/routes/index.ts
import { Router } from 'express';

const router = Router();

// Health Check Endpoint (zum Testen der Konnektivität)
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'psy-nexus-backend', database: 'ready' });
});

export default router;
