#!/bin/bash

set -e

echo "🚀 PSY-NEXUS Production Deployment Starting..."
echo "⏰ Timestamp: $(date)"

# Check Docker
echo "✅ Checking Docker installation..."
docker --version
docker-compose --version

# Build Frontend
echo "🏗️  Building Frontend..."
cd apps/web
npm install
npm run build
cd ../..

# Create volumes
echo "📁 Creating Docker volumes..."
docker volume create psy-nexus-db || true
docker volume create psy-nexus-ollama || true

# Start Services
echo "🚀 Starting Docker services..."
docker-compose -f docker-compose.prod.yml down || true
docker-compose -f docker-compose.prod.yml up -d

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 10

# Initialize Database
echo "🗄️  Initializing database..."
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U psynexus -d psy_nexus -f /dev/stdin < db-init.sql

# Pull Ollama Model
echo "🤖 Pulling Ollama model (first time only)..."
docker-compose -f docker-compose.prod.yml exec -T ollama ollama pull qwen2.5-coder:14b || true

# Health Checks
echo "🏥 Running health checks..."

# Check Backend
BACKEND_HEALTH=$(curl -s http://localhost:3000/api/health | grep -q "ok" && echo "✅" || echo "❌")
echo "Backend Health: $BACKEND_HEALTH"

# Check Database
DB_HEALTH=$(docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U psynexus | grep -q "accepting" && echo "✅" || echo "❌")
echo "Database Health: $DB_HEALTH"

# Check Ollama
OLLAMA_HEALTH=$(curl -s http://localhost:11434/api/tags | grep -q "models" && echo "✅" || echo "❌")
echo "Ollama Health: $OLLAMA_HEALTH"

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo ""
echo "📍 Service URLs:"
echo "   Frontend:  https://psy-nexus.com"
echo "   API:       https://psy-nexus.com/api"
echo "   WebSocket: wss://psy-nexus.com/api/agents/ws"
echo ""
echo "📊 Docker Services:"
docker-compose -f docker-compose.prod.yml ps
echo ""
echo "📝 Logs:"
echo "   Backend:   docker-compose -f docker-compose.prod.yml logs -f backend"
echo "   Database:  docker-compose -f docker-compose.prod.yml logs -f postgres"
echo "   Ollama:    docker-compose -f docker-compose.prod.yml logs -f ollama"
echo "   Nginx:     docker-compose -f docker-compose.prod.yml logs -f nginx"
