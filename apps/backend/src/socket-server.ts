import http from 'http';
import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';
import axios, { AxiosRequestConfig } from 'axios';
import agentRoutes from './routes/agentRoutes';

const CORE_URL = process.env.CORE_URL || 'http://localhost:3001';
const app = express();
app.use(cors());
app.use(express.json());

// Hier binden wir die Route ein, die den 404 killt
app.use('/api/agents', agentRoutes);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('🔌 Socket-Verbindung hergestellt:', socket.id);

    socket.on('agent-message', async (data) => {
        const agentName = data.agentName || data.agent || 'Orion';
        const userPrompt = data.message || data.prompt;

        if (!userPrompt) {
            socket.emit('agent-error', { message: 'Kein Prompt erhalten.' });
            return;
        }

        try {
            const config: AxiosRequestConfig = {
                method: 'post',
                url: `${CORE_URL}/api/agents/chat`,
                data: { agentName, prompt: userPrompt },
                responseType: 'stream',
                timeout: 300000,
            };

            const coreResponse = await axios(config);
            let buffer = '';
            let doneEmitted = false;

            coreResponse.data.on('data', (chunk: Buffer) => {
                buffer += chunk.toString();
                let newlineIndex;
                while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
                    const line = buffer.substring(0, newlineIndex).trim();
                    buffer = buffer.substring(newlineIndex + 1);
                    if (line.startsWith('data: ')) {
                        try {
                            const jsonData = JSON.parse(line.substring(6));
                            socket.emit('agent-chunk', {
                                agent: agentName,
                                chunk: jsonData.response || jsonData.chunk || '',
                                sessionId: socket.id
                            });
                        } catch (e) {}
                    }
                }
            });

            coreResponse.data.on('end', () => {
                if (!doneEmitted) {
                    socket.emit('agent-done', { success: true });
                    doneEmitted = true;
                }
            });

        } catch (error: any) {
            socket.emit('agent-error', { message: error.message });
        }
    });

    socket.on('disconnect', (reason) => {
        console.log('🔌 Socket-Verbindung getrennt:', socket.id, 'Grund:', reason);
    });
});

server.listen(3002, () => {
    console.log(`🔗 Psy-socket-gateway (API + Streaming) läuft auf Port 3002`);
});

export { io };
