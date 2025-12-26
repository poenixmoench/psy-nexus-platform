import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

router.get('/api/agents', (req: Request, res: Response) => {
    try {
        const agentsDir = path.join(__dirname, '../agents');
        const files = fs.readdirSync(agentsDir);
        
        const iconMap: Record<string, string> = {
            'SecurityAuditAgent': '🛡️',
            'CodeReviewAgent': '📝',
            'BugFixerAgent': '🐛',
            'ArchitectureAnalyzer': '🏛️',
            'PerformanceTuner': '⚡',
            'NexusKoordinator': '🧠',
            'QwenCoder': '💻'
        };

        const agents = files
            .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
            .map(file => {
                const id = file.replace(/\.(ts|js)$/, '');
                // Name verschönern (z.B. CamelCase zu Leerzeichen)
                const name = id.replace(/([A-Z])/g, ' $1').trim();
                return {
                    id,
                    name,
                    icon: iconMap[id] || '🤖',
                    description: `Automatisierter Agent: ${id}`
                };
            });

        res.json(agents);
    } catch (error) {
        console.error('Fehler beim Scannen der Agenten:', error);
        res.status(500).json({ error: 'Konnte Agenten-Registry nicht lesen' });
    }
});

// Hier folgen deine restlichen History-Routen...
export default router;
