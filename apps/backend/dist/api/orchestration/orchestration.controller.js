import { Router } from 'express';
import { sleep } from '../../../utils/sleep.util';
// ------------------------------------------
// Hilfsfunktion: Router-Registrierung
// ------------------------------------------
export const registerOrchestrationRoutes = (io) => {
    const orchestrationRouter = Router();
    // ------------------------------------------
    // M6.0 API-Endpunkt: Agenten-Daten abrufen
    // ------------------------------------------
    orchestrationRouter.get('/agents', (req, res) => {
        const mockAgents = [
            {
                id: 'A-001-QWEN',
                name: 'Qwen-Coder-14B',
                status: 'LIVE',
                description: 'Code-Generierungs-Agent mit Fokus auf Vue/TS und Node/Express.',
                model: 'Qwen2.5-14B',
                latency: 45
            },
            {
                id: 'B-002-LAMA',
                name: 'Llama-Orchestrator-70B',
                status: 'BESCHÄFTIGT',
                description: 'Hohe Latenz, spezialisiert auf Systemanalyse und komplexes Orchestrierungs-Routing.',
                model: 'Llama3-70B',
                latency: 350
            },
            {
                id: 'C-003-MIX',
                name: 'Mixtral-Data-Expert',
                status: 'LIVE',
                description: 'Schneller Agent für Datenbankschemata und API-Integration.',
                model: 'Mixtral-8x22B',
                latency: 75
            },
            {
                id: 'D-004-SYS',
                name: 'System-Monitor',
                status: 'INAKTIV',
                description: 'Überwacht die Host-Ressourcen. Aktuell im Wartungsmodus.',
                model: 'TinyLlama-1.1B',
                latency: 900
            }
        ];
        console.log('[API] Agenten-Daten gesendet.');
        res.json(mockAgents);
    });
    // ------------------------------------------
    // M7.0 API-Endpunkt: Orchestrierung starten (Streaming)
    // ------------------------------------------
    orchestrationRouter.post('/orchestrate', async (req, res) => {
        const { prompt, socketId } = req.body;
        if (!prompt || !socketId) {
            return res.status(400).json({ success: false, message: 'Fehlende prompt oder socketId im Request Body.' });
        }
        // ACHTUNG: Der Socket-Namespace '/ws/orchestration' muss korrekt im Backend-Server definiert sein!
        const targetSocket = io.of('/ws/orchestration').sockets.get(socketId);
        if (!targetSocket) {
            console.warn(`[ORCH] Socket-ID ${socketId} nicht gefunden.`);
            // Wir antworten mit 200, da die HTTP-Verbindung erfolgreich war, aber das Streaming nicht initiiert werden konnte.
            return res.status(200).json({ success: true, message: 'Orchestrierung wird im Hintergrund gestartet, aber Socket ist nicht verbunden.' });
        }
        console.log(`[ORCH] Empfangener Prompt von Socket ${socketId}: "${prompt}"`);
        // --- Streaming Simulation ---
        try {
            // 1. Stream Start Event senden
            targetSocket.emit('stream-start', {
                message: '[SUCCESS ORCHESTRIERT]',
                socketId,
                timestamp: new Date().toISOString()
            });
            // 2. Antwort in Chunks streamen (10 Zeichen / 100ms)
            const fullResponse = `[SUCCESS ORCHESTRIERT] ${prompt}. Die Verarbeitung der Ergebnisse folgt in Kürze.`;
            const chunks = fullResponse.match(/.{1,10}/g) || [];
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                targetSocket.emit('stream-chunk', {
                    chunk,
                    socketId,
                    progress: `${Math.round((i + 1) / chunks.length * 100)}%`
                });
                await sleep(100); // 100ms Delay
            }
            // 3. Stream End Event senden
            targetSocket.emit('stream-end', {
                message: 'Orchestrierung abgeschlossen',
                socketId,
                status: 'success'
            });
            console.log(`[ORCH] Streaming-Antwort an Socket ${socketId} beendet.`);
            // API-Antwort an das Frontend, die den Start bestätigt
            res.json({ success: true, message: 'Orchestrierung gestartet und Streaming initiiert.' });
        }
        catch (error) {
            console.error('Orchestration Stream Error:', error);
            // Sende Error auch über Socket an das Frontend
            targetSocket.emit('error', { message: 'Interner Streaming-Fehler.' });
            res.status(500).json({ success: false, message: 'Interner Serverfehler während des Streamings.' });
        }
    });
    return orchestrationRouter;
};
