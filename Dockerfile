# ==========================================
# Multi-stage Dockerfile for Coolify Deployment
# ==========================================

# Stage 1: Build the Vite React Application
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for Vite environment variables in Coolify
ARG VITE_DIRECTUS_URL
ARG VITE_DIRECTUS_TOKEN

ENV VITE_DIRECTUS_URL=$VITE_DIRECTUS_URL
ENV VITE_DIRECTUS_TOKEN=$VITE_DIRECTUS_TOKEN

# Install dependencies
COPY package.json ./
RUN npm install

# Copy project files and build
COPY . .
RUN npm run build

# Stage 2: High-Performance Production Nginx Server
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration with SPA fallback routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose standard web port
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
