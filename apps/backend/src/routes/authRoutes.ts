import { Router } from 'express';
const router = Router();

// Beispielroute
router.post('/register', (req, res) => {
  // Registrierungslogik
  res.status(201).send('User registered');
});

router.post('/login', (req, res) => {
  // Login-Logik
  res.status(200).send('User logged in');
});

// Named export, um mit `import { authRoutes }` in index.ts kompatibel zu sein
export const authRoutes = router;

// Falls Sie `export default router;` verwenden wollten, müsste in `index.ts` `import authRoutes from './routes/authRoutes';` stehen.
// Aber da der Fehler TS1192 besagt, dass es keinen default export gibt, ist diese Variante korrekt.
