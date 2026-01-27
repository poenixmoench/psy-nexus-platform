# Stage 1: Build phase (assuming your frontend is a Node.js/React/Vue app)
FROM node:18-alpine AS build_stage
WORKDIR /app

# KORREKTUR des COPY-BEFEHLS: Kopiert den Frontend-Code aus apps/frontend/
# (relativ zum Build Context: infrastructure/docker/frontend)
COPY ../../apps/frontend/ ./

# Installiert Abhängigkeiten und führt den Build durch
RUN npm install
RUN npm run build 

# Stage 2: Serve using NGINX (Lightweight production server)
FROM nginx:alpine

# Entfernt die Standard-nginx-Konfigurationsdatei
RUN rm /etc/nginx/conf.d/default.conf

# Kopiert die gebauten Frontend-Dateien vom Build-Stage
# HINWEIS: Passt /app/dist an, wenn Ihr Build-Output-Ordner anders heißt (z.B. /app/build)
COPY --from=build_stage /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
