"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StigmergyService = void 0;
const tsyringe_1 = require("tsyringe");
const pg_1 = require("pg");
const uuid_1 = require("uuid");
let StigmergyService = class StigmergyService {
    constructor() {
        this.pool = new pg_1.Pool({
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            database: process.env.DB_NAME || 'psy_nexus',
            password: process.env.DB_PASSWORD,
            port: parseInt(process.env.DB_PORT || '5432'),
            max: 20,
            min: 5,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
    }
    async saveTags(tags) {
        if (tags.length === 0)
            return;
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const query = `
        INSERT INTO stigmergy_tags (id, source_agent, tag_type, payload, timestamp, ttl)
        SELECT * FROM UNNEST($1::UUID[], $2::TEXT[], $3::TEXT[], $4::JSONB[], $5::BIGINT[], $6::INTEGER[])
        ON CONFLICT (id) DO NOTHING;
      `;
            const values = [
                tags.map(t => t.id),
                tags.map(t => t.sourceAgent),
                tags.map(t => t.payload.type),
                tags.map(t => JSON.stringify(t.payload)),
                tags.map(t => t.timestamp),
                tags.map(t => t.ttl || null)
            ];
            await client.query(query, values);
            await client.query('COMMIT');
            console.log(`[StigmergyService] Batch-Save erfolgreich: ${tags.length} Tags.`);
        }
        catch (err) {
            await client.query('ROLLBACK');
            console.error('[StigmergyService] Batch-Insert fehlgeschlagen, Rollback ausgeführt:', err);
            throw err;
        }
        finally {
            client.release();
        }
    }
    async getActiveTags() {
        const query = `
      SELECT payload FROM stigmergy_tags 
      WHERE (ttl IS NULL OR (timestamp + ttl) > $1)
      ORDER BY timestamp DESC LIMIT 100
    `;
        const res = await this.pool.query(query, [Date.now()]);
        return res.rows.map(row => row.payload);
    }
    // Neue Methode: Tags nach Namespace laden
    async getTagsByNamespace(namespace) {
        const query = `
      SELECT * FROM stigmergy_tags 
      WHERE (ttl IS NULL OR (timestamp + ttl) > $1)
      AND payload->>'namespace' = $2
      ORDER BY timestamp DESC
    `;
        const res = await this.pool.query(query, [Date.now(), namespace]);
        return res.rows.map(row => ({
            id: row.id,
            sourceAgent: row.source_agent,
            payload: row.payload,
            timestamp: row.timestamp,
            ttl: row.ttl
        }));
    }
    // Neue Methode: Einzelnes Tag erstellen
    async createTag(tagData) {
        const newTag = {
            id: (0, uuid_1.v4)(),
            sourceAgent: tagData.sourceAgent,
            timestamp: Date.now(),
            payload: tagData.payload,
            ttl: tagData.ttl,
            namespace: tagData.namespace,
            priority: tagData.priority
        };
        await this.saveTags([newTag]);
        return newTag;
    }
    async startCleanupScheduler() {
        setInterval(async () => {
            try {
                const deleted = await this.pool.query(`DELETE FROM stigmergy_tags WHERE ttl IS NOT NULL AND (timestamp + ttl) < $1`, [Date.now()]);
                if (deleted.rowCount && deleted.rowCount > 0) {
                    console.log(`[StigmergyService] Cleanup: ${deleted.rowCount} abgelaufene Tags entfernt.`);
                }
            }
            catch (err) {
                console.error('[StigmergyService] Cleanup fehlgeschlagen:', err);
            }
        }, 300000); // Alle 5 Min
    }
};
exports.StigmergyService = StigmergyService;
exports.StigmergyService = StigmergyService = __decorate([
    (0, tsyringe_1.singleton)(),
    (0, tsyringe_1.injectable)()
], StigmergyService);
