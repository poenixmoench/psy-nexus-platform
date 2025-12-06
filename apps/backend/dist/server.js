import express from 'express';
import cors from 'cors';
import http from 'http';
import bodyParser from 'body-parser';
const app = express();
const server = http.createServer(app);
const PORT = 3000;
app.use(cors());
app.use(bodyParser.json());
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString(), connectedClients: 0 });
});
app.post('/api/orchestrate', async (req, res) => {
    const { prompt, socketId } = req.body;
    console.log(`🟢 ORCHESTRIERUNG: ${socketId} → ${prompt.substring(0, 50)}...`);
    res.json({ message: 'Orchestrierung gestartet', socketId });
});
server.listen(PORT, () => {
    console.log(`🚀 PSY-NEXUS M5.0 LIVE - http://localhost:${PORT}`);
});
