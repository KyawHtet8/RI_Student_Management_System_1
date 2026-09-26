# ==========================================
# Stage 1: Build Stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies needed for node-gyp if necessary
RUN apk add --no-cache libc6-compat

# Copy package descriptors
COPY package.json package-lock.json* bun.lock* ./

# Install npm dependencies (prefer clean install when package-lock is present)
RUN npm install

# Copy source code and build config
COPY . .

# Build-time environment arguments (Vite client env vars start with VITE_)
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build production assets
RUN npm run build

# ==========================================
# Stage 2: Production Nginx Server
# ==========================================
FROM nginx:1.27-alpine AS production

LABEL maintainer="Student Management System DevOps Team"
LABEL description="Production Docker image for Student Management System React Frontend"

# Remove default nginx static assets and server config
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port 80
EXPOSE 80

# Health check to ensure nginx is serving requests
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:80/ || exit 1

# Graceful stop signal
STOPSIGNAL SIGQUIT

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
