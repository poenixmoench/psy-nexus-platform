import WebSocket from 'ws';
import { wsConnections } from '../routes/history-routes';

interface IStreamMessage {
  type: 'stream' | 'complete';
  content: string;
  runId: string;
  timestamp: string;
  agentName?: string;
}

class LiveRunService {
  private streamIntervals = new Map<string, NodeJS.Timeout>();

  constructor() {
    console.log('[LiveRunService] Service initialisiert');
  }

  registerConnection(runId: string, ws: WebSocket): void {
    // ✅ WICHTIG: Nutze die GLEICHE Map wie history-routes!
    wsConnections.set(runId, ws);
    console.log(`[LiveRunService] ✅ Verbindung registriert für runId: ${runId} (Map Size: ${wsConnections.size})`);

    ws.on('close', () => {
      wsConnections.delete(runId);
      const interval = this.streamIntervals.get(runId);
      if (interval) {
        clearInterval(interval);
        this.streamIntervals.delete(runId);
      }
      console.log(`[LiveRunService] Verbindung geschlossen für runId: ${runId}`);
    });

    ws.on('error', (error) => {
      console.error(`[LiveRunService] WebSocket Fehler für runId ${runId}:`, error);
    });
  }

  async startStreamingSimulation(runId: string, agentName: string): Promise<void> {
    const agentSimulations: { [key: string]: string[] } = {
      'CodeReviewAgent': [
        'Analysiere Code-Struktur...',
        'Überprüfe Benennungskonventionen...',
        'Suche nach Anti-Patterns...',
        'Evaluiere Code-Komplexität...',
        '✅ Analyse abgeschlossen.'
      ],
      'SecurityAuditAgent': [
        'Scanne auf Sicherheitslücken...',
        'Überprüfe SQL-Injection Anfälligkeit...',
        'Validiere Authentifizierung...',
        'Prüfe Autorisierungen...',
        '✅ Sicherheitsaudit abgeschlossen.'
      ],
      'BugFixerAgent': [
        'Identifiziere Bugs...',
        'Analysiere Root-Cause...',
        'Generiere Fixes...',
        'Teste Lösungen...',
        '✅ Bug-Fixes abgeschlossen.'
      ]
    };

    const messages = agentSimulations[agentName] || [
      'Starte Analyse...',
      'Verarbeite Daten...',
      'Generiere Ergebnisse...',
      '✅ Analyse abgeschlossen.'
    ];

    let messageIndex = 0;
    const intervalId = setInterval(() => {
      if (messageIndex < messages.length) {
        const message: IStreamMessage = {
          type: messageIndex === messages.length - 1 ? 'complete' : 'stream',
          content: `[${agentName}] ${messages[messageIndex]}`,
          runId,
          timestamp: new Date().toISOString(),
          agentName
        };
        this.sendMessage(runId, JSON.stringify(message));
        messageIndex++;
      } else {
        clearInterval(intervalId);
        this.streamIntervals.delete(runId);
        console.log(`[LiveRunService] ✅ Streaming-Simulation für runId ${runId} abgeschlossen`);
      }
    }, 800);

    this.streamIntervals.set(runId, intervalId);
    console.log(`[LiveRunService] Streaming-Simulation gestartet für runId: ${runId}, Agent: ${agentName}`);
  }

  private sendMessage(runId: string, message: string): void {
    if (wsConnections.has(runId)) {
      const ws = wsConnections.get(runId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(message);
          console.log(`[LiveRunService] ✅ Nachricht gesendet an ${runId}`);
        } catch (error) {
          console.error(`[LiveRunService] Fehler beim Senden an ${runId}:`, error);
        }
      } else {
        console.warn(`[LiveRunService] WebSocket nicht OPEN für runId: ${runId}`);
      }
    } else {
      console.warn(`[LiveRunService] ⚠️ Keine Connection für runId: ${runId} (Map Size: ${wsConnections.size})`);
    }
  }

  getConnectionCount(): number {
    return wsConnections.size;
  }

  getAllRunIds(): string[] {
    return Array.from(wsConnections.keys());
  }
}

export default new LiveRunService();
