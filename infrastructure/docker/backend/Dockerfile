# Stage 1: Build the application
FROM node:18-alpine AS builder

# Setzt das Arbeitsverzeichnis im Container
WORKDIR /app

# KORREKTUR des COPY-BEFEHLS (bereits in letzter Runde gemacht):
COPY apps/backend/ ./

# Installiert Abhängigkeiten und führt den Build durch
RUN npm install
RUN npm run build

# Stage 2: Run the application
# WICHTIGE KORREKTUR: Benennen Sie die finale Stage als "prod-stage"
FROM node:18-alpine AS prod-stage

WORKDIR /app
# Kopiert die für den Laufzeitbetrieb notwendigen Dateien
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Startet den korrekten Entry-Point.
CMD ["node", "dist/index.js"]
