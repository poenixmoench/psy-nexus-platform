# Builder Stage
FROM node:20-alpine AS builder

# Setze das Arbeitsverzeichnis auf das Haupt-Frontend-Verzeichnis (Annahme: "web/")
# PASSE DIESEN PFAD AN, FALLS DEIN FRONTEND WOANDERS LIEGT (z.B. frontend/ oder client/)
WORKDIR /app/web

# Kopiere package.json der Wurzel und installiere Abhängigkeiten (sollte im Wurzel-Ordner ausgeführt werden)
# Wir verwenden /app als Wurzel für den Kopiervorgang
WORKDIR /app
COPY package*.json ./
# Kopiere den gesamten Frontend-Code (incl. index.html, etc.)
COPY web ./web

# Installation und Build im Frontend-Kontext
WORKDIR /app/web
RUN npm install
RUN npx tsc

# Production Stage (Nginx)
FROM nginx:alpine

# Kopiere die gebauten Assets (erzeugt von Vite/npm) aus dem Builder-Stage
# Der 'dist' Ordner sollte sich jetzt unter /app/web/dist befinden
COPY --from=builder /app/web/dist /usr/share/nginx/html

# Expose und Startbefehl
EXPOSE 80
CMD ["node", "dist/index.js"]
