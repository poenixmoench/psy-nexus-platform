import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'
import agentRoutes from './routes/agents.js'
import { agentRateLimiter } from './middleware/rate-limiter.js'; // <-- NEU: Rate Limiter Import

dotenv.config({ path: '.env.development' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

// WICHTIG: Rate Limiter vor den Agenten-Routen anwenden
// agentRoutes wird hier als Middleware verwendet, daher wird der Limiter vor allen Routen in agents.ts ausgeführt
app.use('/api/agents', agentRateLimiter, agentRoutes) // <-- NEU: Rate Limiting!

// Serviere statische Vue-App
app.use(express.static(join(__dirname, '../../dist')))

// SPA Fallback
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../../dist/index.html'))
})

app.listen(PORT, () => {
  console.log(`✅ [SERVER] Express running on port ${PORT}`)
  console.log(`🔌 [API] Agents health: curl -H 'X-Dev-Key: dev-key-psy-nexus-2025' http://localhost:${PORT}/api/agents/health`)
})
