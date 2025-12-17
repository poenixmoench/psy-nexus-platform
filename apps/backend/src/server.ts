import express from 'express';
import cors from 'cors';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'psy-nexus-backend',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/agents/health', (req, res) => {
  res.json({ status: 'healthy', service: 'agents-api' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
