# Stage 1: Build-Stage (mit Node:20)
FROM node:20-alpine AS builder

WORKDIR /app

# Kopieren der package*.json Dateien und Installieren der Abhängigkeiten
COPY package*.json ./
RUN npm ci

# Kopieren des gesamten Quellcodes und Bauen der Anwendung
COPY . .
RUN npm run build

# Stage 2: Production Stage (mit Nginx)
FROM nginx:alpine

# Kopieren der gebauten Anwendung in das Nginx-Webroot-Verzeichnis
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: Kopieren einer benutzerdefinierten Nginx-Konfiguration, falls nötig
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Der Standardbefehl startet Nginx (in der Basis-Image-Definition enthalten)
# CMD ["nginx", "-g", "daemon off;"]
