import { Request, Response, NextFunction } from 'express';

export const requireAgentAccess = (req: Request, res: Response, next: NextFunction) => {
    // Prüfe, ob der Request aus dem geschützten Agentenbereich kommt
    const userAgent = req.get('User-Agent') || '';
    const referer = req.get('Referer') || '';
    
    // Erlaube nur Zugriff, wenn:
    // 1. Der Request vom Agentenbereich kommt, ODER
    // 2. Ein spezielles Token im Header ist (für direkte API-Zugriffe)
    const isFromAgentArea = referer.includes('/dev-workspace/') || req.path.startsWith('/api/agents');
    const hasAgentToken = req.headers['x-agent-token'] === process.env.AGENT_ACCESS_TOKEN;
    
    if (isFromAgentArea || hasAgentToken) {
        next(); // Zugriff erlauben
    } else {
        res.status(403).json({ 
            error: 'Access denied. Agent functions only available in protected workspace.', 
            path: req.path 
        });
    }
};
