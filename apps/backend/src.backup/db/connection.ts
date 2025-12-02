import { Pool } from 'pg';

console.log('🔗 [CONNECTION] Initializing pool...');
console.log('DATABASE_URL:', process.env.DATABASE_URL);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://psy_user:password@db:5432/db_name',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('❌ [POOL ERROR]', err.message);
});

pool.on('connect', () => {
  console.log('✅ [POOL] Connected to database!');
});

export function connectDB() {
  console.log('✅ Pool initialized and ready!');
}
