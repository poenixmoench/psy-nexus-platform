import { Pool, PoolClient } from 'pg';
import { OrchestrationRun, RunStatus } from '../types/orchestration-run-types';

export class OrchestrationHistoryService {
  private pool: Pool;

  constructor(databaseUrl: string = process.env.DATABASE_URL!) {
    if (!databaseUrl) {
      console.error('DATABASE_URL nicht definiert. PostgreSQL-Verbindung fehlgeschlagen.');
      this.pool = new Pool({});
    } else {
      this.pool = new Pool({ connectionString: databaseUrl });
    }
    this.pool.on('error', (err) => {
      console.error('PostgreSQL Pool Error:', err);
    });
  }

  private mapRowToRun(row: any): OrchestrationRun {
    return {
      id: row.id,
      userGoal: row.usergoal,
      finalOutput: row.finaloutput,
      agentOutputs: row.agentoutputs || null,
      status: row.status as RunStatus,
      durationMs: row.durationms,
      errorMessage: row.errormessage,
      createdAt: row.createdat,
      updatedAt: row.updatedat,
      completedAt: row.completedat,
    };
  }

  private async withClient<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      return await fn(client);
    } catch (error) {
      console.error('DB Operation Error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  public async startRun(userGoal: string): Promise<{ runId: number; startTime: number }> {
    const startTime = Date.now();
    try {
      const insertQuery = `
        INSERT INTO orchestration_runs (userGoal, status, agentOutputs)
        VALUES ($1, 'IN_PROGRESS', '{}'::jsonb)
        RETURNING id;
      `;
      const result = await this.withClient(client => client.query(insertQuery, [userGoal]));
      const runId = result.rows[0].id;
      console.log(`[History] Started run ${runId} with goal: "${userGoal.substring(0, 50)}..."`);
      return { runId, startTime };
    } catch (e) {
      console.error('DB Error: startRun failed', e);
      throw new Error('Could not start orchestration run in database.');
    }
  }

  public async addAgentOutput(runId: number, agentName: string, output: string): Promise<void> {
    try {
      const updateQuery = `
        UPDATE orchestration_runs
        SET agentOutputs = COALESCE(agentOutputs, '{}'::jsonb) || $1::jsonb
        WHERE id = $2;
      `;
      await this.withClient(client => client.query(updateQuery, [{ [agentName]: output }, runId]));
      console.log(`[History] Added output for agent ${agentName} to run ${runId}`);
    } catch (e) {
      console.error(`DB Error: addAgentOutput failed for Run ${runId}, Agent ${agentName}`, e);
    }
  }

  public async completeRun(runId: number, finalOutput: string, durationMs: number): Promise<void> {
    try {
      const updateQuery = `
        UPDATE orchestration_runs
        SET status = 'SUCCESS', finalOutput = $1, durationMs = $2, completedAt = CURRENT_TIMESTAMP
        WHERE id = $3;
      `;
      await this.withClient(client => client.query(updateQuery, [finalOutput, durationMs, runId]));
      console.log(`[History] Completed run ${runId} in ${durationMs}ms`);
    } catch (e) {
      console.error(`DB Error: completeRun failed for Run ${runId}`, e);
    }
  }

  public async failRun(runId: number, errorMessage: string, durationMs: number): Promise<void> {
    try {
      const updateQuery = `
        UPDATE orchestration_runs
        SET status = 'FAILED', errorMessage = $1, durationMs = $2, completedAt = CURRENT_TIMESTAMP
        WHERE id = $3;
      `;
      await this.withClient(client => client.query(updateQuery, [errorMessage, durationMs, runId]));
      console.log(`[History] Failed run ${runId}: ${errorMessage}`);
    } catch (e) {
      console.error(`DB Error: failRun failed for Run ${runId}`, e);
    }
  }

  public async getRun(runId: number): Promise<OrchestrationRun | null> {
    try {
      const result = await this.withClient(client =>
        client.query('SELECT * FROM orchestration_runs WHERE id = $1', [runId])
      );
      return result.rows.length > 0 ? this.mapRowToRun(result.rows[0]) : null;
    } catch (e) {
      console.error(`DB Error: getRun failed for Run ${runId}`, e);
      return null;
    }
  }

  public async listRuns(limit: number = 50, offset: number = 0): Promise<OrchestrationRun[]> {
    try {
      const selectQuery = 'SELECT * FROM orchestration_runs ORDER BY createdAt DESC LIMIT $1 OFFSET $2;';
      const result = await this.withClient(client => client.query(selectQuery, [limit, offset]));
      return result.rows.map((row: any) => this.mapRowToRun(row));
    } catch (e) {
      console.error('DB Error: listRuns failed', e);
      return [];
    }
  }

  public async searchRuns(query: string, limit: number = 50): Promise<OrchestrationRun[]> {
    try {
      const selectQuery = `
        SELECT * FROM orchestration_runs
        WHERE userGoal ILIKE $1 OR finalOutput ILIKE $1
        ORDER BY createdAt DESC LIMIT $2;
      `;
      const result = await this.withClient(client =>
        client.query(selectQuery, [`%${query}%`, limit])
      );
      return result.rows.map((row: any) => this.mapRowToRun(row));
    } catch (e) {
      console.error(`DB Error: searchRuns failed for query "${query}"`, e);
      return [];
    }
  }

  public async getStatistics(): Promise<{
    total: number;
    successful: number;
    failed: number;
    inProgress: number;
    avgDurationMs: number;
  }> {
    try {
      const statsQuery = `
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) as successful,
          SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed,
          SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgress,
          ROUND(AVG(CASE WHEN durationMs IS NOT NULL THEN durationMs ELSE 0 END))::int as avgDurationMs
        FROM orchestration_runs;
      `;
      const result = await this.withClient(client => client.query(statsQuery));
      return {
        total: parseInt(result.rows[0].total) || 0,
        successful: parseInt(result.rows[0].successful) || 0,
        failed: parseInt(result.rows[0].failed) || 0,
        inProgress: parseInt(result.rows[0].inProgress) || 0,
        avgDurationMs: result.rows[0].avgDurationMs || 0,
      };
    } catch (e) {
      console.error('DB Error: getStatistics failed', e);
      return { total: 0, successful: 0, failed: 0, inProgress: 0, avgDurationMs: 0 };
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}

export const historyService = new OrchestrationHistoryService();
