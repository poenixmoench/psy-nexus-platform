const express = require("express");
const { Pool } = require("pg");
const redis = require("redis");
require("dotenv").config();

const app = express();
const port = process.env.API_PORT || 5000;

app.use(express.json());

// PostgreSQL-Verbindung
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Redis-Verbindung
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});
redisClient.connect();

// Health-Check
app.get("/health", async (req, res) => {
  try {
    await pgPool.query("SELECT 1");
    const redisPing = await redisClient.ping();
    res.json({ status: "healthy", db: true, redis: redisPing === "PONG" });
  } catch (error) {
    res.status(503).json({ status: "unhealthy", error: error.message });
  }
});

// Beispiel-Route (kann später ersetzt werden)
app.get("/api/events", async (req, res) => {
  try {
    const result = await pgPool.query("SELECT * FROM events ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server läuft auf Port ${port}`);
});

