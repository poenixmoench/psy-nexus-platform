# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
# Wir bauen das Backend mit dem spezifischen Projektpfad
RUN npx tsc -p apps/backend/tsconfig.json

# Stage 2: Production
FROM node:22-alpine AS production
WORKDIR /app

# Kopiere die Abhängigkeiten aus der Root (wegen Hoisting)
COPY --from=builder /app/node_modules ./node_modules
# Kopiere das Backend-Verzeichnis inklusive des neuen dist-Ordners
COPY --from=builder /app/apps/backend ./apps/backend

EXPOSE 3000

# Wir setzen das Arbeitsverzeichnis direkt in den Backend-Ordner
WORKDIR /app/apps/backend

# STARTBEFEHL: Exakt angepasst an deine 'find'-Ausgabe
CMD ["node", "dist/apps/backend/src/index.js"]
