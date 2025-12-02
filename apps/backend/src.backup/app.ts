import express, { Request, Response } from 'express';
import runsController from './controllers/RunsController';

const app = express();

app.use(express.json());

app.get('/api/runs/:runId/conversation', (req, res) => runsController.getRunConversation(req, res));
app.get('/api/runs/start-live/:agentName', (req, res) => runsController.startLiveRun(req, res));
app.get('/api/runs/status/live', (req, res) => runsController.getLiveRunsStatus(req, res));

app.get('/', (req: Request, res: Response) => {
  res.send('Psy-Nexus Platform Backend is running.');
});

app.use((err: Error, req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

export default app;
