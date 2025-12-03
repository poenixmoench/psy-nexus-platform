import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Agent Routes OK' });
});

export default router;
