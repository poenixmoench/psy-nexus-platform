import { Request, Response, NextFunction } from 'express';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    (req as any).user = { id: 1, username: 'testuser' };
    next();
};
