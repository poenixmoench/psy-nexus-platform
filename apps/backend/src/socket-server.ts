import http from 'http';
import { Server, Socket } from 'socket.io';
import axios, { AxiosRequestConfig } from 'axios';
import { Readable } from 'stream';

const io = new Server(3002, {
    cors: {
        origin: "*", // ACHTUNG: Nur für Entwicklung, im Produktivbetrieb spezifizieren
        methods: ["GET", "POST"]
    }
});

const CORE_URL = process.env.CORE_API_URL || 'http://localhost:3001'; // Konfigurierbare Core-URL

io.on('connection', (socket: Socket) => {
    console.log('🔌 Socket-Verbindung hergestellt:', socket.id);

    socket.on('agent-message', async (data) => {
        console.log('📨 Nachricht erhalten, leite an Core weiter:', data);

        const agentName = data.agentName || data.agent || 'Orion';
        const userPrompt = data.message || data.prompt;

        if (!userPrompt) {
            console.warn('⚠️ Kein Prompt erhalten von Socket', socket.id);
            socket.emit('agent-error', { message: 'Kein Prompt erhalten.' });
            return;
        }

        try {
            const config: AxiosRequestConfig = {
                method: 'post',
                url: `${CORE_URL}/api/agents/chat`,
                data: {
                    agentName: agentName,
                    prompt: userPrompt
                },
                responseType: 'stream', // Wichtig für Streaming
                // Optional: Timeout
                timeout: 300000, // 5 Minuten
            };

            const coreResponse = await axios(config);

            // Event-Listener für den Core-Stream
            let buffer = ''; // Puffer für teilweise Zeilen
            let doneEmitted = false; // Verhindert mehrfaches 'done'

            coreResponse.data.on('data', (chunk: Buffer) => {
                buffer += chunk.toString(); // Füge Chunk zum Puffer hinzu

                let newlineIndex;
                while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
                    const line = buffer.substring(0, newlineIndex).trim();
                    buffer = buffer.substring(newlineIndex + 1); // Entferne verarbeitete Zeile

                    if (line.startsWith('data: ')) {
                        try {
                            const jsonData = JSON.parse(line.substring(6)); // Entferne 'data: '
                            socket.emit('agent-chunk', {
                                agent: agentName,
                                chunk: jsonData.response || jsonData.chunk || jsonData.message || '',
                                sessionId: socket.id
                            });
                        } catch (e) {
                            console.error('❌ Fehler beim Parsen von SSE-Daten:', line, e);
                            // Optional: Rohdaten senden, falls JSON kaputt ist
                            // socket.emit('agent-chunk', { agent: agentName, chunk: line });
                        }
                    }
                    // Ignoriere andere SSE-Zeilen wie "event:", "id:", "retry:"
                }
            });

            coreResponse.data.on('end', () => {
                console.log('🏁 Core-Stream beendet für Socket', socket.id);
                // Sende 'done', falls noch nicht geschehen
                if (!doneEmitted) {
                     socket.emit('agent-done', { success: true });
                     doneEmitted = true;
                }
            });

            coreResponse.data.on('error', (err: Error) => {
                console.error('❌ Fehler im Core-Stream für Socket', socket.id, err);
                socket.emit('agent-error', { message: `Fehler im Core-Stream: ${err.message}` });
                 if (!doneEmitted) {
                     socket.emit('agent-done', { success: false, error: err.message });
                     doneEmitted = true;
                 }
            });

        } catch (error: any) {
            console.error('❌ Fehler bei der Anfrage an den Core für Socket', socket.id, error.message);
            // Unterscheide zwischen verschiedenen Fehlertypen, wenn nötig
            const errorMessage = error.response?.data?.message || error.message || 'Unbekannter Fehler bei Core-Anfrage.';
            socket.emit('agent-error', { message: errorMessage });
        }
    });

    socket.on('disconnect', (reason) => {
        console.log('🔌 Socket-Verbindung getrennt:', socket.id, 'Grund:', reason);
    });
});

console.log(`🔗 Psy-socket-gateway (Aktiviert, Streaming-fähig) läuft auf Port 3002`);

export { io };
