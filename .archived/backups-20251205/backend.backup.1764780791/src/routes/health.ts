import { Router, Request, Response } from 'express';

const router = Router();

// GET /health - Einfacher Health-Check-Endpunkt
router.get('/', (req: Request, res: Response) => {
  // Prüft grundlegende Server-Konnektivität
  // Optional: Hier könntest du auch DB-Connectivity prüfen
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export const healthRoutes = router;
