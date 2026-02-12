import { injectable, singleton } from 'tsyringe';
import { StigmergyTag } from '@shared/types/AgentTypes';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

@singleton()
@injectable()
export class StigmergyService {
  private pool = new Pool({
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

  async saveTags(tags: StigmergyTag[]): Promise<void> {
    if (tags.length === 0) return;
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
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[StigmergyService] Batch-Insert fehlgeschlagen, Rollback ausgeführt:', err);
      throw err;
    } finally {
      client.release();
    }
  }

  async getActiveTags(): Promise<StigmergyTag[]> {
    const query = `
      SELECT payload FROM stigmergy_tags 
      WHERE (ttl IS NULL OR (timestamp + ttl) > $1)
      ORDER BY timestamp DESC LIMIT 100
    `;
    const res = await this.pool.query(query, [Date.now()]);
    return res.rows.map(row => row.payload);
  }

  // Neue Methode: Tags nach Namespace laden
  async getTagsByNamespace(namespace: string): Promise<StigmergyTag[]> {
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
  async createTag(tagData: Omit<StigmergyTag, 'id' | 'timestamp'>): Promise<StigmergyTag> {
    const newTag: StigmergyTag = {
      id: uuidv4(),
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
        const deleted = await this.pool.query(
          `DELETE FROM stigmergy_tags WHERE ttl IS NOT NULL AND (timestamp + ttl) < $1`,
          [Date.now()]
        );
        if (deleted.rowCount && deleted.rowCount > 0) {
          console.log(`[StigmergyService] Cleanup: ${deleted.rowCount} abgelaufene Tags entfernt.`);
        }
      } catch (err) {
        console.error('[StigmergyService] Cleanup fehlgeschlagen:', err);
      }
    }, 300000); // Alle 5 Min
  }
}
