import { Pool } from 'pg';
import logger from './logger';

export let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || 'postgres://psy_user:password@db:5432/db_name';
    
    console.log('🔗 [DATABASE] Initializing pool with:', connectionString.replace(/password[^@]*@/, 'password:***@'));
    
    try {
      pool = new Pool({
        connectionString,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      pool.on('error', (err) => {
        console.error(' [ERR]  [POOL ERROR]', err.message);
        logger.error('Unexpected error on idle client', { error: err.message });
      });

      console.log(' [OK]  [DATABASE] Pool created successfully!');
    } catch (error) {
      console.error(' [ERR]  [DATABASE ERROR]', error);
      throw error;
    }
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
