# ============================================================
# Production Multi-Stage Dockerfile for Coolify & Vite React
# ============================================================

# Stage 1: Build Frontend Assets
FROM node:20-alpine AS builder

WORKDIR /app

# Arguments for Vite environment variables
ARG VITE_DIRECTUS_URL
ARG VITE_DIRECTUS_TOKEN

ENV VITE_DIRECTUS_URL=$VITE_DIRECTUS_URL
ENV VITE_DIRECTUS_TOKEN=$VITE_DIRECTUS_TOKEN

# Copy package descriptors and install dependencies
COPY package.json ./
RUN npm install

# Copy all source files and compile Vite SPA
COPY . .
RUN npm run build

# Stage 2: Serve with High-Performance Nginx
FROM nginx:alpine AS runner

WORKDIR /usr/share/nginx/html

# Clean default assets
RUN rm -rf ./*

# Create self-contained Nginx configuration for SPA routing & caching
RUN printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    gzip on;\n\
    gzip_vary on;\n\
    gzip_min_length 1024;\n\
    gzip_proxied any;\n\
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/x-javascript application/xml application/json image/svg+xml;\n\
\n\
    location /assets/ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, max-age=31536000, immutable";\n\
        access_log off;\n\
    }\n\
\n\
    location /health {\n\
        access_log off;\n\
        default_type text/plain;\n\
        return 200 "healthy\\n";\n\
    }\n\
\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
\n\
    error_page 500 502 503 504 /50x.html;\n\
    location = /50x.html {\n\
        root /usr/share/nginx/html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

# Copy compiled files from builder
COPY --from=builder /app/dist ./

# Expose standard port 80
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
