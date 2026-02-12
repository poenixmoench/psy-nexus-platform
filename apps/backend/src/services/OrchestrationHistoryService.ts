import { injectable, inject } from 'tsyringe';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Logger } from '../types/Logger';
import { MongoClient, Db, Collection } from 'mongodb';

interface OrchestrationRun {
  runId: string;
  agent: string;
  input: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  output?: string;
  success?: boolean;
  status: 'running' | 'completed' | 'failed';
  error?: string;
}

@injectable()
export class OrchestrationHistoryService {
  private readonly logDir = process.env.LOG_DIR || '/mnt/HC_Volume_103847079/psy-nexus-library/logs';
  private readonly isEnabled = process.env.ENABLE_HISTORY_LOGGING !== 'false';
  private db: Db | null = null;
  private client: MongoClient | null = null;
  private runsCollection: Collection<OrchestrationRun> | null = null;
  private connectionAttempts = 0;
  private maxRetries = 3;

  constructor(@inject('Logger') private logger: Logger) {
    // Sicherstellen, dass Logger-Methoden existieren (Graceful Fallback)
    if (!this.logger || typeof this.logger.info !== 'function') {
      this.logger = {
        info: console.log,
        error: console.error,
        warn: console.warn,
        debug: console.debug
      } as any;
    }
    this.initializeDatabaseAsync();
  }

  private async initializeDatabaseAsync(): Promise<void> {
    // Führe Initialisierung asynchron durch, ohne den Konstruktor zu blockieren
    setTimeout(async () => {
      await this.initDatabase();
    }, 0);
  }

  private async initDatabase(): Promise<void> {
    try {
      const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/psy-nexus';
      this.client = new MongoClient(connectionString, { 
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
        minPoolSize: 2
      });
      
      await this.client.connect();
      this.db = this.client.db();
      this.runsCollection = this.db.collection<OrchestrationRun>('runs');
      
      // Erstelle Indizes für optimale Performance
      await this.runsCollection.createIndex({ "runId": 1 }, { unique: true });
      await this.runsCollection.createIndex({ "userId": 1, "startedAt": -1 });
      await this.runsCollection.createIndex({ "agent": 1, "status": 1 });
      
      this.logger.info('History', 'initDatabase', 'MongoDB-Verbindung steht mit Indizes bereit.');
    } catch (error: any) {
      this.connectionAttempts++;
      this.logger.error('History', 'initDatabase', `MongoDB-Verbindung fehlgeschlagen (Versuch ${this.connectionAttempts}/${this.maxRetries}): ${error.message}`, error);
      
      if (this.connectionAttempts < this.maxRetries) {
        this.logger.warn('History', 'initDatabase', 'Versuche erneut in 5 Sekunden...');
        setTimeout(async () => {
          await this.initDatabase();
        }, 5000);
      }
    }
  }

  async startRun(agent: string, input: string, userId: string): Promise<string | null> {
    if (!this.isEnabled) return null;
    
    const runId = `run-${Date.now()}-${randomUUID().substring(0, 8)}`;
    const runData: OrchestrationRun = { 
      runId, 
      agent, 
      input, 
      userId, 
      startedAt: new Date(), 
      status: 'running' 
    };

    try {
      if (this.runsCollection) {
        await this.runsCollection.insertOne(runData);
        this.logger.info('History', 'startRun', `Run ${runId} in DB gespeichert.`);
      } else {
        throw new Error('Keine DB-Verbindung');
      }
    } catch (error) {
      this.logger.warn('History', 'startRun', 'DB-Fehler, weiche auf Datei-Log aus.', error);
      await this.logToFile({ ...runData, event: 'START' });
    }
    return runId;
  }

  async completeRun(runId: string, output: string, success: boolean): Promise<void> {
    if (!this.isEnabled || !runId) return;
    
    try {
      if (this.runsCollection) {
        const result = await this.runsCollection.updateOne(
          { runId }, 
          { 
            $set: { 
              completedAt: new Date(), 
              output, 
              success, 
              status: success ? 'completed' : 'failed' 
            } 
          }
        );
        
        if (result.matchedCount === 0) {
          this.logger.warn('History', 'completeRun', `Run ${runId} nicht gefunden für Update.`);
        } else {
          this.logger.info('History', 'completeRun', `Run ${runId} aktualisiert: ${success}`);
        }
      } else {
        throw new Error('Keine DB-Verbindung');
      }
    } catch (error) {
      this.logger.warn('History', 'completeRun', 'DB-Fehler bei Complete, weiche aus.', error);
      await this.logToFile({ runId, output, success, event: 'COMPLETE' });
    }
  }

  async logError(runId: string, error: Error): Promise<void> {
    if (!this.isEnabled || !runId) return;
    
    try {
      if (this.runsCollection) {
        await this.runsCollection.updateOne(
          { runId }, 
          { $set: { status: 'failed', error: error.message, completedAt: new Date() } }
        );
        this.logger.error('History', 'logError', `Run ${runId}: ${error.message}`, error);
      } else {
        throw new Error('Keine DB-Verbindung');
      }
    } catch (logError) {
      this.logger.warn('History', 'logError', 'DB-Fehler bei Error-Log, weiche aus.', logError);
      await this.logToFile({ runId, error: error.message, event: 'ERROR' });
    }
  }

  async getRun(runId: string): Promise<OrchestrationRun | null> {
    try {
      if (this.runsCollection) {
        return await this.runsCollection.findOne({ runId });
      }
      return null;
    } catch (error) {
      this.logger.error('History', 'getRun', 'Fehler beim Abrufen des Runs', error);
      return null;
    }
  }

  async getRunsForUser(userId: string, limit: number = 50): Promise<OrchestrationRun[]> {
    try {
      if (this.runsCollection) {
        return await this.runsCollection
          .find({ userId })
          .sort({ startedAt: -1 })
          .limit(limit)
          .toArray();
      }
      return [];
    } catch (error) {
      this.logger.error('History', 'getRunsForUser', 'Fehler beim Abrufen der Runs für User', error);
      return [];
    }
  }

  private async logToFile(entry: any) {
    try {
      const logPath = path.join(this.logDir, 'orchestration-history.jsonl');
      await fs.mkdir(this.logDir, { recursive: true }).catch(() => {});
      await fs.appendFile(logPath, JSON.stringify(entry) + '\n');
    } catch (e) {
      this.logger.error('History', 'logToFile', 'Datei-Fallback fehlgeschlagen!', e);
    }
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
    }
  }
}

// Export für Kompatibilität mit bestehendem Code
export const historyService = new OrchestrationHistoryService({
  info: console.log,
  error: console.error,
  warn: console.warn,
  debug: console.log
} as any);
