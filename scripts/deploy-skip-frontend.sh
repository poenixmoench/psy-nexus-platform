#!/bin/bash

set -e

echo "🚀 PSY-NEXUS Production Deployment (Frontend Skip)..."
echo "⏰ Timestamp: $(date)"

# Check Docker
docker --version
docker-compose --version

# Create volumes
echo "📁 Creating Docker volumes..."
docker volume create psy-nexus-db || true
docker volume create psy-nexus-ollama || true

# Start Services (Skip Frontend Build)
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
echo "🤖 Pulling Ollama model..."
docker-compose -f docker-compose.prod.yml exec -T ollama ollama pull qwen2.5-coder:14b || true

# Health Checks
echo "🏥 Running health checks..."
BACKEND_HEALTH=$(curl -s http://localhost:3000/api/health 2>/dev/null | head -c 50)
echo "Backend: $BACKEND_HEALTH"

OLLAMA_HEALTH=$(curl -s http://localhost:11434/api/tags 2>/dev/null | grep -q "qwen" && echo "✅" || echo "⏳")
echo "Ollama: $OLLAMA_HEALTH"

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo ""
echo "📊 Docker Services:"
docker-compose -f docker-compose.prod.yml ps
