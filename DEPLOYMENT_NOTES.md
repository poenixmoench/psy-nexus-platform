# PSY-NEXUS Deployment Notes - Dec 17, 2025

## Fixed Issues

### 1. Agent API Routes (404 Not Found)
- **Problem:** `/api/agents/status/connected` returned 404
- **Root Cause:** Routes mounted AFTER static file serving in Express
- **Solution:** Moved agent routes BEFORE static files in index.js

### 2. Module Path Issues
- **Problem:** `Cannot find module './models/Agent'`
- **Root Cause:** Models in `./src/models/` but required from `./models/`
- **Solution:** Updated require paths:
  - `index.js`: `./models/` → `./src/models/`
  - `routes/agents.js`: `../models/` → `../src/models/`

### 3. WebSocket Module Conflict
- **Problem:** `initializeWebSocket is not a function`
- **Root Cause:** Two websocket.js files - src version incomplete
- **Solution:** Use root-level websocket.js with all exports

### 4. Docker Volume Mount Issue
- **Problem:** node_modules deleted on container restart
- **Solution:** Added anonymous volume: `- /app/node_modules`

### 5. Routes File Missing in Container
- **Problem:** `./routes/` directory not in Docker build
- **Solution:** Mount entire `./backend` directory as volume

## Production Configuration

### docker-compose.yml

backend:
volumes:
- ./backend:/app
- /app/node_modules
- ./frontend/dist:/app/public:ro


### Express Route Order (index.js)
1. Health checks
2. MongoDB connection
3. **API Routes (agents, sessions, messages, events)**
4. **WebSocket initialization**
5. Static files & SPA fallback
6. server.listen()

## Endpoints Verified
- `GET /api/agents/status/connected` ✅
- `GET /api/agents/list` ✅
- `GET /api/agents/:id` ✅
- `POST /api/agents/:id/command` ✅

## Next Steps
- Connect agents via WebSocket
- Test agent communication pipeline
- Monitor MongoDB connections
