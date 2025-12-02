import { Router, Request, Response } from 'express';

const router = Router();

console.log('[M5.0] Agent Routes Module wird geladen...');

// ============================================================
// M5.0: Controller-Funktionen für CRUD-Operationen
// ============================================================

// POST /api/agents - Neuen Agenten erstellen
const createAgent = (req: Request, res: Response) => {
    const { name, model, prompt, description } = req.body;
    
    console.log('[M5.0] POST /api/agents - Neuen Agenten erstellen');
    console.log(`  - Name: ${name}`);
    console.log(`  - Model: ${model || 'default'}`);
    
    const newAgent = {
        id: `agent-${Date.now()}`,
        name: name,
        model: model || 'openai/gpt-4o-mini',
        prompt: prompt || 'You are a helpful assistant.',
        description: description || '',
        createdAt: new Date().toISOString()
    };
    
    res.status(201).json({
        success: true,
        message: 'Agent erfolgreich erstellt',
        agent: newAgent
    });
};

// GET /api/agents/:id - Einzelnen Agenten abrufen
const getAgentById = (req: Request, res: Response) => {
    const agentId = req.params.id;
    
    console.log(`[M5.0] GET /api/agents/${agentId} - Agenten-Details abrufen`);
    
    const agent = {
        id: agentId,
        name: agentId,
        model: 'openai/gpt-4o-mini',
        prompt: 'You are a helpful software engineer. Be concise and accurate.',
        description: `Agent für ${agentId}`,
        createdAt: '2025-12-02T04:00:00Z',
        updatedAt: '2025-12-02T04:00:00Z'
    };
    
    res.json({
        success: true,
        agent: agent
    });
};

// GET /api/agents - Alle Agenten abrufen
const getAgents = (req: Request, res: Response) => {
    console.log('[M5.0] GET /api/agents - Alle Agenten abrufen');
    
    const mockAgents = [
        {
            id: 'SecurityAuditAgent',
            name: 'Security Audit Agent',
            model: 'openai/gpt-4o-mini',
            description: 'Scanned für Sicherheitslücken und Vulnerabilities',
            createdAt: '2025-12-01T00:00:00Z'
        },
        {
            id: 'CodeReviewAgent',
            name: 'Code Review Agent',
            model: 'openai/gpt-4o-mini',
            description: 'Überprüft Code-Qualität und Best Practices',
            createdAt: '2025-12-01T00:00:00Z'
        },
        {
            id: 'BugFixerAgent',
            name: 'Bug Fixer Agent',
            model: 'openai/gpt-4o-mini',
            description: 'Identifiziert und behebt Bugs',
            createdAt: '2025-12-01T00:00:00Z'
        }
    ];
    
    res.json({
        success: true,
        agents: mockAgents,
        total: mockAgents.length
    });
};

// PUT /api/agents/:id - Agenten aktualisieren
const updateAgent = (req: Request, res: Response) => {
    const agentId = req.params.id;
    const { name, model, prompt, description } = req.body;
    
    console.log(`[M5.0] PUT /api/agents/${agentId} - Agent aktualisieren`);
    console.log(`  - Neue Daten:`, { name, model, prompt, description });
    
    const updatedAgent = {
        id: agentId,
        name: name || agentId,
        model: model || 'openai/gpt-4o-mini',
        prompt: prompt || 'Updated prompt',
        description: description || '',
        updatedAt: new Date().toISOString()
    };
    
    res.json({
        success: true,
        message: `Agent ${agentId} erfolgreich aktualisiert`,
        agent: updatedAgent
    });
};

// DELETE /api/agents/:id - Agenten löschen
const deleteAgent = (req: Request, res: Response) => {
    const agentId = req.params.id;
    
    console.log(`[M5.0] DELETE /api/agents/${agentId} - Agent löschen`);
    
    res.status(204).send();
};

// ============================================================
// ROUTE DEFINITIONEN
// ============================================================

router.get('/', getAgents);
router.post('/', createAgent);
router.get('/:id', getAgentById);
router.put('/:id', updateAgent);
router.delete('/:id', deleteAgent);

console.log('[M5.0] Agent Routes erfolgreich registriert');

export default router;
