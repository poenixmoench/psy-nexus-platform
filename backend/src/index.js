const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Sicherheits-Header
app.use(cors()); // Cross-Origin Resource Sharing erlauben
app.use(express.json()); // JSON-Body parsen

// Einfacher Test-Endpoint
app.get('/', (req, res) => {
  res.send('Psy-Nexus Backend läuft! (Version 0.0.1 - Hello World)');
});

// Starte den Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Psy-Nexus Backend server läuft auf Port ${PORT}`);
});
