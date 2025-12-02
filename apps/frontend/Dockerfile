# Stage 1: Build the Vue/Vite app
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
# Install dependencies needed for build
RUN npm ci
# Copy source code
COPY . .
# Build the application (creates the /dist directory with static files)
RUN npm run build

# Stage 2: Serve the static files with a minimal Node server (using 'serve' package)
FROM node:20-alpine
WORKDIR /usr/app
# Global install of 'serve' to host the static /dist directory
RUN npm install -g serve
# Copy the production files from the build stage
COPY --from=build /app/dist /usr/app/dist
# Expose the correct port
EXPOSE 5173
# Command to run the static server
CMD ["serve", "-s", "dist", "-l", "5173"]
