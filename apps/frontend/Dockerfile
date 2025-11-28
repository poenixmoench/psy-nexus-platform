# Stage 1: Builder Stage
# Basis-Image für den Build-Prozess (Node.js 20)
FROM node:20-alpine AS builder

# Setze das Arbeitsverzeichnis im Container
WORKDIR /app

# 1. Installiere Abhängigkeiten
# Kopiere zuerst nur die package.json, um den Layer-Cache für die Installation zu optimieren
COPY package*.json ./
RUN npm ci

# --- Cache-Brecher ---
# Dies muss bei jedem Build mit einem neuen Wert überschrieben werden, um den Cache der nachfolgenden COPY-Anweisungen zu brechen.
ARG BUILD_DATE=20251125_0430
# ---------------------

# 2. Kopiere NUR den Frontend-Quellcode
# Diese spezifischen COPY-Befehle ersetzen die fehlerhafte "COPY . ." Zeile.
# Sie verhindern, dass Backend-Dateien (wie src/db/eventQueries.ts) versehentlich kopiert werden.
COPY src ./src
COPY public ./public
COPY tsconfig.json .
COPY vite.config.ts .

# 3. Baue die Anwendung
# Führt den Build-Befehl aus, der die statischen Assets erstellt
RUN npm run build


# Stage 2: Production Stage
# Verwende einen leichten Nginx-Container, um die gebaute Anwendung zu hosten
FROM nginx:alpine AS production

# Kopiere die gebauten Assets aus der Builder-Stage in das Nginx-Webroot
# Der Pfad 'dist' ist der Standard-Output-Ordner eines Vue/Vite-Builds
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: Kopiere die Nginx-Konfiguration
# Hier sollte Ihre Nginx-Konfiguration für das Reverse Proxying und die SPA-Behandlung stehen
# COPY nginx.conf /etc/nginx/conf.d/default.conf
