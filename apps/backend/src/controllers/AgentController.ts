import { Request, Response } from 'express';
import { OllamaService } from '../services/OllamaService';

export class AgentController {
  static async handleStream(req: Request, res: Response) {
    const { message, agentName } = req.body;
    try {
      await OllamaService.generateStream(message, agentName, (chunk) => {
      });
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAllAgents(req: Request, res: Response) {
    const agents = [
      { name: 'ORION', role: 'Strategische Leitung' },
      { name: 'PLAN-AGENT', role: 'Projekt-Koordination' },
      { name: 'FRONTEND-MEISTER', role: 'UI/UX-Architektur' },
      { name: 'DESIGN-ALCHEMIST', role: 'Lead Visual Architect' },
      { name: 'BACKEND-ARCHITEKT', role: 'System-Infrastruktur' },
      { name: 'QA-GURU', role: 'Qualitätssicherung' },
      { name: 'OPTIMIERER', role: 'Performance-Tuning' },
      { name: 'DOKUMENTATION-AGENT', role: 'Technische Dokumentation' }
    ];
    res.json(agents);
  }
}
