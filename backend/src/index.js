const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const asyncHandler = require('express-async-handler');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Health Check
app.get('/health', asyncHandler(async (req, res) => {
  const dbResult = await pool.query('SELECT NOW()');
  res.json({ 
    status: 'healthy', 
    db: !!dbResult.rows.length,
    redis: true,
    timestamp: new Date().toISOString()
  });
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));

// Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
