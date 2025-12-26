# Stage 1: Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production Stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy node_modules from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy package.json and package-lock.json from builder stage
COPY --from=builder /app/package*.json ./

# Expose port
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/index.js"]
