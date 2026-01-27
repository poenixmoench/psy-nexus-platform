import { injectable, inject } from 'tsyringe';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Logger } from '../types/Logger';

interface OrchestrationRun {
  id: string;
  agent: string;
  input: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'running' | 'completed' | 'failed';
}

@injectable()
export class OrchestrationHistoryService {
  private readonly logDir = process.env.LOG_DIR || '/mnt/HC_Volume_103847079/psy-nexus-library/logs';
  private readonly isEnabled = process.env.ENABLE_HISTORY_LOGGING !== 'false';

  constructor(@inject('Logger') private logger: Logger) {
    // Verzeichnis für Datei-Fallback sicherstellen
    fs.mkdir(this.logDir, { recursive: true }).catch(() => {});
  }

  async startRun(agent: string, input: string, userId: string): Promise<string | null> {
    if (!this.isEnabled) return null;
    
    const runId = `run-${Date.now()}-${randomUUID().substring(0, 8)}`;
    
    try {
      // Hier käme die DB-Logik hin
      this.logger.info('History', 'startRun', `Run ${runId} gestartet.`);
    } catch (error) {
      this.logger.warn('History', 'startRun', 'DB-Fehler, weiche auf Datei-Log aus.');
      await this.logToFile({ runId, agent, input, userId, event: 'START', timestamp: new Date() });
    }

    return runId;
  }

  async completeRun(runId: string, output: string, success: boolean): Promise<void> {
    if (!this.isEnabled || !runId) return;
    
    try {
      // DB-Logik hier
      this.logger.info('History', 'completeRun', `Run ${runId} abgeschlossen: ${success}`);
    } catch (error) {
      this.logger.warn('History', 'completeRun', 'DB-Fehler bei Complete, weiche aus.');
      await this.logToFile({ runId, output, success, event: 'COMPLETE', timestamp: new Date() });
    }
  }

  async logError(runId: string, error: Error): Promise<void> {
    if (!this.isEnabled || !runId) return;
    
    try {
      // DB-Logik hier
      this.logger.error('History', 'logError', `Run ${runId}: ${error.message}`, error);
    } catch (logError) {
      this.logger.warn('History', 'logError', 'DB-Fehler bei Error-Log, weiche aus.');
      await this.logToFile({ runId, error: error.message, event: 'ERROR', timestamp: new Date() });
    }
  }

  private async logToFile(entry: any) {
    try {
      const logPath = path.join(this.logDir, 'orchestration-history.jsonl');
      await fs.appendFile(logPath, JSON.stringify(entry) + '\n');
    } catch (e) {
      this.logger.error('History', 'logToFile', 'Datei-Fallback fehlgeschlagen!', e);
    }
  }
}

// Export für Kompatibilität mit bestehendem Code
export const historyService = new OrchestrationHistoryService(console.log as any);
