import express, { Express } from 'express';
import cors from 'cors';
import agentRoutes from './routes/agentRoutes';
import streamingChatRouter from './routes/streamingChatRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));
app.use('/api', agentRoutes);
app.use('/api/stream', streamingChatRouter);

app.listen(3000, () => console.log(' [OK]  Server on 3000'));

export default app;
