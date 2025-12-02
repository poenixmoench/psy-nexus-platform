import { Router } from 'express';
import { ollamaService } from '../services/OllamaStreamService';

const router = Router();

router.post('/orchestrate', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const { userGoal } = req.body;

    if (!userGoal) {
        return res.status(400).send('Fehlendes userGoal im Body.');
    }

    try {
        await ollamaService.streamOrchestration(userGoal, res);
    } catch (error) {
        console.error('Orchestration Stream Error:', error);
        res.write('data: ' + JSON.stringify({ type: 'error', message: 'Interner Serverfehler' }) + '\n\n');
        res.end();
    }
});

router.post('/chat', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const { prompt, agent } = req.body;

    if (!prompt || !agent) {
        return res.status(400).json({ error: 'Missing prompt or agent parameter' });
    }

    try {
        await ollamaService.streamAgentChat(prompt, agent, res);
    } catch (error) {
        console.error('Chat Stream Error:', error);
        res.write('data: ' + JSON.stringify({ type: 'error', message: 'Interner Serverfehler' }) + '\n\n');
        res.end();
    }
});

router.get('/health', (req, res) => {
    res.json({ status: 'streaming router ok' });
});

export default router;
