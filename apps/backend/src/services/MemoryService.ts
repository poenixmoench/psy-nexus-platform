import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  tokens_used?: number;
}

export class MemoryService {
  private static pool: Pool;

  static init(dbPool: Pool) {
    this.pool = dbPool;
    console.log(' [OK]  MemoryService initialized with PostgreSQL');
  }

  static async createSession(agentId: string, sessionId?: string): Promise<string> {
    const id = sessionId || uuidv4();
    const query = `
      INSERT INTO agent_sessions (session_id, agent_id, state)
      VALUES ($1, $2, 'idle')
      ON CONFLICT (session_id) DO NOTHING
      RETURNING session_id
    `;
    try {
      const result = await this.pool.query(query, [id, agentId]);
      console.log(`📝 Session created: ${id}`);
      return id;
    } catch (error: any) {
      console.error(' [ERR]  Error creating session:', error.message);
      throw error;
    }
  }

  static async saveMessage(sessionId: string, role: string, content: string, tokensUsed: number = 0): Promise<void> {
    const query = `
      INSERT INTO agent_messages (session_id, role, content, tokens_used)
      SELECT id, $2, $3, $4
      FROM agent_sessions
      WHERE session_id = $1
    `;
    try {
      await this.pool.query(query, [sessionId, role, content, tokensUsed]);
      console.log(` [DIALOG]  Message saved: ${role} (${sessionId})`);
    } catch (error: any) {
      console.error(' [ERR]  Error saving message:', error.message);
    }
  }

  static async getHistory(sessionId: string): Promise<Message[]> {
    const query = `
      SELECT role, content, created_at as timestamp, tokens_used
      FROM agent_messages
      WHERE session_id = (SELECT id FROM agent_sessions WHERE session_id = $1)
      ORDER BY created_at ASC
    `;
    try {
      const result = await this.pool.query(query, [sessionId]);
      return result.rows;
    } catch (error: any) {
      console.error(' [ERR]  Error retrieving history:', error.message);
      return [];
    }
  }

  static async updateSessionState(sessionId: string, state: string): Promise<void> {
    const query = `
      UPDATE agent_sessions
      SET state = $2, updated_at = NOW()
      WHERE session_id = $1
    `;
    try {
      await this.pool.query(query, [sessionId, state]);
      console.log(`📊 State updated: ${state} (${sessionId})`);
    } catch (error: any) {
      console.error(' [ERR]  Error updating state:', error.message);
    }
  }

  static async getSession(sessionId: string) {
    const query = `
      SELECT 
        s.id,
        s.session_id,
        s.agent_id,
        s.state,
        COALESCE(COUNT(m.id), 0)::int as message_count,
        COALESCE(SUM(m.tokens_used), 0)::int as total_tokens,
        s.created_at,
        s.updated_at
      FROM agent_sessions s
      LEFT JOIN agent_messages m ON s.id = m.session_id
      WHERE s.session_id = $1
      GROUP BY s.id, s.session_id, s.agent_id, s.state, s.created_at, s.updated_at
    `;
    try {
      const result = await this.pool.query(query, [sessionId]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error: any) {
      console.error(' [ERR]  Error getting session:', error.message);
      return null;
    }
  }

  static async deleteSession(sessionId: string): Promise<boolean> {
    const query = `DELETE FROM agent_sessions WHERE session_id = $1`;
    try {
      const result = await this.pool.query(query, [sessionId]);
      console.log(`🗑️ Session deleted: ${sessionId}`);
      return result.rowCount! > 0;
    } catch (error: any) {
      console.error(' [ERR]  Error deleting session:', error.message);
      return false;
    }
  }

  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_sessions,
        SUM(CASE WHEN state = 'awaiting_user_input' THEN 1 ELSE 0 END) as awaiting_user_input,
        SUM(CASE WHEN state = 'executing' THEN 1 ELSE 0 END) as executing,
        SUM(CASE WHEN state = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN state = 'error' THEN 1 ELSE 0 END) as errors,
        SUM(total_tokens) as total_tokens_used
      FROM agent_session_stats
    `;
    try {
      const result = await this.pool.query(query);
      return result.rows[0];
    } catch (error: any) {
      console.error(' [ERR]  Error getting stats:', error.message);
      return null;
    }
  }

  static async pruneOldSessions(daysOld: number = 30): Promise<number> {
    const query = `
      DELETE FROM agent_sessions
      WHERE created_at < NOW() - INTERVAL '${daysOld} days'
      AND state IN ('completed', 'error')
    `;
    try {
      const result = await this.pool.query(query);
      console.log(`🧹 Pruned ${result.rowCount} old sessions`);
      return result.rowCount || 0;
    } catch (error: any) {
      console.error(' [ERR]  Error pruning sessions:', error.message);
      return 0;
    }
  }
}

export default MemoryService;
