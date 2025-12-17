# -- BUILD STAGE --
# Nutze die offizielle Node.js 20 LTS (slim) Version als Basis für den Build-Schritt.
FROM node:20-slim AS builder

# Setze das Arbeitsverzeichnis im Container
WORKDIR /app

# Kopiere package.json, package-lock.json und installiere die Abhängigkeiten
COPY package*.json ./
# Kopiere das gesamte Projektverzeichnis von der Host-Maschine (./)
COPY . .
RUN npm install

# Führe den Build aus (falls dein Backend einen Build-Schritt hat)
# Dies ist oft bei TypeScript oder Babel der Fall.
# Falls kein 'build' Skript existiert, muss dieser Schritt angepasst oder entfernt werden.
RUN npm run build || echo "No build script found, skipping build phase."

# -- PRODUCTION STAGE --
# Nutze Node.js Alpine für ein extrem kleines und sicheres finales Image.
FROM node:20-alpine

# Setze die Umgebung auf Produktion
ENV NODE_ENV=production
ENV PORT=8080

# Setze das Arbeitsverzeichnis auf den Produktionspfad
WORKDIR /app

# Kopiere nur die benötigten Dateien vom Build-Image
# 1. Die dependencies (sehr wichtig für die Laufzeit)
COPY --from=builder /app/node_modules ./node_modules
# 2. Die gebuildeten oder Quellcode-Dateien
COPY --from=builder /app/dist ./dist 
COPY --from=builder /app/src ./src 
COPY --from=builder /app/package.json .

# Der Container hört auf Port 8080 (wird später über NGINX freigegeben)
EXPOSE 8080

# Definiere den Befehl, der beim Start des Containers ausgeführt wird
# Wir nutzen npm start, was in deiner package.json auf den Produktivserver zeigen sollte (z.B. node dist/main.js)
CMD ["npm", "start"]
