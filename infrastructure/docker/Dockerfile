# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY apps/backend/package*.json ./
RUN npm ci

# Hinzufügen des Prisma-Schemas und Generieren der Typen VOR dem TypeScript-Build
COPY apps/backend/prisma ./prisma
RUN npx prisma generate

COPY apps/backend/tsconfig.json ./
COPY apps/backend/src ./src

RUN npm run build

# Production Stage
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY apps/backend/package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

COPY --from=builder /app/dist ./dist

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "dist/server.js"]
