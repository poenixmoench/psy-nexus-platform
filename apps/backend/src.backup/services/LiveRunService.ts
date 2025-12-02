import WebSocket from 'ws';

interface IStreamMessage {
  type: 'stream' | 'complete';
  content: string;
  runId: string;
  timestamp: string;
  agentName?: string;
}

class LiveRunService {
  private connections = new Map<string, WebSocket>();
  private streamIntervals = new Map<string, NodeJS.Timeout>();

  constructor() {
    console.log('[LiveRunService] Service initialisiert');
  }

  registerConnection(runId: string, ws: WebSocket): void {
    this.connections.set(runId, ws);
    console.log(`[LiveRunService] Verbindung registriert für runId: ${runId}`);

    ws.on('close', () => {
      this.connections.delete(runId);
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
        'Analysiere abgeschlossen.'
      ],
      'SecurityAuditAgent': [
        'Scanne auf Sicherheitslücken...',
        'Überprüfe SQL-Injection Anfälligkeit...',
        'Validiere Authentifizierung...',
        'Prüfe Autorisierungen...',
        'Sicherheitsaudit abgeschlossen.'
      ],
      'PerformanceOptimizer': [
        'Messende Performance-Metriken...',
        'Identifiziere Engpässe...',
        'Analysiere Speichernutzung...',
        'Optimiere kritische Pfade...',
        'Performance-Analyse abgeschlossen.'
      ],
      'ArchitectureAnalyzer': [
        'Analysiere System-Architektur...',
        'Überprüfe Abhängigkeiten...',
        'Evaluiere Skalierbarkeit...',
        'Prüfe Modularität...',
        'Architektur-Analyse abgeschlossen.'
      ],
      'BugDetectorAgent': [
        'Suche nach bekannten Bugs...',
        'Analysiere Edge-Cases...',
        'Überprüfe Fehlerbehandlung...',
        'Teste Grenzfälle...',
        'Bug-Detektion abgeschlossen.'
      ]
    };

    const messages = agentSimulations[agentName] || [
      'Starte Analyse...',
      'Verarbeite Daten...',
      'Generiere Ergebnisse...',
      'Analyse abgeschlossen.'
    ];

    let messageIndex = 0;
    const intervalId = setInterval(() => {
      if (messageIndex < messages.length) {
        const message: IStreamMessage = {
          type: messageIndex === messages.length - 1 ? 'complete' : 'stream',
          content: messages[messageIndex],
          runId,
          timestamp: new Date().toISOString(),
          agentName
        };
        this.sendMessage(runId, JSON.stringify(message));
        messageIndex++;
      } else {
        clearInterval(intervalId);
        this.streamIntervals.delete(runId);
        console.log(`[LiveRunService] Streaming-Simulation für runId ${runId} abgeschlossen`);
      }
    }, 150);

    this.streamIntervals.set(runId, intervalId);
    console.log(`[LiveRunService] Streaming-Simulation gestartet für runId: ${runId}, Agent: ${agentName}`);
  }

  private sendMessage(runId: string, message: string): void {
    const ws = this.connections.get(runId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    } else {
      console.warn(`[LiveRunService] Keine aktive Verbindung für runId: ${runId}`);
    }
  }

  getConnectionCount(): number {
    return this.connections.size;
  }

  getAllRunIds(): string[] {
    return Array.from(this.connections.keys());
  }
}

export default new LiveRunService();
