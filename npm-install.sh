#!/bin/bash
cd /root/psy-nexus
cat >> docker-compose.yml << 'NPM'
  proxy-manager:
    image: jc21/nginx-proxy-manager:latest
    restart: always
    ports:
      - '80:80'
      - '81:81'
      - '443:443'
    volumes:
      - ./data:/data
      - ./data/logs:/var/log/nginx
      - ./data/ssl:/etc/letsencrypt
NPM
docker compose up -d proxy-manager && sleep 30 && docker compose ps
