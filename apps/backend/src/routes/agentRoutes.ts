import { Router } from 'express';
import { handleAgentRequest } from '../controllers/ollama-proxy.controller';
import { requireAgentAccess } from '../middleware/agentAuth';

const router = Router();

// Nur für den geschützten Agentenbereich zugänglich
router.get('/', requireAgentAccess, (req, res) => {
    const agents = [
        { id: "ORION", name: "Orion", role: "Orchestrator" },
        { id: "PLAN-AGENT", name: "Plan-Agent", role: "Strategie" },
        { id: "DESIGN-ALCHEMIST", name: "Design Alchemist", role: "UI/UX" },
        { id: "FRONTEND-MEISTER", name: "Frontend Meister", role: "Frontend" },
        { id: "BACKEND-ARCHITEKT", name: "Backend Architekt", role: "Backend" },
        { id: "QA-GURU", name: "QA Guru", role: "Qualität" },
        { id: "OPTIMIERER", name: "Optimierer", role: "Performance" },
        { id: "DOKUMENTATION-AGENT", name: "Dokumentator", role: "Docs" }
    ];
    res.json(agents);
});

router.post('/chat', requireAgentAccess, handleAgentRequest);

export default router;
