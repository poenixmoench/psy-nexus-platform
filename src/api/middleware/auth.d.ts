import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            devKey?: string;
        }
    }
}
export declare const authDevMiddleware: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
//# sourceMappingURL=auth.d.ts.map