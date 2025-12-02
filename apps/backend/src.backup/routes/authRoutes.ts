import express, { Router, Request, Response } from 'express';
const router: Router = express.Router();
router.post('/login', (req: Request, res: Response) => { res.json({ success: true, token: 'demo-token' }); });
router.post('/register', (req: Request, res: Response) => { res.json({ success: true, message: 'User registered' }); });
export default router;
