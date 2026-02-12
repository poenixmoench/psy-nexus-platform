"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.historyService = exports.OrchestrationHistoryService = void 0;
const tsyringe_1 = require("tsyringe");
const crypto_1 = require("crypto");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const mongodb_1 = require("mongodb");
let OrchestrationHistoryService = class OrchestrationHistoryService {
    constructor(logger) {
        this.logger = logger;
        this.logDir = process.env.LOG_DIR || '/mnt/HC_Volume_103847079/psy-nexus-library/logs';
        this.isEnabled = process.env.ENABLE_HISTORY_LOGGING !== 'false';
        this.db = null;
        this.client = null;
        this.runsCollection = null;
        this.connectionAttempts = 0;
        this.maxRetries = 3;
        // Sicherstellen, dass Logger-Methoden existieren (Graceful Fallback)
        if (!this.logger || typeof this.logger.info !== 'function') {
            this.logger = {
                info: console.log,
                error: console.error,
                warn: console.warn,
                debug: console.debug
            };
        }
        this.initializeDatabaseAsync();
    }
    async initializeDatabaseAsync() {
        // Führe Initialisierung asynchron durch, ohne den Konstruktor zu blockieren
        setTimeout(async () => {
            await this.initDatabase();
        }, 0);
    }
    async initDatabase() {
        try {
            const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/psy-nexus';
            this.client = new mongodb_1.MongoClient(connectionString, {
                serverSelectionTimeoutMS: 5000,
                maxPoolSize: 10,
                minPoolSize: 2
            });
            await this.client.connect();
            this.db = this.client.db();
            this.runsCollection = this.db.collection('runs');
            // Erstelle Indizes für optimale Performance
            await this.runsCollection.createIndex({ "runId": 1 }, { unique: true });
            await this.runsCollection.createIndex({ "userId": 1, "startedAt": -1 });
            await this.runsCollection.createIndex({ "agent": 1, "status": 1 });
            this.logger.info('History', 'initDatabase', 'MongoDB-Verbindung steht mit Indizes bereit.');
        }
        catch (error) {
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
    async startRun(agent, input, userId) {
        if (!this.isEnabled)
            return null;
        const runId = `run-${Date.now()}-${(0, crypto_1.randomUUID)().substring(0, 8)}`;
        const runData = {
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
            }
            else {
                throw new Error('Keine DB-Verbindung');
            }
        }
        catch (error) {
            this.logger.warn('History', 'startRun', 'DB-Fehler, weiche auf Datei-Log aus.', error);
            await this.logToFile({ ...runData, event: 'START' });
        }
        return runId;
    }
    async completeRun(runId, output, success) {
        if (!this.isEnabled || !runId)
            return;
        try {
            if (this.runsCollection) {
                const result = await this.runsCollection.updateOne({ runId }, {
                    $set: {
                        completedAt: new Date(),
                        output,
                        success,
                        status: success ? 'completed' : 'failed'
                    }
                });
                if (result.matchedCount === 0) {
                    this.logger.warn('History', 'completeRun', `Run ${runId} nicht gefunden für Update.`);
                }
                else {
                    this.logger.info('History', 'completeRun', `Run ${runId} aktualisiert: ${success}`);
                }
            }
            else {
                throw new Error('Keine DB-Verbindung');
            }
        }
        catch (error) {
            this.logger.warn('History', 'completeRun', 'DB-Fehler bei Complete, weiche aus.', error);
            await this.logToFile({ runId, output, success, event: 'COMPLETE' });
        }
    }
    async logError(runId, error) {
        if (!this.isEnabled || !runId)
            return;
        try {
            if (this.runsCollection) {
                await this.runsCollection.updateOne({ runId }, { $set: { status: 'failed', error: error.message, completedAt: new Date() } });
                this.logger.error('History', 'logError', `Run ${runId}: ${error.message}`, error);
            }
            else {
                throw new Error('Keine DB-Verbindung');
            }
        }
        catch (logError) {
            this.logger.warn('History', 'logError', 'DB-Fehler bei Error-Log, weiche aus.', logError);
            await this.logToFile({ runId, error: error.message, event: 'ERROR' });
        }
    }
    async getRun(runId) {
        try {
            if (this.runsCollection) {
                return await this.runsCollection.findOne({ runId });
            }
            return null;
        }
        catch (error) {
            this.logger.error('History', 'getRun', 'Fehler beim Abrufen des Runs', error);
            return null;
        }
    }
    async getRunsForUser(userId, limit = 50) {
        try {
            if (this.runsCollection) {
                return await this.runsCollection
                    .find({ userId })
                    .sort({ startedAt: -1 })
                    .limit(limit)
                    .toArray();
            }
            return [];
        }
        catch (error) {
            this.logger.error('History', 'getRunsForUser', 'Fehler beim Abrufen der Runs für User', error);
            return [];
        }
    }
    async logToFile(entry) {
        try {
            const logPath = path.join(this.logDir, 'orchestration-history.jsonl');
            await fs.mkdir(this.logDir, { recursive: true }).catch(() => { });
            await fs.appendFile(logPath, JSON.stringify(entry) + '\n');
        }
        catch (e) {
            this.logger.error('History', 'logToFile', 'Datei-Fallback fehlgeschlagen!', e);
        }
    }
    async close() {
        if (this.client) {
            await this.client.close();
        }
    }
};
exports.OrchestrationHistoryService = OrchestrationHistoryService;
exports.OrchestrationHistoryService = OrchestrationHistoryService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('Logger')),
    __metadata("design:paramtypes", [Object])
], OrchestrationHistoryService);
// Export für Kompatibilität mit bestehendem Code
exports.historyService = new OrchestrationHistoryService({
    info: console.log,
    error: console.error,
    warn: console.warn,
    debug: console.log
});
