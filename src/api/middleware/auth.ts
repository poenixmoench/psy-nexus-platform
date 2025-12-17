import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      devKey?: string;
    }
  }
}

export const authDevMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const devKey = req.headers['x-dev-key'] as string;
  const validKey = process.env.DEV_API_KEY || 'dev-key-default';
  if (!devKey || devKey !== validKey) {
    return res.status(403).json({ error: 'Unauthorized: Invalid or missing dev key', message: 'This endpoint is for development use only.' });
  }
  req.devKey = devKey;
  next();
};
