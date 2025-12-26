const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  user: process.env.POSTGRES_USER || 'psynexus',
  password: process.env.POSTGRES_PASSWORD || '',
  database: process.env.POSTGRES_DB || 'psynexus',
  port: process.env.POSTGRES_PORT || 5432
});
pool.on('error', (err) => console.error('DB Error:', err));
module.exports = pool;
