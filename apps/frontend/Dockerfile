# Stage 1: Build Stage (Vite/React Build)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production Stage (Nginx)
FROM nginx:alpine

# Copy the built assets from the builder stage to the nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Default command for nginx
CMD ["nginx", "-g", "daemon off;"]
