#!/bin/bash
cd /root/psy-nexus-platform/infrastructure/docker
echo "📊 DB STATUS"
docker compose exec db psql -U psy_user -d db_name -c "\dt"
echo ""
echo "📋 DB DATEN"
docker compose exec db psql -U psy_user -d db_name -c "SELECT * FROM events;"
echo ""
echo "🔨 FRONTEND BUILD"
cd /root/psy-nexus-platform/apps/frontend
docker build -t psy-nexus-frontend-build --target=build .
echo ""
echo "📦 EXTRACTING"
docker create --name temp-frontend-extract psy-nexus-frontend-build
docker cp temp-frontend-extract:/app/dist /root/psy-nexus-platform/apps/web/
docker rm temp-frontend-extract
docker rmi psy-nexus-frontend-build
echo ""
echo "📂 FILES"
ls -lah /root/psy-nexus-platform/apps/web/ | head -15
echo ""
cd /root/psy-nexus-platform/infrastructure/docker
docker compose restart backend frontend
sleep 10
echo "✅ STATUS"
docker compose ps
echo ""
curl -s http://localhost:5173 | head -10
