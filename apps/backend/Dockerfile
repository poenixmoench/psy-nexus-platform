# Verwende ein Node.js-Basisimage (angepasst an deine Entwicklungsumgebung)
FROM node:18-alpine

# Setze das Arbeitsverzeichnis im Container
WORKDIR /app

# Kopiere package*.json (und ggf. andere Konfigurationsdateien wie tsconfig.json)
COPY package*.json ./

# Installiere Abhängigkeiten
RUN npm install

# Kopiere den gesamten Source-Code (TypeScript)
COPY . .

# Kompiliere den TypeScript-Code zu JavaScript
# Stelle sicher, dass dein tsconfig.json die richtigen Einstellungen hat
# (z.B. "outDir": "dist", "rootDir": "src")
RUN npx tsc

# Exponiere den Port, auf dem dein Backend läuft (Standard für Express ist 3000)
EXPOSE 3000

# Starte das kompilierte JavaScript (angepasst an deine Hauptdatei)
# Wenn deine Hauptdatei z.B. /src/index.ts heißt, wird die kompilierte JS-Datei /app/dist/index.js
CMD [ "node", "dist/index.js" ]
