# -- BUILD STAGE --
# Nutze Node.js 20 LTS (slim) für den Build von React
FROM node:20-slim AS builder

WORKDIR /app

# Kopiere package.json und package-lock.json und installiere die Abhängigkeiten
COPY package*.json ./
RUN npm install

# Kopiere den gesamten Quellcode und führe den Build aus
COPY . .
# Führt den React-Build aus, um die statischen Dateien zu erstellen
RUN npm run build

# -- PRODUCTION STAGE --
# Nutze die extrem schlanke Alpine-Version von NGINX (optimal für statische Dateien)
FROM nginx:alpine

# Kopiere die gebuildeten, statischen Dateien aus dem Build-Stage
# In React/Vite/NextJS wird der Output meist in den 'dist' oder 'build' Ordner gelegt.
COPY --from=builder /app/dist /usr/share/nginx/html

# Entferne die Standard-Konfigurationsdatei von NGINX
RUN rm /etc/nginx/conf.d/default.conf

# Eigene NGINX-Konfiguration für das Frontend
# Diese Konfiguration stellt sicher, dass alle Anfragen (z.B. für Client-Side-Routing)
# korrekt an die index.html zurückgeleitet werden.
COPY ./nginx-frontend.conf /etc/nginx/conf.d/default.conf

# Standard-HTTP-Port
EXPOSE 80

# Starte NGINX
CMD ["nginx", "-g", "daemon off;"]
